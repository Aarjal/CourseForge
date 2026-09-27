const mongoose = require("mongoose");

const chapterSchema = new mongoose.Schema(
    {
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        duration: {
            type: Number,
            required: true,
        },
        preview: {
            type:Boolean,
            default: false,
        },
        order: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

 module.exports = mongoose.model("Chapter", chapterSchema)