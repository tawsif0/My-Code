require("dotenv").config();
const Admin = require("../models/Admin");
const Category = require("../models/Category");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const Teacher = require("../models/Teacher");

// JWT generator
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// Admin dashboard fetch
exports.adminGet = async (req, res) => {
  try {
    const admin = await Admin.findById(req.id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    res.status(200).json({
      username: admin.username,
      email: admin.email,
      role: admin.role,
      notifications: true,
      passwordChangedAt: admin.passwordChangedAt // <-- Added field
    });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

// Admin registration (First admin only)
exports.getAdmin = async (req, res) => {
  const admin = await Admin.findOne();
  if (admin) {
    return res
      .status(200)
      .json({ success: true, message: "Admin exists", admin });
  }
};

// Register admin
exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    if (!username || !email || !password) {
      return res.send({ success: false, message: "All fields required" });
    }

    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.send({ success: false, message: "Email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({
      username,
      email,
      password: hashedPassword,
      role: "admin"
    });

    await newAdmin.save();
    return res.send({ success: true, message: "Admin registered." });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Login (Admin & SubAdmin)
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email }).select("+password");

    if (!admin) return res.send({ success: false, message: "User not found." });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch)
      return res.send({ success: false, message: "Invalid credentials." });

    if (admin.status !== "active") {
      return res.send({
        success: false,
        message: "Your account on approval."
      });
    }

    const token = generateToken(admin._id, admin.role);
    res.json({ success: true, token, admin });
  } catch (error) {
    res.status(401).json({ success: false, error: error.message });
  }
};
exports.updateAdmin = async (req, res) => {
  try {
    const { name, email } = req.body;
    const admin = await Admin.findById(req.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (name) admin.username = name;
    if (email) admin.email = email;

    await admin.save();
    res.status(200).json({ message: "Profile updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const admin = await Admin.findById(req.id);

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(newPassword, salt);
    admin.passwordChangedAt = Date.now(); // Track when password changed
    await admin.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
// SubAdmin creation (Admin only)
exports.createSubAdmin = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existing = await Admin.findOne({ email });
    if (existing)
      return res.status(400).json({ success: false, message: "Email in use." });

    const hashedPassword = await bcrypt.hash(password, 10);
    const subAdmin = new Admin({
      username,
      email,
      password: hashedPassword,
      role: "subadmin"
    });

    await subAdmin.save();
    res.status(201).json({ success: true, message: "SubAdmin created." });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete SubAdmin (Admin only)
exports.deleteSubAdmin = async (req, res) => {
  try {
    const subAdmin = await Admin.findById(req.params.id);
    if (!subAdmin || subAdmin.role !== "subadmin") {
      return res
        .status(404)
        .json({ success: false, message: "SubAdmin not found." });
    }

    await Admin.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "SubAdmin deleted." });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// List SubAdmins
exports.listSubAdmins = async (req, res) => {
  try {
    const subadmins = await Admin.find({ role: "subadmin" }).select(
      "-password"
    );
    res.json({ success: true, subadmins });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
//status update for subadmins
exports.updateSubadminStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "inactive", "suspended"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }

    const updated = await Admin.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Subadmin not found" });
    }

    res.json({
      success: true,
      message: "Status updated successfully",
      subadmin: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
// Forgot Password admin
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.send({ success: false, message: "User not found." });

    const resetCode = Math.floor(1000 + Math.random() * 9000).toString();
    admin.resetCode = resetCode;
    admin.resetCodeExpires = Date.now() + 10 * 60 * 1000;
    await admin.save();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP is: ${resetCode}`
    });

    res.json({ success: true, message: "OTP sent." });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const admin = await Admin.findOne({
      email,
      resetCode: otp,
      resetCodeExpires: { $gt: Date.now() }
    });

    if (!admin)
      return res.send({ success: false, message: "Invalid/expired OTP" });
    res.json({ success: true, message: "OTP verified." });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const admin = await Admin.findOne({
      email,
      resetCode: otp,
      resetCodeExpires: { $gt: Date.now() }
    });

    if (!admin) return res.send({ success: false, message: "Invalid OTP." });

    admin.password = await bcrypt.hash(newPassword, 10);
    admin.resetCode = undefined;
    admin.resetCodeExpires = undefined;
    await admin.save();

    res.json({ success: true, message: "Password reset successful." });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// --------------teacher----------------------------
exports.teacherregistration = async (req, res, next) => {
  try {
    // Check if files are uploaded first
    if (!req.files || !req.files.cv || req.files.cv.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "CV is required"
      });
    }

    if (
      !req.files["certificates[]"] ||
      req.files["certificates[]"].length === 0
    ) {
      return res.status(400).json({
        message: "At least one certificate is required"
      });
    }

    // Process file paths
    const cvPath = req.files.cv[0].path
      .replace(/\\/g, "/")
      .replace("public/", "");
    const certificatesPaths = req.files["certificates[]"].map((file) =>
      file.path.replace(/\\/g, "/").replace("public/", "")
    );

    const profilePhotoPath =
      req.files.profile_photo && req.files.profile_photo[0]
        ? req.files.profile_photo[0].filename
            .replace(/\\/g, "/")
            .replace("public/", "")
        : undefined;

    // Create the teacher
    const newTeacher = await Teacher.create({
      email: req.body.email,
      password: req.body.password,
      full_name: req.body.full_name,
      phone: req.body.phone,
      specialization:
        req.body.specialization === "Other"
          ? req.body.custom_specialization
          : req.body.specialization,
      qualifications: req.body.qualifications,
      linkedin_url: req.body.linkedin_url,
      hourly_rate: req.body.hourly_rate,
      status: "pending",
      cv: cvPath,
      certificates: certificatesPaths,
      profile_photo: profilePhotoPath
    });

    // Remove password from response
    newTeacher.password = undefined;

    // Get the updated count of pending teachers
    const pendingCount = await Teacher.countDocuments({ status: "pending" });

    res.status(201).json({
      status: "success",
      message: "Teacher registered successfully",
      data: {
        teacher: newTeacher,
        notifications: {
          pending_count: pendingCount // Include the current count in response
        }
      }
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message || "Something went wrong during registration."
    });
  }
};

// Enhanced notifications controller
exports.notifications = async (req, res) => {
  try {
    const notifications = await Teacher.find({ status: "pending" })
      .select("-password -__v")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      notifications: notifications.map((teacher) => ({
        id: teacher._id,
        name: teacher.full_name,
        email: teacher.email,
        specialization: teacher.specialization,
        createdAt: teacher.createdAt,
        cv: teacher.cv,
        certificates: teacher.certificates,
        profilePhoto: teacher.profile_photo
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications"
    });
  }
};

// Enhanced approveTeacher controller
exports.approveTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { status, rejectionReason } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be 'approved' or 'rejected'"
      });
    }

    const updateData = { status };
    if (status === "rejected" && rejectionReason) {
      updateData.rejection_reason = rejectionReason; // Or change this to match frontend
    }

    const updatedTeacher = await Teacher.findByIdAndUpdate(
      teacherId,
      updateData,
      { new: true, runValidators: true }
    ).select("-password -__v");

    if (!updatedTeacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found"
      });
    }

    // Email content
    let mailOptions = {
      from: `"Northern-Lights Admin" <${process.env.EMAIL_USER}>`,
      to: updatedTeacher.email,
      subject: `Your Teacher Application Status - ${status.toUpperCase()}`
    };

    if (status === "approved") {
      mailOptions.html = `
        <h2>Congratulations, ${updatedTeacher.full_name}!</h2>
        <p>Your teacher application has been <strong>approved</strong>.</p>
        <p>You can now log in to your account and start teaching on our platform.</p>
        <p>Best regards,<br/>Northern-Lights Team</p>
      `;
    } else {
      mailOptions.html = `
  <h2>Dear ${updatedTeacher.full_name},</h2>
  <p>We regret to inform you that your teacher application has been <strong>rejected</strong>.</p>
  ${
    updatedTeacher.rejection_reason
      ? `<p><strong>Reason:</strong> ${updatedTeacher.rejection_reason}</p>`
      : ""
  }
  <p>If you have any questions, please contact our support team.</p>
  <p>Best regards,<br/>Northern-Lights Team</p>
`;
    }

    // Send email
    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: `Teacher ${status} successfully and notification email sent`,
      teacher: updatedTeacher
    });
  } catch (err) {
    console.error("Approval error:", err);
    res.status(500).json({
      success: false,
      message: "Error updating teacher status",
      error: err.message
    });
  }
};
exports.teacherlogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide email and password"
      });
    }

    // 2) Check if teacher exists and password is correct
    const teacher = await Teacher.findOne({ email }).select("+password");

    if (
      !teacher ||
      !(await teacher.correctPassword(password, teacher.password))
    ) {
      return res.status(401).json({
        status: "fail",
        message: "Incorrect email or password"
      });
    }

    // 3) Check if teacher account is approved
    if (teacher.status !== "approved") {
      return res.status(403).json({
        status: "fail",
        message:
          "Your account is not yet approved. Please wait for admin approval."
      });
    }

    // 4) If everything is OK, send token to client
    const token = jwt.sign(
      { id: teacher._id, role: "teacher" },
      process.env.JWT_SECRET,
      {
        expiresIn: "10d"
      }
    );

    // Remove password from output
    teacher.password = undefined;

    res.status(200).json({
      status: "success",
      token,
      data: teacher
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      status: "error",
      message: "An error occurred during login"
    });
  }
};

exports.teacherforgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const teacher = await Teacher.findOne({ email });
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "If this email is registered, you'll receive a reset OTP."
      });
    }

    const resetCode = Math.floor(1000 + Math.random() * 9000).toString();
    teacher.resetCode = resetCode;
    teacher.resetCodeExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await teacher.save();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Teacher Portal Password Reset OTP",
      text: `Your password reset OTP is: ${resetCode}\nThis code will expire in 10 minutes.`,
      html: `
        <div>
          <h3>Teacher Portal Password Reset</h3>
          <p>Your password reset OTP is: <strong>${resetCode}</strong></p>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `
    });

    res.json({
      success: true,
      message: "OTP sent to registered email."
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      error: "Could not process request. Please try again."
    });
  }
};

exports.teacherverifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const teacher = await Teacher.findOne({
      email,
      resetCode: otp,
      resetCodeExpires: { $gt: Date.now() }
    });

    if (!teacher) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP. Please request a new one."
      });
    }

    res.json({
      success: true,
      message: "OTP verified successfully."
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({
      success: false,
      error: "Could not verify OTP. Please try again."
    });
  }
};

exports.teacherresetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    // Find teacher with valid OTP
    const teacher = await Teacher.findOne({
      email,
      resetCode: otp,
      resetCodeExpires: { $gt: Date.now() }
    });

    if (!teacher) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP. Please start the reset process again."
      });
    }

    // Validate new password meets schema requirements
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters"
      });
    }

    if (!/\d/.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least one number"
      });
    }

    if (!/[!@#$%^&*]/.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least one special character"
      });
    }

    // Hash and save new password
    teacher.password = await bcrypt.hash(newPassword, 12);
    teacher.resetCode = undefined;
    teacher.resetCodeExpires = undefined;
    await teacher.save();

    // Send confirmation email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Password Has Been Reset",
      text: "Your teacher portal password has been successfully reset.",
      html: `
        <div>
          <h3>Password Reset Confirmation</h3>
          <p>Your teacher portal password has been successfully reset.</p>
          <p>If you didn't make this change, please contact support immediately.</p>
        </div>
      `
    });

    res.json({
      success: true,
      message:
        "Password reset successful. You can now login with your new password."
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      error: "Could not reset password. Please try again."
    });
  }
};
// course category
exports.getCategory = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.createCategory = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Category name is required" });
  }

  try {
    const category = new Category({ name });
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
exports.updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Category name is required" });
  }

  try {
    const category = await Category.findByIdAndUpdate(
      id,
      { name },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Home page
