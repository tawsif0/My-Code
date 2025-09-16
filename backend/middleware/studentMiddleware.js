const jwt = require("jsonwebtoken");
const Student = require("../models/Student");

const studentAuth = async (req, res, next) => {
  try {
    // 1. Get token from header
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Find student
    const student = await Student.findById(decoded.id).select("-password");
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    // 4. Attach student to request
    req.student = student;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
};

module.exports = studentAuth;
