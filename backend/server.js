
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
const userRoutes = require("./routes/userRoutes");

const app = express();

// Allowed frontend origins
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://kppsc-nextjs-z619.vercel.app",
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL_PREVIEW,
].filter(Boolean);

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests without Origin, e.g. server-to-server requests
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.error("CORS blocked origin:", origin);
    return callback(new Error("Origin not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// CORS must run before API routes
app.use(cors(corsOptions));

// Explicitly handle preflight requests
app.options(/.*/, cors(corsOptions));

// Parse request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "KPPSC Backend API is running",
  });
});

// Health endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "KPPSC API is running",
  });
});

// API routes
app.use("/api", userRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/adminroute", adminRoutes);
app.use("/api/photo", photoRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/ads", advertisementRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/schedules", scheduleRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Central error handler
app.use((err, req, res, next) => {
  console.error("API Error:", err.message);

  if (res.headersSent) {
    return next(err);
  }

  if (err.message === "Origin not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "Origin not allowed by CORS",
    });
  }

  return res.status(err.status || 500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
});

// Connect to MongoDB
connectDB().catch((error) => {
  console.error("MongoDB connection failed:", error.message);
});

// Start server only in local development
const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`KPPSC server running on port ${PORT}`);
  });
}

module.exports = app;
