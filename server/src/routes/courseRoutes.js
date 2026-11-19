const express = require("express");
const router = express.Router();
const validate = require("../middleware/validate");
const {
  createCourseSchema,
  updateCourseSchema,
} = require("../validations/courseValidation");
const {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  togglePublish,
} = require("../controllers/courseController");

router.get("/", getCourses);
router.get("/:id", getCourseById);
router.post("/", validate(createCourseSchema), createCourse);
router.put("/:id", validate(updateCourseSchema), updateCourse);
router.delete("/:id", deleteCourse);
router.patch("/:id/publish", togglePublish);

module.exports = router;
