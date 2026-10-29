
const mongoose = require("mongoose");
const crypto = require("crypto");
const Schedule = require("../models/Schedule");
const { uploadBuffer, deleteAsset } = require("../config/cloudinary");

const validate = ({ post, applicationStart, applicationEnd, examDate }) => {
  if (!post || !String(post).trim()) {
    return "Post / Exam name is required.";
  }

  const start = new Date(applicationStart);
  const end = new Date(applicationEnd);
  const exam = new Date(examDate);

  if ([start, end, exam].some((date) => Number.isNaN(date.getTime()))) {
    return "Please provide valid dates.";
  }

  if (end < start) {
    return "Application end date cannot be before start date.";
  }

  if (exam < end) {
    return "Exam date cannot be before application end date.";
  }

  return null;
};

const uploadSchedulePdf = (file) =>
  uploadBuffer(file.buffer, {
    folder: "kppsc/schedules",
    resourceType: "raw",
    publicId: `schedule-${Date.now()}-${crypto.randomUUID()}.pdf`,
  });

exports.getSchedules = async (_req, res) => {
  try {
    const data = await Schedule.find().sort({ examDate: 1 }).lean();
    return res.json({ success: true, data });
  } catch (error) {
    console.error("getSchedules:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch schedules.",
    });
  }
};

exports.createSchedule = async (req, res) => {
  const error = validate(req.body);

  if (error) {
    return res.status(400).json({ success: false, message: error });
  }

  let uploaded = null;

  try {
    if (req.file) uploaded = await uploadSchedulePdf(req.file);

    const schedule = await Schedule.create({
      post: String(req.body.post).trim(),
      applicationStart: req.body.applicationStart,
      applicationEnd: req.body.applicationEnd,
      examDate: req.body.examDate,
      pdf: uploaded?.url || "",
      pdfPublicId: uploaded?.publicId || "",
    });

    return res.status(201).json({ success: true, data: schedule });
  } catch (error) {
    console.error("createSchedule:", error);

    if (uploaded?.publicId) {
      try {
        await deleteAsset(uploaded.publicId, "raw");
      } catch (cleanupError) {
        console.error("PDF cleanup failed:", cleanupError.message);
      }
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create schedule.",
    });
  }
};

exports.updateSchedule = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid schedule id.",
    });
  }

  let uploaded = null;

  try {
    const schedule = await Schedule.findById(id);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found.",
      });
    }

    const merged = {
      post: req.body.post ?? schedule.post,
      applicationStart: req.body.applicationStart ?? schedule.applicationStart,
      applicationEnd: req.body.applicationEnd ?? schedule.applicationEnd,
      examDate: req.body.examDate ?? schedule.examDate,
    };

    const error = validate(merged);

    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    if (req.file) uploaded = await uploadSchedulePdf(req.file);

    const oldPublicId = schedule.pdfPublicId;

    schedule.post = String(merged.post).trim();
    schedule.applicationStart = merged.applicationStart;
    schedule.applicationEnd = merged.applicationEnd;
    schedule.examDate = merged.examDate;

    if (uploaded) {
      schedule.pdf = uploaded.url;
      schedule.pdfPublicId = uploaded.publicId;
    }

    await schedule.save();

    if (uploaded && oldPublicId) {
      try {
        await deleteAsset(oldPublicId, "raw");
      } catch (cleanupError) {
        console.error("Old schedule PDF cleanup failed:", cleanupError.message);
      }
    }

    return res.json({ success: true, data: schedule });
  } catch (error) {
    console.error("updateSchedule:", error);

    if (uploaded?.publicId) {
      try {
        await deleteAsset(uploaded.publicId, "raw");
      } catch (cleanupError) {
        console.error("New PDF cleanup failed:", cleanupError.message);
      }
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update schedule.",
    });
  }
};

exports.deleteSchedule = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid schedule id.",
    });
  }

  try {
    const schedule = await Schedule.findById(id);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found.",
      });
    }

    await schedule.deleteOne();

    if (schedule.pdfPublicId) {
      try {
        await deleteAsset(schedule.pdfPublicId, "raw");
      } catch (cleanupError) {
        console.error("Schedule PDF cleanup failed:", cleanupError.message);
      }
    }

    return res.json({
      success: true,
      data: null,
      message: "Schedule deleted.",
    });
  } catch (error) {
    console.error("deleteSchedule:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete schedule.",
    });
  }
};
