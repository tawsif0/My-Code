const jwt = require("jsonwebtoken");
const Student = require("../models/Student");

const studentAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Verify token safely
    let decoded;
    try {
      decoded = jwt.verify(token, "435345sdfsfd");
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expired" });
      }
      if (err.name === "JsonWebTokenError") {
        return res.status(401).json({ message: "Invalid token" });
      }
      return res
        .status(500)
        .json({ message: "Internal server error during authentication" });
    }

    // Safer: remove password field
    const student = await Student.findById(decoded.id)
      .select("-password")
      .catch((err) => {
        console.error("Student lookup error:", err);
        return null;
      });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    req.student = student;
    req.token = token;
    next();
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Internal server error during authentication" });
  }
};

module.exports = studentAuth;
