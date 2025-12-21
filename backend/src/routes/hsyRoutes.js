const express = require("express");
const router = express.Router();
const hsyController = require("../controllers/hsyController");

router.get("/hsy-cache", hsyController.getHSYCache);
router.get("/hsy-test/:id", hsyController.testHSYById);
router.get("/hsy-search/:term", hsyController.searchHSY);
router.get("/waste-guide", hsyController.getWasteGuide);
router.post("/waste-guide/search", hsyController.searchWasteGuide);
router.get("/hsy-auth-test", hsyController.testHSYAuth);

module.exports = router;
