const jwt = require("jsonwebtoken");
const Teacher = require("../models/Teacher"); // Adjust the path as needed

exports.authenticateTeacher = async (req, res, next) => {
  try {
    // 1) Get the token and check if it exists
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        status: "fail",
        message: "You are not logged in. Please log in to get access.",
      });
    }

    // 2) Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3) Check if teacher still exists
    const currentTeacher = await Teacher.findById(decoded.id);
    if (!currentTeacher) {
      return res.status(401).json({
        status: "fail",
        message: "The teacher belonging to this token no longer exists.",
      });
    }

    // 4) Check if teacher account is approved
    if (currentTeacher.status !== "approved") {
      return res.status(403).json({
        status: "fail",
        message: "Your account is not yet approved. Please contact admin.",
      });
    }

    // 5) Check if the role is teacher
    if (decoded.role !== "teacher") {
      return res.status(403).json({
        status: "fail",
        message: "You are not authorized to access this resource.",
      });
    }

    // 6) Grant access to protected route
    req.teacher = currentTeacher;
    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({
        status: "fail",
        message: "Invalid token. Please log in again.",
      });
    }
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        status: "fail",
        message: "Your token has expired. Please log in again.",
      });
    }
    console.error("Authentication error:", err);
    res.status(500).json({
      status: "error",
      message: "An error occurred during authentication",
    });
  }
};
