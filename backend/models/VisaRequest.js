// models/VisaRequest.js
const mongoose = require("mongoose");

const visaRequestSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "completed"],
    default: "pending"
  },
  assignedConsultant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee"
  },
  destinationCountry: {
    type: String,
    required: true
  },
  visaType: {
    type: String,
    required: true,
    enum: ["student", "work", "tourist"]
  },
  documents: [
    {
      name: String,
      url: String,
      status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
      },
      feedback: String,
      uploadedAt: Date
    }
  ],
  processingSteps: [
    {
      name: String,
      status: {
        type: String,
        enum: ["pending", "in-progress", "completed", "rejected"],
        default: "pending"
      },
      completedAt: Date,
      notes: String,
      requiredDocuments: [String]
    }
  ],
  currentStep: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date
});

visaRequestSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("VisaRequest", visaRequestSchema);
