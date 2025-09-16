const mongoose = require("mongoose");

const ConsultationSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
    },
    countries: {
      type: [String],
      required: [true, "At least one country is required"],
    },
    studyLevel: {
      type: String,
      required: [true, "Study level is required"],
    },
    intake: {
      type: String,
      required: [true, "Intake is required"],
    },
    sponsor: {
      type: String,
      required: [true, "Sponsor is required"],
    },
    message: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "assigned", "completed", "cancelled"],
      default: "pending",
    },
    cancellationReason: {
      type: String,
    },
    assignedTo: {
      type: mongoose.Schema.ObjectId,
      ref: "Employee",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Consultation", ConsultationSchema);
