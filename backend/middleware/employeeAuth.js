const jwt = require("jsonwebtoken");
const Employee = require("../models/Employee");

const authenticateToken = async (req, res, next) => {
  try {
    const token = req.header("x-auth-token");
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token, authorization denied"
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, "435345sdfsfd");
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token has expired"
        });
      }
      return res.status(401).json({
        success: false,
        message: "Token is not valid"
      });
    }

    const employee = await Employee.findById(decoded.id).catch((err) => {
      return null;
    });

    if (!employee) {
      return res.status(401).json({
        success: false,
        message: "Employee not found"
      });
    }

    if (
      typeof employee.changedPasswordAfter === "function" &&
      employee.changedPasswordAfter(decoded.iat)
    ) {
      return res.status(401).json({
        success: false,
        message: "Password was changed recently. Please log in again."
      });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later."
    });
  }
};

module.exports = { authenticateToken };
