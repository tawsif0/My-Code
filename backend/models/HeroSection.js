// models/HeroSection.js
const mongoose = require("mongoose");

const heroSectionSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("HeroSection", heroSectionSchema);
