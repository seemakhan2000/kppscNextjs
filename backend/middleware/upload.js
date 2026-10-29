
const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 2,
  },
  fileFilter: (_req, file, cb) => {
    const isPdf =
      file.mimetype === "application/pdf" &&
      file.originalname.toLowerCase().endsWith(".pdf");

    const isImage =
      ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype);

    if (file.fieldname === "pdf" && isPdf) {
      return cb(null, true);
    }

    if (file.fieldname === "image" && isImage) {
      return cb(null, true);
    }

    if (file.fieldname === "photo" && isImage) {
      return cb(null, true);
    }

    return cb(
      new Error("Invalid file type. Use JPG, PNG, WEBP, or PDF as required.")
    );
  },
});

module.exports = upload;
