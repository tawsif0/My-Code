const mongoose = require("mongoose");

const countrySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    criteria: [
      {
        criteria: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Criteria",
          required: true,
        },
        description: {
          type: String,
          default: "",
          trim: true,
        },
      },
    ],
    highlights: { type: [String], default: [] },
    flag: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Country", countrySchema);
