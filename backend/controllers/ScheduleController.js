const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const Schedule = require("../models/Schedule");

const removeFile = (relativePath) => {
  if (!relativePath) return;
  fs.unlink(path.join(__dirname, "..", relativePath), () => {});
};

const validate = ({ post, applicationStart, applicationEnd, examDate }) => {
  if (!post || !String(post).trim()) return "Post / Exam name is required.";

  const start = new Date(applicationStart);
  const end = new Date(applicationEnd);
  const exam = new Date(examDate);

  if ([start, end, exam].some((d) => Number.isNaN(d.getTime()))) {
    return "Please provide valid dates.";
  }
  if (end < start) return "Application end date cannot be before start date.";
  if (exam < end) return "Exam date cannot be before application end date.";
  return null;
};

// GET /api/schedules  (public)
exports.getSchedules = async (_req, res) => {
  try {
    const data = await Schedule.find().sort({ examDate: 1 }).lean();
    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch schedules." });
  }
};

// POST /api/schedules  (admin)
exports.createSchedule = async (req, res) => {
  const error = validate(req.body);
  if (error) {
    if (req.file) removeFile(`uploads/schedules/${req.file.filename}`);
    return res.status(400).json({ success: false, message: error });
  }

  try {
    const schedule = await Schedule.create({
      post: req.body.post.trim(),
      applicationStart: req.body.applicationStart,
      applicationEnd: req.body.applicationEnd,
      examDate: req.body.examDate,
      pdf: req.file ? `uploads/schedules/${req.file.filename}` : "",
    });
    res.status(201).json({ success: true, data: schedule });
  } catch (err) {
    console.error(err);
    if (req.file) removeFile(`uploads/schedules/${req.file.filename}`);
    res.status(500).json({ success: false, message: "Failed to create schedule." });
  }
};

// PUT /api/schedules/:id  (admin)
exports.updateSchedule = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ success: false, message: "Invalid schedule id." });
  }

  try {
    const schedule = await Schedule.findById(id);
    if (!schedule) {
      if (req.file) removeFile(`uploads/schedules/${req.file.filename}`);
      return res.status(404).json({ success: false, message: "Schedule not found." });
    }

    const merged = {
      post: req.body.post ?? schedule.post,
      applicationStart: req.body.applicationStart ?? schedule.applicationStart,
      applicationEnd: req.body.applicationEnd ?? schedule.applicationEnd,
      examDate: req.body.examDate ?? schedule.examDate,
    };

    const error = validate(merged);
    if (error) {
      if (req.file) removeFile(`uploads/schedules/${req.file.filename}`);
      return res.status(400).json({ success: false, message: error });
    }

    Object.assign(schedule, merged, { post: String(merged.post).trim() });

    if (req.file) {
      removeFile(schedule.pdf);
      schedule.pdf = `uploads/schedules/${req.file.filename}`;
    }

    await schedule.save();
    res.json({ success: true, data: schedule });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to update schedule." });
  }
};


exports.deleteSchedule = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ success: false, message: "Invalid schedule id." });
  }

  try {
    const schedule = await Schedule.findByIdAndDelete(id);
    if (!schedule) {
      return res.status(404).json({ success: false, message: "Schedule not found." });
    }
    removeFile(schedule.pdf);
    res.json({ success: true, data: null, message: "Schedule deleted." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to delete schedule." });
  }
};