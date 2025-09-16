const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const AdminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    role: {
      type: String,
      enum: ["admin", "subadmin"],
      default: "subadmin",
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "inactive",
    },
    resetCode: String,
    resetCodeExpires: Date,
    passwordChangedAt: {
      type: Date,
      default: Date.now, // Set the timestamp when the admin is created
    },
  },
  { timestamps: true }
);

// Middleware to update passwordChangedAt if password is modified
AdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.passwordChangedAt = Date.now();
  next();
});

module.exports = mongoose.model("Admin", AdminSchema);
