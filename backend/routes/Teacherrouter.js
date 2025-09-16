const express = require("express");

const { authenticateTeacher } = require("../middleware/teacherauth");
const { create } = require("../models/Admin");
const Course = require("../models/Course");
const Teaceherrouter = express.Router();
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs");
const Teacher = require("../models/Teacher");
const Category = require("../models/Category");
const Student = require("../models/Student");
// Configure storage for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "./public/courses";
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    const dir = "./public/courses";

    let finalName = file.originalname;
    let counter = 1;

    while (fs.existsSync(path.join(dir, finalName))) {
      finalName = `${baseName}(${counter})${ext}`;
      counter++;
    }
    cb(null, finalName);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
});

// Middleware to handle multiple file uploads
const uploadMultiple = upload.fields([
  { name: "thumbnail", maxCount: 1 },
  { name: "attachments", maxCount: 10 },
  { name: "contentVideos", maxCount: 20 },
  { name: "contentThumbnails", maxCount: 20 },
]);

// --------------------------teacher-profile---------------------------------
// Get teacher profile data
Teaceherrouter.get(
  "/teacher-profile/:id",
  authenticateTeacher,
  async (req, res) => {
    try {
      // Find the teacher by ID, excluding the password field
      const teacher = await Teacher.findById(req.params.id);

      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: "Teacher not found",
        });
      }

      res.status(200).json({
        success: true,
        data: teacher,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch teacher profile",
        error: error.message,
      });
    }
  }
);
// -------------------------- Course Update Route ----------------------------
Teaceherrouter.put(
  "/update-course/:id",
  [
    upload.fields([
      { name: "thumbnail", maxCount: 1 },
      { name: "attachments", maxCount: 10 },
      { name: "contentThumbnails", maxCount: 10 },
      { name: "contentVideos", maxCount: 10 },
    ]),
  ],
  async (req, res) => {
    try {
      const {
        title,
        description,
        type,
        price,
        content,
        categories,
        level,
        status,
        existingAttachments = "[]",
      } = req.body;

      const course = await Course.findById(req.params.id);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      // Validate type change
      if (type && course.type !== type) {
        // If changing to live course, remove all non-live content
        if (type === "live") {
          let parsedContent =
            typeof content === "string" ? JSON.parse(content) : content;
          if (Array.isArray(parsedContent)) {
            parsedContent = parsedContent.filter(
              (item) => item.type === "live"
            );
            if (parsedContent.length === 0) {
              return res.status(400).json({
                success: false,
                message: "Live courses must have at least one live session",
              });
            }
          }
        }
        // If changing from live to another type, remove all live content
        else if (course.type === "live") {
          let parsedContent =
            typeof content === "string" ? JSON.parse(content) : content;
          if (Array.isArray(parsedContent)) {
            parsedContent = parsedContent.filter(
              (item) => item.type !== "live"
            );
          }
        }
        // If changing between free/premium, transform tutorial content
        else {
          let parsedContent =
            typeof content === "string" ? JSON.parse(content) : content;
          if (Array.isArray(parsedContent)) {
            parsedContent = parsedContent.map((item) => {
              if (item.type === "tutorial") {
                if (type === "premium") {
                  // Switching to premium - remove youtubeLink
                  const { youtubeLink, ...rest } = item;
                  return { ...rest };
                } else {
                  // Switching to free - remove content
                  const { content, ...rest } = item;
                  return { ...rest, youtubeLink: "" };
                }
              }
              return item;
            });
          }
        }
      }

      // Handle thumbnail update
      if (req.files?.thumbnail) {
        const thumbnailFile = req.files.thumbnail[0];
        course.thumbnail = {
          filename: thumbnailFile.originalname,
          path: thumbnailFile.filename,
          size: thumbnailFile.size,
          mimetype: thumbnailFile.mimetype,
        };
      }

      // Handle attachments - parse existing and merge with new ones
      let existingAttachmentsArray = [];
      try {
        existingAttachmentsArray = JSON.parse(existingAttachments);
      } catch (e) {
        console.error("Error parsing existingAttachments", e);
      }

      const newAttachments =
        req.files.attachments?.map((file) => ({
          filename: file.originalname,
          path: file.filename,
          size: file.size,
          mimetype: file.mimetype,
        })) || [];

      course.attachments = [...existingAttachmentsArray, ...newAttachments];

      // Parse and process content
      let parsedContent =
        typeof content === "string" ? JSON.parse(content) : content;

      // Validate quiz questions structure
      if (Array.isArray(parsedContent)) {
        for (const item of parsedContent) {
          if (item.type === "quiz" && Array.isArray(item.questions)) {
            for (const question of item.questions) {
              // Validate question structure based on type
              if (!question.type || !question.question) {
                return res.status(400).json({
                  success: false,
                  message: "All questions must have a type and question text",
                });
              }

              // Validate MCQ questions
              if (["mcq-single", "mcq-multiple"].includes(question.type)) {
                if (
                  !Array.isArray(question.options) ||
                  question.options.length < 2
                ) {
                  return res.status(400).json({
                    success: false,
                    message: "MCQ questions must have at least 2 options",
                  });
                }
                if (
                  question.correctAnswer === undefined ||
                  question.correctAnswer === null
                ) {
                  return res.status(400).json({
                    success: false,
                    message:
                      "MCQ questions must have a correct answer selected",
                  });
                }

                // Remove expectedAnswer field if it exists for MCQ questions
                if (question.expectedAnswer !== undefined) {
                  delete question.expectedAnswer;
                }
              }

              // Validate short/broad answer questions
              if (["short-answer", "broad-answer"].includes(question.type)) {
                if (
                  question.expectedAnswer === undefined ||
                  question.expectedAnswer === null ||
                  question.expectedAnswer.trim() === ""
                ) {
                  return res.status(400).json({
                    success: false,
                    message:
                      "Short and broad answer questions must have an expected answer",
                  });
                }

                // Remove correctAnswer field if it exists for short/broad answers
                if (question.correctAnswer !== undefined) {
                  delete question.correctAnswer;
                }

                // Remove options field if it exists for short/broad answers
                if (question.options !== undefined) {
                  delete question.options;
                }
              }
            }
          }
        }

        // For live courses, validate all items are live sessions
        if (type === "live") {
          const invalidItems = parsedContent.filter(
            (item) => item.type !== "live"
          );
          if (invalidItems.length > 0) {
            return res.status(400).json({
              success: false,
              message: "Live courses can only contain live sessions",
            });
          }
        }

        // Track video content items that need processing
        const videoContentItems = parsedContent.filter(
          (item) =>
            item.type === "tutorial" &&
            type === "premium" &&
            (item.contentFile || item.content)
        );

        // Assign videos in order
        const videoFiles = req.files?.contentVideos || [];
        let videoIndex = 0;

        parsedContent = parsedContent.map((item) => {
          // Handle tutorial content for premium courses
          if (item.type === "tutorial" && type === "premium") {
            // Handle new video upload
            if (item.contentFile && videoFiles[videoIndex]) {
              item.content = {
                filename: videoFiles[videoIndex].originalname,
                path: videoFiles[videoIndex].filename,
                size: videoFiles[videoIndex].size,
                mimetype: videoFiles[videoIndex].mimetype,
              };
              videoIndex++;
            } else if (item.content && !item.contentFile) {
              // Keep existing content if no new file was uploaded
              item.content = item.content;
            }

            // Clean up temporary field
            delete item.contentFile;
            delete item.youtubeLink;
          }

          // Handle tutorial content for free courses
          if (item.type === "tutorial" && type === "free") {
            // Ensure content is removed for free courses
            if (item.content) {
              delete item.content;
            }
            if (!item.youtubeLink) {
              throw new Error(
                `YouTube link is required for free tutorial: ${item.title}`
              );
            }
          }

          // Handle live class thumbnails
          if (item.type === "live") {
            if (!item.meetingLink) {
              throw new Error(
                `Meeting link is required for live class: ${item.title}`
              );
            }

            if (!item.schedule) {
              throw new Error(
                `Schedule is required for live class: ${item.title}`
              );
            }

            if (req.files.contentThumbnails) {
              const thumbFile = req.files.contentThumbnails.find(
                (f) => f.originalname === item.thumbnail?.name
              );
              if (thumbFile) {
                item.thumbnail = {
                  filename: thumbFile.originalname,
                  path: thumbFile.filename,
                  size: thumbFile.size,
                  mimetype: thumbFile.mimetype,
                };
              }
            }
          }

          return item;
        });

        // Verify all videos were assigned
        const expectedVideos = parsedContent.filter(
          (item) =>
            item.type === "tutorial" && type === "premium" && item.contentFile
        ).length;

        if (videoIndex < expectedVideos) {
          return res.status(400).json({
            success: false,
            message: `Missing video files for ${
              expectedVideos - videoIndex
            } tutorials`,
          });
        }
      }

      // Update other fields
      if (title) course.title = title;
      if (description) course.description = description;
      if (type) course.type = type;

      // Price handling for premium and live courses
      if (type === "premium" || type === "live") {
        if (!price || isNaN(price)) {
          return res.status(400).json({
            success: false,
            message: "Price is required for premium and live courses",
          });
        }
        course.price = parseFloat(price);
      } else {
        course.price = 0; // Free courses have no price
      }

      if (content) course.content = parsedContent;
      if (categories) {
        course.categories =
          typeof categories === "string" ? JSON.parse(categories) : categories;
      }
      if (level) course.level = level;
      if (status) course.status = status;

      await course.save();

      res.json({
        success: true,
        message: "Course updated successfully",
        data: course,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || "Server error while updating course",
      });
    }
  }
);

// -------------------------- Delete Attachment Route ----------------------------
Teaceherrouter.delete(
  "/delete-attachment/:courseId/:attachmentId",
  async (req, res) => {
    try {
      const { courseId, attachmentId } = req.params;

      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      // Find the attachment
      const attachmentIndex = course.attachments.findIndex(
        (att) => att._id.toString() === attachmentId
      );

      if (attachmentIndex === -1) {
        return res.status(404).json({
          success: false,
          message: "Attachment not found",
        });
      }

      // Delete the file from filesystem
      const attachment = course.attachments[attachmentIndex];
      try {
        fs.unlinkSync(attachment.path);
      } catch (err) {
        console.error("Error deleting attachment file:", err);
      }

      // Remove from array
      course.attachments.splice(attachmentIndex, 1);
      await course.save();

      res.status(200).json({
        success: true,
        message: "Attachment deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to delete attachment",
        error: error.message,
      });
    }
  }
);

// -------------------------- Password Update ----------------------------
Teaceherrouter.put(
  "/update-password/:id",
  authenticateTeacher,
  async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const teacherId = req.params.id;

      // Validate input
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "Current password and new password are required",
        });
      }

      // Find the teacher and include the password field
      const teacher = await Teacher.findById(teacherId).select("+password");

      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: "Teacher not found",
        });
      }

      // Verify current password
      const isMatch = await teacher.correctPassword(
        currentPassword,
        teacher.password
      );
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Current password is incorrect",
        });
      }

      // Validate new password
      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 8 characters",
        });
      }

      if (!/\d/.test(newPassword) || !/[!@#$%^&*]/.test(newPassword)) {
        return res.status(400).json({
          success: false,
          message: "Password must contain a number and a special character",
        });
      }

      // Update password
      teacher.password = newPassword;
      await teacher.save();

      res.status(200).json({
        success: true,
        message: "Password updated successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to update password",
        error: error.message,
      });
    }
  }
);

// -------------------------- Profile Update ----------------------------
Teaceherrouter.put(
  "/update-profile/:id",
  authenticateTeacher,
  async (req, res) => {
    try {
      const teacherId = req.params.id;
      const updates = { ...req.body };

      // Find the teacher
      const teacher = await Teacher.findById(teacherId);
      if (!teacher) {
        return res
          .status(404)
          .json({ success: false, message: "Teacher not found" });
      }

      // Whitelist fields (now includes 'email')
      const allowedUpdates = [
        "full_name",
        "email",
        "phone",
        "specialization",
        "qualifications",
        "linkedin_url",
        "hourly_rate",
        "profile_photo",
      ];

      // Validate requested fields
      const isValidOperation = Object.keys(updates).every((k) =>
        allowedUpdates.includes(k)
      );
      if (!isValidOperation) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid updates!" });
      }

      // Normalize/trim string inputs
      [
        "full_name",
        "email",
        "phone",
        "specialization",
        "qualifications",
        "linkedin_url",
        "profile_photo",
      ].forEach((k) => {
        if (updates[k] != null && typeof updates[k] === "string") {
          updates[k] = updates[k].trim();
        }
      });

      // PHONE (E.164)
      if (updates.phone && !/^\+[1-9]\d{1,14}$/.test(updates.phone)) {
        return res.status(400).json({
          success: false,
          message: "Include country code (e.g., +880)",
        });
      }

      // FULL NAME (first + last)
      if (updates.full_name && updates.full_name.split(/\s+/).length < 2) {
        return res.status(400).json({
          success: false,
          message: "Must include first and last name",
        });
      }

      // HOURLY RATE (number, minimum 10)
      if (updates.hourly_rate !== undefined) {
        const rate = Number(updates.hourly_rate);
        if (Number.isNaN(rate)) {
          return res
            .status(400)
            .json({ success: false, message: "Hourly rate must be a number" });
        }
        if (rate < 10) {
          return res
            .status(400)
            .json({ success: false, message: "Minimum $10/hour" });
        }
        updates.hourly_rate = Math.round(rate * 100) / 100; // normalize to 2 decimals
      }

      // EMAIL (format + uniqueness)
      if (updates.email !== undefined) {
        const email = updates.email.toLowerCase();
        const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        if (!emailOk) {
          return res
            .status(400)
            .json({ success: false, message: "Invalid email address" });
        }
        const existing = await Teacher.findOne({
          email,
          _id: { $ne: teacherId },
        });
        if (existing) {
          return res
            .status(409)
            .json({ success: false, message: "Email is already in use" });
        }
        updates.email = email;
      }

      // LINKEDIN URL (optional validation)
      if (updates.linkedin_url) {
        try {
          const u = new URL(updates.linkedin_url);
          if (!["http:", "https:"].includes(u.protocol)) throw new Error();
        } catch {
          return res
            .status(400)
            .json({ success: false, message: "Invalid LinkedIn URL" });
        }
      }

      // Apply updates
      Object.keys(updates).forEach((k) => {
        teacher[k] = updates[k];
      });
      teacher.last_updated = Date.now();
      await teacher.save();

      return res.status(200).json({
        success: true,
        message: "Profile updated successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to update profile",
        error: error.message,
      });
    }
  }
);

// Teacher routes for courses
Teaceherrouter.get(
  "/my-courses/:teacherId",
  authenticateTeacher,
  async (req, res) => {
    try {
      const courses = await Course.find({ instructor: req.params.teacherId });
      res.json(courses);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error while fetching teacher courses",
      });
    }
  }
);

Teaceherrouter.get(
  "/my-course/:courseId",
  authenticateTeacher,
  async (req, res) => {
    try {
      const course = await Course.findById(req.params.courseId)
        .populate("instructor", "name email")
        .populate("studentsEnrolled", "name email");

      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      // Verify that the requesting teacher is the course instructor
      if (course.instructor._id.toString() !== req.teacher._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized access to this course",
        });
      }

      res.json(course);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error while fetching course",
      });
    }
  }
);

Teaceherrouter.put(
  "/update-course/:courseId",
  [
    authenticateTeacher,
    upload.fields([
      { name: "thumbnail", maxCount: 1 },
      { name: "attachments", maxCount: 10 },
      { name: "contentThumbnails", maxCount: 10 },
      { name: "contentVideos", maxCount: 10 },
    ]),
  ],
  async (req, res) => {
    try {
      const {
        title,
        description,
        type,
        price,
        content,
        categories,
        requirements,
        whatYouWillLearn,
        level,
        status,
        category,
      } = req.body;

      // First verify the teacher owns this course
      const existingCourse = await Course.findById(req.params.courseId);
      if (!existingCourse) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      if (existingCourse.instructor.toString() !== req.teacher._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized to update this course",
        });
      }

      // Handle thumbnail update
      if (req.files.thumbnail) {
        const thumbnailFile = req.files.thumbnail[0];
        existingCourse.thumbnail = {
          filename: thumbnailFile.originalname,
          path: thumbnailFile.path,
          size: thumbnailFile.size,
          mimetype: thumbnailFile.mimetype,
        };
      }

      // Update fields
      if (title) existingCourse.title = title;
      if (description) existingCourse.description = description;
      if (type) existingCourse.type = type;
      if (price) existingCourse.price = parseFloat(price);
      if (content)
        existingCourse.content =
          typeof content === "string" ? JSON.parse(content) : content;
      if (categories)
        existingCourse.categories =
          typeof categories === "string" ? JSON.parse(categories) : categories;
      if (requirements)
        existingCourse.requirements =
          typeof requirements === "string"
            ? requirements.split(",")
            : requirements;
      if (whatYouWillLearn)
        existingCourse.whatYouWillLearn =
          typeof whatYouWillLearn === "string"
            ? whatYouWillLearn.split(",")
            : whatYouWillLearn;
      if (level) existingCourse.level = level;
      if (status) existingCourse.status = status;
      if (category) existingCourse.category = category;

      // Handle attachments
      if (req.files.attachments) {
        const attachmentFiles = req.files.attachments.map((file) => ({
          filename: file.originalname,
          path: file.path,
          size: file.size,
          mimetype: file.mimetype,
        }));
        existingCourse.attachments = [
          ...existingCourse.attachments,
          ...attachmentFiles,
        ];
      }

      // Handle premium content
      if (type === "premium") {
        if (req.files.contentVideos) {
          // Process video uploads
          // You'll need to map these to the appropriate content items
        }
        if (req.files.contentThumbnails) {
          // Process thumbnail uploads for live classes
        }
      }

      await existingCourse.save();

      res.json({
        success: true,
        message: "Course updated successfully",
        data: existingCourse,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error while updating course",
      });
    }
  }
);

Teaceherrouter.delete(
  "/delete-content/:courseId",
  authenticateTeacher,
  async (req, res) => {
    try {
      const course = await Course.findById(req.params.courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      // Verify the teacher owns this course
      if (course.instructor.toString() !== req.teacher._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized to delete this course",
        });
      }

      await course.remove();

      res.json({
        success: true,
        message: "Course deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error while deleting course",
      });
    }
  }
);

Teaceherrouter.get(
  "/enrolled-courses",
  authenticateTeacher,
  async (req, res) => {
    try {
      // Find the student and populate the course details
      const student = await Student.findById(req.user.id)
        .populate({
          path: "enrolledCourses.course",
          select:
            "title description instructor thumbnail price category level totalStudents rating duration language",
          populate: {
            path: "instructor",
            select: "full_name profile_picture",
          },
        })
        .select("enrolledCourses");

      if (!student) {
        return res
          .status(404)
          .json({ success: false, message: "Student not found" });
      }

      // Format the response data
      const enrolledCourses = student.enrolledCourses.map((enrollment) => {
        const course = enrollment.course;
        return {
          courseId: course._id,
          title: course.title,
          description: course.description,
          instructor: course.instructor,
          thumbnail: course.thumbnail,
          price: course.price,
          category: course.category,
          level: course.level,
          duration: course.duration,
          language: course.language,
          enrolledAt: enrollment.enrolledAt,
          progress: enrollment.progress,
          completed: enrollment.completed,
          lastAccessed: enrollment.lastAccessed,
          totalContentItems: course.content ? course.content.length : 0,
          completedContentItems: enrollment.contentProgress
            ? enrollment.contentProgress.filter((cp) => cp.completed).length
            : 0,
          quizAttempts: enrollment.quizAttempts.length,
          certificates: enrollment.certificates,
          nextRecommendedContent: getNextRecommendedContent(
            enrollment.contentProgress,
            course.content
          ),
        };
      });

      // Sort by last accessed (most recent first) or by progress (highest first)
      enrolledCourses.sort((a, b) => {
        if (a.lastAccessed && b.lastAccessed) {
          return new Date(b.lastAccessed) - new Date(a.lastAccessed);
        }
        return b.progress - a.progress;
      });

      res.status(200).json({
        success: true,
        count: enrolledCourses.length,
        data: enrolledCourses,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error while fetching enrolled courses",
        error: error.message,
      });
    }
  }
);
Teaceherrouter.get(
  "/enrolled-courses/:studentId",
  authenticateTeacher,
  async (req, res) => {
    try {
      // Validate student ID
      if (!mongoose.Types.ObjectId.isValid(req.params.studentId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid student ID" });
      }

      // Check if the requesting user has permission (student or admin)
      if (req.user.role !== "admin" && req.user.id !== req.params.studentId) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to access these courses",
        });
      }

      // Find the student with enrolled courses populated
      const student = await Student.findById(req.params.studentId)
        .select("enrolledCourses")
        .populate({
          path: "enrolledCourses.course",
          select:
            "title description instructor thumbnail price categories level duration content",
          populate: {
            path: "instructor",
            select: "full_name profile_picture",
          },
        });

      if (!student) {
        return res
          .status(404)
          .json({ success: false, message: "Student not found" });
      }

      // Format the response data
      const enrolledCourses = await Promise.all(
        student.enrolledCourses.map(async (enrollment) => {
          const course = enrollment.course;

          // Calculate total content items
          const totalContentItems = course.content ? course.content.length : 0;

          // Calculate completed content items
          const completedContentItems = enrollment.contentProgress
            ? enrollment.contentProgress.filter((cp) => cp.completed).length
            : 0;

          // Format thumbnail URL
          let thumbnailUrl = "/default-thumbnail.jpg";
          if (course.thumbnail) {
            thumbnailUrl =
              typeof course.thumbnail === "string"
                ? course.thumbnail
                : course.thumbnail.path || "/default-thumbnail.jpg";
            // Normalize path for Windows/Linux compatibility
            thumbnailUrl = thumbnailUrl.replace(/\\/g, "/");
          }

          // Get next recommended content
          const nextContent = getNextRecommendedContent(
            enrollment.contentProgress,
            course.content
          );

          return {
            enrollmentInfo: {
              _id: enrollment._id,
              enrolledAt: enrollment.enrolledAt,
              progress: enrollment.progress,
              completed: enrollment.completed,
              lastAccessed: enrollment.lastAccessed,
              completedContentItems,
              totalContentItems,
              quizAttempts: enrollment.quizAttempts
                ? enrollment.quizAttempts.length
                : 0,
              certificates: enrollment.certificates || [],
            },
            courseDetails: {
              _id: course._id,
              title: course.title,
              description: course.description,
              instructor: course.instructor,
              thumbnail: {
                path: thumbnailUrl,
                alt: course.title,
              },
              price: course.price,
              categories: course.categories || [],
              level: course.level,
              duration: course.duration, // in minutes
              contentCount: totalContentItems,
              nextRecommendedContent: nextContent,
            },
          };
        })
      );

      // Sort courses by last accessed (most recent first) or by progress (highest first)
      enrolledCourses.sort((a, b) => {
        const aDate =
          a.enrollmentInfo.lastAccessed || a.enrollmentInfo.enrolledAt;
        const bDate =
          b.enrollmentInfo.lastAccessed || b.enrollmentInfo.enrolledAt;

        if (aDate && bDate) {
          return new Date(bDate) - new Date(aDate);
        }
        return b.enrollmentInfo.progress - a.enrollmentInfo.progress;
      });

      res.status(200).json({
        success: true,
        count: enrolledCourses.length,
        enrolledCourses,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error while fetching enrolled courses",
        error: error.message,
      });
    }
  }
);

// Helper function to determine next recommended content
function getNextRecommendedContent(contentProgress = [], courseContent = []) {
  if (courseContent.length === 0) return null;

  // Find the first content item not marked as completed
  for (const contentItem of courseContent) {
    const progressItem = contentProgress.find(
      (cp) =>
        cp.contentItemId &&
        contentItem._id &&
        cp.contentItemId.toString() === contentItem._id.toString()
    );

    if (!progressItem || !progressItem.completed) {
      return {
        contentItemId: contentItem._id,
        title: contentItem.title || "Untitled Content",
        type: contentItem.type || "lesson",
      };
    }
  }

  // If all content is completed, return the first item
  const firstItem = courseContent[0];
  return {
    contentItemId: firstItem._id,
    title: firstItem.title || "Untitled Content",
    type: firstItem.type || "lesson",
  };
}

// Helper function to determine next recommended content
function getNextRecommendedContent(contentProgress, courseContent) {
  if (!courseContent || courseContent.length === 0) return null;

  // Find the first content item not marked as completed
  for (const contentItem of courseContent) {
    const progressItem = contentProgress.find(
      (cp) => cp.contentItemId.toString() === contentItem._id.toString()
    );

    if (!progressItem || !progressItem.completed) {
      return {
        contentItemId: contentItem._id,
        title: contentItem.title,
        type: contentItem.type,
      };
    }
  }

  // If all content is completed, return the first item
  return {
    contentItemId: courseContent[0]._id,
    title: courseContent[0].title,
    type: courseContent[0].type,
  };
}
// -------------------------- Profile Photo Update ----------------------------
const storages = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./public/uploads/teachers";
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    const dir = "./public/uploads/teachers";

    let finalName = file.originalname;
    let counter = 1;

    while (fs.existsSync(path.join(dir, finalName))) {
      finalName = `${baseName}(${counter})${ext}`;
      counter++;
    }

    cb(null, finalName);
  },
});

// Configure multer instance with error handling
const uploads = multer({
  storage: storages,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});
Teaceherrouter.put(
  "/update-profile-photo/:id",
  authenticateTeacher,
  uploads.single("profile_photo"),
  async (req, res) => {
    try {
      const teacherId = req.params.id;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Profile photo is required",
        });
      }

      const teacher = await Teacher.findById(teacherId);
      if (!teacher) {
        // remove uploaded file if teacher not found
        try {
          fs.unlinkSync(req.file.path);
        } catch {}
        return res
          .status(404)
          .json({ success: false, message: "Teacher not found" });
      }

      // Delete old profile photo if exists (we store filename, not full path)
      if (teacher.profile_photo) {
        const oldPath = path.join(
          "public",
          "uploads",
          "teachers",
          teacher.profile_photo
        );
        if (fs.existsSync(oldPath)) {
          try {
            fs.unlinkSync(oldPath);
          } catch (err) {
            console.error("Error deleting old profile photo:", err);
          }
        }
      }

      // Save only the filename; express.static("public") will serve /uploads/teachers/<filename>
      teacher.profile_photo = req.file.filename;
      teacher.last_updated = Date.now();
      await teacher.save();

      return res.status(200).json({
        success: true,
        message: "Profile photo updated successfully",
        data: {
          // return filename so frontend can build URL
          profile_photo: teacher.profile_photo,
          last_updated: teacher.last_updated,
        },
      });
    } catch (error) {
      // cleanup if needed
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch {}
      }
      return res.status(500).json({
        success: false,
        message: "Failed to update profile photo",
        error: error.message,
      });
    }
  }
);

// ---------------------------- Course Routes ----------------------------

// Create a new course
Teaceherrouter.post(
  "/create-course",
  authenticateTeacher,
  uploadMultiple,
  async (req, res) => {
    try {
      // Validate required files
      if (!req.files || !req.files["thumbnail"]) {
        return res.status(400).json({
          success: false,
          message: "Course thumbnail is required",
        });
      }

      const {
        title,
        description,
        type,
        price,
        content,
        level = "beginner",
        user_id,
        category,
      } = req.body;

      // Validate required fields
      if (!title || !description || !type || !user_id || !content) {
        cleanupFiles(req.files);
        return res.status(400).json({
          success: false,
          message:
            "Title, description, type, user ID, and content are required",
        });
      }

      // Validate price for premium and live courses
      if ((type === "premium" || type === "live") && (!price || isNaN(price))) {
        cleanupFiles(req.files);
        return res.status(400).json({
          success: false,
          message: "Price is required for premium and live courses",
        });
      }

      // Parse and process content
      let parsedContent;
      try {
        parsedContent =
          typeof content === "string" ? JSON.parse(content) : content;

        // Ensure content is an array
        if (!Array.isArray(parsedContent)) {
          throw new Error("Content must be an array");
        }

        // Validate quiz questions structure
        for (const item of parsedContent) {
          if (item.type === "quiz" && Array.isArray(item.questions)) {
            for (const question of item.questions) {
              // Validate question structure based on type
              if (!question.type || !question.question) {
                return res.status(400).json({
                  success: false,
                  message: "All questions must have a type and question text",
                });
              }

              // Validate MCQ questions
              if (["mcq-single", "mcq-multiple"].includes(question.type)) {
                if (
                  !Array.isArray(question.options) ||
                  question.options.length < 2
                ) {
                  return res.status(400).json({
                    success: false,
                    message: "MCQ questions must have at least 2 options",
                  });
                }
                if (
                  question.correctAnswer === undefined ||
                  question.correctAnswer === null
                ) {
                  return res.status(400).json({
                    success: false,
                    message:
                      "MCQ questions must have a correct answer selected",
                  });
                }
              }

              // Validate short/broad answer questions
              if (["short-answer", "broad-answer"].includes(question.type)) {
                if (
                  question.expectedAnswer === undefined ||
                  question.expectedAnswer === null ||
                  question.expectedAnswer.trim() === ""
                ) {
                  return res.status(400).json({
                    success: false,
                    message:
                      "Short and broad answer questions must have an expected answer",
                  });
                }

                // Remove correctAnswer field if it exists for short/broad answers
                if (question.correctAnswer !== undefined) {
                  delete question.correctAnswer;
                }
              }
            }
          }
        }
      } catch (parseError) {
        cleanupFiles(req.files);
        return res.status(400).json({
          success: false,
          message: "Invalid content format",
          error: parseError.message,
        });
      }

      // Process thumbnail
      const thumbnailFile = req.files["thumbnail"][0];
      const thumbnailData = {
        filename: thumbnailFile.originalname,
        path: thumbnailFile.filename,
        size: thumbnailFile.size,
        mimetype: thumbnailFile.mimetype,
      };

      // Create a map of video filenames to their file objects for quick lookup
      const videoFilesMap = {};
      if (req.files["contentVideos"]) {
        req.files["contentVideos"].forEach((file) => {
          videoFilesMap[file.originalname] = file;
        });
      }

      // Process content items to attach uploaded files
      const processedContent = parsedContent.map((item) => {
        const contentItem = { ...item };

        // For premium course tutorials, attach the uploaded video
        if (
          item.type === "tutorial" &&
          type === "premium" &&
          item.content?.filename
        ) {
          const videoFilename = item.content.filename;
          const videoFile = videoFilesMap[videoFilename];

          if (videoFile) {
            contentItem.content = {
              filename: videoFile.originalname,
              path: videoFile.filename,
              size: videoFile.size,
              mimetype: videoFile.mimetype,
            };
          } else {
            // If video file not found, keep the filename reference but mark as missing
            contentItem.content = {
              filename: videoFilename,
              error: "Video file not uploaded",
            };
          }
        }

        // For live sessions, attach thumbnails if uploaded
        if (item.type === "live" && item.thumbnail?.filename) {
          const thumbnailFilename = item.thumbnail.filename;
          const thumbnailFiles = req.files["contentThumbnails"] || [];
          const thumbnailFile = thumbnailFiles.find(
            (f) => f.originalname === thumbnailFilename
          );

          if (thumbnailFile) {
            contentItem.thumbnail = {
              filename: thumbnailFile.originalname,
              path: thumbnailFile.filename,
              size: thumbnailFile.size,
              mimetype: thumbnailFile.mimetype,
            };
          } else {
            // If thumbnail file not found, keep the filename reference but mark as missing
            contentItem.thumbnail = {
              filename: thumbnailFilename,
              error: "Thumbnail file not uploaded",
            };
          }
        }

        // Process quiz questions - format correct answers appropriately
        if (item.type === "quiz" && item.questions) {
          contentItem.questions = item.questions.map((q) => ({
            ...q,
            correctAnswer: formatCorrectAnswer(q.type, q.correctAnswer),
          }));
        }

        return contentItem;
      });

      // Process attachments
      const attachments = [];
      if (req.files["attachments"]) {
        req.files["attachments"].forEach((file) => {
          attachments.push({
            filename: file.originalname,
            path: file.filename,
            size: file.size,
            mimetype: file.mimetype,
          });
        });
      }

      // Create the new course
      const newCourse = new Course({
        title,
        description,
        instructor: user_id,
        thumbnail: thumbnailData,
        attachments,
        content: processedContent,
        price: type === "premium" || type === "live" ? parseFloat(price) : 0,
        type,
        status: "active",
        level: level || "beginner",
        createbyid: user_id,
        category: category || "",
        categories: category ? [category] : [],
      });

      await newCourse.save();

      res.status(201).json({
        success: true,
        message: "Course created successfully",
        data: newCourse,
      });
    } catch (error) {
      cleanupFiles(req.files);

      res.status(500).json({
        success: false,
        message: "Failed to create course",
        error: error.message,
      });
    }
  }
);

// Helper functions
function cleanupFiles(files) {
  if (files) {
    Object.values(files).forEach((fileArray) => {
      fileArray.forEach((file) => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    });
  }
}
function formatCorrectAnswer(questionType, correctAnswer) {
  if (questionType === "mcq-single") {
    return parseInt(correctAnswer);
  } else if (questionType === "mcq-multiple") {
    if (Array.isArray(correctAnswer)) {
      return correctAnswer.map((ans) => parseInt(ans));
    }
    return [];
  }
  return correctAnswer;
}

// Get all courses
Teaceherrouter.get("/all-courses", authenticateTeacher, async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.send(courses);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Get courses created by the current teacher
Teaceherrouter.get("/my-courses/:id", authenticateTeacher, async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.params.id }).sort({
      createdAt: -1,
    });
    res.send(courses);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Get a specific course
Teaceherrouter.get(
  "/single-course/:id",
  authenticateTeacher,
  async (req, res) => {
    try {
      const course = await Course.findById(req.params.id)
        .populate("instructor", "username email")
        .populate("studentsEnrolled", "username email")
        .populate("ratings.user", "username");

      if (!course) {
        return res.status(404).send({ error: "Course not found" });
      }
      res.send(course);
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  }
);

// Update a course
Teaceherrouter.put(
  "/update-course/:id",
  authenticateTeacher,
  async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = [
      "title",
      "description",
      "thumbnail",
      "attachments",
      "price",
      "type",
      "status",
      "categories",
      "duration",
      "requirements",
      "whatYouWillLearn",
      "level",
      "content",
    ];

    // const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    // if (!isValidOperation) {
    //   return res.status(400).send({ error: 'Invalid updates!' });
    // }

    try {
      const course = await Course.findOne({
        _id: req.params.id,
        createbyid: req.body.user_id,
      });

      if (!course) {
        return res
          .status(404)
          .send({ error: "Course not found or not authorized" });
      }

      updates.forEach((update) => (course[update] = req.body[update]));
      await course.save();

      res.send(course);
    } catch (error) {
      res.status(400).send({ error: error.message });
    }
  }
);

// Delete a course
Teaceherrouter.delete(
  "/delete-course/:id",
  authenticateTeacher,
  async (req, res) => {
    try {
      const course = await Course.findOneAndDelete({
        _id: req.params.id,
        createbyid: req.user._id,
      });

      if (!course) {
        return res
          .status(404)
          .send({ error: "Course not found or not authorized" });
      }

      res.send(course);
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  }
);

// Add content to a course
Teaceherrouter.post(
  "/add-content/:courseId",
  authenticateTeacher,
  async (req, res) => {
    try {
      const course = await Course.findOne({
        _id: req.params.courseId,
        createbyid: req.user._id,
      });

      if (!course) {
        return res
          .status(404)
          .send({ error: "Course not found or not authorized" });
      }

      course.content.push(req.body);
      await course.save();
      res.send(course);
    } catch (error) {
      res.status(400).send({ error: error.message });
    }
  }
);

// Update course content item
Teaceherrouter.put(
  "/update-content/:courseId",
  authenticateTeacher,
  async (req, res) => {
    try {
      const course = await Course.findOne({
        _id: req.params.courseId,
        createbyid: req.user._id,
      });

      if (!course) {
        return res
          .status(404)
          .send({ error: "Course not found or not authorized" });
      }

      const contentItem = course.content.id(req.params.contentId);
      if (!contentItem) {
        return res.status(404).send({ error: "Content item not found" });
      }

      Object.assign(contentItem, req.body);
      await course.save();
      res.send(course);
    } catch (error) {
      res.status(400).send({ error: error.message });
    }
  }
);

// Delete course content item
Teaceherrouter.delete(
  "/delete-content/:courseId",
  authenticateTeacher,
  async (req, res) => {
    try {
      const course = await Course.findByIdAndDelete({
        _id: req.params.courseId,
      });

      res.send({ success: true, message: "Deleted successfully!" });
    } catch (error) {
      res.status(400).send({ error: error.message });
    }
  }
);
// ---------------------------all-category----------------------------
Teaceherrouter.get("/all-category", authenticateTeacher, async (req, res) => {
  try {
    const allcategory = await Category.find();
    if (!allcategory) {
      return res.send({ success: false, message: "Category did not find!" });
    }
    res.send({ success: true, data: allcategory });
  } catch (error) {
    console.log(error);
  }
});
// -------------------------- All Student Submissions Routes ----------------------------

const mongoose = require("mongoose");

// ================= GET ALL SUBMISSIONS =================
Teaceherrouter.get(
  "/all-submissions",
  authenticateTeacher,
  async (req, res) => {
    try {
      // Get teacher_id from authenticated user (set by authenticateTeacher middleware)
      const teacher_id = req.teacher._id;

      // 1. Get all courses taught by this teacher with proper population
      const courses = await Course.find({ instructor: teacher_id })
        .populate({
          path: "enrollments.studentId",
          select: "full_name email",
          model: "Student",
        })
        .populate({
          path: "content",
          select: "title type passingScore",
        });

      if (!courses || courses.length === 0) {
        return res.status(200).json({
          success: true,
          count: 0,
          data: [],
          message: "No courses found for this teacher",
        });
      }

      // 2. Transform the data to show only quiz submissions
      const submissions = courses
        .flatMap((course) => {
          if (!course.enrollments || course.enrollments.length === 0) {
            return [];
          }

          return course.enrollments.flatMap((enrollment) => {
            if (!enrollment.progress || enrollment.progress.length === 0) {
              return [];
            }

            // Filter to only include quiz submissions with answers
            return enrollment.progress
              .filter((progress) => {
                // Only include quiz content that has been submitted (has answers)
                const contentItem = course.content.find(
                  (c) =>
                    c &&
                    c._id &&
                    progress.contentItemId &&
                    c._id.toString() === progress.contentItemId.toString()
                );

                return (
                  contentItem &&
                  contentItem.type === "quiz" &&
                  progress.answers &&
                  progress.answers.length > 0
                );
              })
              .map((progress) => {
                // Find the content item details
                const contentItem = course.content.find(
                  (c) =>
                    c &&
                    c._id &&
                    progress.contentItemId &&
                    c._id.toString() === progress.contentItemId.toString()
                );

                // Safely process answers
                const answers = (progress.answers || []).map((answer) => {
                  // Find the original question from course content to get the expected answer
                  const contentItem = course.content.find(
                    (c) =>
                      c &&
                      c._id &&
                      progress.contentItemId &&
                      c._id.toString() === progress.contentItemId.toString()
                  );

                  let originalQuestion = null;
                  if (contentItem && contentItem.questions) {
                    originalQuestion = contentItem.questions.find(
                      (q) =>
                        q &&
                        q._id &&
                        answer.questionId &&
                        q._id.toString() === answer.questionId.toString()
                    );
                  }

                  // Determine the correct/expected answer based on question type
                  let correctOrExpectedAnswer = "No expected answer provided";

                  if (originalQuestion) {
                    if (
                      originalQuestion.type === "mcq-single" ||
                      originalQuestion.type === "mcq-multiple"
                    ) {
                      correctOrExpectedAnswer =
                        originalQuestion.correctAnswer !== undefined
                          ? originalQuestion.correctAnswer
                          : "No correct answer provided";
                    } else if (
                      originalQuestion.type === "short-answer" ||
                      originalQuestion.type === "broad-answer"
                    ) {
                      correctOrExpectedAnswer =
                        originalQuestion.expectedAnswer !== undefined
                          ? originalQuestion.expectedAnswer
                          : "No expected answer provided";
                    }
                  }

                  return {
                    answerId: answer._id,
                    question: answer.questionText || "Unknown question",
                    questionType: answer.questionType || "unknown",
                    studentAnswer:
                      answer.answer !== undefined
                        ? answer.answer
                        : "No answer provided",
                    correctAnswer: correctOrExpectedAnswer,
                    isCorrect: answer.isCorrect || false,
                    marksObtained: answer.marksObtained || 0,
                    maxMarks: answer.maxMarks || 0,
                    teacherFeedback: answer.teacherFeedback || "",
                  };
                });

                return {
                  student: {
                    name: enrollment.studentId?.full_name || "Unknown Student",
                    email: enrollment.studentId?.email || "No email",
                  },
                  courseTitle: course.title || "Untitled course",
                  contentItem: {
                    _id: contentItem?._id || null, // Ensure this is included
                    title: contentItem?.title || "Unknown content",
                    type: contentItem?.type || "unknown",
                    passingScore: contentItem?.passingScore || 70,
                  },
                  status: progress.status || "unknown",
                  gradingStatus: progress.gradingStatus || "not-graded",
                  score: progress.score || 0,
                  maxScore: progress.maxScore || 0,
                  percentage: progress.percentage || 0,
                  passed: progress.passed || false,
                  lastAccessed: progress.lastAccessed || new Date(),
                  answers,
                };
              });
          });
        })
        .filter((submission) => submission !== null);

      res.status(200).json({
        success: true,
        count: submissions.length,
        data: submissions,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch submissions",
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
    }
  }
);

// ================= GRADE SUBMISSION =================
Teaceherrouter.put(
  "/grade-submission",
  authenticateTeacher,
  async (req, res) => {
    try {
      const { studentEmail, contentItemId, answers } = req.body;

      // 1. Find the student first
      const Student = mongoose.model("Student");
      const student = await Student.findOne({ email: studentEmail });

      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student not found",
        });
      }

      // 2. Find the course taught by this teacher that has this student enrolled AND contains the content item
      const course = await Course.findOne({
        instructor: req.teacher._id,
        "enrollments.studentId": student._id,
        "content._id": contentItemId, // Ensure the course has this content item
      }).populate({
        path: "enrollments.studentId",
        select: "full_name email",
        model: "Student",
      });

      if (!course) {
        return res.status(404).json({
          success: false,
          message:
            "Course not found for this teacher and student, or content item not in course",
        });
      }

      // 3. Find the specific enrollment
      const enrollment = course.enrollments.find(
        (e) =>
          e.studentId && e.studentId._id.toString() === student._id.toString()
      );

      if (!enrollment) {
        return res.status(404).json({
          success: false,
          message: "Student enrollment not found",
        });
      }

      if (!enrollment.progress) {
        return res.status(404).json({
          success: false,
          message: "No progress data found for this enrollment",
        });
      }

      // 4. Find the progress item using contentItemId
      const progress = enrollment.progress.find(
        (p) => p.contentItemId && p.contentItemId.toString() === contentItemId
      );

      if (!progress) {
        return res.status(404).json({
          success: false,
          message:
            "Content submission not found for this student and content item",
        });
      }

      if (!progress.answers) {
        return res.status(404).json({
          success: false,
          message: "No answers found for this submission",
        });
      }

      // 5. Update each answer with grading
      let newScore = 0;
      const now = new Date();

      answers.forEach((gradedAnswer) => {
        // Find answer by ID
        const answer = progress.answers.id(gradedAnswer.answerId);

        if (answer) {
          answer.marksObtained = gradedAnswer.marks;
          answer.teacherFeedback = gradedAnswer.feedback;
          answer.isCorrect = gradedAnswer.isCorrect;
          answer.gradedBy = req.teacher._id;
          answer.gradedAt = now;

          newScore += gradedAnswer.marks;
        } else {
          console.warn(`Answer with ID ${gradedAnswer.answerId} not found`);
        }
      });

      // 6. Update progress metrics
      progress.score = newScore;
      progress.percentage = Math.round((newScore / progress.maxScore) * 100);

      // Use 40% as passing score
      const passingScore = 40;
      progress.passed = progress.percentage >= passingScore;
      progress.gradingStatus = "manually-graded";
      progress.status = "graded";

      // 7. Save the changes
      await course.save();

      res.status(200).json({
        success: true,
        message: "Submission graded successfully",
        data: {
          student: studentEmail,
          contentItemId: contentItemId,
          newScore,
          maxScore: progress.maxScore,
          percentage: progress.percentage,
          passed: progress.passed,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to grade submission",
        error: error.message,
      });
    }
  }
);

// -------------------------- Student Quiz Answers Routes ----------------------------
// Get submissions needing grading
Teaceherrouter.get(
  "/submissions-needing-grading",
  authenticateTeacher,
  async (req, res) => {
    try {
      const courses = await Course.find({ instructor: req.body.teacher_id })
        .populate({
          path: "enrollments.studentId",
          select: "full_name email",
        })
        .populate({
          path: "content",
          select: "title type",
        });

      const needsGrading = courses.flatMap((course) => {
        return course.enrollments.flatMap((enrollment) => {
          return enrollment.progress
            .filter(
              (progress) =>
                progress.gradingStatus === "partially-graded" ||
                progress.answers.some((a) => !a.gradedAt)
            )
            .map((progress) => {
              const contentItem = course.content.find(
                (c) => c._id.toString() === progress.contentItemId.toString()
              );

              return {
                student: enrollment.studentId.full_name,
                email: enrollment.studentId.email,
                course: course.title,
                content: contentItem?.title || "Unknown",
                type: contentItem?.type || "unknown",
                submittedAt: progress.lastAccessed,
                answers: progress.answers
                  .filter((a) => !a.gradedAt)
                  .map((a) => ({
                    question: a.questionText,
                    type: a.questionType,
                    studentAnswer: a.answer,
                    correctAnswer: a.correctAnswer,
                    maxMarks: a.maxMarks,
                  })),
              };
            });
        });
      });

      res.status(200).json({
        success: true,
        count: needsGrading.length,
        data: needsGrading,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch submissions needing grading",
        error: error.message,
      });
    }
  }
);
// Get all quiz answers for a specific course
Teaceherrouter.get(
  "/course/:courseId/quiz-answers",
  authenticateTeacher,
  async (req, res) => {
    try {
      const courseId = req.params.courseId;
      const teacherId = req.teacher._id;

      // Verify teacher owns the course
      const course = await Course.findOne({
        _id: courseId,
        instructor: teacherId,
      }).populate({
        path: "enrollments.studentId",
        select: "full_name email",
      });

      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found or not authorized",
        });
      }

      // Extract all quiz answers from enrollments
      const quizAnswers = [];

      course.enrollments.forEach((enrollment) => {
        enrollment.progress.forEach((progress) => {
          // Only include quiz content items
          const contentItem = course.content.id(progress.contentItemId);
          if (contentItem && contentItem.type === "quiz") {
            quizAnswers.push({
              student: {
                id: enrollment.studentId._id,
                name: enrollment.studentId.full_name,
                email: enrollment.studentId.email,
              },
              quizId: progress.contentItemId,
              quizTitle: contentItem.title,
              attemptNumber: progress.attempts,
              score: progress.score,
              maxScore: progress.maxScore,
              percentage: progress.percentage,
              passed: progress.passed,
              gradingStatus: progress.gradingStatus,
              answers: progress.answers.map((answer) => ({
                questionId: answer.questionId,
                questionText: answer.questionText,
                questionType: answer.questionType,
                studentAnswer: answer.answer,
                correctAnswer: answer.correctAnswer,
                isCorrect: answer.isCorrect,
                marksObtained: answer.marksObtained,
                maxMarks: answer.maxMarks,
                teacherFeedback: answer.teacherFeedback,
                needsManualGrading: answer.needsManualGrading,
                graded: !!answer.gradedAt,
              })),
              submittedAt: progress.lastAccessed,
            });
          }
        });
      });

      res.status(200).json({
        success: true,
        count: quizAnswers.length,
        data: quizAnswers,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch quiz answers",
        error: error.message,
      });
    }
  }
);

// Get quiz answers for a specific student in a course
Teaceherrouter.get(
  "/course/:courseId/student/:studentId/quiz-answers",
  authenticateTeacher,
  async (req, res) => {
    try {
      const { courseId, studentId } = req.params;
      const teacherId = req.teacher._id;

      // Verify teacher owns the course
      const course = await Course.findOne({
        _id: courseId,
        instructor: teacherId,
      }).populate({
        path: "enrollments.studentId",
        match: { _id: studentId },
        select: "full_name email",
      });

      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found or not authorized",
        });
      }

      // Find the specific enrollment
      const enrollment = course.enrollments.find(
        (e) => e.studentId._id.toString() === studentId
      );
      if (!enrollment) {
        return res.status(404).json({
          success: false,
          message: "Student not enrolled in this course",
        });
      }

      // Extract quiz answers for this student
      const quizAnswers = [];

      enrollment.progress.forEach((progress) => {
        // Only include quiz content items
        const contentItem = course.content.id(progress.contentItemId);
        if (contentItem && contentItem.type === "quiz") {
          quizAnswers.push({
            quizId: progress.contentItemId,
            quizTitle: contentItem.title,
            attemptNumber: progress.attempts,
            score: progress.score,
            maxScore: progress.maxScore,
            percentage: progress.percentage,
            passed: progress.passed,
            gradingStatus: progress.gradingStatus,
            answers: progress.answers.map((answer) => ({
              questionId: answer.questionId,
              questionText: answer.questionText,
              questionType: answer.questionType,
              studentAnswer: answer.answer,
              correctAnswer: answer.correctAnswer,
              isCorrect: answer.isCorrect,
              marksObtained: answer.marksObtained,
              maxMarks: answer.maxMarks,
              teacherFeedback: answer.teacherFeedback,
              needsManualGrading: answer.needsManualGrading,
              graded: !!answer.gradedAt,
            })),
            submittedAt: progress.lastAccessed,
          });
        }
      });

      res.status(200).json({
        success: true,
        count: quizAnswers.length,
        data: {
          student: {
            id: enrollment.studentId._id,
            name: enrollment.studentId.full_name,
            email: enrollment.studentId.email,
          },
          quizzes: quizAnswers,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch student quiz answers",
        error: error.message,
      });
    }
  }
);

// Grade a specific quiz question answer
Teaceherrouter.put(
  "/course/:courseId/quiz/:quizId/student/:studentId/grade",
  authenticateTeacher,
  async (req, res) => {
    try {
      const { courseId, quizId, studentId } = req.params;
      const teacherId = req.teacher._id;
      const { questionId, marks, feedback, isCorrect } = req.body;

      // Validate input
      if (marks === undefined) {
        return res.status(400).json({
          success: false,
          message: "Marks are required for grading",
        });
      }

      // Verify teacher owns the course
      const course = await Course.findOne({
        _id: courseId,
        instructor: teacherId,
      });

      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found or not authorized",
        });
      }

      // Find the specific enrollment
      const enrollment = course.enrollments.find(
        (e) => e.studentId.toString() === studentId
      );

      if (!enrollment) {
        return res.status(404).json({
          success: false,
          message: "Student not enrolled in this course",
        });
      }

      // Find the quiz progress
      const progress = enrollment.progress.find(
        (p) => p.contentItemId.toString() === quizId
      );

      if (!progress) {
        return res.status(404).json({
          success: false,
          message: "Quiz attempt not found",
        });
      }

      // Find the specific answer to grade
      const answer = progress.answers.find(
        (a) => a.questionId.toString() === questionId
      );

      if (!answer) {
        return res.status(404).json({
          success: false,
          message: "Question answer not found",
        });
      }

      // Validate marks don't exceed max marks
      if (marks > answer.maxMarks) {
        return res.status(400).json({
          success: false,
          message: `Marks cannot exceed maximum marks (${answer.maxMarks})`,
        });
      }

      // Update the answer with grading information
      answer.marksObtained = marks;
      answer.teacherFeedback = feedback || "";
      answer.isCorrect =
        isCorrect !== undefined ? isCorrect : marks >= answer.maxMarks * 0.5;
      answer.gradedBy = teacherId;
      answer.gradedAt = new Date();

      // Recalculate the total score
      let newScore = 0;
      progress.answers.forEach((a) => {
        newScore += a.marksObtained || 0;
      });

      // Update progress metrics
      progress.score = newScore;
      progress.percentage = Math.round((newScore / progress.maxScore) * 100);
      progress.passed =
        progress.percentage >= (course.content.id(quizId).passingScore || 70);

      // Update grading status
      const ungradedAnswers = progress.answers.filter((a) => !a.gradedAt);
      progress.gradingStatus =
        ungradedAnswers.length === 0 ? "manually-graded" : "partially-graded";

      // Save the changes
      await course.save();

      res.status(200).json({
        success: true,
        message: "Answer graded successfully",
        data: {
          studentId,
          quizId,
          questionId,
          marksObtained: answer.marksObtained,
          maxMarks: answer.maxMarks,
          isCorrect: answer.isCorrect,
          newTotalScore: progress.score,
          maxTotalScore: progress.maxScore,
          percentage: progress.percentage,
          passed: progress.passed,
          gradingStatus: progress.gradingStatus,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to grade quiz answer",
        error: error.message,
      });
    }
  }
);

// Bulk grade multiple quiz questions
Teaceherrouter.put(
  "/course/:courseId/quiz/:quizId/student/:studentId/bulk-grade",
  authenticateTeacher,
  async (req, res) => {
    try {
      const { courseId, quizId, studentId } = req.params;
      const teacherId = req.teacher._id;
      const { grades } = req.body; // Array of { questionId, marks, feedback, isCorrect }

      // Validate input
      if (!grades || !Array.isArray(grades)) {
        return res.status(400).json({
          success: false,
          message: "Grades array is required",
        });
      }

      // Verify teacher owns the course
      const course = await Course.findOne({
        _id: courseId,
        instructor: teacherId,
      });

      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found or not authorized",
        });
      }

      // Find the specific enrollment
      const enrollment = course.enrollments.find(
        (e) => e.studentId.toString() === studentId
      );

      if (!enrollment) {
        return res.status(404).json({
          success: false,
          message: "Student not enrolled in this course",
        });
      }

      // Find the quiz progress
      const progress = enrollment.progress.find(
        (p) => p.contentItemId.toString() === quizId
      );

      if (!progress) {
        return res.status(404).json({
          success: false,
          message: "Quiz attempt not found",
        });
      }

      const now = new Date();
      let newScore = 0;

      // Process each grade
      grades.forEach((grade) => {
        const { questionId, marks, feedback, isCorrect } = grade;

        // Find the answer to grade
        const answer = progress.answers.find(
          (a) => a.questionId.toString() === questionId
        );

        if (answer) {
          // Validate marks don't exceed max marks
          const finalMarks = Math.min(marks, answer.maxMarks);

          // Update the answer
          answer.marksObtained = finalMarks;
          answer.teacherFeedback = feedback || "";
          answer.isCorrect =
            isCorrect !== undefined
              ? isCorrect
              : finalMarks >= answer.maxMarks * 0.5;
          answer.gradedBy = teacherId;
          answer.gradedAt = now;

          newScore += finalMarks;
        }
      });

      // Update progress metrics
      progress.score = newScore;
      progress.percentage = Math.round((newScore / progress.maxScore) * 100);
      progress.passed =
        progress.percentage >= course.content.id(quizId).passingScore || 70;

      // Update grading status
      const ungradedAnswers = progress.answers.filter((a) => !a.gradedAt);
      progress.gradingStatus =
        ungradedAnswers.length === 0 ? "manually-graded" : "partially-graded";

      // Save the changes
      await course.save();

      res.status(200).json({
        success: true,
        message: "Answers graded successfully",
        data: {
          studentId,
          quizId,
          questionsGraded: grades.length,
          newTotalScore: progress.score,
          maxTotalScore: progress.maxScore,
          percentage: progress.percentage,
          passed: progress.passed,
          gradingStatus: progress.gradingStatus,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to grade quiz answers",
        error: error.message,
      });
    }
  }
);
// Get live class attendance data for a teacher
Teaceherrouter.get(
  "/live-class-attendance",
  authenticateTeacher,
  async (req, res) => {
    try {
      const teacherId = req.teacher._id;

      // 1. Find all courses taught by this teacher that have live class content
      const courses = await Course.find({ instructor: teacherId }).populate({
        path: "enrollments.studentId",
        select: "full_name email",
        model: "Student",
      });

      if (!courses || courses.length === 0) {
        return res.status(200).json({
          success: true,
          count: 0,
          data: [],
          message: "No live classes found for this teacher",
        });
      }

      // 2. Transform the data to show attendance records
      const attendanceRecords = [];

      courses.forEach((course) => {
        // Find all live class content items in this course
        const liveClasses = (course.content || []).filter(
          (item) => item.type === "live"
        );

        liveClasses.forEach((liveClass) => {
          // For each enrollment, find progress for this live class
          course.enrollments.forEach((enrollment) => {
            const progress = enrollment.progress.find(
              (p) =>
                p.contentItemId &&
                liveClass._id &&
                p.contentItemId.toString() === liveClass._id.toString()
            );

            attendanceRecords.push({
              courseId: course._id,
              courseTitle: course.title,
              contentId: liveClass._id,
              contentItem: {
                _id: liveClass._id,
                title: liveClass.title,
                type: liveClass.type,
                schedule: liveClass.schedule,
                duration: liveClass.duration,
              },
              student: {
                _id: enrollment.studentId?._id,
                name: enrollment.studentId?.full_name || "Unknown Student",
                email: enrollment.studentId?.email || "No email",
              },
              completed: progress?.completed || false,
              lastAccessed: progress?.lastAccessed || null,
              timeSpent: progress?.timeSpent || 0,
              attendanceStatus: progress?.attendanceStatus || "not-started",
            });
          });
        });
      });

      res.status(200).json({
        success: true,
        count: attendanceRecords.length,
        data: attendanceRecords,
      });
    } catch (error) {
      console.error("Error fetching live class attendance:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch live class attendance",
        error: error.message,
      });
    }
  }
);

// Get all answers needing manual grading for a teacher's courses
Teaceherrouter.get(
  "/answers-needing-grading",
  authenticateTeacher,
  async (req, res) => {
    try {
      const teacherId = req.teacher._id;

      // Find all courses taught by this teacher
      const courses = await Course.find({ instructor: teacherId })
        .populate({
          path: "enrollments.studentId",
          select: "full_name email",
        })
        .populate({
          path: "content",
          select: "title type",
        });

      // Collect all answers needing grading
      const answersNeedingGrading = [];

      courses.forEach((course) => {
        course.enrollments.forEach((enrollment) => {
          enrollment.progress.forEach((progress) => {
            // Only include quiz content items
            const contentItem = course.content.id(progress.contentItemId);
            if (contentItem && contentItem.type === "quiz") {
              progress.answers.forEach((answer) => {
                if (!answer.gradedAt && answer.needsManualGrading) {
                  answersNeedingGrading.push({
                    courseId: course._id,
                    courseTitle: course.title,
                    student: {
                      id: enrollment.studentId._id,
                      name: enrollment.studentId.full_name,
                      email: enrollment.studentId.email,
                    },
                    quizId: progress.contentItemId,
                    quizTitle: contentItem.title,
                    questionId: answer.questionId,
                    questionText: answer.questionText,
                    questionType: answer.questionType,
                    studentAnswer: answer.answer,
                    correctAnswer: answer.correctAnswer,
                    maxMarks: answer.maxMarks,
                    attemptNumber: progress.attempts,
                    submittedAt: progress.lastAccessed,
                  });
                }
              });
            }
          });
        });
      });

      res.status(200).json({
        success: true,
        count: answersNeedingGrading.length,
        data: answersNeedingGrading,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch answers needing grading",
        error: error.message,
      });
    }
  }
);

// -------------------------- Live Class Progress Routes ----------------------------

// Get live class progress data for teacher
Teaceherrouter.get(
  "/live-class-progress/:courseId",
  authenticateTeacher,
  async (req, res) => {
    try {
      const { courseId } = req.params;
      const teacherId = req.teacher._id;

      // Find the course and verify the teacher is the instructor
      const course = await Course.findOne({
        _id: courseId,
        instructor: teacherId,
      })
        .populate("enrollments.studentId", "full_name email")
        .select("content enrollments");

      if (!course) {
        return res.json({
          success: false,
          message: "Course not found or you are not the instructor",
        });
      }

      // Find all live class content items
      const liveClasses = course.content.filter((item) => item.type === "live");

      // Get progress data for each live class
      const liveClassProgress = liveClasses.map((liveClass) => {
        // Find all enrollments that have progress for this live class
        const enrollmentsWithProgress = course.enrollments.filter(
          (enrollment) => {
            return enrollment.progress.some(
              (p) => p.contentItemId.toString() === liveClass._id.toString()
            );
          }
        );

        // Calculate completion stats
        const totalStudents = course.enrollments.length;
        const completedStudents = enrollmentsWithProgress.length;
        const completionRate =
          totalStudents > 0
            ? Math.round((completedStudents / totalStudents) * 100)
            : 0;

        return {
          liveClassId: liveClass._id,
          title: liveClass.title,
          scheduledTime: liveClass.scheduledTime,
          duration: liveClass.duration,
          totalStudents,
          completedStudents,
          completionRate,
          students: enrollmentsWithProgress.map((enrollment) => {
            const progress = enrollment.progress.find(
              (p) => p.contentItemId.toString() === liveClass._id.toString()
            );
            return {
              studentId: enrollment.studentId._id,
              name: enrollment.studentId.full_name,
              email: enrollment.studentId.email,
              completed: progress?.completed || false,
              lastAccessed: progress?.lastAccessed,
              timeSpent: progress?.timeSpent || 0,
            };
          }),
        };
      });

      res.json({
        success: true,
        data: liveClassProgress,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch live class progress",
        error: error.message,
      });
    }
  }
);

// Mark live class as completed for all students
Teaceherrouter.post(
  "/complete-live-class/:courseId/:contentId",
  authenticateTeacher,
  async (req, res) => {
    try {
      const { courseId, contentId } = req.params;
      const teacherId = req.teacher._id;

      // Verify the teacher is the course instructor
      const course = await Course.findOne({
        _id: courseId,
        instructor: teacherId,
      });

      if (!course) {
        return res.status(403).json({
          success: false,
          message: "Not authorized or course not found",
        });
      }

      // Verify the content item is a live class
      const liveClass = course.content.id(contentId);
      if (!liveClass || liveClass.type !== "live") {
        return res.status(404).json({
          success: false,
          message: "Live class not found",
        });
      }

      const now = new Date();

      // Update progress for all enrolled students
      course.enrollments.forEach((enrollment) => {
        let progress = enrollment.progress.find(
          (p) => p.contentItemId.toString() === contentId.toString()
        );

        if (!progress) {
          progress = {
            contentItemId: liveClass._id,
            contentItemType: "live",
            completed: false,
            lastAccessed: null,
            status: "not-started",
            timeSpent: 0,
          };
          enrollment.progress.push(progress);
        }

        progress.completed = true;
        progress.status = "completed";
        progress.lastAccessed = now;
        // Set default time spent if not set (e.g., 60 minutes for a typical class)
        progress.timeSpent = progress.timeSpent || liveClass.duration || 60;
      });

      await course.save();

      res.json({
        success: true,
        message: "Live class marked as completed for all students",
        data: {
          courseId,
          liveClassId: contentId,
          completedAt: now,
          totalStudents: course.enrollments.length,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to complete live class",
        error: error.message,
      });
    }
  }
);

// Update the route to use null for pending status
Teaceherrouter.post(
  "/update-live-class-attendance/:courseId/:contentId/:studentId",
  authenticateTeacher,
  async (req, res) => {
    try {
      const { courseId, contentId, studentId } = req.params;
      let { attendanceStatus } = req.body;
      const teacherId = req.teacher._id;

      const course = await Course.findOne({
        _id: courseId,
        instructor: teacherId,
      });
      if (!course) {
        return res.status(403).json({
          success: false,
          message: "Not authorized or course not found",
        });
      }

      const liveClass = course.content.id(contentId);
      if (!liveClass || liveClass.type !== "live") {
        return res
          .status(404)
          .json({ success: false, message: "Live class not found" });
      }

      const enrollment = course.enrollments.find(
        (e) => e.studentId.toString() === studentId.toString()
      );
      if (!enrollment) {
        return res
          .status(404)
          .json({ success: false, message: "Student not enrolled" });
      }

      let progress = enrollment.progress.find(
        (p) => p.contentItemId.toString() === contentId.toString()
      );
      if (!progress) {
        progress = {
          contentItemId: liveClass._id,
          contentItemType: "live",
          completed: false,
          lastAccessed: null,
          status: "not-started",
          timeSpent: 0,
          attendanceStatus: "pending",
        };
        enrollment.progress.push(progress);
      }

      // ✅ Always normalize attendance
      if (!["present", "absent", "pending"].includes(attendanceStatus)) {
        attendanceStatus = "pending";
      }
      progress.attendanceStatus = attendanceStatus;

      // ✅ Completion rules
      if (attendanceStatus === "present") {
        progress.completed = true;
        progress.status = "completed";
      } else if (attendanceStatus === "absent") {
        progress.completed = false;
        progress.status = "in-progress";
      } else {
        progress.completed = false;
        progress.status = "not-started";
      }

      progress.lastAccessed = new Date();
      await course.save();

      res.json({
        success: true,
        data: {
          studentId,
          liveClassId: contentId,
          attendanceStatus: progress.attendanceStatus,
          completed: progress.completed,
          lastAccessed: progress.lastAccessed,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to update attendance",
        error: error.message,
      });
    }
  }
);

// Mark all students as present in a class
Teaceherrouter.post(
  "/mark-all-present/:courseId/:contentId",
  authenticateTeacher,
  async (req, res) => {
    try {
      const { courseId, contentId } = req.params;
      const teacherId = req.teacher._id;

      // Verify the teacher is the course instructor
      const course = await Course.findOne({
        _id: courseId,
        instructor: teacherId,
      });

      if (!course) {
        return res.status(403).json({
          success: false,
          message: "Not authorized or course not found",
        });
      }

      // Verify the content item is a live class
      const liveClass = course.content.id(contentId);
      if (!liveClass || liveClass.type !== "live") {
        return res.status(404).json({
          success: false,
          message: "Live class not found",
        });
      }

      // Update attendance for all enrolled students
      course.enrollments.forEach((enrollment) => {
        let progress = enrollment.progress.find(
          (p) => p.contentItemId.toString() === contentId.toString()
        );

        if (!progress) {
          progress = {
            contentItemId: liveClass._id,
            contentItemType: "live",
            completed: true,
            lastAccessed: new Date(),
            status: "completed",
            timeSpent: 0,
            attendanceStatus: "present", // Store as string
          };
          enrollment.progress.push(progress);
        } else {
          progress.attendanceStatus = "present"; // Store as string
          progress.completed = true;
          progress.status = "completed";
          progress.lastAccessed = new Date();
        }
      });

      await course.save();

      res.json({
        success: true,
        message: "All students marked as present",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to mark all students as present",
        error: error.message,
      });
    }
  }
);

// Get student progress for a specific live class
Teaceherrouter.get(
  "/live-class-student-progress/:courseId/:contentId",
  authenticateTeacher,
  async (req, res) => {
    try {
      const { courseId, contentId } = req.params;
      const teacherId = req.teacher._id;

      // Verify the teacher is the course instructor
      const course = await Course.findOne({
        _id: courseId,
        instructor: teacherId,
      })
        .populate("enrollments.studentId", "full_name email")
        .select("content enrollments");

      if (!course) {
        return res.status(403).json({
          success: false,
          message: "Not authorized or course not found",
        });
      }

      // Verify the content item is a live class
      const liveClass = course.content.id(contentId);
      if (!liveClass || liveClass.type !== "live") {
        return res.status(404).json({
          success: false,
          message: "Live class not found",
        });
      }

      // Get progress data for all students
      const studentProgress = course.enrollments.map((enrollment) => {
        const progress = enrollment.progress.find(
          (p) => p.contentItemId.toString() === contentId.toString()
        );

        return {
          studentId: enrollment.studentId._id,
          name: enrollment.studentId.full_name,
          email: enrollment.studentId.email,
          completed: progress?.completed || false,
          lastAccessed: progress?.lastAccessed,
          timeSpent: progress?.timeSpent || 0,
          status: progress?.status || "not-started",
        };
      });

      res.json({
        success: true,
        data: {
          liveClassId: contentId,
          title: liveClass.title,
          studentProgress,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch student progress",
        error: error.message,
      });
    }
  }
);
module.exports = Teaceherrouter;
