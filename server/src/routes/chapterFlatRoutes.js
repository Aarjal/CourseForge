const express = require("express");
const router = express.Router();
const { updateChapter, deleteChapter } = require("../controllers/chapterController");

router.put("/:id", updateChapter);
router.delete("/:id", deleteChapter);

module.exports = router;