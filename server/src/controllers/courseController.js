const Course = require("../models/course");

const getCourses = async (req, res) => {
    try {
        const courses = await Course.find();
        res.status(200).json(courses);
    }catch (error) {
        res.status(500).json({message: "Failed to fetch course", error: error.message});
    }
};

module.exports = { getCourses };