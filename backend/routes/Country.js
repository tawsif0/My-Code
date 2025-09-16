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
    const uploadDir = "uploads/flags";
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, "flag-" + uniqueSuffix + extension);
  }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/svg+xml"];
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
      .populate("criteria", "name")
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
    const country = await Country.findById(req.params.id).populate("criteria", "name");
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
    const { name, description, criteria } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Country name is required" });
    }

    if (!criteria) {
      return res.status(400).json({ message: "Criteria is required" });
    }

    // Check if criteria exists
    const criteriaExists = await Criteria.findById(criteria);
    if (!criteriaExists) {
      return res.status(400).json({ message: "Invalid criteria" });
    }

    // Check if country already exists
    const existingCountry = await Country.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") }
    });

    if (existingCountry) {
      return res.status(400).json({ message: "Country already exists" });
    }

    // Create new country
    const newCountry = new Country({
      name: name.trim(),
      description: description ? description.trim() : "",
      criteria: criteria
    });

    // Handle file upload if exists
    if (req.file) {
      newCountry.flag = req.file.filename;
    }

    await newCountry.save();

    // Populate criteria for response
    await newCountry.populate("criteria", "name");

    res.status(201).json({
      message: "Country created successfully",
      country: newCountry
    });
  } catch (err) {
    console.error(err);

    // Clean up uploaded file if error occurred
    if (req.file) {
      fs.unlink(req.file.path, (unlinkErr) => {
        if (unlinkErr) console.error("Error deleting uploaded file:", unlinkErr);
      });
    }

    if (err.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }

    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ message: "File too large (max 5MB)" });
    }

    if (err.message.includes("images are allowed")) {
      return res.status(415).json({ message: "Unsupported file type" });
    }

    res.status(500).json({ message: "Error creating country" });
  }
});

// PUT update country
router.put("/:id", upload.single("flag"), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, criteria } = req.body;

    const country = await Country.findById(id);
    if (!country) {
      return res.status(404).json({ message: "Country not found" });
    }

    if (name && !name.trim()) {
      return res.status(400).json({ message: "Country name cannot be empty" });
    }

    if (criteria) {
      const criteriaExists = await Criteria.findById(criteria);
      if (!criteriaExists) {
        return res.status(400).json({ message: "Invalid criteria" });
      }
    }

    // Check for duplicate name (excluding current country)
    if (name && name.trim().toLowerCase() !== country.name.toLowerCase()) {
      const existingCountry = await Country.findOne({
        name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
        _id: { $ne: id }
      });

      if (existingCountry) {
        return res.status(400).json({ message: "Country name already exists" });
      }
    }

    // Update fields
    if (name) country.name = name.trim();
    if (description !== undefined) country.description = description.trim();
    if (criteria) country.criteria = criteria;

    // Handle file upload
    if (req.file) {
      // Delete old flag file if exists
      if (country.flag) {
        const oldFlagPath = path.join("uploads/flags", country.flag);
        fs.unlink(oldFlagPath, (err) => {
          if (err) console.error("Error deleting old flag:", err);
        });
      }
      country.flag = req.file.filename;
    }

    await country.save();
    await country.populate("criteria", "name");

    res.status(200).json({
      message: "Country updated successfully",
      country
    });
  } catch (err) {
    console.error(err);

    // Clean up uploaded file if error occurred
    if (req.file) {
      fs.unlink(req.file.path, (unlinkErr) => {
        if (unlinkErr) console.error("Error deleting uploaded file:", unlinkErr);
      });
    }

    if (err.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }

    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid country ID" });
    }

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
  const filePath = path.join(__dirname, "../uploads/flags", filename);

  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ message: "Flag image not found" });
  }
});

module.exports = router;