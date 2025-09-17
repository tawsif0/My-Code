const express = require("express");
const router = express.Router();
const ContactUser = require("../models/ContactUser");

// POST contact message
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    if (!phone || !phone.trim()) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const newContact = new ContactUser({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      message: message.trim(),
    });

    await newContact.save();

    res.status(201).json({
      success: true,
      message: "Message submitted successfully",
      data: newContact,
    });
  } catch (error) {
    console.error("Error saving contact user:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
});

// GET all contact messages
router.get("/", async (req, res) => {
  try {
    const messages = await ContactUser.find().sort({ createdAt: -1 });
    res.json({ success: true, data: messages });
  } catch (error) {
    console.error("Error fetching contact messages:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
// DELETE /api/contact/:id - Delete a contact message
router.delete("/:id", async (req, res) => {
  try {
    const deletedMessage = await ContactUser.findByIdAndDelete(req.params.id);

    if (!deletedMessage) {
      return res
        .status(404)
        .json({ success: false, message: "Message not found" });
    }

    res.json({ success: true, message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error deleting contact message:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
module.exports = router;
