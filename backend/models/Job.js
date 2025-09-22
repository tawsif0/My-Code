const mongoose = require("mongoose");

const FormFieldSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["text", "date", "file"],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  required: {
    type: Boolean,
    default: true,
  },
});

const JobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  applyLink: {
    type: String,
    default: "",
  },
  hasCustomForm: {
    type: Boolean,
    default: false,
  },
  customFormFields: [FormFieldSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Job", JobSchema);
