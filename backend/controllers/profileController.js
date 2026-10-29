
const Profile = require("../models/Profile");
const Photo = require("../models/photo");

const saveProfile = async (req, res) => {
  try {
    const { profile, education = [], experience = [] } = req.body;

    if (!profile || !profile.cnic) {
      return res.status(400).json({
        success: false,
        message: "Profile CNIC is required.",
      });
    }

    if (!Array.isArray(education) || !Array.isArray(experience)) {
      return res.status(400).json({
        success: false,
        message: "Education and experience must be arrays.",
      });
    }

    const cnic = String(profile.cnic).trim();

    const savedProfile = await Profile.findOneAndUpdate(
      { cnic },
      {
        $set: {
          profile: { ...profile, cnic },
          education,
          experience,
        },
        $setOnInsert: {
          cnic,
          status: "Pending",
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Profile saved successfully.",
      profile: savedProfile,
    });
  } catch (error) {
    console.error("saveProfile error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A profile with this CNIC already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to save profile.",
    });
  }
};

const getProfileByCnic = async (req, res) => {
  try {
    const cnic = String(req.params.cnic || "").trim();

    if (!cnic) {
      return res.status(400).json({
        success: false,
        message: "CNIC is required.",
      });
    }

    const profile = await Profile.findOne({ cnic });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found.",
      });
    }

    return res.status(200).json(profile);
  } catch (error) {
    console.error("getProfileByCnic error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve profile.",
    });
  }
};

const getAllProfiles = async (req, res) => {
  try {
    const profiles = await Profile.find().sort({ _id: -1 });

    return res.status(200).json(profiles);
  } catch (error) {
    console.error("getAllProfiles error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve profiles.",
    });
  }
};

const updateStatus = async (req, res) => {
  try {
    const cnic = String(req.params.cnic || "").trim();
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required.",
      });
    }

    const profile = await Profile.findOneAndUpdate(
      { cnic },
      { $set: { status } },
      { new: true, runValidators: true }
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found.",
      });
    }

    return res.status(200).json(profile);
  } catch (error) {
    console.error("updateStatus error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update profile status.",
    });
  }
};

const deleteProfile = async (req, res) => {
  try {
    const cnic = String(req.params.cnic || "").trim();

    const deletedProfile = await Profile.findOneAndDelete({ cnic });

    if (!deletedProfile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found.",
      });
    }

    // Delete the photo database record.
    // Do not use fs.unlink for Cloudinary URLs.
    await Photo.deleteOne({ cnic });

    return res.status(200).json({
      success: true,
      message: "Profile deleted successfully.",
    });
  } catch (error) {
    console.error("deleteProfile error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete profile.",
    });
  }
};

module.exports = {
  saveProfile,
  getAllProfiles,
  getProfileByCnic,
  updateStatus,
  deleteProfile,
};
