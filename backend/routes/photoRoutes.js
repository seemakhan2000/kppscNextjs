const express = require("express");
const upload = require("../middleware/upload");

const {
  uploadProfilePhoto,
  getPhotoByCnic,
} = require("../controllers/photoController");

const router = express.Router();

router.get("/:cnic", getPhotoByCnic);

router.post(
  "/:cnic",
  upload.single("photo"),
  uploadProfilePhoto
);

router.put(
  "/:cnic",
  upload.single("photo"),
  uploadProfilePhoto
);

module.exports = router;