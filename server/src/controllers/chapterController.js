const Chapter = require("../models/chapter");
const Course = require("../models/course");

const getChaptersByCourse = async (req, res, next) => {
  try {
    const chapters = await Chapter.find({ course: req.params.course_id }).sort({
      order: 1,
    });
    res.status(200).json(chapters);
  } catch (error) {
    next(error);
  }
};

const getChapterById = async (req, res, next) => {
  try {
    const chapter = await Chapter.findById(req.params.id);
    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }
    res.status(200).json(chapter);
  } catch (error) {
    next(error);
  }
};

const createChapter = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.course_id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    let order = req.body.order;
    if (order === undefined || order === null) {
      const highest = await Chapter.findOne({
        course: req.params.course_id,
      }).sort({ order: -1 });
      order = highest ? highest.order + 1 : 1;
    }

    const chapter = await Chapter.create({
      ...req.body,
      order,
      course: req.params.course_id,
    });

    res.status(201).json(chapter);
  } catch (error) {
    next(error);
  }
};

const updateChapter = async (req, res, next) => {
  try {
    const chapter = await Chapter.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: "after",
      runValidators: true,
    });

    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    res.status(200).json(chapter);
  } catch (error) {
    next(error);
  }
};

const deleteChapter = async (req, res, next) => {
  try {
    const chapter = await Chapter.findByIdAndDelete(req.params.id);

    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    res.status(200).json({ message: "Chapter deleted successfully" });
  } catch (error) {
    next(error);
  }
};

const reorderChapters = async (req, res, next) => {
  try {
    const { chapterOrders } = req.body; // [{ id: string, order: number }]

    const updatePromises = chapterOrders.map((item) =>
      Chapter.findOneAndUpdate(
        { _id: item.id, course: req.params.course_id },
        { order: item.order },
        { returnDocument: "after" }
      )
    );

    await Promise.all(updatePromises);

    const updatedChapters = await Chapter.find({
      course: req.params.course_id,
    }).sort({ order: 1 });

    res.status(200).json(updatedChapters);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getChaptersByCourse,
  getChapterById,
  createChapter,
  updateChapter,
  deleteChapter,
  reorderChapters,
};
