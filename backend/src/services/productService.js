const fs = require("fs");
const path = require("path");
const openaiService = require("./openaiService");
const hsyService = require("./hsyService");

class ProductService {
  /**
   * Analyze product and get complete analysis result
   */
  async analyzeProduct(imagePath) {
    try {
      // Step 1: Get HSY waste guide list
      console.log("Fetching HSY waste guide list...");
      const hsyWasteGuideList = await hsyService.getHSYWasteGuideList();

      console.log(`✅ Retrieved HSY cache: ${hsyWasteGuideList.length} items`);
      if (hsyWasteGuideList.length < 600) {
        console.warn(
          `⚠️ WARNING: HSY cache has fewer items than expected (${hsyWasteGuideList.length} < 600)`
        );
      }

      // Step 2: Get object and material analysis
      const objectMaterialResult = await openaiService.analyzeObjectMaterial(
        imagePath
      );

      // Step 3: Analyze the image with HSY list
      console.log("Analyzing image with OpenAI and HSY waste guide...");
      const analysisResult = await openaiService.analyzeProductImage(
        imagePath,
        hsyWasteGuideList
      );

      analysisResult.objectMaterial = objectMaterialResult.shortDescription;

      // Step 4: Find HSY match for primary answer
      const hsyListFormatted = this.formatHSYList(hsyWasteGuideList);
      const productDescription = `${analysisResult.name}, ${analysisResult.material}, ${analysisResult.category}`;

      const { hsyMatchId } = await openaiService.findHSYMatch(
        productDescription,
        analysisResult.name,
        analysisResult.category,
        analysisResult.material,
        hsyListFormatted
      );

      analysisResult.hsyMatchId = hsyMatchId;

      // Step 5: Find HSY matches for alternatives
      const alternativeAnswers = await openaiService.findAlternativeHSYMatches(
        analysisResult.alternativeAnswers || [],
        hsyListFormatted
      );

      // Step 6: Fetch detailed HSY information
      let wasteGuideDetails = null;
      let aiRecyclingAdvice = null;

      if (hsyMatchId) {
        console.log(`Fetching HSY details for ID: ${hsyMatchId}`);
        wasteGuideDetails = await hsyService.getHSYWasteGuideDetails(
          hsyMatchId
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

        console.log("Getting AI fallback recycling advice...");
        aiRecyclingAdvice = await openaiService.getAIRecyclingAdvice(
          `${analysisResult.name}, ${analysisResult.category}, ${analysisResult.description}`,
          objectMaterialResult.shortDescription
        );

        if (aiRecyclingAdvice) {
          console.log("✅ Generated AI recycling advice");
        }
      }

      // Step 7: Fetch HSY details for alternatives
      for (let i = 0; i < alternativeAnswers.length; i++) {
        const alt = alternativeAnswers[i];
        if (alt.hsyMatchId) {
          console.log(`   Fetching HSY details for alternative #${i + 1}...`);
          const altWasteGuideDetails = await hsyService.getHSYWasteGuideDetails(
            alt.hsyMatchId
          );
          if (altWasteGuideDetails) {
            console.log(
              `   ✅ Found HSY details: "${altWasteGuideDetails.title}"`
            );
            alt.wasteGuideMatch = {
              id: altWasteGuideDetails.id,
              title: altWasteGuideDetails.title,
              synonyms: altWasteGuideDetails.synonyms || [],
              notes: altWasteGuideDetails.notes || null,
              wasteTypes: altWasteGuideDetails.wasteTypes || [],
              recyclingMethods: altWasteGuideDetails.recyclingMethods || [],
            };
          }
        }
      }

      analysisResult.alternativeAnswers = alternativeAnswers;

      return {
        analysisResult,
        wasteGuideDetails,
        aiRecyclingAdvice,
        objectMaterialResult,
      };
    } catch (error) {
      console.error("Error in product analysis:", error);
      throw error;
    }
  }

  /**
   * Format HSY list for OpenAI
   */
  formatHSYList(hsyWasteGuideList) {
    return hsyWasteGuideList
      .map(
        (item) =>
          `ID: ${item.id}, Title: "${item.title}"${
            item.synonyms.length > 0
              ? `, Synonyms: [${item.synonyms.join(", ")}]`
              : ""
          }`
      )
      .join("\n");
  }

  /**
   * Calculate points based on analysis
   */
  calculatePoints(confidence, hasWasteGuideMatch) {
    return Math.floor((confidence || 50) / 2) + (hasWasteGuideMatch ? 10 : 0);
  }

  /**
   * Clean up uploaded image file
   */
  cleanupImageFile(imagePath) {
    fs.unlink(imagePath, (unlinkErr) => {
      if (unlinkErr) console.error("Error deleting file:", unlinkErr);
    });
  }

  /**
   * Build product response object
   */
  buildProductResponse(
    scanId,
    analysisResult,
    points,
    scannedAt,
    imagePath,
    wasteGuideDetails,
    aiRecyclingAdvice,
    objectMaterial
  ) {
    return {
      id: scanId,
      name: analysisResult.name,
      brand: analysisResult.brand,
      category: analysisResult.category,
      barcode: "camera-scanned",
      points: points,
      rating: analysisResult.confidence || 50,
      description: `${objectMaterial} - ${analysisResult.description}`,
      scannedAt: scannedAt,
      photoUri: `/uploads/${path.basename(imagePath)}`,
      photoWidth: 0,
      photoHeight: 0,
      recyclability: analysisResult.recyclability,
      suggestions: analysisResult.suggestions || [],
      confidence: analysisResult.confidence,
      analysisMethod: "openai-vision-with-hsy",
      objectMaterial: objectMaterial,
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
  }

  /**
   * Build fallback product response for errors
   */
  buildFallbackResponse() {
    return {
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
    };
  }
}

module.exports = new ProductService();
