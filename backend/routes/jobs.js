const express = require("express");
const multer = require("multer");
const path = require("path");
const Job = require("../models/Job");
const Application = require("../models/Application");
const fs = require("fs");
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(__dirname, "../public/jobs");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    const dir = "../public/jobs";

    let finalName = file.originalname;
    let counter = 1;

    while (fs.existsSync(path.join(dir, finalName))) {
      finalName = `${baseName}(${counter})${ext}`;
      counter++;
    }

    cb(null, finalName);
  },
});

const upload = multer({ storage: storage });

// Get all jobs
router.get("/", async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new job post
router.post("/create", async (req, res) => {
  try {
    const { title, description, applyLink, hasCustomForm, customFormFields } =
      req.body;

    const job = new Job({
      title,
      description,
      applyLink,
      hasCustomForm,
      customFormFields,
    });

    await job.save();
    res.status(201).json(job);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Apply for a job
router.post("/apply", upload.any(), async (req, res) => {
  try {
    const { jobId } = req.body;
    const userId = req.user.id;

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Process application data
    const fieldData = [];
    const files = [];

    // Process regular fields
    Object.keys(req.body).forEach((key) => {
      if (key !== "jobId") {
        fieldData.push({
          fieldId: key,
          value: req.body[key],
        });
      }
    });

    // Process files
    if (req.files) {
      req.files.forEach((file) => {
        files.push({
          fieldId: file.fieldname,
          filename: file.originalname,
          path: file.path,
        });
      });
    }

    // Create application
    const application = new Application({
      jobId,
      applicantId: userId,
      fieldData,
      files,
    });

    await application.save();
    res.status(201).json({ message: "Application submitted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
