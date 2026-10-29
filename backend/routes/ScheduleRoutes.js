
const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const crypto = require("crypto");

const controller = require("../controllers/ScheduleController");

const router = express.Router();

const uploadDir = path.join(__dirname, "..", "uploads", "schedules");
fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, _file, cb) => {
      cb(
        null,
        `${Date.now()}-${crypto.randomBytes(6).toString("hex")}.pdf`
      );
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files are allowed."));
    }
    cb(null, true);
  },
});

const uploadPdf = (req, res, next) => {
  upload.single("pdf")(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }
    next();
  });
};


router.get("/", controller.getSchedules);
router.post("/", uploadPdf, controller.createSchedule);
router.put("/:id", uploadPdf, controller.updateSchedule);
router.delete("/:id", controller.deleteSchedule);

module.exports = router;
