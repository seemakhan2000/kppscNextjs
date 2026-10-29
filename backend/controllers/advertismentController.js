
const crypto = require("crypto");
const Advertisement = require("../models/advertisnment");
const { uploadBuffer, deleteAsset } = require("../config/cloudinary");

const parseDate = (value) => {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid start date or end date.");
  }

  return date;
};

const uploadAdFile = (file, type) =>
  uploadBuffer(file.buffer, {
    folder: type === "pdf" ? "kppsc/ads/pdfs" : "kppsc/ads/images",
    resourceType: type === "pdf" ? "raw" : "image",
    publicId: `${type}-${Date.now()}-${crypto.randomUUID()}${type === "pdf" ? ".pdf" : ""}`,
  });

const cleanupUploads = async (uploads) => {
  for (const item of uploads) {
    if (!item?.publicId) continue;

    try {
      await deleteAsset(item.publicId, item.resourceType);
    } catch (error) {
      console.error("Cloudinary cleanup failed:", error.message);
    }
  }
};

exports.getAds = async (_req, res) => {
  try {
    const ads = await Advertisement.find().sort({ createdAt: -1 });
    return res.status(200).json(ads);
  } catch (error) {
    console.error("getAds:", error);
    return res.status(500).json({ message: "Failed to fetch advertisements." });
  }
};

exports.getAdById = async (req, res) => {
  try {
    const ad = await Advertisement.findById(req.params.id);

    if (!ad) {
      return res.status(404).json({ message: "Advertisement not found." });
    }

    return res.status(200).json(ad);
  } catch (error) {
    console.error("getAdById:", error);
    return res.status(500).json({ message: "Failed to fetch advertisement." });
  }
};

exports.createAd = async (req, res) => {
  const uploaded = [];

  try {
    const { title, description, startDate, endDate } = req.body;

    if (!title?.trim() || !description?.trim()) {
      return res.status(400).json({
        message: "Title and description are required.",
      });
    }

    const parsedStartDate = parseDate(startDate);
    const parsedEndDate = parseDate(endDate);

    if (!parsedStartDate || !parsedEndDate) {
      return res.status(400).json({
        message: "Start date and end date are required.",
      });
    }

    if (parsedEndDate < parsedStartDate) {
      return res.status(400).json({
        message: "End date cannot be before start date.",
      });
    }

    const imageFile = req.files?.image?.[0];
    const pdfFile = req.files?.pdf?.[0];

    const image = imageFile ? await uploadAdFile(imageFile, "image") : null;
    if (image) uploaded.push({ ...image, resourceType: "image" });

    const pdf = pdfFile ? await uploadAdFile(pdfFile, "pdf") : null;
    if (pdf) uploaded.push({ ...pdf, resourceType: "raw" });

    const ad = await Advertisement.create({
      title: title.trim(),
      description: description.trim(),
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      image: image?.url || null,
      imagePublicId: image?.publicId || "",
      pdf: pdf?.url || null,
      pdfPublicId: pdf?.publicId || "",
    });

    return res.status(201).json(ad);
  } catch (error) {
    console.error("createAd:", error);
    await cleanupUploads(uploaded);

    return res.status(400).json({
      message: error.message || "Failed to create advertisement.",
    });
  }
};

exports.updateAd = async (req, res) => {
  const uploaded = [];

  try {
    const ad = await Advertisement.findById(req.params.id);

    if (!ad) {
      return res.status(404).json({ message: "Advertisement not found." });
    }

    const { title, description, startDate, endDate } = req.body;

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({ message: "Title is required." });
      }
      ad.title = title.trim();
    }

    if (description !== undefined) {
      if (!description.trim()) {
        return res.status(400).json({ message: "Description is required." });
      }
      ad.description = description.trim();
    }

    const nextStart = startDate !== undefined ? parseDate(startDate) : ad.startDate;
    const nextEnd = endDate !== undefined ? parseDate(endDate) : ad.endDate;

    if (!nextStart || !nextEnd) {
      return res.status(400).json({
        message: "Start date and end date are required.",
      });
    }

    if (nextEnd < nextStart) {
      return res.status(400).json({
        message: "End date cannot be before start date.",
      });
    }

    ad.startDate = nextStart;
    ad.endDate = nextEnd;

    const oldAssets = [];

    if (req.files?.image?.[0]) {
      const image = await uploadAdFile(req.files.image[0], "image");
      uploaded.push({ ...image, resourceType: "image" });

      if (ad.imagePublicId) {
        oldAssets.push({ publicId: ad.imagePublicId, resourceType: "image" });
      }

      ad.image = image.url;
      ad.imagePublicId = image.publicId;
    }

    if (req.files?.pdf?.[0]) {
      const pdf = await uploadAdFile(req.files.pdf[0], "pdf");
      uploaded.push({ ...pdf, resourceType: "raw" });

      if (ad.pdfPublicId) {
        oldAssets.push({ publicId: ad.pdfPublicId, resourceType: "raw" });
      }

      ad.pdf = pdf.url;
      ad.pdfPublicId = pdf.publicId;
    }

    await ad.save();

    await cleanupUploads(oldAssets);

    return res.status(200).json(ad);
  } catch (error) {
    console.error("updateAd:", error);
    await cleanupUploads(uploaded);

    return res.status(400).json({
      message: error.message || "Failed to update advertisement.",
    });
  }
};

exports.deleteAd = async (req, res) => {
  try {
    const ad = await Advertisement.findById(req.params.id);

    if (!ad) {
      return res.status(404).json({ message: "Advertisement not found." });
    }

    await ad.deleteOne();

    await cleanupUploads([
      { publicId: ad.imagePublicId, resourceType: "image" },
      { publicId: ad.pdfPublicId, resourceType: "raw" },
    ]);

    return res.status(200).json({
      message: "Advertisement deleted successfully.",
    });
  } catch (error) {
    console.error("deleteAd:", error);
    return res.status(500).json({
      message: "Failed to delete advertisement.",
    });
  }
};
