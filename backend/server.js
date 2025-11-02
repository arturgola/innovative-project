const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const multer = require("multer");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "./uploads";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(
      null,
      Date.now() +
        "-" +
        Math.round(Math.random() * 1e9) +
        path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// OpenAI Configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

// HSY Waste Guide API Configuration
const HSY_WASTE_API_URL =
  "https://dev.klapi.hsy.fi/int2001/v1/waste-guide-api/waste-pages?lang=en";
const HSY_CLIENT_ID = process.env.HSY_CLIENT_ID;
const HSY_CLIENT_SECRET = process.env.HSY_CLIENT_SECRET;

// Database setup
const db = new sqlite3.Database("./data.db");
db.run("CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY, name TEXT)");

// Create users table
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  level INTEGER DEFAULT 1,
  total_points INTEGER DEFAULT 0,
  scans_today INTEGER DEFAULT 0,
  joined_date TEXT DEFAULT CURRENT_TIMESTAMP,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
)`);

// Create product scans table
db.run(`CREATE TABLE IF NOT EXISTS product_scans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  name TEXT NOT NULL,
  brand TEXT,
  category TEXT,
  barcode TEXT,
  points INTEGER DEFAULT 0,
  rating REAL DEFAULT 0,
  description TEXT,
  recyclability TEXT,
  eco_score REAL DEFAULT 0,
  suggestions TEXT, -- JSON string array
  confidence REAL DEFAULT 0,
  analysis_method TEXT DEFAULT 'openai-vision',
  object_material TEXT,
  waste_guide_match TEXT, -- JSON string with HSY waste guide match data
  image_path TEXT,
  photo_width INTEGER,
  photo_height INTEGER,
  scanned_at TEXT DEFAULT CURRENT_TIMESTAMP,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id)
)`);

// Add waste_guide_match column to existing table if it doesn't exist
db.run(`ALTER TABLE product_scans ADD COLUMN waste_guide_match TEXT`, (err) => {
  if (err && !err.message.includes("duplicate column name")) {
    console.error("Error adding waste_guide_match column:", err.message);
  }
});

// Helper functions for OpenAI analysis
async function convertImageToBase64(imagePath) {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    return imageBuffer.toString("base64");
  } catch (error) {
    console.error("Error converting image to base64:", error);
    throw error;
  }
}

// HSY API authentication helper
function getHSYHeaders() {
  if (!HSY_CLIENT_ID || !HSY_CLIENT_SECRET) {
    throw new Error(
      "HSY credentials not configured. Please set HSY_CLIENT_ID and HSY_CLIENT_SECRET in environment variables."
    );
  }

  return {
    "Content-Type": "application/json",
    client_id: HSY_CLIENT_ID,
    client_secret: HSY_CLIENT_SECRET,
  };
}

// Function to fetch HSY waste guide data and find matches
async function findWasteGuideMatch(aiResponse) {
  try {
    console.log("Fetching HSY waste guide data...");

    // Get HSY authentication headers
    const headers = getHSYHeaders();

    const response = await axios.get(HSY_WASTE_API_URL, {
      timeout: 10000, // 10 second timeout
      headers: headers,
    });

    const responseData = response.data;

    // HSY API returns data in a 'hits' array
    const wasteItems = responseData.hits || responseData;
    console.log(`Found ${wasteItems.length} waste guide items`);

    if (!Array.isArray(wasteItems)) {
      console.warn("HSY API response hits is not an array:", typeof wasteItems);
      console.log("Full response structure:", Object.keys(responseData));
      return null;
    }

    // Extract the product name from AI response for matching
    const aiProductName = aiResponse.name || "";
    const aiObjectMaterial = aiResponse.objectMaterial || "";
    const aiCategory = aiResponse.category || "";

    console.log("Looking for matches with:", {
      aiProductName,
      aiObjectMaterial,
      aiCategory,
    });

    // Find matches by checking titles and synonyms
    const matches = [];

    for (const item of wasteItems) {
      if (!item.title) continue;

      const itemTitle = item.title.toLowerCase();
      const synonyms = (item.synonyms || []).map((s) => s.toLowerCase());
      const productName = aiProductName.toLowerCase();
      const objectMaterial = aiObjectMaterial.toLowerCase();
      const category = aiCategory.toLowerCase();

      // Calculate match score based on different criteria
      let matchScore = 0;

      // Direct title matches (highest priority)
      if (itemTitle.includes(productName) && productName.length > 2) {
        matchScore += 4;
      }

      // Synonym matches (high priority)
      for (const synonym of synonyms) {
        if (synonym.includes(productName) || productName.includes(synonym)) {
          matchScore += 3;
        }
      }

      // Material-based matches
      const materialKeywords = objectMaterial.split(" ");
      for (const keyword of materialKeywords) {
        if (keyword.length > 2) {
          if (itemTitle.includes(keyword)) {
            matchScore += 2;
          }
          // Check synonyms for material matches
          for (const synonym of synonyms) {
            if (synonym.includes(keyword)) {
              matchScore += 2;
            }
          }
        }
      }

      // Category-based matches
      if (category && category.length > 2) {
        if (itemTitle.includes(category)) {
          matchScore += 1;
        }
        for (const synonym of synonyms) {
          if (synonym.includes(category)) {
            matchScore += 1;
          }
        }
      }

      // Word-by-word matching for better accuracy
      const titleWords = itemTitle.split(/\s+/);
      const productWords = productName.split(/\s+/);

      for (const productWord of productWords) {
        if (productWord.length > 2) {
          for (const titleWord of titleWords) {
            if (
              titleWord.includes(productWord) ||
              productWord.includes(titleWord)
            ) {
              matchScore += 1;
            }
          }
          // Also check synonyms
          for (const synonym of synonyms) {
            const synonymWords = synonym.split(/\s+/);
            for (const synonymWord of synonymWords) {
              if (
                synonymWord.includes(productWord) ||
                productWord.includes(synonymWord)
              ) {
                matchScore += 1;
              }
            }
          }
        }
      }

      if (matchScore > 0) {
        matches.push({
          ...item,
          matchScore: matchScore,
        });
      }
    }

    // Sort matches by score (highest first) and return the best match
    matches.sort((a, b) => b.matchScore - a.matchScore);

    if (matches.length > 0) {
      const bestMatch = matches[0];
      console.log(
        `Found best match: "${bestMatch.title}" with score ${bestMatch.matchScore}`
      );
      return bestMatch;
    }

    console.log("No matches found in HSY waste guide");
    return null;
  } catch (error) {
    console.error("Error fetching HSY waste guide data:", error.message);

    if (error.response) {
      console.error("HSY API Response Status:", error.response.status);
      console.error("HSY API Response Data:", error.response.data);
    }

    if (error.response && error.response.status === 401) {
      console.error("HSY API authentication failed - check your API key");
    } else if (error.response && error.response.status === 403) {
      console.error(
        "HSY API access forbidden - check your API key permissions"
      );
    }

    return null;
  }
}

async function analyzeObjectMaterial(imagePath) {
  try {
    const base64Image = await convertImageToBase64(imagePath);

    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze the object in this image and identify its material. Return only a short description string with the object type and material. For example: "plastic bottle", "metal can", "glass jar", "cardboard box", "fabric shirt", "leather shoe", etc. Keep it very brief - just type and material.`,
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                  detail: "high",
                },
              },
            ],
          },
        ],
        max_tokens: 50,
        temperature: 0.1,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    const shortDescription = response.data.choices[0].message.content.trim();
    return {
      shortDescription: shortDescription || "unknown object",
    };
  } catch (error) {
    console.error("Error analyzing object material with OpenAI:", error);
    return {
      shortDescription: "unknown object",
    };
  }
}

async function analyzeProductImage(imagePath) {
  try {
    const base64Image = await convertImageToBase64(imagePath);

    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `First, analyze the object in this image and identify its material. Then provide comprehensive analysis.

STEP 1: Analyze object and its material, return only string with object short descriptions, such as type and material (e.g., "plastic bottle", "metal can", "glass jar").

STEP 2: Provide detailed analysis in JSON format:
                  {
                    "name": "Product name",
                    "brand": "Brand name", 
                    "category": "Product category",
                    "recyclability": "Type of recyclability (e.g., fully recyclable, partially recyclable, not recyclable)",
                    "ecoScore": "Environmental score from 1-100",
                    "description": "Brief product description including the object type and material from step 1",
                    "suggestions": ["Array of eco-friendly suggestions"],
                    "confidence": "Confidence level from 0-100"
                  }
                  
                  Focus on sustainability and environmental impact. Include the object type and material analysis in the description field. If you can't identify the product clearly, provide general information and mark confidence as low.`,
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                  detail: "high",
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
        temperature: 0.3,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    const content = response.data.choices[0].message.content;

    // Parse the JSON response
    try {
      const analysisResult = JSON.parse(content);
      return analysisResult;
    } catch (parseError) {
      // Fallback if JSON parsing fails
      return {
        name: "Unknown Product",
        brand: "Unknown Brand",
        category: "General Item",
        recyclability: "Check local guidelines",
        ecoScore: 50,
        description:
          "Product analysis incomplete. Please try again with a clearer image.",
        suggestions: [
          "Check product packaging for recycling symbols",
          "Consider eco-friendly alternatives",
        ],
        confidence: 30,
      };
    }
  } catch (error) {
    console.error("Error analyzing image with OpenAI:", error);
    throw error;
  }
}

// Routes
app.get("/items", (req, res) => {
  db.all("SELECT * FROM items", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post("/items", (req, res) => {
  const { name } = req.body;
  db.run("INSERT INTO items (name) VALUES (?)", [name], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, name });
  });
});

// Product Scan Routes
// Analyze product image and save scan result
app.post("/analyze-product", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    const imagePath = req.file.path;
    const { userId } = req.body;

    console.log("Analyzing product image for user:", userId);

    // First, get object and material analysis
    const objectMaterialResult = await analyzeObjectMaterial(imagePath);

    // Then analyze the image with full OpenAI analysis
    const analysisResult = await analyzeProductImage(imagePath);

    // Add object material to analysis result for waste guide matching
    analysisResult.objectMaterial = objectMaterialResult.shortDescription;

    // Find matching item in HSY waste guide
    console.log("Searching for matches in HSY waste guide...");
    const wasteGuideMatch = await findWasteGuideMatch(analysisResult);

    if (wasteGuideMatch) {
      console.log(`✅ Found HSY waste guide match: "${wasteGuideMatch.title}"`);
    } else {
      console.log("❌ No HSY waste guide match found");
    }

    // Calculate points based on eco score
    const points = Math.floor(analysisResult.ecoScore / 2);

    // Save scan result to database
    const scannedAt = new Date().toISOString();
    const suggestionsJson = JSON.stringify(analysisResult.suggestions);
    const wasteGuideMatchJson = wasteGuideMatch
      ? JSON.stringify({
          title: wasteGuideMatch.title,
          matchScore: wasteGuideMatch.matchScore,
          id: wasteGuideMatch.id,
          synonyms: wasteGuideMatch.synonyms || [],
          notes: wasteGuideMatch.notes || null,
          wasteTypes: wasteGuideMatch.wasteTypes || [],
          recyclingMethods: wasteGuideMatch.recyclingMethods || [],
        })
      : null;

    db.run(
      `INSERT INTO product_scans 
       (user_id, name, brand, category, barcode, points, rating, description, 
        recyclability, eco_score, suggestions, confidence, analysis_method, 
        object_material, waste_guide_match, image_path, photo_width, photo_height, scanned_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId || null,
        analysisResult.name,
        analysisResult.brand,
        analysisResult.category,
        "camera-scanned",
        points,
        analysisResult.ecoScore,
        `${objectMaterialResult.shortDescription} - ${analysisResult.description}`,
        analysisResult.recyclability,
        analysisResult.ecoScore,
        suggestionsJson,
        analysisResult.confidence,
        "openai-vision",
        objectMaterialResult.shortDescription,
        wasteGuideMatchJson,
        imagePath,
        0, // photo width will be set by frontend
        0, // photo height will be set by frontend
        scannedAt,
      ],
      function (err) {
        if (err) {
          console.error("Database error:", err);
          // Clean up uploaded file on database error
          fs.unlink(imagePath, (unlinkErr) => {
            if (unlinkErr) console.error("Error deleting file:", unlinkErr);
          });
          return res.status(500).json({ error: err.message });
        }

        // If user provided, update their stats
        if (userId) {
          db.run(
            "UPDATE users SET total_points = total_points + ?, scans_today = scans_today + 1 WHERE id = ?",
            [points, userId],
            (updateErr) => {
              if (updateErr) {
                console.error("Error updating user stats:", updateErr);
              }
            }
          );
        }

        // Return the complete product data
        const productWithAnalysis = {
          id: this.lastID,
          name: analysisResult.name,
          brand: analysisResult.brand,
          category: analysisResult.category,
          barcode: "camera-scanned",
          points: points,
          rating: analysisResult.ecoScore,
          description: `${objectMaterialResult.shortDescription} - ${analysisResult.description}`,
          scannedAt: scannedAt,
          photoUri: `/uploads/${path.basename(imagePath)}`,
          photoWidth: 0,
          photoHeight: 0,
          recyclability: analysisResult.recyclability,
          ecoScore: analysisResult.ecoScore,
          suggestions: analysisResult.suggestions,
          confidence: analysisResult.confidence,
          analysisMethod: "openai-vision",
          objectMaterial: objectMaterialResult.shortDescription,
          wasteGuideMatch: wasteGuideMatch
            ? {
                title: wasteGuideMatch.title,
                matchScore: wasteGuideMatch.matchScore,
                id: wasteGuideMatch.id,
                synonyms: wasteGuideMatch.synonyms || [],
                notes: wasteGuideMatch.notes || null,
                wasteTypes: wasteGuideMatch.wasteTypes || [],
                recyclingMethods: wasteGuideMatch.recyclingMethods || [],
              }
            : null,
        };

        res.json(productWithAnalysis);
      }
    );
  } catch (error) {
    console.error("Error analyzing product:", error);

    // Clean up uploaded file on error
    if (req.file) {
      fs.unlink(req.file.path, (unlinkErr) => {
        if (unlinkErr) console.error("Error deleting file:", unlinkErr);
      });
    }

    // Return fallback result
    res.status(500).json({
      error: "Analysis failed",
      fallback: {
        id: Date.now(),
        name: "Scanned Product",
        brand: "Unknown Brand",
        category: "General Item",
        barcode: "camera-scanned",
        points: Math.floor(Math.random() * 50) + 10,
        rating: 0,
        description: "Product scanned via camera. AI analysis unavailable.",
        scannedAt: new Date().toISOString(),
        analysisMethod: "basic",
      },
    });
  }
});

// Get user's scan history
app.get("/users/:id/scans", (req, res) => {
  const userId = req.params.id;

  db.all(
    "SELECT * FROM product_scans WHERE user_id = ? ORDER BY created_at DESC",
    [userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });

      const scans = rows.map((row) => ({
        id: row.id,
        name: row.name,
        brand: row.brand,
        category: row.category,
        barcode: row.barcode,
        points: row.points,
        rating: row.rating,
        description: row.description,
        recyclability: row.recyclability,
        ecoScore: row.eco_score,
        suggestions: JSON.parse(row.suggestions || "[]"),
        confidence: row.confidence,
        analysisMethod: row.analysis_method,
        objectMaterial: row.object_material,
        wasteGuideMatch: row.waste_guide_match
          ? JSON.parse(row.waste_guide_match)
          : null,
        photoUri: `/uploads/${path.basename(row.image_path)}`,
        photoWidth: row.photo_width,
        photoHeight: row.photo_height,
        scannedAt: row.scanned_at,
      }));

      res.json(scans);
    }
  );
});

// Serve uploaded images
app.use("/uploads", express.static("uploads"));

// HSY Waste Guide API endpoint for testing
app.get("/waste-guide", async (req, res) => {
  try {
    // Get HSY authentication headers
    const headers = getHSYHeaders();

    const response = await axios.get(HSY_WASTE_API_URL, {
      timeout: 10000,
      headers: headers,
    });
    const responseData = response.data;
    const wasteItems = responseData.hits || responseData;

    res.json({
      success: true,
      itemCount: wasteItems.length,
      totalResults: responseData.total || wasteItems.length,
      items: wasteItems.slice(0, 5), // Return first 5 items as sample
      responseStructure: Object.keys(responseData),
    });
  } catch (error) {
    console.error("Error fetching HSY waste guide:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Test waste guide matching with a search term
app.post("/waste-guide/search", async (req, res) => {
  try {
    const { searchTerm } = req.body;

    if (!searchTerm) {
      return res.status(400).json({ error: "Search term is required" });
    }

    // Create a mock analysis result to test the matching
    const mockAnalysisResult = {
      name: searchTerm,
      objectMaterial: searchTerm,
      category: searchTerm,
    };

    const match = await findWasteGuideMatch(mockAnalysisResult);

    res.json({
      success: true,
      searchTerm: searchTerm,
      match: match,
    });
  } catch (error) {
    console.error("Error searching waste guide:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Test HSY authentication
app.get("/hsy-auth-test", async (req, res) => {
  try {
    const headers = getHSYHeaders();

    res.json({
      success: true,
      message: "HSY authentication headers configured successfully",
      authMethod: "Client ID/Secret Headers",
      clientId: HSY_CLIENT_ID,
      headers: {
        "Content-Type": headers["Content-Type"],
        client_id: headers["client_id"],
        client_secret: headers["client_secret"]
          ? `${headers["client_secret"].substring(0, 6)}...`
          : null,
      },
    });
  } catch (error) {
    console.error("HSY authentication test failed:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      authMethod: "Client ID/Secret Headers",
      missingCredentials: {
        clientId: !HSY_CLIENT_ID,
        clientSecret: !HSY_CLIENT_SECRET,
      },
    });
  }
});

// User Routes
// Create a new user
app.post("/users", (req, res) => {
  const { name, level = 1, total_points = 0, scans_today = 0 } = req.body;

  if (!name || name.trim() === "") {
    return res.status(400).json({ error: "Name is required" });
  }

  const joinedDate = new Date().toISOString();

  db.run(
    "INSERT INTO users (name, level, total_points, scans_today, joined_date) VALUES (?, ?, ?, ?, ?)",
    [name.trim(), level, total_points, scans_today, joinedDate],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      // Return the created user
      db.get("SELECT * FROM users WHERE id = ?", [this.lastID], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({
          id: row.id,
          name: row.name,
          level: row.level,
          totalPoints: row.total_points,
          scansToday: row.scans_today,
          joinedDate: row.joined_date,
        });
      });
    }
  );
});

// Get all users
app.get("/users", (req, res) => {
  db.all("SELECT * FROM users ORDER BY created_at DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const users = rows.map((row) => ({
      id: row.id,
      name: row.name,
      level: row.level,
      totalPoints: row.total_points,
      scansToday: row.scans_today,
      joinedDate: row.joined_date,
    }));

    res.json(users);
  });
});

// Get user by ID
app.get("/users/:id", (req, res) => {
  const userId = req.params.id;

  db.get("SELECT * FROM users WHERE id = ?", [userId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "User not found" });

    res.json({
      id: row.id,
      name: row.name,
      level: row.level,
      totalPoints: row.total_points,
      scansToday: row.scans_today,
      joinedDate: row.joined_date,
    });
  });
});

// Update user profile
app.put("/users/:id", (req, res) => {
  const userId = req.params.id;
  const { name, level, total_points, scans_today } = req.body;

  if (!name || name.trim() === "") {
    return res.status(400).json({ error: "Name is required" });
  }

  const updatedAt = new Date().toISOString();

  db.run(
    "UPDATE users SET name = ?, level = ?, total_points = ?, scans_today = ?, updated_at = ? WHERE id = ?",
    [name.trim(), level, total_points, scans_today, updatedAt, userId],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0)
        return res.status(404).json({ error: "User not found" });

      // Return updated user
      db.get("SELECT * FROM users WHERE id = ?", [userId], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({
          id: row.id,
          name: row.name,
          level: row.level,
          totalPoints: row.total_points,
          scansToday: row.scans_today,
          joinedDate: row.joined_date,
        });
      });
    }
  );
});

// Delete user
app.delete("/users/:id", (req, res) => {
  const userId = req.params.id;

  db.run("DELETE FROM users WHERE id = ?", [userId], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0)
      return res.status(404).json({ error: "User not found" });

    res.json({ message: "User deleted successfully" });
  });
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend running at http://0.0.0.0:${PORT}`);
  console.log(`Local access: http://localhost:${PORT}`);
  console.log(`Network access: http://192.168.1.145:${PORT}`);
});
