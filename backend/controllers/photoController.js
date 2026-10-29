
const path = require("path");
const fs = require("fs");
const Photo = require("../models/photo");

const uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No photo uploaded" });
    }

    const cnic = req.params.cnic;
    const photoPath = `/uploads/${req.file.filename}`;
    await Photo.findOneAndUpdate(
      { cnic },
      { filename: req.file.filename, url: photoPath, uploadedAt: new Date() },
      { upsert: true, new: true }
    );

    res.json({ photo: photoPath });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

const getPhotoByCnic = async (req, res) => {
  try {
    const { cnic } = req.params;
    const photo = await Photo.findOne({ cnic }).sort({ uploadedAt: -1 }); 
    if (!photo) {
      return res.json({ photo: null });
    }
    res.json({ photo: photo.url });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { uploadProfilePhoto, getPhotoByCnic };
