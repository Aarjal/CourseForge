const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const courseRoutes = require("./routes/courseRoutes");
const chapterRoutes = require("./routes/chapterRoutes");
const chapterFlatRoutes = require("./routes/chapterFlatRoutes");
const authRoutes = require("./routes/authRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");
const progressRoutes = require("./routes/progressRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

const defaultOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://aarjal.github.io",
];

const allowedOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(",").map((origin) => origin.trim()).filter(Boolean)
  : defaultOrigins;

app.use(express.json());
app.use(cookieParser());
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

// Health check endpoints
app.get("/api/health", (req, res) => {
  res.json({ message: "server is running yay" });
});
app.get("/api/v1/health", (req, res) => {
  res.json({ status: "ok", version: "v1" });
});

// v1 API Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/enrollments", enrollmentRoutes);
app.use("/api/v1/progress", progressRoutes);
app.use("/api/v1/analytics", analyticsRoutes);
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/courses/:course_id/chapters", chapterRoutes);
app.use("/api/v1/chapters", chapterFlatRoutes);

// Backward-compatible alias for existing endpoints
app.use("/api/auth", authRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/courses/:course_id/chapters", chapterRoutes);
app.use("/api/chapters", chapterFlatRoutes);

// Central Error Handling Middleware (must be after all routes)
app.use(errorHandler);

module.exports = app;
