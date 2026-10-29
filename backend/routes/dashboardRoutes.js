const express = require("express");
const router = express.Router();
const {
  getDashboardStats,
  getProfiles
} = require("../controllers/dashboardController");

router.get("/stats", getDashboardStats);
router.get("/profiles", getProfiles);

module.exports = router;
