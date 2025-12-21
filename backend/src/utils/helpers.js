const fs = require("fs");

/**
 * Convert image file to base64 string
 */
const convertImageToBase64 = (imagePath) => {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    return imageBuffer.toString("base64");
  } catch (error) {
    console.error("Error converting image to base64:", error);
    throw error;
  }
};

/**
 * Clean OpenAI response and extract JSON
 */
const cleanOpenAIResponse = (content) => {
  try {
    let cleanContent = content.trim();
    cleanContent = cleanContent.replace(/^```json\s*/, "");
    cleanContent = cleanContent.replace(/^```\s*/, "");
    cleanContent = cleanContent.replace(/\s*```$/, "");
    return cleanContent.trim();
  } catch (error) {
    console.error("Error cleaning OpenAI response:", error);
    return content;
  }
};

/**
 * Calculate user level based on total points
 */
const calculateLevel = (totalPoints) => {
  const { POINTS_PER_LEVEL } = require("../../config/constants");
  const safePoints = totalPoints || 0;
  return Math.floor(safePoints / POINTS_PER_LEVEL) + 1;
};

/**
 * Get HSY authentication headers
 */
const getHSYHeaders = () => {
  const {
    HSY_CLIENT_ID,
    HSY_CLIENT_SECRET,
  } = require("../../config/constants");

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
};

module.exports = {
  convertImageToBase64,
  cleanOpenAIResponse,
  calculateLevel,
  getHSYHeaders,
};
