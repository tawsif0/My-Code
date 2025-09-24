const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const EventUser = require("../models/EventUser");
const Event = require("../models/Event");

// Storage config (similar to studentstorage)
const eventStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../public/events");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../public/events");
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);

    let finalName = file.originalname;
    let counter = 1;

    while (fs.existsSync(path.join(uploadPath, finalName))) {
      finalName = `${baseName}(${counter})${ext}`;
      counter++;
    }

    cb(null, finalName);
  }
});

const eventUpload = multer({
  storage: eventStorage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});
// Get all events
router.get("/", async (req, res) => {
  try {
    const events = await Event.find();

    const now = new Date();

    const updatedEvents = await Promise.all(
      events.map(async (event) => {
        const eventStart = new Date(`${event.startDate}T${event.startTime}:00`);
        const eventEnd = new Date(`${event.endDate}T${event.endTime}:00`);

        if (
          event.eventStatus === "pending" &&
          now >= eventStart &&
          now < eventEnd
        ) {
          event.eventStatus = "launched";
          await event.save();
        } else if (
          (event.eventStatus === "launched" && now >= eventEnd) ||
          (event.eventStatus === "pending" && now >= eventEnd) // never launched but expired
        ) {
          event.eventStatus = "ended";
          await event.save();
        }
        return event;
      })
    );

    res.json({ success: true, data: updatedEvents });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching events"
    });
  }
});

// GET only launched events
router.get("/active", async (req, res) => {
  try {
    const activeEvents = await Event.find({
      eventStatus: { $in: ["pending", "launched"] }
    }).sort({
      startDate: 1,
      startTime: 1
    });

    res.status(200).json({
      success: true,
      data: activeEvents
    });
  } catch (error) {
    console.error("Error fetching active events:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching active events"
    });
  }
});

// Get all registered users (with optional filter by eventId)
router.get("/users", async (req, res) => {
  try {
    const { eventId, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (eventId) {
      filter.eventId = eventId;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await EventUser.find(filter)
      .populate("eventId", "title startDate endDate")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await EventUser.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalUsers: total
      }
    });
  } catch (error) {
    console.error("Error fetching event users:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching event users"
    });
  }
});

//get only one event
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    res.json({ success: true, data: event });
  } catch (error) {
    res.status(404).json({ success: false, message: "Event not found" });
  }
});

// Create Event
router.post("/create", eventUpload.single("image"), async (req, res) => {
  try {
    const {
      title,
      startDate,
      endDate,
      startTime,
      endTime,
      location,
      description
    } = req.body;
    const imageFile = req.file;

    if (
      !title ||
      !startDate ||
      !endDate ||
      !startTime ||
      !endTime ||
      !location ||
      !description
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    const eventData = {
      title,
      startDate,
      endDate,
      startTime,
      endTime,
      location,
      description,
      eventStatus: "pending"
    };

    if (imageFile) {
      eventData.image = imageFile.filename;
    }

    const newEvent = await Event.create(eventData);

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: newEvent
    });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating event"
    });
  }
});

// Launch event
router.put("/:id/launch", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event)
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });

    if (event.eventStatus === "launched")
      return res
        .status(400)
        .json({ success: false, message: "Event already launched" });

    event.eventStatus = "launched";
    await event.save();

    res.json({
      success: true,
      message: "Event launched successfully",
      data: event
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to launch event" });
  }
});

//End manually
router.put("/:id/end", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event)
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });

    event.eventStatus = "ended";
    await event.save();

    res.json({
      success: true,
      message: "Event ended successfully",
      data: event
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to end event" });
  }
});

// Update Event
router.put("/:id", eventUpload.single("image"), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    // Update fields
    const {
      title,
      startDate,
      endDate,
      startTime,
      endTime,
      location,
      description
    } = req.body;

    if (title) event.title = title;
    if (startDate) event.startDate = startDate;
    if (endDate) event.endDate = endDate;
    if (startTime) event.startTime = startTime;
    if (endTime) event.endTime = endTime;
    if (location) event.location = location;
    if (description) event.description = description;

    // Handle new image upload
    if (req.file) {
      event.image = req.file.filename;
    }

    // ✅ Status logic: recalc based on current time vs updated times
    const now = new Date();
    const start = new Date(`${event.startDate}T${event.startTime}`);
    const end = new Date(`${event.endDate}T${event.endTime}`);

    if (now < start) {
      event.eventStatus = "pending";
    } else if (now >= start && now <= end) {
      event.eventStatus = "launched";
    } else {
      event.eventStatus = "ended";
    }

    await event.save();

    res.json({
      success: true,
      message: "Event updated successfully",
      data: event
    });
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating event"
    });
  }
});

// Delete event
router.delete("/:id", async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }
    res.json({ success: true, message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete event" });
  }
});

//Event Register
router.post("/:id/register", async (req, res) => {
  try {
    const { userName, userEmail, userPhone, message } = req.body;
    const { id } = req.params;

    if (!userName || !userEmail || !userPhone) {
      return res
        .status(400)
        .json({ success: false, message: "All fields required" });
    }

    const eventUser = new EventUser({
      eventId: id,
      userName,
      userEmail,
      userPhone,
      message
    });

    await eventUser.save();

    res.status(201).json({ success: true, data: eventUser });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
