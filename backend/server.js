const express = require("express");
const cors = require("cors");
const path = require("path");

// Import configuration
const { PORT } = require("./config/constants");
const database = require("./config/database");

// Import middleware
const errorHandler = require("./middleware/errorHandler");

// Import routes
const itemRoutes = require("./src/routes/itemRoutes");
const userRoutes = require("./src/routes/userRoutes");
const productRoutes = require("./src/routes/productRoutes");
const hsyRoutes = require("./src/routes/hsyRoutes");

// Import services
const hsyService = require("./src/services/hsyService");

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use("/uploads", express.static("uploads"));

app.use("/uploads", express.static("uploads"));

// Routes
app.use("/items", itemRoutes);
app.use("/users", userRoutes);
app.use("/", productRoutes);
app.use("/", hsyRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

/**
 * Initialize HSY cache on startup
 */
async function initializeServer() {
  try {
    console.log("Initializing database...");
    await database.initialize();
    console.log("✅ Database initialized successfully");

    console.log("Initializing HSY waste guide cache...");
    await hsyService.getHSYWasteGuideList();
    console.log("✅ HSY cache initialized successfully");
  } catch (error) {
    console.error("❌ Server initialization error:", error.message);
    console.log(
      "Server will continue - missing components will be loaded on demand"
    );
  }
}

/**
 * Start server
 */
app.listen(PORT, "0.0.0.0", async () => {
  console.log(`Backend running at http://0.0.0.0:${PORT}`);
  console.log(`Local access: http://localhost:${PORT}`);
  console.log(`Network access: http://192.168.1.145:${PORT}`);

  await initializeServer();
});
