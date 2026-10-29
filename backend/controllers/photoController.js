
const crypto = require("crypto");
const Photo = require("../models/photo");
const { uploadBuffer, deleteAsset } = require("../config/cloudinary");

const uploadProfilePhoto = async (req, res) => {
  let uploaded = null;

  try {
    if (!req.file) {
      return res.status(400).json({ error: "No photo uploaded." });
    }

    const { cnic } = req.params;

    if (!cnic) {
      return res.status(400).json({ error: "CNIC is required." });
    }

    uploaded = await uploadBuffer(req.file.buffer, {
      folder: "kppsc/profile-photos",
      resourceType: "image",
      publicId: `profile-${crypto.randomUUID()}`,
    });

    const previous = await Photo.findOne({ cnic });

    const photo = await Photo.findOneAndUpdate(
      { cnic },
      {
        cnic,
        filename: uploaded.publicId,
        url: uploaded.url,
        publicId: uploaded.publicId,
        uploadedAt: new Date(),
      },
      { upsert: true, new: true, runValidators: true }
    );

    // Remove the previous image only after the database update succeeds.
    if (previous?.publicId && previous.publicId !== uploaded.publicId) {
      try {
        await deleteAsset(previous.publicId, "image");
      } catch (error) {
        console.error("Old profile photo cleanup failed:", error.message);
      }
    }

    return res.json({ photo: photo.url });
  } catch (error) {
    console.error("uploadProfilePhoto:", error);

    if (uploaded?.publicId) {
      try {
        await deleteAsset(uploaded.publicId, "image");
      } catch (cleanupError) {
        console.error("Photo cleanup failed:", cleanupError.message);
      }
    }

    return res.status(500).json({ error: "Failed to upload profile photo." });
  }
};

const getPhotoByCnic = async (req, res) => {
  try {
    const { cnic } = req.params;
    const photo = await Photo.findOne({ cnic }).sort({ uploadedAt: -1 });

    return res.json({ photo: photo?.url || null });
  } catch (error) {
    console.error("getPhotoByCnic:", error);
    return res.status(500).json({ error: "Failed to fetch profile photo." });
  }
};

module.exports = { uploadProfilePhoto, getPhotoByCnic };
