const Course = require("../models/course");

const getCourses = async (req, res) => {
    try {
        const courses = await Course.find();
        res.status(200).json(courses);
    }catch (error) {
        res.status(500).json({message: "Failed to fetch course", error: error.message});
    }
};

const getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        
        if (!course) {
            return res.status( 404 ).json({ message: "Course not found"});
        }

        res.status(200).json(course);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch course", error: error.message });
    }
};


module.exports = { getCourses, getCourseById };