const axios = require("axios");
const fs = require("fs");
require("dotenv").config();

const HSY_WASTE_API_URL =
  "https://dev.klapi.hsy.fi/int2001/v1/waste-guide-api/waste-pages?lang=en";
const HSY_CLIENT_ID = process.env.HSY_CLIENT_ID;
const HSY_CLIENT_SECRET = process.env.HSY_CLIENT_SECRET;

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

async function fetchAllTitles() {
  try {
    console.log("Fetching HSY waste guide data...");
    const headers = getHSYHeaders();

    const response = await axios.get(HSY_WASTE_API_URL, {
      timeout: 10000,
      headers: headers,
    });

    const responseData = response.data;
    const wasteItems = responseData.hits || responseData;

    console.log(`Found ${wasteItems.length} waste guide items`);

    // Extract all titles and additional info
    const items = wasteItems
      .filter((item) => item.title)
      .map((item) => ({
        title: item.title,
        synonyms: item.synonyms || [],
        id: item.id || "N/A",
        wasteTypes: item.wasteTypes || [],
        recyclingMethods: item.recyclingMethods || [],
      }))
      .sort((a, b) => a.title.localeCompare(b.title));

    // Create a JSON file for programmatic use
    const jsonPath = "../hsy_waste_guide_data.json";
    fs.writeFileSync(jsonPath, JSON.stringify(items, null, 2));
    console.log(`✅ Successfully fetched ${items.length} waste guide items`);
    console.log(`📄 JSON data saved to: ${jsonPath}`);
  } catch (error) {
    console.error("❌ Error fetching HSY data:", error.message);
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    }

    // Check if it's an authentication issue
    if (!HSY_CLIENT_ID || !HSY_CLIENT_SECRET) {
      console.error("🔑 Missing HSY credentials in environment variables");
      console.error("Please set HSY_CLIENT_ID and HSY_CLIENT_SECRET");
    }
  }
}

fetchAllTitles();
