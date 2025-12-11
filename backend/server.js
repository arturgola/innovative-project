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

// HSY Waste Guide Cache
let hsyWasteGuideCache = null;
let hsyCacheTimestamp = null;
const HSY_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

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

// Add AI recycling advice columns to existing table if they don't exist
db.run(
  `ALTER TABLE product_scans ADD COLUMN ai_recycling_advice TEXT`,
  (err) => {
    if (err && !err.message.includes("duplicate column name")) {
      console.error("Error adding ai_recycling_advice column:", err.message);
    }
  }
);

db.run(
  `ALTER TABLE product_scans ADD COLUMN is_dangerous INTEGER DEFAULT 0`,
  (err) => {
    if (err && !err.message.includes("duplicate column name")) {
      console.error("Error adding is_dangerous column:", err.message);
    }
  }
);

db.run(`ALTER TABLE product_scans ADD COLUMN danger_warning TEXT`, (err) => {
  if (err && !err.message.includes("duplicate column name")) {
    console.error("Error adding danger_warning column:", err.message);
  }
});

db.run(`ALTER TABLE product_scans ADD COLUMN general_tips TEXT`, (err) => {
  if (err && !err.message.includes("duplicate column name")) {
    console.error("Error adding general_tips column:", err.message);
  }
});

// Add alternative_answers column to existing table if it doesn't exist
db.run(
  `ALTER TABLE product_scans ADD COLUMN alternative_answers TEXT`,
  (err) => {
    if (err && !err.message.includes("duplicate column name")) {
      console.error("Error adding alternative_answers column:", err.message);
    }
  }
);

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

// Helper function to clean OpenAI response and extract JSON
function cleanOpenAIResponse(content) {
  try {
    // Remove markdown code blocks if present
    let cleanContent = content.trim();

    // Remove ```json and ``` markers
    cleanContent = cleanContent.replace(/^```json\s*/, "");
    cleanContent = cleanContent.replace(/^```\s*/, "");
    cleanContent = cleanContent.replace(/\s*```$/, "");

    // Trim any extra whitespace
    cleanContent = cleanContent.trim();

    return cleanContent;
  } catch (error) {
    console.error("Error cleaning OpenAI response:", error);
    return content;
  }
}

// AI fallback recycling advice when no HSY match found
async function getAIRecyclingAdvice(productDescription, objectMaterial) {
  try {
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: `Analyze this waste item and provide recycling/disposal advice. Return ONLY valid JSON without markdown formatting:

ITEM: "${productDescription}"
MATERIAL: "${objectMaterial}"

Return this JSON structure:
{
  "recyclingAdvice": "Clear recycling instructions",
  "isDangerous": false,
  "dangerWarning": null,
  "generalTips": ["Array of 2-3 practical recycling tips"]
}

RULES:
1. If item contains hazardous materials (batteries, chemicals, electronics, medical waste, asbestos, paint, motor oil, etc.), set "isDangerous": true and "dangerWarning": "This item may contain hazardous materials. Please check official waste guide for proper disposal."
2. Focus on practical disposal advice for common household waste
3. Keep advice clear and actionable
4. Include sorting instructions (plastic recycling bin, metal recycling, composting, etc.)

IMPORTANT: Return only the JSON object, no explanatory text or markdown.`,
          },
        ],
        max_tokens: 500,
        temperature: 0.3,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    const adviceContent = response.data.choices[0].message.content;

    try {
      const cleanedContent = cleanOpenAIResponse(adviceContent);
      const advice = JSON.parse(cleanedContent);

      return {
        recyclingAdvice:
          advice.recyclingAdvice ||
          "Check local recycling guidelines for this item.",
        isDangerous: advice.isDangerous || false,
        dangerWarning: advice.dangerWarning || null,
        generalTips: advice.generalTips || [],
      };
    } catch (parseError) {
      console.error("Error parsing AI recycling advice:", parseError);
      return {
        recyclingAdvice: "Check local recycling guidelines for this item.",
        isDangerous: false,
        dangerWarning: null,
        generalTips: ["Check product packaging for recycling symbols"],
      };
    }
  } catch (error) {
    console.error("Error getting AI recycling advice:", error);
    return {
      recyclingAdvice: "Check local recycling guidelines for this item.",
      isDangerous: false,
      dangerWarning: null,
      generalTips: ["Check product packaging for recycling symbols"],
    };
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

// Function to fetch HSY waste guide list and cache it
async function getHSYWasteGuideList() {
  try {
    // Check if cache is still valid
    const now = Date.now();
    if (
      hsyWasteGuideCache &&
      hsyCacheTimestamp &&
      now - hsyCacheTimestamp < HSY_CACHE_DURATION
    ) {
      console.log("Using cached HSY waste guide data");
      return hsyWasteGuideCache;
    }

    console.log("Fetching fresh HSY waste guide data...");

    // Get HSY authentication headers
    const headers = getHSYHeaders();

    // First try with original URL to see base response
    console.log("Fetching with original URL:", HSY_WASTE_API_URL);

    const response = await axios.get(HSY_WASTE_API_URL, {
      timeout: 15000, // 15 second timeout
      headers: headers,
    });

    const responseData = response.data;
    console.log("HSY API response structure:", Object.keys(responseData));
    console.log(
      "Total count from API:",
      responseData.total || responseData.totalCount || "unknown"
    );

    let allWasteItems = responseData.hits || responseData;
    console.log(`Got ${allWasteItems.length} items from first request`);

    if (!Array.isArray(allWasteItems)) {
      console.warn(
        "HSY API response hits is not an array:",
        typeof allWasteItems
      );
      console.log("Full response data:", responseData);
      return [];
    }

    // Check if there are more pages available
    const totalCount = responseData.total || responseData.totalCount;
    if (totalCount && totalCount > allWasteItems.length) {
      console.log(
        `API indicates ${totalCount} total items, but we only got ${allWasteItems.length}. Fetching all items...`
      );

      // Calculate how many requests we need (20 items per request)
      const itemsPerPage = allWasteItems.length; // Should be 20
      const totalPages = Math.ceil(totalCount / itemsPerPage);
      console.log(
        `Need to fetch ${totalPages} pages to get all ${totalCount} items`
      );

      // Try different pagination parameter formats
      const paginationFormats = [
        (page) => `${HSY_WASTE_API_URL}&page=${page}`,
        (page) => `${HSY_WASTE_API_URL}&offset=${page * itemsPerPage}`,
        (page) => `${HSY_WASTE_API_URL}&from=${page * itemsPerPage}`,
        (page) => `${HSY_WASTE_API_URL}&skip=${page * itemsPerPage}`,
        (page) => `${HSY_WASTE_API_URL}&start=${page * itemsPerPage}`,
      ];

      let successfulFormat = null;

      // Test each pagination format with the second page (don't add items yet)
      for (const formatFunc of paginationFormats) {
        try {
          const testUrl = formatFunc(2); // Try third page (page 2, or offset 40) for testing
          console.log(`Testing pagination format: ${testUrl}`);

          const testResponse = await axios.get(testUrl, {
            timeout: 10000,
            headers: headers,
          });

          const testData = testResponse.data;
          const testItems = testData.hits || testData;

          if (Array.isArray(testItems) && testItems.length > 0) {
            console.log(
              `✅ Found working pagination format! Got ${testItems.length} items`
            );
            successfulFormat = formatFunc;
            break; // Don't add items here, we'll fetch them properly below
          }
        } catch (testError) {
          console.log(
            `❌ Format failed: ${
              testError.response?.status || testError.message
            }`
          );
        }
      }

      // If we found a working format, fetch all remaining pages systematically
      if (successfulFormat) {
        console.log(`Fetching remaining pages using successful format...`);

        // Use Set to track unique item IDs to prevent duplicates
        const seenIds = new Set(allWasteItems.map((item) => item.id));

        // Start from page 2 since page 1 returns the same items as the initial request (page 0/no page param)
        for (let page = 2; page <= Math.min(totalPages, 35); page++) {
          // Limit to 35 pages max for safety
          try {
            const pageUrl = successfulFormat(page);
            console.log(
              `Fetching page ${page}/${Math.min(totalPages, 35)}: ${pageUrl}`
            );

            const pageResponse = await axios.get(pageUrl, {
              timeout: 10000,
              headers: headers,
            });

            const pageData = pageResponse.data;
            const pageItems = pageData.hits || pageData;

            if (Array.isArray(pageItems) && pageItems.length > 0) {
              // Filter out duplicates based on ID
              const newItems = pageItems.filter((item) => {
                if (seenIds.has(item.id)) {
                  return false;
                }
                seenIds.add(item.id);
                return true;
              });

              if (newItems.length > 0) {
                allWasteItems = [...allWasteItems, ...newItems];
                console.log(
                  `  ✅ Got ${newItems.length} new items (${
                    pageItems.length - newItems.length
                  } duplicates filtered, total: ${allWasteItems.length})`
                );
              } else {
                console.log(
                  `  ⚠️ All items were duplicates, stopping pagination`
                );
                break;
              }
            } else {
              console.log(`  ⚠️ No more items found, stopping pagination`);
              break;
            }

            // Stop if we've reached the expected total count
            if (allWasteItems.length >= totalCount) {
              console.log(
                `  ✅ Reached expected total count of ${totalCount}, stopping pagination`
              );
              break;
            }

            // Add small delay to be respectful to the API
            await new Promise((resolve) => setTimeout(resolve, 100));
          } catch (pageError) {
            console.error(
              `  ❌ Error fetching page ${page}: ${
                pageError.response?.status || pageError.message
              }`
            );
            // Continue with other pages even if one fails
          }
        }

        console.log(
          `✅ Pagination complete! Fetched ${allWasteItems.length} total items (expected: ${totalCount})`
        );
      } else {
        console.log(
          `❌ No working pagination format found. Using ${allWasteItems.length} items from first request only.`
        );
      }
    }

    // Remove any potential duplicates by ID (final safety check)
    const uniqueItems = allWasteItems.filter(
      (item, index, array) =>
        array.findIndex((otherItem) => otherItem.id === item.id) === index
    );

    if (uniqueItems.length !== allWasteItems.length) {
      console.log(
        `⚠️ Removed ${
          allWasteItems.length - uniqueItems.length
        } duplicate items in final cleanup`
      );
    }

    // Extract only id, title, and synonyms for the cache
    const simplifiedItems = uniqueItems
      .map((item) => ({
        id: item.id,
        title: item.title || "",
        synonyms: item.synonyms || [],
      }))
      .filter((item) => item.title && item.id); // Only include items with title and id

    console.log(
      `Cached ${simplifiedItems.length} HSY waste guide items (${uniqueItems.length} unique items, ${allWasteItems.length} total before deduplication)`
    );

    // Update cache
    hsyWasteGuideCache = simplifiedItems;
    hsyCacheTimestamp = now;

    return simplifiedItems;
  } catch (error) {
    console.error("Error fetching HSY waste guide data:", error.message);

    if (error.response) {
      console.error("HSY API Response Status:", error.response.status);
      console.error("HSY API Response Data:", error.response.data);
    }

    // Return cached data if available, even if stale
    if (hsyWasteGuideCache) {
      console.log("Using stale cached HSY data due to API error");
      return hsyWasteGuideCache;
    }

    return [];
  }
}

// Function to fetch detailed waste guide item by ID
async function getHSYWasteGuideDetails(wasteGuideId) {
  try {
    console.log(`Fetching HSY waste guide details for ID: ${wasteGuideId}`);

    // Get HSY authentication headers
    const headers = getHSYHeaders();

    const detailUrl = `https://dev.klapi.hsy.fi/int2001/v1/waste-guide-api/waste-pages/${wasteGuideId}?lang=en`;

    const response = await axios.get(detailUrl, {
      timeout: 10000, // 10 second timeout
      headers: headers,
    });

    console.log(
      `✅ Successfully fetched details for HSY item: "${response.data.title}"`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching HSY waste guide details for ID ${wasteGuideId}:`,
      error.message
    );

    if (error.response) {
      console.error("HSY API Response Status:", error.response.status);
      console.error("HSY API Response Data:", error.response.data);
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

async function analyzeProductImage(imagePath, hsyWasteGuideList) {
  try {
    const base64Image = await convertImageToBase64(imagePath);

    // Format COMPLETE HSY waste guide list for comparison (all items, not limited)
    console.log(
      `📋 Preparing complete HSY cache for OpenAI: ${hsyWasteGuideList.length} items`
    );

    const hsyListFormatted = hsyWasteGuideList
      .map(
        (item) =>
          `ID: ${item.id}, Title: "${item.title}"${
            item.synonyms.length > 0
              ? `, Synonyms: [${item.synonyms.join(", ")}]`
              : ""
          }`
      )
      .join("\n");

    console.log(
      `✅ HSY cache formatted: ${hsyListFormatted.length} characters, ${hsyWasteGuideList.length} waste items`
    );

    // Step 1: Analyze the image and get main answer + 4 alternatives
    const analysisResponse = await axios.post(
      OPENAI_API_URL,
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze the item in this image. Identify what it is and what material it's made of.

Provide 1 PRIMARY answer (most likely) and 4 ALTERNATIVE answers (other possibilities).

Return ONLY valid JSON without markdown formatting or code blocks:

{
  "primaryAnswer": {
    "itemName": "Simple item name (e.g., 'Plastic bottle', 'Metal can', 'Glass jar')",
    "material": "Primary material (plastic, metal, glass, paper, cardboard, etc.)",
    "brand": "Brand name if visible, or 'Unknown'",
    "category": "Item category (e.g., 'Beverage container', 'Food packaging', 'Electronics')",
    "sortingExplanation": "Brief explanation of how to sort/dispose this item (1-2 sentences)",
    "confidence": 85,
    "keywords": ["keyword1", "keyword2"]
  },
  "alternativeAnswers": [
    {
      "itemName": "Alternative item name",
      "material": "Material type",
      "sortingExplanation": "How to sort/dispose this alternative (1-2 sentences)",
      "confidence": 60
    },
    {
      "itemName": "Alternative item name 2",
      "material": "Material type",
      "sortingExplanation": "How to sort/dispose this alternative (1-2 sentences)",
      "confidence": 50
    },
    {
      "itemName": "Alternative item name 3",
      "material": "Material type",
      "sortingExplanation": "How to sort/dispose this alternative (1-2 sentences)",
      "confidence": 40
    },
    {
      "itemName": "Alternative item name 4",
      "material": "Material type",
      "sortingExplanation": "How to sort/dispose this alternative (1-2 sentences)",
      "confidence": 30
    }
  ]
}

IMPORTANT: 
- Be simple and direct - just identify the item and material
- Alternatives should be genuinely different possibilities (different materials or item types)
- Sorting explanations should be practical and brief
- Return only JSON, no markdown, no explanatory text`,
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
        max_tokens: 1500,
        temperature: 0.4,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    const analysisContent = analysisResponse.data.choices[0].message.content;
    let analysisResult;

    try {
      // Clean the response to remove markdown code blocks
      const cleanedContent = cleanOpenAIResponse(analysisContent);
      console.log("Cleaned OpenAI response:", cleanedContent);
      analysisResult = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("Error parsing OpenAI analysis response:", parseError);
      console.error("Raw OpenAI response:", analysisContent);
      return {
        name: "Unknown Product",
        brand: "Unknown Brand",
        category: "General Item",
        recyclability: "Check local guidelines",
        description:
          "Product analysis incomplete. Please try again with a clearer image.",
        suggestions: ["Check product packaging for recycling symbols"],
        confidence: 30,
        keywords: [],
        hsyMatchId: null,
        alternativeAnswers: [],
      };
    }

    // Extract primary answer fields
    const primary = analysisResult.primaryAnswer || {};
    const name = primary.itemName || "Unknown Product";
    const brand = primary.brand || "Unknown";
    const category = primary.category || "General Item";
    const material = primary.material || "Unknown material";
    const sortingExplanation =
      primary.sortingExplanation || "Check local guidelines";
    const confidence = primary.confidence || 50;
    const keywords = primary.keywords || [];

    // Step 2: Find HSY match for primary answer with reasoning
    const productDescription = `${name}, ${material}, ${category}`;

    const matchingResponse = await axios.post(
      OPENAI_API_URL,
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Find the best HSY waste guide match for this item:

ITEM: "${productDescription}"

HSY Waste Guide Items (Finnish waste management):
${hsyListFormatted}

MATCHING STRATEGY:
1. FIRST: Try to find an exact match based on the item type (${name}) and category (${category})
2. IF NO EXACT MATCH: Fall back to matching by primary material type (${material})
   - For example: if item is "plastic bottle" but not found, match to general "plastic" waste category
   - If item is "aluminum can" but not found, match to general "metal" or "aluminum" waste category

Return a JSON object with the ID and a brief explanation of your matching decision.
Format: {"id": 123, "reasoning": "Brief explanation - mention if exact match or material-based fallback"}
If no match exists even by material, return: {"id": null, "reasoning": "Brief explanation why no match found"}`,
              },
            ],
          },
        ],
        max_tokens: 200,
        temperature: 0.1,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    const matchContent =
      matchingResponse.data.choices[0].message.content.trim();
    let hsyMatchId = null;
    let matchReasoning = "No reasoning provided";

    try {
      const cleanedMatchContent = cleanOpenAIResponse(matchContent);
      const matchResult = JSON.parse(cleanedMatchContent);

      if (matchResult.id && matchResult.id !== "null") {
        hsyMatchId = parseInt(matchResult.id);
        matchReasoning = matchResult.reasoning || "Match found";
      } else {
        matchReasoning = matchResult.reasoning || "No suitable HSY match found";
      }
    } catch (parseError) {
      // Fallback to old parsing logic
      if (matchContent && matchContent !== "null" && matchContent !== "NULL") {
        const parsedId = parseInt(matchContent.replace(/['"]/g, ""));
        if (!isNaN(parsedId)) {
          hsyMatchId = parsedId;
          matchReasoning = "Match found (legacy format)";
        }
      }
    }

    console.log(`\n${"=".repeat(70)}`);
    console.log(`🔍 PRIMARY ITEM ANALYSIS:`);
    console.log(`   Item: "${productDescription}"`);
    console.log(`   HSY Match ID: ${hsyMatchId || "None"}`);
    console.log(`   🤖 AI Reasoning: "${matchReasoning}"`);

    // Step 3: Process alternative answers and find HSY matches for each
    const alternativeAnswers = [];
    const alternatives = analysisResult.alternativeAnswers || [];

    for (let i = 0; i < alternatives.length && i < 4; i++) {
      const alt = alternatives[i];
      const altDescription = `${alt.itemName}, ${alt.material}`;

      // Try to find HSY match for this alternative with reasoning
      const altMatchingResponse = await axios.post(
        OPENAI_API_URL,
        {
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Find HSY waste guide match for: "${altDescription}"

HSY Items:
${hsyListFormatted}

MATCHING STRATEGY:
1. FIRST: Try exact match for item type "${alt.itemName}"
2. IF NO EXACT MATCH: Match by material type "${alt.material}"

Return JSON: {"id": number_or_null, "reasoning": "brief explanation - exact or material-based"}`,
                },
              ],
            },
          ],
          max_tokens: 200,
          temperature: 0.1,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
        }
      );

      const altMatchContent =
        altMatchingResponse.data.choices[0].message.content.trim();
      let altHsyMatchId = null;
      let altMatchReasoning = "No reasoning provided";

      try {
        const cleanedAltContent = cleanOpenAIResponse(altMatchContent);
        const altMatchResult = JSON.parse(cleanedAltContent);

        if (altMatchResult.id && altMatchResult.id !== "null") {
          altHsyMatchId = parseInt(altMatchResult.id);
          altMatchReasoning = altMatchResult.reasoning || "Match found";
        } else {
          altMatchReasoning =
            altMatchResult.reasoning || "No suitable HSY match found";
        }
      } catch (parseError) {
        // Fallback to old parsing logic
        if (
          altMatchContent &&
          altMatchContent !== "null" &&
          altMatchContent !== "NULL"
        ) {
          const parsedId = parseInt(altMatchContent.replace(/['"]/g, ""));
          if (!isNaN(parsedId)) {
            altHsyMatchId = parsedId;
            altMatchReasoning = "Match found (legacy format)";
          }
        }
      }

      console.log(`\n🔍 ALTERNATIVE #${i + 1}:`);
      console.log(`   Item: "${altDescription}"`);
      console.log(`   HSY Match ID: ${altHsyMatchId || "None"}`);
      console.log(`   🤖 AI Reasoning: "${altMatchReasoning}"`);

      // Fetch HSY waste guide details for this alternative if match found
      let altWasteGuideDetails = null;
      if (altHsyMatchId) {
        console.log(`   Fetching HSY details for alternative #${i + 1}...`);
        altWasteGuideDetails = await getHSYWasteGuideDetails(altHsyMatchId);
        if (altWasteGuideDetails) {
          console.log(
            `   ✅ Found HSY details: "${altWasteGuideDetails.title}"`
          );
        }
      }

      alternativeAnswers.push({
        itemName: alt.itemName,
        material: alt.material,
        sortingExplanation: alt.sortingExplanation,
        confidence: alt.confidence,
        hsyMatchId: altHsyMatchId,
        wasteGuideMatch: altWasteGuideDetails
          ? {
              id: altWasteGuideDetails.id,
              title: altWasteGuideDetails.title,
              synonyms: altWasteGuideDetails.synonyms || [],
              notes: altWasteGuideDetails.notes || null,
              wasteTypes: altWasteGuideDetails.wasteTypes || [],
              recyclingMethods: altWasteGuideDetails.recyclingMethods || [],
            }
          : null,
      });
    }

    console.log(`${"=".repeat(70)}\n`);

    // Build final result
    const result = {
      name: name,
      brand: brand,
      category: category,
      recyclability: material,
      description: sortingExplanation,
      suggestions: [sortingExplanation],
      confidence: confidence,
      keywords: keywords,
      hsyMatchId: hsyMatchId,
      alternativeAnswers: alternativeAnswers,
    };

    return result;
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

    // Step 1: Get HSY waste guide list
    console.log("Fetching HSY waste guide list...");
    const hsyWasteGuideList = await getHSYWasteGuideList();

    // Verify we have the complete cache
    console.log(`✅ Retrieved HSY cache: ${hsyWasteGuideList.length} items`);
    if (hsyWasteGuideList.length < 600) {
      console.warn(
        `⚠️ WARNING: HSY cache has fewer items than expected (${hsyWasteGuideList.length} < 600)`
      );
    }

    // Step 2: Get object and material analysis
    const objectMaterialResult = await analyzeObjectMaterial(imagePath);

    // Step 3: Analyze the image with HSY list included in prompt
    console.log("Analyzing image with OpenAI and HSY waste guide...");
    const analysisResult = await analyzeProductImage(
      imagePath,
      hsyWasteGuideList
    );

    // Add object material to analysis result
    analysisResult.objectMaterial = objectMaterialResult.shortDescription;

    // Step 4: Fetch detailed HSY waste guide information if match found
    let wasteGuideDetails = null;
    let aiRecyclingAdvice = null;

    if (analysisResult.hsyMatchId) {
      console.log(`Fetching HSY details for ID: ${analysisResult.hsyMatchId}`);
      wasteGuideDetails = await getHSYWasteGuideDetails(
        analysisResult.hsyMatchId
      );

      if (wasteGuideDetails) {
        console.log(
          `✅ Found HSY waste guide details: "${wasteGuideDetails.title}"`
        );
      } else {
        console.log("❌ Failed to fetch HSY waste guide details");
      }
    } else {
      console.log("❌ No HSY waste guide match selected by AI");

      // Step 5: Get AI fallback recycling advice when no HSY match found
      console.log("Getting AI fallback recycling advice...");
      aiRecyclingAdvice = await getAIRecyclingAdvice(
        `${analysisResult.name}, ${analysisResult.category}, ${analysisResult.description}`,
        objectMaterialResult.shortDescription
      );

      if (aiRecyclingAdvice) {
        console.log("✅ Generated AI recycling advice");
      }
    }

    // Calculate points based on confidence and recyclability
    const points =
      Math.floor((analysisResult.confidence || 50) / 2) +
      (wasteGuideDetails ? 10 : 0);

    // Save scan result to database
    const scannedAt = new Date().toISOString();
    const suggestionsJson = JSON.stringify(analysisResult.suggestions || []);
    const wasteGuideMatchJson = wasteGuideDetails
      ? JSON.stringify({
          id: wasteGuideDetails.id,
          title: wasteGuideDetails.title,
          synonyms: wasteGuideDetails.synonyms || [],
          notes: wasteGuideDetails.notes || null,
          wasteTypes: wasteGuideDetails.wasteTypes || [],
          recyclingMethods: wasteGuideDetails.recyclingMethods || [],
          instructions: wasteGuideDetails.instructions || null,
        })
      : null;

    db.run(
      `INSERT INTO product_scans 
       (user_id, name, brand, category, barcode, points, rating, description, 
        recyclability, suggestions, confidence, analysis_method, 
        object_material, waste_guide_match, ai_recycling_advice, is_dangerous, 
        danger_warning, general_tips, alternative_answers, image_path, photo_width, photo_height, scanned_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId || null,
        analysisResult.name,
        analysisResult.brand,
        analysisResult.category,
        "camera-scanned",
        points,
        analysisResult.confidence || 50,
        `${objectMaterialResult.shortDescription} - ${analysisResult.description}`,
        analysisResult.recyclability,
        suggestionsJson,
        analysisResult.confidence,
        "openai-vision-with-hsy",
        objectMaterialResult.shortDescription,
        wasteGuideMatchJson,
        aiRecyclingAdvice ? aiRecyclingAdvice.recyclingAdvice : null,
        aiRecyclingAdvice ? (aiRecyclingAdvice.isDangerous ? 1 : 0) : 0,
        aiRecyclingAdvice ? aiRecyclingAdvice.dangerWarning : null,
        aiRecyclingAdvice
          ? JSON.stringify(aiRecyclingAdvice.generalTips)
          : null,
        JSON.stringify(analysisResult.alternativeAnswers || []),
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
          rating: analysisResult.confidence || 50,
          description: `${objectMaterialResult.shortDescription} - ${analysisResult.description}`,
          scannedAt: scannedAt,
          photoUri: `/uploads/${path.basename(imagePath)}`,
          photoWidth: 0,
          photoHeight: 0,
          recyclability: analysisResult.recyclability,
          suggestions: analysisResult.suggestions || [],
          confidence: analysisResult.confidence,
          analysisMethod: "openai-vision-with-hsy",
          objectMaterial: objectMaterialResult.shortDescription,
          wasteGuideMatch: wasteGuideDetails
            ? {
                id: wasteGuideDetails.id,
                title: wasteGuideDetails.title,
                synonyms: wasteGuideDetails.synonyms || [],
                notes: wasteGuideDetails.notes || null,
                wasteTypes: wasteGuideDetails.wasteTypes || [],
                recyclingMethods: wasteGuideDetails.recyclingMethods || [],
                instructions: wasteGuideDetails.instructions || null,
              }
            : null,
          aiRecyclingAdvice: aiRecyclingAdvice
            ? {
                advice: aiRecyclingAdvice.recyclingAdvice,
                isDangerous: aiRecyclingAdvice.isDangerous,
                dangerWarning: aiRecyclingAdvice.dangerWarning,
                generalTips: aiRecyclingAdvice.generalTips,
              }
            : null,
          alternativeAnswers: analysisResult.alternativeAnswers || [],
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
        suggestions: JSON.parse(row.suggestions || "[]"),
        confidence: row.confidence,
        analysisMethod: row.analysis_method,
        objectMaterial: row.object_material,
        wasteGuideMatch: row.waste_guide_match
          ? JSON.parse(row.waste_guide_match)
          : null,
        aiRecyclingAdvice:
          row.ai_recycling_advice ||
          row.is_dangerous ||
          row.danger_warning ||
          row.general_tips
            ? {
                advice: row.ai_recycling_advice,
                isDangerous: row.is_dangerous === 1,
                dangerWarning: row.danger_warning,
                generalTips: row.general_tips
                  ? JSON.parse(row.general_tips)
                  : [],
              }
            : null,
        alternativeAnswers: row.alternative_answers
          ? JSON.parse(row.alternative_answers)
          : [],
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

// Debug endpoint to see cached HSY items
app.get("/hsy-cache", async (req, res) => {
  try {
    const hsyItems = await getHSYWasteGuideList();
    res.json({
      success: true,
      itemCount: hsyItems.length,
      items: hsyItems,
      cacheTimestamp: hsyCacheTimestamp,
      cacheAge: hsyCacheTimestamp ? Date.now() - hsyCacheTimestamp : null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Test specific HSY ID endpoint
app.get("/hsy-test/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const details = await getHSYWasteGuideDetails(id);

    res.json({
      success: !!details,
      id: id,
      details: details,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      id: req.params.id,
    });
  }
});

// Manual search in cached items
app.get("/hsy-search/:term", async (req, res) => {
  try {
    const searchTerm = req.params.term.toLowerCase();
    const hsyItems = await getHSYWasteGuideList();

    const matches = hsyItems.filter((item) => {
      const titleMatch = item.title.toLowerCase().includes(searchTerm);
      const synonymMatch = item.synonyms.some((synonym) =>
        synonym.toLowerCase().includes(searchTerm)
      );
      return titleMatch || synonymMatch;
    });

    res.json({
      success: true,
      searchTerm: req.params.term,
      matchCount: matches.length,
      matches: matches.slice(0, 10), // Return first 10 matches
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

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

    // Get HSY waste guide list
    const hsyWasteGuideList = await getHSYWasteGuideList();

    // Format HSY waste guide list for comparison
    const hsyListFormatted = hsyWasteGuideList
      .slice(0, 100)
      .map(
        (item) =>
          `ID: ${item.id}, Title: "${item.title}"${
            item.synonyms.length > 0
              ? `, Synonyms: [${item.synonyms.join(", ")}]`
              : ""
          }`
      )
      .join("\n");

    // Use OpenAI to find the best match
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
                text: `Find the best match for this search term in the HSY waste guide:

SEARCH TERM: "${searchTerm}"

HSY Waste Guide Items:
${hsyListFormatted}

Compare the search term with titles and synonyms. Return the ID of the best match or "null" if no good match exists.
Response format: Just the ID number (e.g., "123") or "null"`,
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

    const matchContent = response.data.choices[0].message.content.trim();
    let matchId = null;
    let matchDetails = null;

    if (matchContent && matchContent !== "null" && matchContent !== "NULL") {
      const parsedId = parseInt(matchContent.replace(/['"]/g, ""));
      if (!isNaN(parsedId)) {
        matchId = parsedId;
        matchDetails = await getHSYWasteGuideDetails(parsedId);
      }
    }

    res.json({
      success: true,
      searchTerm: searchTerm,
      matchId: matchId,
      match: matchDetails,
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

// Initialize HSY cache on startup
async function initializeServer() {
  try {
    console.log("Initializing HSY waste guide cache...");
    await getHSYWasteGuideList();
    console.log("✅ HSY cache initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize HSY cache:", error.message);
    console.log(
      "Server will continue without HSY cache - it will be loaded on first request"
    );
  }
}

// Start server
app.listen(PORT, "0.0.0.0", async () => {
  console.log(`Backend running at http://0.0.0.0:${PORT}`);
  console.log(`Local access: http://localhost:${PORT}`);
  console.log(`Network access: http://192.168.1.145:${PORT}`);

  // Initialize HSY cache
  await initializeServer();
});
