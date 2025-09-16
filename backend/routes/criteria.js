const express = require("express");
const Criteria = require("../models/Criteria");

const router = express.Router();

// GET all criteria
router.get("/", async (req, res) => {
  try {
    const criterias = await Criteria.find().sort({ createdAt: -1 });
    res.status(200).json(criterias);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error retrieving criteria" });
  }
});

// POST new criteria
router.post("/", async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Criteria name is required" });
    }

    // Check if criteria already exists
    const existingCriteria = await Criteria.findOne({ 
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") } 
    });
    
    if (existingCriteria) {
      return res.status(400).json({ message: "Criteria already exists" });
    }

    const newCriteria = new Criteria({ name: name.trim() });
    await newCriteria.save();
    
    res.status(201).json({ message: "Criteria created successfully", criteria: newCriteria });
  } catch (err) {
    console.error(err);
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    
    res.status(500).json({ message: "Error creating criteria" });
  }
});

// PUT update criteria
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Criteria name is required" });
    }

    // Check if criteria exists
    const criteria = await Criteria.findById(id);
    if (!criteria) {
      return res.status(404).json({ message: "Criteria not found" });
    }

    // Check if name already exists (excluding current criteria)
    const existingCriteria = await Criteria.findOne({ 
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
      _id: { $ne: id } 
    });
    
    if (existingCriteria) {
      return res.status(400).json({ message: "Criteria name already exists" });
    }

    criteria.name = name.trim();
    await criteria.save();

    res.status(200).json({ message: "Criteria updated successfully", criteria });
  } catch (err) {
    console.error(err);
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    
    if (err.name === 'CastError') {
      return res.status(400).json({ message: "Invalid criteria ID" });
    }
    
    res.status(500).json({ message: "Error updating criteria" });
  }
});

// DELETE criteria
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const criteria = await Criteria.findById(id);
    if (!criteria) {
      return res.status(404).json({ message: "Criteria not found" });
    }

    await Criteria.findByIdAndDelete(id);
    res.status(200).json({ message: "Criteria deleted successfully" });
  } catch (err) {
    console.error(err);
    
    if (err.name === 'CastError') {
      return res.status(400).json({ message: "Invalid criteria ID" });
    }
    
    res.status(500).json({ message: "Error deleting criteria" });
  }
});

module.exports = router;