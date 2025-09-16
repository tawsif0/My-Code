const mongoose = require("mongoose");
const { Schema } = mongoose;

const gradedAnswerSchema = new Schema({
  questionId: { type: Schema.Types.ObjectId, required: true },
  questionText: { type: String, required: true },
  questionType: { type: String, required: true },
  studentAnswer: Schema.Types.Mixed,
  correctAnswer: Schema.Types.Mixed,
  autoGraded: Boolean,
  marksObtained: { type: Number, default: 0 },
  maxMarks: { type: Number, required: true },
  teacherFeedback: String,
  gradedBy: { type: Schema.Types.ObjectId, ref: "User" },
  gradedAt: Date,
});

const quizCompletionSchema = new Schema({
  quizId: { type: Schema.Types.ObjectId, required: true },
  quizTitle: { type: String, required: true },
  answers: [gradedAnswerSchema],
  totalScore: { type: Number, default: 0 },
  maxScore: { type: Number, required: true },
  percentage: { type: Number, required: true },
  passed: { type: Boolean, default: false },
  submittedAt: { type: Date, default: Date.now },
  gradedAt: Date,
  status: {
    type: String,
    enum: ["submitted", "partially-graded", "fully-graded"],
    default: "submitted",
  },
});

const courseCompletionSchema = new Schema(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    instructorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    enrolledAt: { type: Date, required: true },
    startedAt: Date,
    completedAt: Date,
    quizzes: [quizCompletionSchema],
    finalGrade: {
      score: Number,
      maxScore: Number,
      percentage: Number,
      letterGrade: String,
      feedback: String,
      gradedBy: { type: Schema.Types.ObjectId, ref: "User" },
      gradedAt: Date,
    },
    status: {
      type: String,
      enum: ["in-progress", "completed", "graded", "certified"],
      default: "in-progress",
    },
    certificateId: String,
    certificateIssuedAt: Date,
  },
  { timestamps: true }
);

// Add indexes for faster queries
courseCompletionSchema.index({ courseId: 1, studentId: 1 }, { unique: true });
courseCompletionSchema.index({ studentId: 1 });
courseCompletionSchema.index({ instructorId: 1 });

module.exports = mongoose.model("CourseCompletion", courseCompletionSchema);
