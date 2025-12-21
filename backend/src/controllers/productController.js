const database = require("../../config/database");
const asyncHandler = require("../../middleware/asyncHandler");
const productService = require("../services/productService");
const { calculateLevel } = require("../utils/helpers");

class ProductController {
  /**
   * Analyze product image and save scan result
   */
  analyzeProduct = asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    const imagePath = req.file.path;
    const { userId } = req.body;

    console.log("Analyzing product image for user:", userId);

    try {
      const {
        analysisResult,
        wasteGuideDetails,
        aiRecyclingAdvice,
        objectMaterialResult,
      } = await productService.analyzeProduct(imagePath);

      const points = productService.calculatePoints(
        analysisResult.confidence,
        !!wasteGuideDetails
      );

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

      const db = database.getDb();

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
          0,
          0,
          scannedAt,
        ],
        function (err) {
          if (err) {
            console.error("Database error:", err);
            productService.cleanupImageFile(imagePath);
            return res.status(500).json({ error: err.message });
          }

          if (userId) {
            db.get(
              "SELECT total_points FROM users WHERE id = ?",
              [userId],
              (getErr, userRow) => {
                if (getErr) {
                  console.error(
                    "Error fetching user for level update:",
                    getErr
                  );
                  return;
                }
                if (!userRow) {
                  console.warn("User not found for level update:", userId);
                  return;
                }

                const previousTotal = userRow.total_points || 0;
                const newTotalPoints = previousTotal + points;
                const newLevel = calculateLevel(newTotalPoints);

                db.run(
                  `UPDATE users
                   SET total_points = ?,
                       level = ?,
                       scans_today = COALESCE(scans_today, 0) + 1,
                       updated_at = CURRENT_TIMESTAMP
                   WHERE id = ?`,
                  [newTotalPoints, newLevel, userId],
                  (updateErr) => {
                    if (updateErr) {
                      console.error(
                        "Error updating user stats/level:",
                        updateErr
                      );
                    } else {
                      console.log(
                        `User ${userId} updated: total_points=${newTotalPoints}, level=${newLevel}`
                      );
                    }
                  }
                );
              }
            );
          }

          const productWithAnalysis = productService.buildProductResponse(
            this.lastID,
            analysisResult,
            points,
            scannedAt,
            imagePath,
            wasteGuideDetails,
            aiRecyclingAdvice,
            objectMaterialResult.shortDescription
          );

          res.json(productWithAnalysis);
        }
      );
    } catch (error) {
      console.error("Error analyzing product:", error);
      productService.cleanupImageFile(imagePath);

      res.status(500).json({
        error: "Analysis failed",
        fallback: productService.buildFallbackResponse(),
      });
    }
  });

  /**
   * Get user's scan history
   */
  getUserScans = asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const db = database.getDb();

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
          photoUri: `/uploads/${require("path").basename(row.image_path)}`,
          photoWidth: row.photo_width,
          photoHeight: row.photo_height,
          scannedAt: row.scanned_at,
        }));

        res.json(scans);
      }
    );
  });
}

module.exports = new ProductController();
