// models/CvApplication.js
const mongoose = require("mongoose");

const cvApplicationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    file: { type: String, required: true }, // Change filePath to file
  },
  { timestamps: true }
);

module.exports = mongoose.model("CvApplication", cvApplicationSchema);
