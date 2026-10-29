
const express = require("express");

const {
  saveProfile,
  getProfileByCnic,
  getAllProfiles,
  updateStatus,
  deleteProfile,
} = require("../controllers/profileController");

const router = express.Router();

router.post("/saveProfile", saveProfile);

router.get("/", getAllProfiles);
router.get("/:cnic", getProfileByCnic);

router.put("/status/:cnic", updateStatus);

router.delete("/:cnic", deleteProfile);

module.exports = router;
