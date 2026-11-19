const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const { getOverview } = require("../controllers/analyticsController");

// Accessible to instructors and admins
router.get("/overview", protect, authorize("instructor", "admin"), getOverview);

module.exports = router;
