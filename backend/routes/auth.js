const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const {
  register,
  login,
  forgotPassword,
  resetPassword,
  updateAdmin,
  updatePassword,
  verifyOtp,
  adminGet,
  getAdmin,
  createSubAdmin,
  deleteSubAdmin,
  listSubAdmins,
  updateSubadminStatus,
  teacherregistration,
  teacherlogin,
  teacherforgotPassword,
  teacherverifyOtp,
  teacherresetPassword,
  notifications,
  approveTeacher,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/auth");
const {
  authenticateToken,
  authorizeAdmin,
  authorizeSubAdmin,
} = require("../middleware/auth");
const multer = require("multer");

// Utility function to create directory if not exists
const ensureDirectoryExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./public/uploads/teachers";
    ensureDirectoryExists(dir);
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

// File filter configuration (unchanged)
const fileFilter = (req, file, cb) => {
  const filetypes = /pdf|jpeg|jpg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    return cb(
      new Error("Only PDF, JPEG, JPG, and PNG files are allowed!"),
      false
    );
  }
};
// Configure multer instance with error handling
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 12, // Max 7 files total (1 cv + 5 certificates + 1 profile photo)
  },
});

// Error handling middleware for file uploads
const handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred when uploading
    return res.status(400).json({
      status: "error",
      message:
        err.code === "LIMIT_FILE_SIZE"
          ? "File too large (max 5MB)"
          : err.code === "LIMIT_FILE_COUNT"
          ? "Too many files uploaded"
          : "File upload error",
    });
  } else if (err) {
    // An unknown error occurred
    return res.status(400).json({
      status: "error",
      message: err.message || "File upload failed",
    });
  }
  next();
};

// Admin routes
router.get("/checkAdmin", getAdmin);
router.get("/admin", authenticateToken, adminGet);
router.put("/update-profile", authenticateToken, updateAdmin);
router.put("/change-password", authenticateToken, updatePassword);

router.post("/subadmin", authenticateToken, authorizeAdmin, createSubAdmin);
router.delete(
  "/subadmin/:id",
  authenticateToken,
  authorizeAdmin,
  deleteSubAdmin
);
router.get("/subadmins", authenticateToken, authorizeAdmin, listSubAdmins);
router.put(
  "/subadmin/:id/status",
  authenticateToken,
  authorizeAdmin,
  updateSubadminStatus
);

// Public auth routes
router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

// Teacher routes
router.post(
  "/teacher-register",
  upload.fields([
    { name: "cv", maxCount: 1 },
    { name: "certificates[]", maxCount: 10 }, // Changed from certificates[] to certificates
    { name: "profile_photo", maxCount: 1 },
  ]),
  handleUploadErrors,
  teacherregistration
);

router.get("/notifications", authenticateToken, notifications);
// Add this to your backend routes
router.get("/notification-count", async (req, res) => {
  try {
    const count = await Teacher.countDocuments({ status: "pending" });
    res.json({ success: true, count });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get notification count",
    });
  }
});
router.patch("/teacher-status/:teacherId", authenticateToken, approveTeacher);
router.post("/teacher-login", teacherlogin);
router.post("/teacher-forget-password", teacherforgotPassword);
router.post("/teacher-verify-otp", teacherverifyOtp);
router.post("/teacher-reset-password", teacherresetPassword);

router.get("/categories", getCategory);
router.post("/categories", authenticateToken, createCategory);
router.put("/categories/:id", authenticateToken, updateCategory);
router.delete("/categories/:id", authenticateToken, deleteCategory);
module.exports = router;
