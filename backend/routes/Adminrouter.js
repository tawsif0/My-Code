const express = require("express");
const Adminrouter = express.Router();
const {
  authenticateToken,
  authorizeAdmin,
  authorizeSubAdmin,
  checkAccountStatus,
} = require("../middleware/auth"); // Update the path accordingly
const Teacher = require("../models/Teacher");
const bcrypt = require("bcryptjs");
const Student = require("../models/Student");
const Course = require("../models/Course");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Admin = require("../models/Admin");
const Employee = require("../models/Employee");
const Consultation = require("../models/Consultation");
const VisaRequest = require("../models/VisaRequest");
const uploads = require("../utils/upload");
// Configure storage for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../public/courses");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Reconstruct the upload path to make it available in this scope
    const uploadPath = path.join(__dirname, "../public/courses");
    const fileExt = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, fileExt);

    let finalName = file.originalname;
    let counter = 1;

    while (fs.existsSync(path.join(uploadPath, finalName))) {
      finalName = `${baseName}(${counter})${fileExt}`;
      counter++;
    }

    cb(null, finalName);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
});

Adminrouter.get("/profile/:id", authenticateToken, async (req, res) => {
  try {
    // Find user by ID
    const user = await Admin.findById(req.params.id).select(
      "-password -resetCode -resetCodeExpires"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Basic profile data for all roles
    const profileData = {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
    };

    res.json({
      success: true,
      message: "Profile retrieved successfully",
      profile: profileData,
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching profile",
    });
  }
});

// -------------------------------------teachers-routes----------------------------------------
// Get all teachers
Adminrouter.get("/teachers", async (req, res) => {
  try {
    const teachers = await Teacher.find({}).select("-password -__v");

    res.json({
      success: true,
      count: teachers.length,
      data: teachers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching teachers",
    });
  }
});

// Get single teacher by ID
Adminrouter.get("/teachers/:id", authenticateToken, async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id).select(
      "-password -__v"
    );

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    res.json({
      success: true,
      data: teacher,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching teacher",
    });
  }
});

// Update teacher (all fields)
Adminrouter.put(
  "/teachers/:id",
  authenticateToken,
  authorizeSubAdmin,
  async (req, res) => {
    try {
      const updates = req.body;

      // Prevent password updates through this route (should have separate password update route)
      if (updates.password) {
        return res.status(400).json({
          success: false,
          message: "Use the password reset route to change password",
        });
      }

      const updatedTeacher = await Teacher.findByIdAndUpdate(
        req.params.id,
        {
          ...updates,
          last_updated: Date.now(),
        },
        { new: true, runValidators: true }
      ).select("-password -__v");

      if (!updatedTeacher) {
        return res.status(404).json({
          success: false,
          message: "Teacher not found",
        });
      }

      res.json({
        success: true,
        message: "Teacher updated successfully",
        data: updatedTeacher,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Server error while updating teacher",
      });
    }
  }
);
// Change teacher password
Adminrouter.put(
  "/teachers-update-password/:id",
  authenticateToken,
  async (req, res) => {
    try {
      const { newPassword } = req.body;

      if (!newPassword) {
        return res.status(400).json({
          success: false,
          message: "New password is required",
        });
      }

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

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      const updatedTeacher = await Teacher.findByIdAndUpdate(
        req.params.id,
        {
          password: hashedPassword,
          last_updated: Date.now(),
        },
        { new: true }
      ).select("-password -__v");

      if (!updatedTeacher) {
        return res.status(404).json({
          success: false,
          message: "Teacher not found",
        });
      }

      res.json({
        success: true,
        message: "Teacher password updated successfully",
        data: updatedTeacher,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Server error while updating password",
      });
    }
  }
);
// Change teacher status
// In your teacherRoutes.js or adminRoutes.js
Adminrouter.put(
  "/teachers-status/:id",
  authenticateToken,
  authorizeSubAdmin,
  async (req, res) => {
    try {
      const { status, rejection_reason } = req.body;

      // Validation (keep your existing validation)
      if (!status || !["pending", "approved", "rejected"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Status is required and must be pending/approved/rejected",
        });
      }

      if (status === "rejected" && !rejection_reason) {
        return res.status(400).json({
          success: false,
          message: "Rejection reason is required",
        });
      }

      // Update teacher
      const updateData = {
        status,
        last_updated: Date.now(),
        ...(status === "rejected" && { rejection_reason }),
        ...(status !== "rejected" && { rejection_reason: undefined }),
      };

      const updatedTeacher = await Teacher.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      ).select("-password -__v");

      if (!updatedTeacher) {
        return res.status(404).json({
          success: false,
          message: "Teacher not found",
        });
      }

      // Get updated notification count
      const pendingCount = await Teacher.countDocuments({ status: "pending" });

      res.json({
        success: true,
        message: `Teacher ${status} successfully`,
        data: {
          teacher: updatedTeacher,
          notifications: {
            pending_count: pendingCount,
          },
        },
      });
    } catch (error) {
      console.error("Teacher status update error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while updating teacher status",
      });
    }
  }
);
Adminrouter.get(
  "/notifications/count",
  authenticateToken,
  authorizeSubAdmin,
  async (req, res) => {
    try {
      const count = await Teacher.countDocuments({ status: "pending" });
      res.json({ success: true, count });
    } catch (error) {
      console.error("Error getting notification count:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get notification count",
      });
    }
  }
);
// Delete single teacher
Adminrouter.delete(
  "/teachers/:id",
  authenticateToken,
  authorizeSubAdmin,
  async (req, res) => {
    try {
      const deletedTeacher = await Teacher.findByIdAndDelete(req.params.id);

      if (!deletedTeacher) {
        return res.status(404).json({
          success: false,
          message: "Teacher not found",
        });
      }

      res.json({
        success: true,
        message: "Teacher deleted successfully",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Server error while deleting teacher",
      });
    }
  }
);

// Delete multiple teachers
Adminrouter.delete(
  "/delete-all-teachers",
  authenticateToken,
  authorizeSubAdmin,
  async (req, res) => {
    try {
      const { teacherIds } = req.body;

      if (
        !teacherIds ||
        !Array.isArray(teacherIds) ||
        teacherIds.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Please provide an array of teacher IDs to delete",
        });
      }

      const result = await Teacher.deleteMany({ _id: { $in: teacherIds } });

      if (result.deletedCount === 0) {
        return res.status(404).json({
          success: false,
          message: "No teachers found to delete",
        });
      }

      res.json({
        success: true,
        message: `${result.deletedCount} teacher(s) deleted successfully`,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Server error while deleting teachers",
      });
    }
  }
);

// ------------------------------------teacher-routes-------------------------------------------------

// -------------------------------------students-routes----------------------------------------
const studentstorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../public/students");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Reconstruct the upload path in filename function
    const uploadPath = path.join(__dirname, "../public/students");
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);

    let finalName = file.originalname;
    let counter = 1;

    while (fs.existsSync(path.join(uploadPath, finalName))) {
      finalName = `${baseName}(${counter})${ext}`;
      counter++;
    }

    cb(null, finalName);
  },
});

const studentupload = multer({
  storage: studentstorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 100MB limit
});
// Get all students
Adminrouter.get(
  "/students",
  authenticateToken,
  authorizeSubAdmin,
  async (req, res) => {
    try {
      const students = await Student.find({}).select("-password -__v");

      res.json({
        success: true,
        count: students.length,
        data: students,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Server error while fetching students",
      });
    }
  }
);

// Get single student by ID
Adminrouter.get(
  "/students/:id",
  authenticateToken,
  authorizeSubAdmin,
  async (req, res) => {
    try {
      const student = await Student.findById(req.params.id).select(
        "-password -__v"
      );

      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student not found",
        });
      }

      res.json({
        success: true,
        data: student,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Server error while fetching student",
      });
    }
  }
);

// Create new student
Adminrouter.post(
  "/students",
  authenticateToken,
  authorizeSubAdmin,
  studentupload.single("profile_picture"), // Handle single file upload
  async (req, res) => {
    try {
      const { email, password, full_name, phone, date_of_birth, address } =
        req.body;
      const profilePhoto = req.file;

      const existingStudent = await Student.findOne({ email });
      if (existingStudent) {
        return res.status(400).json({
          success: false,
          message: "Student with this email already exists",
        });
      }

      // Create student with optional profile photo
      const studentData = {
        email,
        password,
        full_name,
        phone,
        date_of_birth,
        address,
        isVerified: true,
      };

      if (profilePhoto) {
        studentData.profile_picture = req.file.filename; // Make sure this matches what frontend expects
      }

      const newStudent = await Student.create(studentData);

      // Remove password from the response
      const studentResponse = newStudent.toObject();
      delete studentResponse.password;

      res.status(201).json({
        success: true,
        message: "Student created successfully",
        data: {
          ...newStudent.toObject(),
          password: undefined, // Remove password
          profile_picture: newStudent.profile_picture, // Ensure this has the uploaded filename
        },
      });
    } catch (error) {
      console.error(error);
      if (error.name === "ValidationError") {
        return res.status(400).json({
          success: false,
          message: Object.values(error.errors).map((val) => val.message),
        });
      }
      res.status(500).json({
        success: false,
        message: "Server error while creating student",
      });
    }
  }
);
// Update student (all fields except password)
Adminrouter.put(
  "/students/:id",
  authenticateToken,
  authorizeSubAdmin,
  async (req, res) => {
    try {
      const updates = req.body;

      // Prevent password updates through this route
      if (updates.password) {
        return res.status(400).json({
          success: false,
          message: "Use the password update route to change password",
        });
      }

      const updatedStudent = await Student.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true, runValidators: true }
      ).select("-password -__v");

      if (!updatedStudent) {
        return res.status(404).json({
          success: false,
          message: "Student not found",
        });
      }

      res.json({
        success: true,
        message: "Student updated successfully",
        data: updatedStudent,
      });
    } catch (error) {
      console.error(error);
      if (error.name === "ValidationError") {
        return res.status(400).json({
          success: false,
          message: Object.values(error.errors).map((val) => val.message),
        });
      }
      res.status(500).json({
        success: false,
        message: "Server error while updating student",
      });
    }
  }
);

// Change student password
Adminrouter.put(
  "/students-update-password/:id",
  authenticateToken,
  authorizeSubAdmin,
  async (req, res) => {
    try {
      const { newPassword } = req.body;

      if (!newPassword) {
        return res.status(400).json({
          success: false,
          message: "New password is required",
        });
      }

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

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      const updatedStudent = await Student.findByIdAndUpdate(
        req.params.id,
        {
          password: hashedPassword,
          password_changed_at: Date.now(),
        },
        { new: true }
      ).select("-password -__v");

      if (!updatedStudent) {
        return res.status(404).json({
          success: false,
          message: "Student not found",
        });
      }

      res.json({
        success: true,
        message: "Student password updated successfully",
        data: updatedStudent,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Server error while updating password",
      });
    }
  }
);

// Change student status (active/inactive)
Adminrouter.put(
  "/students-status/:id",
  authenticateToken,
  authorizeSubAdmin,
  async (req, res) => {
    try {
      const { is_active } = req.body;

      if (typeof is_active !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "is_active must be a boolean value",
        });
      }

      const updatedStudent = await Student.findByIdAndUpdate(
        req.params.id,
        {
          is_active,
          last_login: is_active ? Date.now() : undefined,
        },
        { new: true }
      ).select("-password -__v");

      if (!updatedStudent) {
        return res.status(404).json({
          success: false,
          message: "Student not found",
        });
      }

      res.json({
        success: true,
        message: `Student status changed to ${
          is_active ? "active" : "inactive"
        }`,
        data: updatedStudent,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Server error while updating student status",
      });
    }
  }
);

// Delete single student
Adminrouter.delete(
  "/students/:id",
  authenticateToken,
  authorizeSubAdmin,
  async (req, res) => {
    try {
      const deletedStudent = await Student.findByIdAndDelete(req.params.id);

      if (!deletedStudent) {
        return res.status(404).json({
          success: false,
          message: "Student not found",
        });
      }

      res.json({
        success: true,
        message: "Student deleted successfully",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Server error while deleting student",
      });
    }
  }
);

// Delete multiple students
Adminrouter.delete(
  "/delete-all-students",
  authenticateToken,
  authorizeSubAdmin,
  async (req, res) => {
    try {
      const { studentIds } = req.body;

      if (
        !studentIds ||
        !Array.isArray(studentIds) ||
        studentIds.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Please provide an array of student IDs to delete",
        });
      }

      const result = await Student.deleteMany({ _id: { $in: studentIds } });

      if (result.deletedCount === 0) {
        return res.status(404).json({
          success: false,
          message: "No students found to delete",
        });
      }

      res.json({
        success: true,
        message: `${result.deletedCount} student(s) deleted successfully`,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Server error while deleting students",
      });
    }
  }
);

// -------------------------------------courses-routes----------------------------------------

// Create a new course
Adminrouter.post(
  "/courses",
  [
    authenticateToken,
    authorizeSubAdmin,
    upload.fields([
      { name: "thumbnail", maxCount: 1 },
      { name: "attachments", maxCount: 10 },
      { name: "contentThumbnails", maxCount: 10 },
      { name: "contentVideos", maxCount: 1000 },
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
        level = "beginner",
        categories,
      } = req.body;

      // Validate required fields
      if (!title || !description || !type || !content) {
        return res.status(400).json({
          success: false,
          message: "Title, description, type, and content are required",
        });
      }

      // Validate price for premium and live courses
      if ((type === "premium" || type === "live") && (!price || isNaN(price))) {
        return res.status(400).json({
          success: false,
          message: "Price is required for premium and live courses",
        });
      }

      // Handle thumbnail upload
      if (!req.files?.thumbnail) {
        return res.status(400).json({
          success: false,
          message: "Course thumbnail is required",
        });
      }

      const thumbnailFile = req.files.thumbnail[0];
      const thumbnailData = {
        filename: thumbnailFile.originalname,
        path: thumbnailFile.filename,
        size: thumbnailFile.size,
        mimetype: thumbnailFile.mimetype,
      };

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
      }

      // Create a map of video filenames to their file objects for quick lookup
      const videoFilesMap = {};
      if (req.files?.contentVideos) {
        req.files.contentVideos.forEach((file) => {
          videoFilesMap[file.originalname] = file;
        });
      }

      // Process content items to attach uploaded files
      if (Array.isArray(parsedContent)) {
        parsedContent = parsedContent.map((item) => {
          // For premium course tutorials, attach the uploaded video
          if (item.type === "tutorial" && type === "premium" && item.content) {
            const videoFilename = item.content.filename;
            const videoFile = videoFilesMap[videoFilename];

            if (videoFile) {
              item.content = {
                filename: videoFile.originalname,
                path: videoFile.filename,
                size: videoFile.size,
                mimetype: videoFile.mimetype,
              };
            }
          }

          // For live sessions, attach thumbnails if uploaded
          if (item.type === "live" && item.thumbnail?.filename) {
            const thumbnailFilename = item.thumbnail.filename;
            const thumbnailFile = req.files.contentThumbnails?.find(
              (f) => f.originalname === thumbnailFilename
            );

            if (thumbnailFile) {
              item.thumbnail = {
                filename: thumbnailFile.originalname,
                path: thumbnailFile.filename,
                size: thumbnailFile.size,
                mimetype: thumbnailFile.mimetype,
              };
            }
          }

          return item;
        });
      }

      // Handle attachments
      const attachments =
        req.files.attachments?.map((file) => ({
          filename: file.originalname,
          path: file.filename,
          size: file.size,
          mimetype: file.mimetype,
        })) || [];

      // Parse categories
      let categoryList = [];
      if (categories) {
        try {
          categoryList = JSON.parse(categories);
        } catch (e) {
          return res.status(400).json({
            success: false,
            message: "Invalid categories format",
          });
        }
      }

      // Create the course
      const newCourse = new Course({
        title,
        description,
        instructor: req.user_id,
        thumbnail: thumbnailData,
        type,
        price: type === "free" ? 0 : parseFloat(price),
        content: parsedContent,
        attachments,
        level,
        status: "active",
        categories: categoryList,
      });

      await newCourse.save();

      res.status(201).json({
        success: true,
        message: "Course created successfully",
        data: newCourse,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: error.message || "Server error while creating course",
      });
    }
  }
);

// Get all courses
Adminrouter.get(
  "/courses",
  authenticateToken,
  authorizeSubAdmin,
  async (req, res) => {
    try {
      const { status, type, instructor } = req.query;
      const filter = {};

      if (status) filter.status = status;
      if (type) filter.type = type;
      if (instructor) filter.instructor = instructor;

      const courses = await Course.find().sort({ createdAt: -1 });

      res.json({
        success: true,
        count: courses.length,
        data: courses,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Server error while fetching courses",
      });
    }
  }
);

// Get single course by ID
Adminrouter.get(
  "/courses/:id",
  authenticateToken,
  authorizeSubAdmin,
  async (req, res) => {
    try {
      const course = await Course.findById(req.params.id)
        .populate("instructor", "name email")
        .populate("studentsEnrolled", "name email");

      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      res.json({
        success: true,
        data: course,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Server error while fetching course",
      });
    }
  }
);

// Update course
Adminrouter.put(
  "/courses/:id",
  [
    authenticateToken,
    authorizeSubAdmin,
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
      console.error(error);
      res.status(500).json({
        success: false,
        message: error.message || "Server error while updating course",
      });
    }
  }
);

// Change course status
Adminrouter.put(
  "/courses/:id/status",
  authenticateToken,
  authorizeSubAdmin,
  async (req, res) => {
    try {
      const { status } = req.body;

      if (!["active", "inactive"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status value",
        });
      }

      const course = await Course.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );

      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      res.json({
        success: true,
        message: `Course status changed to ${status}`,
        data: course,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Server error while updating course status",
      });
    }
  }
);

// Delete course
Adminrouter.delete(
  "/courses/:id",
  authenticateToken,
  authorizeSubAdmin,
  async (req, res) => {
    try {
      const course = await Course.findByIdAndDelete(req.params.id);

      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      // TODO: Delete associated files from storage

      res.json({
        success: true,
        message: "Course deleted successfully",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Server error while deleting course",
      });
    }
  }
);

// Get course analytics
Adminrouter.get(
  "/courses/:id/analytics",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    try {
      const course = await Course.findById(req.params.id)
        .populate("studentsEnrolled", "name email")
        .populate("ratings.user", "name");

      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      const analytics = {
        totalStudents: course.studentsEnrolled.length,
        averageRating: course.averageRating,
        totalRatings: course.ratings.length,
        ratingDistribution: [1, 2, 3, 4, 5].map((star) => ({
          star,
          count: course.ratings.filter((r) => r.rating === star).length,
        })),
        recentStudents: course.studentsEnrolled.slice(0, 5),
        recentReviews: course.ratings
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5)
          .map((r) => ({
            user: r.user,
            rating: r.rating,
            review: r.review,
            date: r.createdAt,
          })),
      };

      res.json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Server error while fetching course analytics",
      });
    }
  }
);

// Get all courses by status
Adminrouter.get(
  "/courses/status/:status",
  authenticateToken,
  authorizeSubAdmin,
  async (req, res) => {
    try {
      const { status } = req.params;

      if (!["active", "inactive"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status value",
        });
      }

      const courses = await Course.find({ status })
        .populate("instructor", "name email")
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        count: courses.length,
        data: courses,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Server error while fetching courses by status",
      });
    }
  }
);

// Publish course (change status from to active)
Adminrouter.put(
  "/courses/:id/publish",
  authenticateToken,
  authorizeSubAdmin,
  async (req, res) => {
    try {
      const course = await Course.findById(req.params.id);

      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      course.status = "active";
      await course.save();

      res.json({
        success: true,
        message: "Course published successfully",
        data: course,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Server error while publishing course",
      });
    }
  }
);

// Unpublish course (change status to inactive)
Adminrouter.put(
  "/courses/:id/unpublish",
  authenticateToken,
  authorizeSubAdmin,
  async (req, res) => {
    try {
      const course = await Course.findById(req.params.id);

      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      if (course.status !== "active") {
        return res.status(400).json({
          success: false,
          message: "Only active courses can be unpublished",
        });
      }

      course.status = "inactive";
      await course.save();

      res.json({
        success: true,
        message: "Course unpublished successfully",
        data: course,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Server error while unpublishing course",
      });
    }
  }
);
// Reassign course to a new teacher (admin only)
Adminrouter.put(
  "/reassign-teacher/:courseId",
  authenticateToken,
  authorizeSubAdmin,
  async (req, res) => {
    try {
      const { courseId, newInstructorId, changedBy } = req.params;

      if (!newInstructorId) {
        return res.json({
          success: false,
          message: "New instructor ID is required",
        });
      }
      const course = await Course.findById(courseId);
      if (!course) {
        return res.json({ success: false, message: "Course not found" });
      }

      if (course.instructor) {
        course.previousInstructors.push({
          instructor: course.instructor,
          changedAt: new Date(),
          changedBy: changedBy,
        });
      }

      // Update the instructor
      course.instructor = newInstructorId;
      await course.save();

      res.json({
        success: true,
        message: "Course instructor updated successfully",
      });
    } catch (error) {
      console.error("Error reassigning teacher:", error);
      res
        .status(500)
        .json({ message: "Server error while reassigning teacher" });
    }
  }
);

// Change course instructor (admin only)
Adminrouter.put(
  "/courses/:courseId/change-instructor",
  authenticateToken,
  authorizeSubAdmin,
  async (req, res) => {
    try {
      console.log(req.params);
      const { courseId } = req.params;
      const { newInstructorId, changedBy } = req.body;

      // Validate required fields
      if (!newInstructorId || !changedBy) {
        return res.status(400).json({
          success: false,
          message: "Both newInstructorId and changedBy are required",
        });
      }

      // Find the course
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      // Verify the new instructor exists (optional - remove if not needed)
      const newInstructor = await Teacher.findById(newInstructorId);
      if (!newInstructor) {
        return res.status(404).json({
          success: false,
          message: "New instructor not found",
        });
      }

      // Verify the admin making the change exists (optional)
      const adminMakingChange = await Admin.findById(changedBy);
      if (!adminMakingChange) {
        return res.status(404).json({
          success: false,
          message: "Admin making the change not found",
        });
      }

      // If there's a current instructor, add to previous instructors
      if (course.instructor) {
        course.previousInstructors.push({
          instructor: course.instructor,
          changedAt: new Date(),
          changedBy: changedBy,
        });
      }

      // Update the instructor
      course.instructor = newInstructorId;
      await course.save();

      res.json({
        success: true,
        message: "Course instructor updated successfully",
        data: {
          courseId: course._id,
          newInstructor: newInstructorId,
          previousInstructor: course.instructor,
          changedBy: changedBy,
          changedAt: new Date(),
        },
      });
    } catch (error) {
      console.error("Error changing course instructor:", error);
      res.status(500).json({
        success: false,
        message: "Server error while changing course instructor",
        error: error.message,
      });
    }
  }
);
// ------------------------------------courses-routes-------------------------------------------------

// ---------------------------all-category----------------------------
Adminrouter.get(
  "/all-category",
  authenticateToken,
  authorizeSubAdmin,
  async (req, res) => {
    try {
      const allcategory = await Category.find();
      if (!allcategory) {
        return res.send({ success: false, message: "Category did not find!" });
      }
      res.send({ success: true, data: allcategory });
    } catch (error) {
      console.log(error);
    }
  }
);

// ---------------------------Employee Routes----------------------------

Adminrouter.post(
  "/employee",
  authenticateToken,
  authorizeSubAdmin,
  async (req, res) => {
    const { username, email, password, phoneNumber } = req.body;

    // Validate input
    if (!username || !email || !password || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    try {
      // Check if employee exists
      let employee = await Employee.findOne({
        $or: [{ email }, { username }, { phoneNumber }],
      });

      if (employee) {
        return res.status(400).json({
          success: false,
          message:
            "Employee with this email, username, or phone number already exists",
        });
      }

      employee = new Employee({
        username,
        email,
        password,
        phoneNumber,
      });

      await employee.save();

      res.status(201).json({
        success: true,
        message: "Employee created successfully",
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({
        success: false,
        message: "Server Error",
      });
    }
  }
);
Adminrouter.get(
  "/employees",
  authenticateToken,
  authorizeSubAdmin,
  async (req, res) => {
    try {
      const { status, username, email } = req.query;
      const filter = {};

      if (status) filter.status = status;
      if (username) filter.username = username;
      if (email) filter.email = email;

      // Fetch employees with optional filters
      const employees = await Employee.find(filter).sort({ createdAt: -1 });

      res.json({
        success: true,
        count: employees.length,
        data: employees,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Server error while fetching employees",
      });
    }
  }
);
Adminrouter.delete(
  "/employees/:id",
  authenticateToken,
  authorizeAdmin, // Only admin can delete employees
  async (req, res) => {
    try {
      const employee = await Employee.findByIdAndDelete(req.params.id);

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Employee not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Employee deleted successfully",
      });
    } catch (err) {
      console.error(err.message);

      // Handle CastError for invalid ID format
      if (err.name === "CastError") {
        return res.status(400).json({
          success: false,
          message: "Invalid employee ID",
        });
      }

      res.status(500).json({
        success: false,
        message: "Server Error",
      });
    }
  }
);
//----------------------------------Consultancy routes----------------------------------------
Adminrouter.post("/consultancy", async (req, res) => {
  try {
    const consultation = await Consultation.create(req.body);

    res.status(201).json({
      success: true,
      data: consultation,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});
Adminrouter.get(
  "/consultancy",
  authenticateToken,
  authorizeSubAdmin,
  async (req, res) => {
    try {
      const consultations = await Consultation.find()
        .populate("assignedTo", "username email phoneNumber")
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        count: consultations.length,
        data: consultations,
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({
        success: false,
        message: "Server Error",
      });
    }
  }
);
Adminrouter.put(
  "/consultancy/:id/assign",
  authenticateToken,
  authorizeSubAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { employeeId } = req.body;

      // Check if employee exists and is a consultant
      const employee = await Employee.findOne({
        _id: employeeId,
        role: "consultant",
      });

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Consultant employee not found",
        });
      }

      // Check if consultation exists
      const consultation = await Consultation.findById(id);
      if (!consultation) {
        return res.status(404).json({
          success: false,
          message: "Consultation not found",
        });
      }

      // Update consultation
      consultation.assignedTo = employeeId;
      consultation.status = "assigned";
      await consultation.save();

      res.status(200).json({
        success: true,
        data: consultation,
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({
        success: false,
        message: "Server Error",
      });
    }
  }
);
Adminrouter.put(
  "/consultancy/:id/cancel",
  authenticateToken,
  authorizeSubAdmin,
  async (req, res) => {
    try {
      const { cancellationReason } = req.body;

      if (!cancellationReason) {
        return res.status(400).json({
          success: false,
          message: "Cancellation reason is required",
        });
      }

      const consultation = await Consultation.findByIdAndUpdate(
        req.params.id,
        {
          status: "cancelled",
          cancellationReason,
        },
        { new: true }
      ).populate("assignedTo", "username email phoneNumber");

      if (!consultation) {
        return res.status(404).json({
          success: false,
          message: "Consultation not found",
        });
      }

      res.status(200).json({
        success: true,
        data: consultation,
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({
        success: false,
        message: "Server Error",
      });
    }
  }
);
Adminrouter.put(
  "/consultancy/:id/status",
  authenticateToken,
  authorizeSubAdmin,
  async (req, res) => {
    try {
      const { status } = req.body;
      const validStatuses = ["pending", "assigned", "completed", "cancelled"];

      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status value",
        });
      }

      const consultation = await Consultation.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      ).populate("assignedTo", "username email phoneNumber");

      if (!consultation) {
        return res.status(404).json({
          success: false,
          message: "Consultation not found",
        });
      }

      res.status(200).json({
        success: true,
        data: consultation,
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({
        success: false,
        message: "Server Error",
      });
    }
  }
);

Adminrouter.put(
  "/consultancy/:id/reassign",
  authenticateToken,
  authorizeSubAdmin,
  async (req, res) => {
    try {
      const { employeeId } = req.body;

      // Verify the new consultant exists
      const employee = await Employee.findOne({
        _id: employeeId,
        role: "consultant",
      });

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Consultant not found",
        });
      }

      const consultation = await Consultation.findByIdAndUpdate(
        req.params.id,
        {
          assignedTo: employeeId,
          status: "assigned",
        },
        { new: true }
      ).populate("assignedTo", "username email phoneNumber");

      if (!consultation) {
        return res.status(404).json({
          success: false,
          message: "Consultation not found",
        });
      }

      res.status(200).json({
        success: true,
        data: consultation,
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({
        success: false,
        message: "Server Error",
      });
    }
  }
);

//==================================Visa Processing Route-------------------------------------
Adminrouter.get(
  "/requests",
  authenticateToken,
  authorizeSubAdmin,
  async (req, res) => {
    try {
      const requests = await VisaRequest.find()
        .populate("student", "full_name email")
        .populate("assignedConsultant", "username email");

      res.json({
        success: true,
        requests,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);
Adminrouter.put(
  "/approve/:requestId",
  authenticateToken,
  authorizeSubAdmin,
  async (req, res) => {
    try {
      const visaRequest = await VisaRequest.findByIdAndUpdate(
        req.params.requestId,
        { status: "approved" },
        { new: true }
      ).populate("student", "full_name email");

      if (!visaRequest) {
        return res.status(404).json({
          success: false,
          message: "Visa request not found",
        });
      }

      res.json({
        success: true,
        updatedRequest: visaRequest,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// Admin rejects visa request
Adminrouter.put(
  "/reject/:requestId",
  authenticateToken,
  authorizeSubAdmin,
  async (req, res) => {
    try {
      const visaRequest = await VisaRequest.findByIdAndUpdate(
        req.params.requestId,
        { status: "rejected" },
        { new: true }
      ).populate("student", "full_name email");

      if (!visaRequest) {
        return res.status(404).json({
          success: false,
          message: "Visa request not found",
        });
      }

      res.json({
        success: true,
        updatedRequest: visaRequest,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);
Adminrouter.put(
  "/reopen/:id",
  authenticateToken,
  authorizeSubAdmin,
  async (req, res) => {
    try {
      const visaRequest = await VisaRequest.findById(req.params.id)
        .populate("student", "full_name email")
        .populate("assignedConsultant", "username email");

      if (!visaRequest) {
        return res.status(404).json({ message: "Visa request not found" });
      }

      // Check if the request is actually rejected
      if (visaRequest.status !== "rejected") {
        return res.status(400).json({
          message: "Only rejected visa requests can be reopened",
        });
      }

      // Update status to pending and reset processing steps
      visaRequest.status = "pending";
      visaRequest.updatedAt = Date.now();

      // Reset all processing steps to pending
      visaRequest.processingSteps = visaRequest.processingSteps.map((step) => ({
        ...step.toObject(),
        status: "pending",
        completedAt: null,
        notes: step.notes, // Keep existing notes
      }));

      // Reset current step to the beginning
      visaRequest.currentStep = 0;

      await visaRequest.save();

      res.json({
        message: "Visa request reopened successfully",
        updatedRequest: visaRequest,
      });
    } catch (error) {
      console.error("Error reopening visa request:", error);
      res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  }
);

// Admin assigns consultant
Adminrouter.put(
  "/assign/:requestId",
  authenticateToken,
  authorizeSubAdmin,
  async (req, res) => {
    try {
      const { consultantId } = req.body;

      const consultant = await Employee.findById(consultantId);
      if (!consultant || consultant.role !== "consultant") {
        return res.status(400).json({
          success: false,
          message: "Invalid consultant",
        });
      }

      const visaRequest = await VisaRequest.findByIdAndUpdate(
        req.params.requestId,
        { assignedConsultant: consultantId },
        { new: true }
      )
        .populate("student", "full_name email")
        .populate("assignedConsultant", "username email");

      if (!visaRequest) {
        return res.status(404).json({
          success: false,
          message: "Visa request not found",
        });
      }

      res.json({
        success: true,
        updatedRequest: visaRequest,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// Admin gets all consultants
Adminrouter.get(
  "/consultants",
  authenticateToken,
  authorizeSubAdmin,
  async (req, res) => {
    try {
      const consultants = await Employee.find({ role: "consultant" });

      res.json({
        success: true,
        consultants,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

//-----------------Visa steps--------------------------------

Adminrouter.get(
  "/request/:requestId",
  authenticateToken,
  authorizeSubAdmin,
  async (req, res) => {
    try {
      const request = await VisaRequest.findById(req.params.requestId)
        .populate({
          path: "student",
          select: "full_name email",
        })
        .populate("assignedConsultant", "username email phoneNumber");

      if (!request) {
        return res.status(404).json({
          success: false,
          message: "Visa request not found",
        });
      }

      res.json({
        success: true,
        request,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);
// Employee approves document
Adminrouter.put(
  "/approve-document/:requestId",
  authenticateToken,
  authorizeSubAdmin,
  async (req, res) => {
    try {
      const { documentName } = req.body;

      const visaRequest = await VisaRequest.findById(req.params.requestId);

      if (!visaRequest) {
        return res.status(404).json({
          success: false,
          message: "Visa request not found",
        });
      }

      const documentIndex = visaRequest.documents.findIndex(
        (doc) => doc.name === documentName
      );

      if (documentIndex === -1) {
        return res.status(400).json({
          success: false,
          message: "Document not found in request",
        });
      }

      visaRequest.documents[documentIndex].status = "approved";
      visaRequest.documents[documentIndex].feedback = req.body.feedback || "";
      await visaRequest.save();

      const updatedRequest = await VisaRequest.findById(visaRequest._id)
        .populate("student", "full_name email")
        .populate("assignedConsultant", "username email");

      res.json({
        success: true,
        updatedRequest,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// Employee rejects document
Adminrouter.put(
  "/reject-document/:requestId",
  authenticateToken,
  authorizeSubAdmin,
  async (req, res) => {
    try {
      const { documentName, feedback } = req.body;

      if (!feedback) {
        return res.status(400).json({
          success: false,
          message: "Feedback is required when rejecting a document",
        });
      }

      const visaRequest = await VisaRequest.findById(req.params.requestId);

      if (!visaRequest) {
        return res.status(404).json({
          success: false,
          message: "Visa request not found",
        });
      }

      const documentIndex = visaRequest.documents.findIndex(
        (doc) => doc.name === documentName
      );

      if (documentIndex === -1) {
        return res.status(400).json({
          success: false,
          message: "Document not found in request",
        });
      }

      visaRequest.documents[documentIndex].status = "rejected";
      visaRequest.documents[documentIndex].feedback = feedback;
      await visaRequest.save();

      const updatedRequest = await VisaRequest.findById(visaRequest._id)
        .populate("student", "full_name email")
        .populate("assignedConsultant", "username email");

      res.json({
        success: true,
        updatedRequest,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// Admin updates processing step
Adminrouter.put(
  "/update-step/:requestId",
  authenticateToken,
  authorizeSubAdmin,
  async (req, res) => {
    try {
      const { stepName, status, notes } = req.body;

      const visaRequest = await VisaRequest.findById(req.params.requestId);

      if (!visaRequest) {
        return res.status(404).json({
          success: false,
          message: "Visa request not found",
        });
      }

      const stepIndex = visaRequest.processingSteps.findIndex(
        (step) => step.name === stepName
      );

      if (stepIndex === -1) {
        return res.status(400).json({
          success: false,
          message: "Step not found in request",
        });
      }

      // Update step details
      visaRequest.processingSteps[stepIndex].status = status;
      visaRequest.processingSteps[stepIndex].notes = notes;

      if (status === "completed") {
        visaRequest.processingSteps[stepIndex].completedAt = new Date();

        if (stepIndex < visaRequest.processingSteps.length - 1) {
          visaRequest.currentStep = stepIndex + 1;

          // Add documents for next step
          const nextStep = visaRequest.processingSteps[stepIndex + 1];
          if (nextStep.requiredDocuments?.length > 0) {
            nextStep.requiredDocuments.forEach((docName) => {
              if (!visaRequest.documents.some((doc) => doc.name === docName)) {
                visaRequest.documents.push({
                  name: docName,
                  status: "pending",
                });
              }
            });
          }
        } else {
          visaRequest.status = "completed";
          visaRequest.completedAt = new Date();
          visaRequest.currentStep = visaRequest.processingSteps.length;
        }
      }

      await visaRequest.save();

      const updatedRequest = await VisaRequest.findById(visaRequest._id)
        .populate("student", "full_name email")
        .populate("assignedConsultant", "username email");

      res.json({
        success: true,
        updatedRequest,
      });
    } catch (error) {
      console.error("Error updating visa step:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update visa processing step",
      });
    }
  }
);

Adminrouter.post(
  "/upload/:requestId",
  authenticateToken,
  authorizeSubAdmin,
  uploads.single("document"),
  async (req, res) => {
    try {
      // Validate input
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      const { documentName } = req.body;
      if (!documentName) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({
          success: false,
          message: "Document name is required",
        });
      }

      const visaRequest = await VisaRequest.findById(req.params.requestId);
      if (!visaRequest) {
        fs.unlinkSync(req.file.path);
        return res.status(404).json({
          success: false,
          message: "Visa request not found",
        });
      }

      const docIndex = visaRequest.documents.findIndex(
        (doc) => doc.name === documentName
      );
      if (docIndex === -1) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({
          success: false,
          message: "Invalid document name for this visa request",
        });
      }

      // Delete previous file if exists
      if (visaRequest.documents[docIndex].url) {
        const oldFilePath = path.join(
          __dirname,
          "../../",
          visaRequest.documents[docIndex].url
        );
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }

      // Update document
      const updatedDoc = {
        name: documentName,
        url: req.file.path.replace(/\\/g, "/"),
        status: "pending",
        feedback: "",
        uploadedAt: new Date(),
        updatedAt: new Date(),
      };

      visaRequest.documents[docIndex] = updatedDoc;
      await visaRequest.save();

      res.status(200).json({
        success: true,
        document: updatedDoc, // Return the updated document
        message: "Document uploaded successfully",
      });
    } catch (error) {
      console.error("Document upload error:", error);
      if (req.file?.path) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({
        success: false,
        message: "Failed to update document: " + error.message,
      });
    }
  }
);

Adminrouter.get(
  "/download/:filename",
  authenticateToken,
  authorizeSubAdmin,
  (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(__dirname, "../public/visa", filename);

    // Check if file exists
    if (fs.existsSync(filePath)) {
      res.download(filePath, filename, (err) => {
        if (err) {
          console.error("Download error:", err);
          res.status(500).send("Could not download file");
        }
      });
    } else {
      res.status(404).send("File not found");
    }
  }
);

module.exports = Adminrouter;
