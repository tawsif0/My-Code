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
  }
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

router.get("/applications", async (req, res) => {
  try {
    const applications = await Application.find()
      .populate("jobId", "title customFormFields") // Add customFormFields here
      .exec();

    res.status(200).json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
});
// Get single job by ID
router.get("/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json(job);
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
      customFormFields
    });

    await job.save();
    res.status(201).json(job);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { title, description, applyLink, hasCustomForm, customFormFields } =
      req.body;

    const job = await Job.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        applyLink: hasCustomForm ? "" : applyLink,
        hasCustomForm,
        customFormFields: hasCustomForm ? customFormFields : []
      },
      { new: true, runValidators: true }
    );

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    res.status(200).json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Delete job (protected)
router.delete("/:id", async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Job deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Apply for a job
router.post("/apply", upload.any(), async (req, res) => {
  try {
    const { jobId } = req.body;

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
        let fieldId;

        // Check if it's a field or file key and extract the ID
        if (key.startsWith("field_")) {
          fieldId = key.substring(6); // Remove "field_" prefix
        } else if (key.startsWith("file_")) {
          fieldId = key.substring(5); // Remove "file_" prefix
        } else {
          fieldId = key; // Fallback
        }

        // Only add if it's a valid ObjectId (24 character hex string)
        if (fieldId.match(/^[0-9a-fA-F]{24}$/)) {
          fieldData.push({
            fieldId: fieldId,
            value: req.body[key]
          });
        }
      }
    });

    // Process files
    if (req.files) {
      req.files.forEach((file) => {
        let fieldId = file.fieldname;

        // Extract field ID from fieldname
        if (file.fieldname.startsWith("file_")) {
          fieldId = file.fieldname.substring(5);
        } else if (file.fieldname.startsWith("field_")) {
          fieldId = file.fieldname.substring(6);
        }

        // Only add if it's a valid ObjectId
        if (fieldId.match(/^[0-9a-fA-F]{24}$/)) {
          files.push({
            fieldId: fieldId,
            filename: file.originalname,
            path: "/jobs/" + file.filename
          });
        }
      });
    }

    // Create application
    const application = new Application({
      jobId,
      fieldData,
      files
    });

    await application.save();
    res.status(201).json({ message: "Application submitted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a job (and all its applications)
router.delete("/:id", async (req, res) => {
  try {
    // First delete all applications for this job
    await Application.deleteMany({ jobId: req.params.id });

    // Then delete the job
    const job = await Job.findByIdAndDelete(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json({ message: "Job and all applications deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a single application
router.delete("/applications/:id", async (req, res) => {
  try {
    const application = await Application.findByIdAndDelete(req.params.id);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.json({ message: "Application deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
