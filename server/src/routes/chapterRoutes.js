const express = require("express");
const router = express.Router({ mergeParams: true});
const { createChapter } = require("../controllers/chapterController");

router.post("/", createChapter);

module.exports = router;