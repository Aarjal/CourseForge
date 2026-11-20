const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { protect, authorize } = require("../middleware/auth");
const { uploadSingle, uploadBatch } = require("../controllers/uploadController");

// Uploads require authentication (instructor or admin)
router.post(
  "/",
  protect,
  authorize("instructor", "admin"),
  upload.single("file"),
  uploadSingle
);

router.post(
  "/batch",
  protect,
  authorize("instructor", "admin"),
  upload.array("files", 10),
  uploadBatch
);

module.exports = router;
