require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const courseRoutes = require("./routes/courseRoutes");
const chapterRoutes = require("./routes/chapterRoutes");
const chapterFlatRoutes = require("./routes/chapterFlatRoutes");
const app = express();
const PORT = process.env.PORT || 5000;

const defaultOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://aarjal.github.io",
];

const allowedOrigins = process.env.CLIENT_ORIGIN
    ? process.env.CLIENT_ORIGIN.split(",").map((origin) => origin.trim()).filter(Boolean)
    : defaultOrigins;

app.use(express.json());
app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true,
    })
);
app.use("/api/courses", courseRoutes);
app.use("/api/courses/:course_id/chapters", chapterRoutes);
app.use("/api/chapters", chapterFlatRoutes);
app.get("/api/health", (req, res) => {
    res.json({
        message: "server is running yay",
    });
});

app.use((err, req, res, next) => {
    if (err.message === "Not allowed by CORS") {
        return res.status(403).json({ error: "Not allowed by CORS" });
    }
    res.status(500).json({ error: err.message || "Internal server error" });
});

connectDB();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
