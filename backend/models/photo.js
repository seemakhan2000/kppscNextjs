const mongoose = require("mongoose");

const photoSchema = new mongoose.Schema({
  cnic: { type: String, required: true },
  filename: { type: String, required: true },
  url: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Photo || mongoose.model("Photo", photoSchema);
