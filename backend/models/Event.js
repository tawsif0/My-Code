const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    startDate: { type: String, required: true }, // YYYY-MM-DD
    endDate: { type: String, required: true }, // YYYY-MM-DD
    startTime: { type: String, required: true }, // e.g. "15:00"
    endTime: { type: String, required: true }, // e.g. "18:00"
    location: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String },
    eventStatus: {
      type: String,
      enum: ["pending", "launched", "ended"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
