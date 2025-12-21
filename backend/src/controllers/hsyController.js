const asyncHandler = require("../../middleware/asyncHandler");
const hsyService = require("../services/hsyService");
const openaiService = require("../services/openaiService");
const { OPENAI_API_URL } = require("../../config/constants");
const axios = require("axios");
const { cleanOpenAIResponse } = require("../utils/helpers");

class HSYController {
  /**
   * Get cached HSY items
   */
  getHSYCache = asyncHandler(async (req, res) => {
    const hsyItems = await hsyService.getHSYWasteGuideList();
    const cacheInfo = hsyService.getCacheInfo();

    res.json({
      success: true,
      itemCount: hsyItems.length,
      items: hsyItems,
      cacheTimestamp: cacheInfo.cacheTimestamp,
      cacheAge: cacheInfo.cacheAge,
    });
  });

  /**
   * Test specific HSY ID
   */
  testHSYById = asyncHandler(async (req, res) => {
    const id = req.params.id;
    const details = await hsyService.getHSYWasteGuideDetails(id);

    res.json({
      success: !!details,
      id: id,
      details: details,
    });
  });

  /**
   * Search cached HSY items
   */
  searchHSY = asyncHandler(async (req, res) => {
    const searchTerm = req.params.term;
    const matches = hsyService.searchCachedItems(searchTerm);

    res.json({
      success: true,
      searchTerm: searchTerm,
      matchCount: matches.length,
      matches: matches.slice(0, 10),
    });
  });

  /**
   * Get waste guide data from HSY API
   */
  getWasteGuide = asyncHandler(async (req, res) => {
    const { HSY_WASTE_API_URL } = require("../../config/constants");
    const { getHSYHeaders } = require("../utils/helpers");

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
      items: wasteItems.slice(0, 5),
      responseStructure: Object.keys(responseData),
    });
  });

  /**
   * Search waste guide with OpenAI matching
   */
  searchWasteGuide = asyncHandler(async (req, res) => {
    const { searchTerm } = req.body;
    const { OPENAI_API_KEY } = require("../../config/constants");

    if (!searchTerm) {
      return res.status(400).json({ error: "Search term is required" });
    }

    const hsyWasteGuideList = await hsyService.getHSYWasteGuideList();

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
        matchDetails = await hsyService.getHSYWasteGuideDetails(parsedId);
      }
    }

    res.json({
      success: true,
      searchTerm: searchTerm,
      matchId: matchId,
      match: matchDetails,
    });
  });

  /**
   * Test HSY authentication
   */
  testHSYAuth = asyncHandler(async (req, res) => {
    const { getHSYHeaders } = require("../utils/helpers");
    const {
      HSY_CLIENT_ID,
      HSY_CLIENT_SECRET,
    } = require("../../config/constants");

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
}

module.exports = new HSYController();
