const mongoose = require("mongoose");
const { Schema } = mongoose;

const rubricItemSchema = new Schema({
  criteria: { type: String, required: true },
  levels: [
    {
      score: { type: Number, required: true },
      description: { type: String, required: true },
    },
  ],
});

const gradingRubricSchema = new Schema(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    quizId: { type: Schema.Types.ObjectId },
    questionId: { type: Schema.Types.ObjectId },
    title: { type: String, required: true },
    items: [rubricItemSchema],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("GradingRubric", gradingRubricSchema);
