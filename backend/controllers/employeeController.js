const Employee = require("../models/Employee");

// @desc    Get current logged in employee
exports.getMe = async (req, res) => {
  try {
    const employee = await Employee.findById(req.user.id).select("-password");
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    res.status(200).json({
      success: true,
      employee,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// @desc    Update employee profile
exports.updateProfile = async (req, res) => {
  try {
    const fieldsToUpdate = {
      username: req.body.username,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(
      (key) => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    const employee = await Employee.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    res.status(200).json({
      success: true,
      employee,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// @desc    Change employee password
exports.changePassword = async (req, res) => {
  try {
    const employee = await Employee.findById(req.user.id).select("+password");

    // Check current password
    if (!(await employee.matchPassword(req.body.currentPassword))) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Set new password
    employee.password = req.body.newPassword;
    await employee.save();

    // Create new token
    const token = employee.generateAuthToken();

    res.status(200).json({
      success: true,
      token,
      message: "Password updated successfully",
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
