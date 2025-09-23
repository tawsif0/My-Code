const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const Cv = require("../models/CvApplication");

// Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../public/cv");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    const dir = path.join(__dirname, "../public/cv");
    let finalName = file.originalname;
    let counter = 1;
    while (fs.existsSync(path.join(dir, finalName))) {
      finalName = `${baseName}(${counter})${ext}`;
      counter++;
    }
    cb(null, finalName);
  },
});

// Multer config with validation
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx/;
    const ext = path.extname(file.originalname).toLowerCase();
    const mime = file.mimetype;
    if (allowedTypes.test(ext) && allowedTypes.test(mime)) {
      cb(null, true);
    } else {
      cb(new Error("Only .pdf, .doc, and .docx files are allowed"));
    }
  },
}).single("file");

// --- CREATE CV ---
router.post("/", (req, res) => {
  upload(req, res, async function (err) {
    if (err instanceof multer.MulterError || err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    const { name, email, phone } = req.body;
    if (!req.file)
      return res
        .status(400)
        .json({ success: false, message: "CV file is required" });

    try {
      const newCv = await Cv.create({
        name,
        email,
        phone,
        file: req.file.filename,
      });
      res.status(201).json({ success: true, data: newCv });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  });
});

// --- GET ALL CVs ---
router.get("/", async (req, res) => {
  try {
    const cvs = await Cv.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: cvs });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// --- DELETE CV ---
router.delete("/:id", async (req, res) => {
  try {
    const cv = await Cv.findById(req.params.id);
    if (!cv)
      return res.status(404).json({ success: false, message: "CV not found" });

    // Remove file from disk
    const filePath = path.join(__dirname, "../public/cv", cv.file);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await cv.deleteOne();
    res.status(200).json({ success: true, message: "CV deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
