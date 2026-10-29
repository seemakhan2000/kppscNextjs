
const Advertisement = require("../models/advertisnment");

// Helper: Parse and validate a date
function parseDate(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid start date or end date.");
  }

  return date;
}

// GET all advertisements
exports.getAds = async (req, res) => {
  try {
    const ads = await Advertisement.find().sort({ createdAt: -1 });
    return res.status(200).json(ads);
  } catch (error) {
    console.error("getAds error:", error);

    return res.status(500).json({
      message: "Failed to fetch advertisements",
    });
  }
};

// GET advertisement by ID
exports.getAdById = async (req, res) => {
  try {
    const ad = await Advertisement.findById(req.params.id);

    if (!ad) {
      return res.status(404).json({
        message: "Advertisement not found",
      });
    }

    return res.status(200).json(ad);
  } catch (error) {
    console.error("getAdById error:", error);

    return res.status(500).json({
      message: "Failed to fetch advertisement",
    });
  }
};

// CREATE advertisement
exports.createAd = async (req, res) => {
  try {
    console.log("Create advertisement req.body:", req.body);

    const { title, description, startDate, endDate } = req.body;

    if (!title?.trim() || !description?.trim()) {
      return res.status(400).json({
        message: "Title and description are required",
      });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({
        message: "Start date and end date are required",
      });
    }

    const parsedStartDate = parseDate(startDate);
    const parsedEndDate = parseDate(endDate);

    if (parsedEndDate < parsedStartDate) {
      return res.status(400).json({
        message: "End date and time cannot be before start date and time",
      });
    }

    const image = req.files?.image?.[0]
      ? `/ads/images/${req.files.image[0].filename}`
      : null;

    const pdf = req.files?.pdf?.[0]
      ? `/ads/pdfs/${req.files.pdf[0].filename}`
      : null;

    const ad = await Advertisement.create({
      title: title.trim(),
      description: description.trim(),
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      image,
      pdf,
    });

    console.log("Saved advertisement dates:", {
      startDate: ad.startDate,
      endDate: ad.endDate,
    });

    return res.status(201).json(ad);
  } catch (error) {
    console.error("createAd error:", error);

    return res.status(400).json({
      message: error.message || "Failed to create advertisement",
    });
  }
};

// UPDATE advertisement
exports.updateAd = async (req, res) => {
  try {
    const { title, description, startDate, endDate } = req.body;

    const existingAd = await Advertisement.findById(req.params.id);

    if (!existingAd) {
      return res.status(404).json({
        message: "Advertisement not found",
      });
    }

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({
          message: "Advertisement title is required",
        });
      }

      existingAd.title = title.trim();
    }

    if (description !== undefined) {
      if (!description.trim()) {
        return res.status(400).json({
          message: "Advertisement description is required",
        });
      }

      existingAd.description = description.trim();
    }

    const nextStartDate =
      startDate !== undefined
        ? parseDate(startDate)
        : existingAd.startDate;

    const nextEndDate =
      endDate !== undefined
        ? parseDate(endDate)
        : existingAd.endDate;

    if (!nextStartDate || !nextEndDate) {
      return res.status(400).json({
        message: "Start date and end date are required",
      });
    }

    if (nextEndDate < nextStartDate) {
      return res.status(400).json({
        message: "End date and time cannot be before start date and time",
      });
    }

    existingAd.startDate = nextStartDate;
    existingAd.endDate = nextEndDate;

    if (req.files?.image?.[0]) {
      existingAd.image = `/ads/images/${req.files.image[0].filename}`;
    }

    if (req.files?.pdf?.[0]) {
      existingAd.pdf = `/ads/pdfs/${req.files.pdf[0].filename}`;
    }

    await existingAd.save();

    console.log("Updated advertisement dates:", {
      startDate: existingAd.startDate,
      endDate: existingAd.endDate,
    });

    return res.status(200).json(existingAd);
  } catch (error) {
    console.error("updateAd error:", error);

    return res.status(400).json({
      message: error.message || "Failed to update advertisement",
    });
  }
};

// DELETE advertisement
exports.deleteAd = async (req, res) => {
  try {
    const ad = await Advertisement.findByIdAndDelete(req.params.id);

    if (!ad) {
      return res.status(404).json({
        message: "Advertisement not found",
      });
    }

    return res.status(200).json({
      message: "Advertisement deleted successfully",
    });
  } catch (error) {
    console.error("deleteAd error:", error);

    return res.status(500).json({
      message: "Failed to delete advertisement",
    });
  }
};
