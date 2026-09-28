require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const courseRoutes = require("./routes/courseRoutes");
const chapterRoutes = require("./routes/chapterRoutes");
const chapterFlatRoutes = require("./routes/chapterFlatRoutes");
const app = express();
const PORT = process.env.PORT || 5000;

// const Course = require("./models/course"); just testing if server's running
// const Chapter = require("./models/chapter");



app.use(express.json());
app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://aarjal.github.io",
    ],
}));
app.use("/api/courses", courseRoutes);
app.use("/api/courses/:course_id/chapters", chapterRoutes);
app.use("/api/chapters", chapterFlatRoutes);
app.get("/api/health", (req,res) => {
    res.json({
        message: "server is running yay",
    });
});
connectDB();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
