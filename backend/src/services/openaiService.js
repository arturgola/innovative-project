const axios = require("axios");
const { OPENAI_API_KEY, OPENAI_API_URL } = require("../../config/constants");
const {
  convertImageToBase64,
  cleanOpenAIResponse,
} = require("../utils/helpers");

class OpenAIService {
  /**
   * Analyze object material from image
   */
  async analyzeObjectMaterial(imagePath) {
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

  /**
   * Get AI recycling advice when no HSY match found
   */
  async getAIRecyclingAdvice(productDescription, objectMaterial) {
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

  /**
   * Analyze product image with HSY waste guide list
   */
  async analyzeProductImage(imagePath, hsyWasteGuideList) {
    try {
      const base64Image = await convertImageToBase64(imagePath);

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

      // Step 1: Analyze the image
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

      return {
        name,
        brand,
        category,
        material,
        recyclability: material,
        description: sortingExplanation,
        suggestions: [sortingExplanation],
        confidence,
        keywords,
        alternativeAnswers: analysisResult.alternativeAnswers || [],
      };
    } catch (error) {
      console.error("Error analyzing image with OpenAI:", error);
      throw error;
    }
  }

  /**
   * Find HSY match for item with reasoning
   */
  async findHSYMatch(
    productDescription,
    name,
    category,
    material,
    hsyListFormatted
  ) {
    try {
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
          matchReasoning =
            matchResult.reasoning || "No suitable HSY match found";
        }
      } catch (parseError) {
        if (
          matchContent &&
          matchContent !== "null" &&
          matchContent !== "NULL"
        ) {
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

      return { hsyMatchId, matchReasoning };
    } catch (error) {
      console.error("Error finding HSY match:", error);
      return { hsyMatchId: null, matchReasoning: "Error during matching" };
    }
  }

  /**
   * Find HSY matches for alternative answers
   */
  async findAlternativeHSYMatches(alternatives, hsyListFormatted) {
    const alternativeAnswers = [];

    for (let i = 0; i < alternatives.length && i < 4; i++) {
      const alt = alternatives[i];
      const altDescription = `${alt.itemName}, ${alt.material}`;

      try {
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

        alternativeAnswers.push({
          itemName: alt.itemName,
          material: alt.material,
          sortingExplanation: alt.sortingExplanation,
          confidence: alt.confidence,
          hsyMatchId: altHsyMatchId,
        });
      } catch (error) {
        console.error(
          `Error finding HSY match for alternative #${i + 1}:`,
          error
        );
        alternativeAnswers.push({
          itemName: alt.itemName,
          material: alt.material,
          sortingExplanation: alt.sortingExplanation,
          confidence: alt.confidence,
          hsyMatchId: null,
        });
      }
    }

    console.log(`${"=".repeat(70)}\n`);
    return alternativeAnswers;
  }
}

module.exports = new OpenAIService();
