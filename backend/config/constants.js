require("dotenv").config();

module.exports = {
  PORT: process.env.PORT || 3000,

  // OpenAI Configuration
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_API_URL: "https://api.openai.com/v1/chat/completions",

  // HSY Waste Guide API Configuration
  HSY_WASTE_API_URL:
    "https://dev.klapi.hsy.fi/int2001/v1/waste-guide-api/waste-pages?lang=en",
  HSY_CLIENT_ID: process.env.HSY_CLIENT_ID,
  HSY_CLIENT_SECRET: process.env.HSY_CLIENT_SECRET,
  HSY_CACHE_DURATION: 24 * 60 * 60 * 1000, // 24 hours in milliseconds

  // File upload configuration
  UPLOAD_DIR: "./uploads",
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB

  // User level configuration
  POINTS_PER_LEVEL: 200,
};
