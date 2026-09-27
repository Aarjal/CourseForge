const Chapter = require("../models/chapter");

const createChapter = async (req, res) => {
    try {
        const chapter = await Chapter.create({
            ...req.body,
            course: req.params.course_id,
        });
        res.status(201).json(chapter);
    } catch(error) {
        res.status(400).json({ message: "Failed to create chapter", error: error.message});
    }
};

module.exports = { createChapter };