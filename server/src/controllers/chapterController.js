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

const updateChapter = async (req, res) => {
    try {
        const chapter = await Chapter.findByIdAndUpdate( req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!chapter) {
            return res.status(404).json({ message:"chapter not found"});
        }
        
        res.status(200).json(chapter);
    } catch ( error) {
        res.status(400).json( {message: "Failed to update chapter", error: error.message})
    }
};

const deleteChapter = async (req, res) => {
    try {
        const chapter = await Chapter.findByIdAndDelete(req.params.id);

        if (!chapter) {
            return res.status(404).json({ message: "Chapter not found"});
        }

        res.status(200).json({ message: "Chapter deleted successfully"});
    } catch (error) {
        res.status(500).json({ message: "Failed to delete chapter", error: error.message})
    }
};

module.exports = { createChapter, updateChapter, deleteChapter };