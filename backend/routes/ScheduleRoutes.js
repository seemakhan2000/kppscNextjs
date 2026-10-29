
const express = require("express");
const upload = require("../middleware/upload");
const controller = require("../controllers/ScheduleController");

const router = express.Router();

const uploadPdf = (req, res, next) => {
  upload.single("pdf")(req, res, (error) => {
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    next();
  });
};

router.get("/", controller.getSchedules);
router.post("/", uploadPdf, controller.createSchedule);
router.put("/:id", uploadPdf, controller.updateSchedule);
router.delete("/:id", controller.deleteSchedule);

module.exports = router;
