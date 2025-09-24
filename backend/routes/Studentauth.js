const express = require("express");
const Student = require("../models/Student");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const Studnetauth = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const studentAuth = require("../middleware/studentMiddleware");
// Configuration
const JWT_SECRET = "435345sdfsfd";
const OTP_EXPIRY_MINUTES = 10; // 10 minutes expiration
const RESET_TOKEN_EXPIRY_MINUTES = 30;
// Configure multer for file uploads
const storage = multer.diskStorage({
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
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit
  }
});

// Email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "tausifrahman02@gmail.com",
    pass: "ozbw qiwq tzzn yhli"
  }
});

// Helper functions

const generateToken = (payload, expiresIn) =>
  jwt.sign(payload, JWT_SECRET, { expiresIn });

//Profile Route
Studnetauth.get("/profile/:id", studentAuth, async (req, res) => {
  try {
    const studentId = req.params.id;

    // Find student by ID
    const student = await Student.findById(studentId).select(
      "-password -otp -otpExpires -resetPasswordToken -resetPasswordExpire"
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json({
      student: {
        _id: student._id,
        id: student._id,
        email: student.email,
        full_name: student.full_name,
        phone: student.phone,
        date_of_birth: student.date_of_birth,
        address: student.address,
        profile_picture: student.profile_picture,
        role: student.role,
        isVerified: student.isVerified,
        createdAt: student.createdAt,
        updatedAt: student.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch profile",
      error: error.message
    });
  }
});

// Alternative endpoint if you need to use the current user's data:
Studnetauth.get("/profile", studentAuth, async (req, res) => {
  try {
    res.status(200).json({
      student: {
        _id: req.student._id,
        id: req.student._id,
        email: req.student.email,
        full_name: req.student.full_name,
        phone: req.student.phone,
        date_of_birth: req.student.date_of_birth,
        address: req.student.address,
        profile_picture: req.student.profile_picture,
        role: req.student.role,
        isVerified: req.student.isVerified,
        createdAt: req.student.createdAt,
        updatedAt: req.student.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch profile",
      error: error.message
    });
  }
});
// Student Registration with OTP
Studnetauth.post(
  "/register",
  upload.single("profile_picture"),
  async (req, res) => {
    try {
      const { email, password, full_name, phone, date_of_birth, address } =
        req.body;
      const profilePhoto = req.file;

      const existingStudent = await Student.findOne({ email });
      if (existingStudent) {
        return res.status(400).json({
          success: false,
          message: "Student with this email already exists"
        });
      }
      const student = new Student({
        email,
        password,
        full_name,
        phone,
        date_of_birth: date_of_birth || null,
        address: address || null
      });
      if (profilePhoto) {
        student.profile_picture = req.file.filename;
      }

      const otp = student.generateOTP();
      await student.save();

      await transporter.sendMail({
        from: '"Northern-Lights" <tausifrahman02@gmail.com>',
        to: email,
        subject: "Verify Your Account",
        html: `Your verification OTP is: <strong>${otp}</strong>. It expires in ${OTP_EXPIRY_MINUTES} minutes.`
      });

      res.status(201).json({
        message:
          "Registration successful. Please verify your account with the OTP sent to your email.",
        email: student.email,
        student: {
          id: student._id,
          email: student.email,
          full_name: student.full_name,
          profile_picture: student.profile_picture
        }
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Registration failed", error: error.message });
    }
  }
);

// Verify OTP
Studnetauth.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (student.isVerified) {
      return res.status(400).json({ message: "Account already verified" });
    }

    // Check if OTP exists and not expired
    if (!student.otp || !student.otpExpires) {
      return res.status(400).json({ message: "OTP not found or expired" });
    }

    // Check expiration first
    if (student.otpExpires < new Date()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    // Compare OTPs (ensure both are strings)
    if (student.otp.toString() !== otp.toString()) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Mark as verified
    student.isVerified = true;
    student.otp = undefined;
    student.otpExpires = undefined;
    await student.save();

    // Generate auth token
    const token = generateToken({ id: student._id, role: student.role }, "1h");

    res.status(200).json({
      message: "Account verified successfully",
      token,
      student: {
        id: student._id,
        email: student.email,
        full_name: student.full_name,
        role: student.role
      }
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "OTP verification failed", error: error.message });
  }
});

// Resend OTP
Studnetauth.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;

    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (student.isVerified) {
      return res.status(400).json({ message: "Account already verified" });
    }

    // Generate new OTP
    const otp = student.generateOTP();
    await student.save();

    // Send OTP email
    await transporter.sendMail({
      from: `"Education App" <tausifrahman02@gmail.com>`,
      to: email,
      subject: "New Verification OTP",
      html: `Your new verification OTP is: <strong>${otp}</strong>. It expires in ${OTP_EXPIRY_MINUTES} minutes.`
    });

    res.status(200).json({ message: "New OTP sent successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to resend OTP", error: error.message });
  }
});

// Student Login
Studnetauth.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Find student with email and select the password field
    const student = await Student.findOne({ email })
      .select("+password")
      .select("-enrolledCourses");

    if (!student) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if account is locked
    if (student.isLocked) {
      const remainingTime = Math.ceil(
        (student.lockUntil - Date.now()) / (60 * 1000) // time in minutes
      );
      return res.status(403).json({
        message: `Account locked. Try again in ${remainingTime} minutes.`
      });
    }

    // Verify password using bcrypt.compare
    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      // Increment failed login attempts
      await student.incrementLoginAttempts();
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if email is verified
    if (!student.isVerified) {
      return res.status(403).json({
        message: "Account not verified. Please verify your email first."
      });
    }

    // Reset login attempts after successful login
    if (student.loginAttempts > 0 || student.lockUntil) {
      student.loginAttempts = 0;
      student.lockUntil = undefined;
      await student.save();
    }

    // Generate JWT token
    const token = generateToken(
      { id: student._id, role: student.role },
      "1h" // Token expires in 1 hour
    );

    res.status(200).json({
      message: "Login successful",
      token,
      student: {
        _id: student._id,
        id: student._id,
        email: student.email,
        full_name: student.full_name,
        phone: student.phone,
        date_of_birth: student.date_of_birth,
        address: student.address,
        profile_picture: student.profile_picture,
        role: student.role,
        isVerified: student.isVerified
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
});

Studnetauth.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const student = await Student.findOne({ email });

    if (!student) {
      return res.status(200).json({
        success: true,
        message: "If an account exists, a reset OTP has been sent"
      });
    }

    // Generate and set OTP with expiration
    const otp = student.generateOTP();
    student.otp = otp;
    student.otpExpires = new Date(Date.now() + 60 * 60 * 1000);

    await student.save();
    // Send email and respond
    await transporter.sendMail({
      from: `"Education App" <tausifrahman02@gmail.com>`,
      to: email,
      subject: "Password Reset OTP",
      html: `Your OTP: <strong>${otp}</strong> (valid for 5 mins)`
    });

    res.status(200).json({
      success: true,
      message: "OTP sent successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to send OTP",
      error: error.message
    });
  }
});
Studnetauth.post("/verify-reset-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Input validation
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required"
      });
    }

    // Find student with matching email, OTP and check expiration
    const student = await Student.findOne({
      email,
      otp,
      otpExpires: { $gt: new Date() }
    });

    if (!student) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP"
      });
    }

    // Generate JWT token valid for 15 minutes
    const tempToken = generateToken(
      {
        id: student._id,
        email: student.email,
        purpose: "password_reset"
      },
      "15m"
    );

    // Clear the OTP after successful verification
    student.otp = undefined;
    student.otpExpires = undefined;
    await student.save();

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      tempToken,
      user: {
        id: student._id,
        email: student.email
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error during OTP verification",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
});

// Reset Password with OTP
Studnetauth.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    // Find student with OTP fields
    const student = await Student.findOne({ email }).select("+otp");
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Verify OTP matches
    if (student.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Update password and clear OTP fields
    student.password = newPassword;
    student.otp = undefined;
    await student.save();

    res
      .status(200)
      .json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Password reset failed",
      error: error.message
    });
  }
});

// Change Password
Studnetauth.post("/change-password", studentAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Verify current password
    const isMatch = await req.student.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    const bcrypt = require("bcryptjs");
    const salt = await bcrypt.genSalt(10);
    req.student.password = await bcrypt.hash(newPassword, salt);

    await req.student.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to change password", error: error.message });
  }
});

module.exports = Studnetauth;
