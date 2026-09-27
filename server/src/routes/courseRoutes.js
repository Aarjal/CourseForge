const express = require("express");
const router = express.Router();
const { getCourses, getCourseById, createCourse, updateCourse } = require("../controllers/courseController");

router.get("/", getCourses);
router.get("/:id", getCourseById);
router.post("/", createCourse);
router.put("/:id", updateCourse);

module.exports = router;