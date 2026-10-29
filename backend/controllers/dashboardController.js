const Profile = require("../models/Profile");

const getDashboardStats = async (req, res) => {
  try {
    const pending = await Profile.countDocuments({
      status: { $regex: /^pending$/i },
    });

    const confirmed = await Profile.countDocuments({
      status: { $regex: /^confirmed$/i },
    });

    const total = await Profile.countDocuments({});

    res.json({
      total,
      pending,
      confirmed,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const getProfiles = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status) query.status = status;

    const profiles = await Profile.find(query).sort({ createdAt: -1 });
    res.json(profiles);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getDashboardStats, getProfiles };
