const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const employeeSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Please provide a username"],
    unique: true,
    trim: true,
    maxlength: [50, "Username cannot be more than 50 characters"],
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please provide a valid email",
    ],
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: [6, "Password must be at least 6 characters"],
    select: false,
  },
  phoneNumber: {
    type: String,
    required: [true, "Please provide a phone number"],
  },
  role: {
    type: String,
    enum: ["consultant"],
    default: "consultant",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  passwordChangedAt: Date,
  otp: {
    type: String,
    select: false,
  },
  otpExpires: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Encrypt password before saving
employeeSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Update passwordChangedAt when password is modified
employeeSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) {
    return next();
  }
  this.passwordChangedAt = Date.now() - 1000; // Subtract 1 second to ensure token is created after
  next();
});

// Generate JWT token
employeeSchema.methods.generateAuthToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "30d",
  });
};

// Generate temporary token for password reset
employeeSchema.methods.generateTempToken = function (expiresIn = "15m") {
  return jwt.sign(
    { id: this._id, email: this.email, purpose: "password_reset" },
    process.env.JWT_SECRET,
    { expiresIn }
  );
};

// Match user entered password to hashed password in database
employeeSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Check if password was changed after token was issued
employeeSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Generate OTP for password reset
employeeSchema.methods.generateOTP = function () {
  // Generate a 6-digit numeric OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = otp;
  this.otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes expiry

  return otp;
};

// Verify OTP
employeeSchema.methods.verifyOTP = function (otp) {
  return this.otp === otp && this.otpExpires && this.otpExpires > Date.now();
};

// Clear OTP fields after use
employeeSchema.methods.clearOTP = function () {
  this.otp = undefined;
  this.otpExpires = undefined;
  return this.save();
};

module.exports = mongoose.model("Employee", employeeSchema);
