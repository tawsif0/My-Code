// routes/heroSection.js
const express = require("express");
const HeroSection = require("../models/HeroSection");
const upload = require("../utils/multer");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// POST API to add a new hero section (with image and description)
router.post("/upload", upload.single("image"), async (req, res) => {
  const { description } = req.body;
  // Make sure req.file.path is a string, not an array
  const imagePath = req.file ? req.file.path : null;

  try {
    const newHeroSection = new HeroSection({
      description,
      image: imagePath // This should be a string
    });

    await newHeroSection.save();
    res.status(201).json({ message: "Hero Section saved successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error saving hero section" });
  }
});

// GET API to retrieve all hero sections (including image and description)
router.get("/", async (req, res) => {
  try {
    const heroSections = await HeroSection.find();
    res.status(200).json(heroSections);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error retrieving hero sections" });
  }
});

// PUT API to update a hero section (by ID) (with image and description)
router.put("/:id", upload.single("image"), async (req, res) => {
  const { id } = req.params;
  const { description } = req.body;
  let imagePath = req.file ? req.file.path : null; // Path to the uploaded image (if provided)

  try {
    const heroSection = await HeroSection.findById(id);

    if (!heroSection) {
      return res.status(404).json({ message: "Hero section not found" });
    }

    // If new image is provided, update the image path
    if (imagePath) {
      // Delete old image file if a new one is uploaded
      if (fs.existsSync(heroSection.image)) {
        fs.unlinkSync(heroSection.image);
      }
      heroSection.image = imagePath;
    }

    // Update the description
    heroSection.description = description || heroSection.description;

    await heroSection.save();
    res.status(200).json({ message: "Hero Section updated successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating hero section" });
  }
});

// DELETE API to delete a hero section (by ID)
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const heroSection = await HeroSection.findById(id);

    if (!heroSection) {
      return res.status(404).json({ message: "Hero section not found" });
    }

    // Delete the image file associated with the hero section
    if (heroSection.image && fs.existsSync(heroSection.image)) {
      fs.unlinkSync(heroSection.image);
    }

    // Use either deleteOne() or findByIdAndDelete()
    await HeroSection.deleteOne({ _id: id });
    // or: await HeroSection.findByIdAndDelete(id);

    res.status(200).json({ message: "Hero Section deleted successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting hero section" });
  }
});

module.exports = router;
