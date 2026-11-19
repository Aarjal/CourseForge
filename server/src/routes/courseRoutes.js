const express = require("express");
const router = express.Router();
const validate = require("../middleware/validate");
const { protect, authorize } = require("../middleware/auth");
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

// Public routes
router.get("/", getCourses);
router.get("/:id", getCourseById);

// Protected routes — require instructor or admin role
router.post(
  "/",
  protect,
  authorize("instructor", "admin"),
  validate(createCourseSchema),
  createCourse
);
router.put(
  "/:id",
  protect,
  authorize("instructor", "admin"),
  validate(updateCourseSchema),
  updateCourse
);
router.delete("/:id", protect, authorize("instructor", "admin"), deleteCourse);
router.patch(
  "/:id/publish",
  protect,
  authorize("instructor", "admin"),
  togglePublish
);

module.exports = router;
