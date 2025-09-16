const mongoose = require("mongoose");

const countrySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    description: {
      type: String,
      trim: true,
      default: ""
    },
    criteria: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Criteria",
      required: true
    },
    flag: {
      type: String, // This will store the filename/path of the uploaded flag
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Country", countrySchema);