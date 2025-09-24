const express = require("express");
const BlogCategory = require("../models/BlogCategory");

const router = express.Router();

// GET all blog categories
router.get("/", async (req, res) => {
  try {
    const categories = await BlogCategory.find().sort({ createdAt: -1 });
    res.status(200).json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error retrieving blog categories" });
  }
});

// POST new blog category
router.post("/", async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Category name is required" });
    }

    // Check if category already exists
    const existingCategory = await BlogCategory.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") }
    });

    if (existingCategory) {
      return res.status(400).json({ message: "Blog category already exists" });
    }

    const newCategory = new BlogCategory({ name: name.trim() });
    await newCategory.save();

    res.status(201).json({
      message: "Blog category created successfully",
      category: newCategory
    });
  } catch (err) {
    console.error(err);

    if (err.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }

    res.status(500).json({ message: "Error creating blog category" });
  }
});

// PUT update blog category
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Category name is required" });
    }

    // Check if category exists
    const category = await BlogCategory.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Blog category not found" });
    }

    // Check if name already exists (excluding current category)
    const existingCategory = await BlogCategory.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
      _id: { $ne: id }
    });

    if (existingCategory) {
      return res
        .status(400)
        .json({ message: "Blog category name already exists" });
    }

    category.name = name.trim();
    await category.save();

    res
      .status(200)
      .json({ message: "Blog category updated successfully", category });
  } catch (err) {
    console.error(err);

    if (err.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }

    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    res.status(500).json({ message: "Error updating blog category" });
  }
});

// DELETE blog category
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const category = await BlogCategory.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Blog category not found" });
    }

    await BlogCategory.findByIdAndDelete(id);
    res.status(200).json({ message: "Blog category deleted successfully" });
  } catch (err) {
    console.error(err);

    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    res.status(500).json({ message: "Error deleting blog category" });
  }
});

module.exports = router;
