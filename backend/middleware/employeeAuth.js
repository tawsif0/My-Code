const jwt = require("jsonwebtoken");
const Employee = require("../models/Employee");

const authenticateToken = (req, res, next) => {
  // Get token from header
  const token = req.header("x-auth-token");

  // Check if no token
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "No token, authorization denied",
    });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if employee still exists
    Employee.findById(decoded.id).then((employee) => {
      if (!employee) {
        return res.status(401).json({
          success: false,
          message: "Employee not found",
        });
      }

      // Check if password was changed after token was issued
      if (employee.changedPasswordAfter(decoded.iat)) {
        return res.status(401).json({
          success: false,
          message: "Password was changed recently. Please log in again.",
        });
      }

      req.user = decoded;
      next();
    });
  } catch (err) {
    res.status(401).json({
      success: false,
      message: "Token is not valid",
    });
  }
};

module.exports = { authenticateToken };
