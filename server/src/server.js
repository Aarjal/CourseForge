require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");
const courseRoutes = require("./routes/courseRoutes");
const app = express();
const PORT = process.env.PORT || 5000;
app.use("/api/courses", courseRoutes);
// const Course = require("./models/course"); just testing if server's running
// const Chapter = require("./models/chapter");



app.use(express.json());

app.get("/api/health", (req,res) => {
    res.json({
        message: "server is running yay",
    });
});
connectDB();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
