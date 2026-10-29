
const express = require("express");
const upload = require("../middleware/upload");
const controller = require("../controllers/advertismentController");

const router = express.Router();

const uploadAdFiles = (req, res, next) => {
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "pdf", maxCount: 1 },
  ])(req, res, (error) => {
    if (error) {
      return res.status(400).json({ message: error.message });
    }

    next();
  });
};

router.get("/", controller.getAds);
router.get("/:id", controller.getAdById);
router.post("/", uploadAdFiles, controller.createAd);
router.put("/:id", uploadAdFiles, controller.updateAd);
router.delete("/:id", controller.deleteAd);

module.exports = router;
