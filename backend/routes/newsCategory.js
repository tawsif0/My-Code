const express = require("express");
const NewsCategory = require("../models/NewsCategory");

const router = express.Router();

// GET all news categories
router.get("/", async (req, res) => {
  try {
    const categories = await NewsCategory.find().sort({ createdAt: -1 });
    res.status(200).json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error retrieving news categories" });
  }
});

// POST new news category
router.post("/", async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Category name is required" });
    }

    // Check if category already exists
    const existingCategory = await NewsCategory.findOne({ 
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") } 
    });
    
    if (existingCategory) {
      return res.status(400).json({ message: "News category already exists" });
    }

    const newCategory = new NewsCategory({ name: name.trim() });
    await newCategory.save();
    
    res.status(201).json({ message: "News category created successfully", category: newCategory });
  } catch (err) {
    console.error(err);
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    
    res.status(500).json({ message: "Error creating news category" });
  }
});

// PUT update news category
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Category name is required" });
    }

    // Check if category exists
    const category = await NewsCategory.findById(id);
    if (!category) {
      return res.status(404).json({ message: "News category not found" });
    }

    // Check if name already exists (excluding current category)
    const existingCategory = await NewsCategory.findOne({ 
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
      _id: { $ne: id } 
    });
    
    if (existingCategory) {
      return res.status(400).json({ message: "News category name already exists" });
    }

    category.name = name.trim();
    await category.save();

    res.status(200).json({ message: "News category updated successfully", category });
  } catch (err) {
    console.error(err);
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    
    if (err.name === 'CastError') {
      return res.status(400).json({ message: "Invalid category ID" });
    }
    
    res.status(500).json({ message: "Error updating news category" });
  }
});

// DELETE news category
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const category = await NewsCategory.findById(id);
    if (!category) {
      return res.status(404).json({ message: "News category not found" });
    }

    await NewsCategory.findByIdAndDelete(id);
    res.status(200).json({ message: "News category deleted successfully" });
  } catch (err) {
    console.error(err);
    
    if (err.name === 'CastError') {
      return res.status(400).json({ message: "Invalid category ID" });
    }
    
    res.status(500).json({ message: "Error deleting news category" });
  }
});

module.exports = router;