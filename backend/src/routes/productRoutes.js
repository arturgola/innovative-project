const express = require("express");
const router = express.Router();
const upload = require("../../middleware/upload");
const productController = require("../controllers/productController");

router.post(
  "/analyze-product",
  upload.single("image"),
  productController.analyzeProduct
);
router.get("/users/:id/scans", productController.getUserScans);

module.exports = router;
