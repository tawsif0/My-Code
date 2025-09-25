const jwt = require("jsonwebtoken");
const Employee = require("../models/Employee");

const authenticateToken = (req, res, next) => {
  // Get token from header - check both Authorization and x-auth-token headers
  let token = req.header("x-auth-token");

  // If no x-auth-token, check Authorization header
  if (!token) {
    const authHeader = req.header("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7); // Remove "Bearer " prefix
    }
  }

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
    Employee.findById(decoded.id)
      .then((employee) => {
        if (!employee) {
          return res.status(401).json({
            success: false,
            message: "Employee not found",
          });
        }

        // Check if employee is active
        if (!employee.isActive) {
          return res.status(401).json({
            success: false,
            message: "Account is deactivated",
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
      })
      .catch((err) => {
        res.status(500).json({
          success: false,
          message: "Server error during authentication",
        });
      });
  } catch (err) {
    res.status(401).json({
      success: false,
      message: "Token is not valid",
    });
  }
};

module.exports = { authenticateToken };
