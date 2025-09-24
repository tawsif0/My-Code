const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Country = require("../models/Country");
const Criteria = require("../models/Criteria");
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../public/flags");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, "flag-" + uniqueSuffix + extension);
  }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/svg+xml"
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG, or SVG images are allowed"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// GET all countries
router.get("/", async (req, res) => {
  try {
    const countries = await Country.find()
      .populate("criteria.criteria", "name") // <-- populate nested field
      .sort({ createdAt: -1 });
    res.status(200).json(countries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error retrieving countries" });
  }
});

// GET single country
router.get("/:id", async (req, res) => {
  try {
    const country = await Country.findById(req.params.id).populate(
      "criteria.criteria",
      "name"
    ); // <-- populate nested field
    if (!country) {
      return res.status(404).json({ message: "Country not found" });
    }
    res.status(200).json(country);
  } catch (err) {
    console.error(err);
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid country ID" });
    }
    res.status(500).json({ message: "Error retrieving country" });
  }
});

// POST new country
router.post("/", upload.single("flag"), async (req, res) => {
  try {
    const { name, criteria, description, highlights } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Country name is required" });
    }

    // Normalize arrays
    let criteriaArray = Array.isArray(criteria) ? criteria : [criteria];
    let descriptionArray = Array.isArray(description)
      ? description
      : [description];
    let highlightsArray = Array.isArray(highlights)
      ? highlights
      : highlights
      ? [highlights]
      : [];

    if (criteriaArray.length !== descriptionArray.length) {
      return res
        .status(400)
        .json({ message: "Criteria and description mismatch" });
    }

    // Validate criteria existence
    const validCriterias = await Criteria.find({ _id: { $in: criteriaArray } });
    if (validCriterias.length !== criteriaArray.length) {
      return res
        .status(400)
        .json({ message: "One or more criterias are invalid" });
    }

    // Check duplicates by name
    const duplicate = await Country.findOne({ name: name.trim() });
    if (duplicate) {
      return res.status(400).json({ message: "Country already exists" });
    }

    // Pair criteria with description
    const criteriaWithDesc = criteriaArray.map((c, i) => ({
      criteria: c,
      description: descriptionArray[i]?.trim() || ""
    }));

    const newCountry = new Country({
      name: name.trim(),
      criteria: criteriaWithDesc,
      highlights: highlightsArray,
      flag: req.file ? req.file.filename : null
    });

    await newCountry.save();
    await newCountry.populate("criteria.criteria", "name");

    res
      .status(201)
      .json({ message: "Country created successfully", country: newCountry });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating country" });
  }
});

// PUT update country
router.put("/:id", upload.single("flag"), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, criteria, description, highlights } = req.body;

    const country = await Country.findById(id);
    if (!country) {
      return res.status(404).json({ message: "Country not found" });
    }

    // Normalize arrays
    let criteriaArray = Array.isArray(criteria) ? criteria : [criteria];
    let descriptionArray = Array.isArray(description)
      ? description
      : [description];
    let highlightsArray = Array.isArray(highlights) ? highlights : [highlights];

    // Ensure criteria and description match in length
    if (criteriaArray.length !== descriptionArray.length) {
      return res
        .status(400)
        .json({ message: "Each criteria must have a description" });
    }

    // Validate all criterias exist
    const validCriterias = await Criteria.find({ _id: { $in: criteriaArray } });
    if (validCriterias.length !== criteriaArray.length) {
      return res
        .status(400)
        .json({ message: "One or more criterias are invalid" });
    }

    // Check duplicates in other countries (exclude current one)
    const duplicate = await Country.findOne({
      _id: { $ne: id },
      name: name.trim(),
      "criteria.criteria": { $in: criteriaArray }
    });
    if (duplicate) {
      return res.status(400).json({
        message: "This criteria is already used for this country"
      });
    }

    // ✅ CORRECTED: Create proper criteria objects
    const criteriaWithDesc = criteriaArray.map((c, i) => ({
      criteria: c,
      description: descriptionArray[i]?.trim() || ""
    }));

    // ✅ Update country fields with proper structure
    country.name = name.trim();
    country.criteria = criteriaWithDesc; // Use the properly formatted array
    country.highlights = highlightsArray.map((h) => h.trim());

    if (req.file) {
      country.flag = req.file.filename;
    }

    await country.save();
    await country.populate("criteria.criteria", "name");

    res.status(200).json({ message: "Country updated successfully", country });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating country" });
  }
});

// DELETE country
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const country = await Country.findById(id);
    if (!country) {
      return res.status(404).json({ message: "Country not found" });
    }

    // Delete flag file if exists
    if (country.flag) {
      const flagPath = path.join("uploads/flags", country.flag);
      fs.unlink(flagPath, (err) => {
        if (err) console.error("Error deleting flag file:", err);
      });
    }

    await Country.findByIdAndDelete(id);
    res.status(200).json({ message: "Country deleted successfully" });
  } catch (err) {
    console.error(err);

    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid country ID" });
    }

    res.status(500).json({ message: "Error deleting country" });
  }
});

// Serve flag images
router.get("/flag/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "../public/flags", filename);

  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ message: "Flag image not found" });
  }
});

module.exports = router;
