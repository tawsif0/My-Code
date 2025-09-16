const mongoose = require("mongoose");

const criteriaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Criteria", criteriaSchema);