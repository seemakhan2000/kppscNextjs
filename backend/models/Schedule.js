const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema(
  {
    post: { type: String, required: true, trim: true, maxlength: 200 },
    applicationStart: { type: Date, required: true },
    applicationEnd: { type: Date, required: true },
    examDate: { type: Date, required: true },
    pdf: { type: String, default: "" }, // e.g. uploads/schedules/123-abc.pdf
  },
  { timestamps: true }
);

scheduleSchema.index({ examDate: 1 });

module.exports = mongoose.model("Schedule", scheduleSchema);