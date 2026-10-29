
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const photoRoutes = require("./routes/photoRoutes");
const profileRoutes = require("./routes/profileRoutes");
const adminRoutes = require("./routes/adminRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const advertisementRoutes = require("./routes/advertisnmetRoute");
const contactRoutes = require("./routes/contactRoutes");
const scheduleRoutes = require("./routes/ScheduleRoutes");

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

app.use("/api", require("./routes/userRoutes"));
app.use("/api/profile", profileRoutes);
app.use("/api/adminroute", adminRoutes);
app.use("/api/photo", photoRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/ads", advertisementRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/schedules", scheduleRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "KPPSC API is running." });
});

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "KPPSC Backend API is running",
  });
});

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
