const express = require("express");
const multer = require("multer");
const path = require("path");
const { uploadProfilePhoto, getPhotoByCnic} = require("../controllers/photoController");


const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `photo-${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed!"), false);
  }
});

router.put("/:cnic", upload.single("photo"), uploadProfilePhoto);
router.get("/:cnic", getPhotoByCnic);


module.exports = router;
