const mongoose = require("mongoose");

const countrySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: [String], // allow array of strings
      default: [], // default empty array
    },
    criteria: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Criteria",
        required: true,
      },
    ],

    flag: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Country", countrySchema);
