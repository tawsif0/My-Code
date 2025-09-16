// models/Course.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

// Question schema with enhanced grading support
const questionSchema = new Schema({
  question: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: ["mcq-single", "mcq-multiple", "short-answer", "broad-answer"],
  },
  options: [String],
  // Change correctAnswer to be conditional
  correctAnswer: {
    type: Schema.Types.Mixed,
    required: function () {
      return ["mcq-single", "mcq-multiple"].includes(this.type);
    },
  },
  // Add expectedAnswer for short and broad answers
  expectedAnswer: {
    type: String,
    required: function () {
      return ["short-answer", "broad-answer"].includes(this.type);
    },
  },
  marks: { type: Number, default: 1 },
  explanation: String,
  needsManualGrading: {
    type: Boolean,
    default: function () {
      return ["short-answer", "broad-answer"].includes(this.type);
    },
  },
});

// In models/Course.js - update the contentItemSchema
const contentItemSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["tutorial", "quiz", "live"],
    },
    title: { type: String, required: true },
    description: String,
    content: {
      filename: String,
      path: String,
      size: Number,
      mimetype: String,
    },
    youtubeLink: String, // For free courses
    thumbnail: {
      filename: String,
      path: String,
      size: Number,
      mimetype: String,
    },
    meetingLink: String, // For live classes
    schedule: {
      type: String,
      required: function () {
        return this.type === "live";
      },
    },
    questions: [questionSchema], // For quizzes
    isPremium: { type: Boolean, default: false },
    duration: { type: Number, default: 0 },
    passingScore: { type: Number, default: 70 },
    maxAttempts: { type: Number, default: 3 },
    showAnswers: { type: Boolean, default: false },
    showCorrectAnswers: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const attachmentSchema = new Schema({
  filename: { type: String, required: true },
  path: { type: String, required: true },
  size: { type: Number, required: true },
  mimetype: { type: String, required: true },
});

// Student answer schema with detailed tracking
const studentAnswerSchema = new Schema(
  {
    questionId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    questionText: { type: String, required: true },
    questionType: { type: String, required: true },
    answer: Schema.Types.Mixed,
    isCorrect: Boolean,
    correctAnswer: Schema.Types.Mixed,
    marksObtained: { type: Number, default: 0 },
    maxMarks: { type: Number, required: true },
    teacherFeedback: String,
    gradedBy: { type: Schema.Types.ObjectId, ref: "Student" },
    gradedAt: Date,
    timeSpent: { type: Number, default: 0 }, // in seconds
  },
  { _id: true }
);
// Student progress tracking for each content item
const studentProgressSchema = new Schema(
  {
    contentItemId: { type: Schema.Types.ObjectId, required: true },
    contentItemType: { type: String },
    completed: { type: Boolean, default: false },
    completedAt: Date,
    score: { type: Number, default: 0 },
    maxScore: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    passed: { type: Boolean, default: false },
    answers: [studentAnswerSchema],
    lastAccessed: Date,
    timeSpent: { type: Number, default: 0 }, // in seconds
    attempts: { type: Number, default: 0 },
    bestScore: { type: Number, default: 0 },
    bestAttempt: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["not-started", "in-progress", "completed", "graded"],
      default: "not-started",
    },
    gradingStatus: {
      type: String,
      enum: [
        "not-graded",
        "auto-graded",
        "manually-graded",
        "partially-graded",
      ],
      default: "not-graded",
    },
    attendanceStatus: {
      type: String,
      enum: ["present", "absent", "pending"], // ✅ all strings
      default: "pending",
    },
  },
  { _id: true }
);

// Course completion certificate details
const certificateSchema = new Schema({
  certificateId: { type: String, required: true },
  issuedAt: { type: Date, default: Date.now },
  issuedBy: { type: Schema.Types.ObjectId, ref: "Student" },
  downloadUrl: String,
  verificationCode: String,
});

// Student enrollment with comprehensive tracking
const enrollmentSchema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, required: true },
    enrolledAt: { type: Date, default: Date.now },
    firstAccessedAt: Date,
    lastAccessed: Date,
    completed: { type: Boolean, default: false },
    completedAt: Date,
    progress: [studentProgressSchema],
    totalTimeSpent: { type: Number, default: 0 }, // in seconds
    certificate: certificateSchema,
    accessHistory: [
      {
        accessedAt: Date,
        duration: Number, // in seconds
        contentItemId: Schema.Types.ObjectId,
        action: String, // 'viewed', 'attempted', 'completed', etc.
      },
    ],
    overallGrade: {
      score: Number,
      maxScore: Number,
      percentage: Number,
      letterGrade: String,
      feedback: String,
      gradedBy: { type: Schema.Types.ObjectId, ref: "Student" },
      gradedAt: Date,
    },
    status: {
      type: String,
      enum: ["active", "completed", "dropped", "certified"],
      default: "active",
    },
  },
  { _id: true }
);
const courseSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    instructor: {
      type: Schema.Types.ObjectId,
    },
    teachingAssistants: [
      {
        user: { type: Schema.Types.ObjectId },
        role: String,
        addedAt: { type: Date, default: Date.now },
      },
    ],
    thumbnail: {
      filename: String,
      path: String,
      size: Number,
      mimetype: String,
    },
    attachments: [attachmentSchema],
    content: [contentItemSchema],
    price: { type: Number, default: 0 },
    type: {
      type: String,
      required: true,
      enum: ["free", "premium", "live"],
      default: "free",
    },
    status: {
      type: String,
      enum: ["active", "inactive", "draft"],
      default: "draft",
    },
    categories: [{ type: String }],
    tags: [String],
    duration: { type: Number, default: 0 }, // in minutes
    enrollments: [enrollmentSchema],
    ratings: [
      {
        user: { type: Schema.Types.ObjectId },
        rating: { type: Number, min: 1, max: 5 },
        review: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    averageRating: { type: Number, default: 0 },
    targetAudience: [String],
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    gradingPolicy: {
      passingGrade: { type: Number, default: 40 },
      gradeScale: [
        {
          letter: String,
          minPercentage: Number,
          maxPercentage: Number,
        },
      ],
    },
    previousInstructors: [
      {
        instructor: { type: Schema.Types.ObjectId },
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: Schema.Types.ObjectId, ref: "Student" },
      },
    ],
    createdBy: { type: Schema.Types.ObjectId, ref: "Student" },
    totalStudents: { type: Number, default: 0 },
    totalLessons: { type: Number, default: 0 },
    totalQuizzes: { type: Number, default: 0 },
    analytics: {
      completionRate: Number,
      averageScore: Number,
      satisfactionScore: Number,
    },
    settings: {
      allowDiscussion: { type: Boolean, default: true },
      showProgress: { type: Boolean, default: true },
      showLeaderboard: { type: Boolean, default: false },
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Calculate average rating whenever a new rating is added
courseSchema.virtual("totalContentItems").get(function () {
  return this.content.length;
});
courseSchema.methods.calculateQuizResults = function (quizId, answers) {
  const quiz = this.content.id(quizId);
  if (!quiz || quiz.type !== "quiz") {
    throw new Error("Quiz not found");
  }

  let score = 0;
  let maxScore = 0;
  const detailedAnswers = [];
  let needsManualGrading = false;

  quiz.questions.forEach((question) => {
    maxScore += question.marks;

    const userAnswer = answers.find((a) => a.questionId.equals(question._id));
    if (!userAnswer) return;

    let isCorrect = false;
    let marksObtained = 0;

    // Check answer correctness based on question type
    switch (question.type) {
      case "mcq-single":
        isCorrect = userAnswer.answer === question.correctAnswer;
        break;
      case "mcq-multiple":
        if (
          Array.isArray(userAnswer.answer) &&
          Array.isArray(question.correctAnswer)
        ) {
          isCorrect =
            userAnswer.answer.length === question.correctAnswer.length &&
            userAnswer.answer.every((ans) =>
              question.correctAnswer.includes(ans)
            );
        }
        break;
      case "short-answer":
      case "broad-answer":
        // For short/broad answers, we don't auto-grade
        needsManualGrading = true;
        isCorrect = false; // Default to false for manual grading
        break;
    }

    if (isCorrect) {
      marksObtained = question.marks;
      score += question.marks;
    }

    detailedAnswers.push({
      questionId: question._id,
      questionText: question.question,
      questionType: question.type,
      answer: userAnswer.answer,
      isCorrect,
      // For MCQ, use correctAnswer; for short/broad, use expectedAnswer
      correctAnswer: ["mcq-single", "mcq-multiple"].includes(question.type)
        ? question.correctAnswer
        : question.expectedAnswer,
      marksObtained,
      maxMarks: question.marks,
      explanation: question.explanation,
      needsManualGrading: question.needsManualGrading,
    });
  });

  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  const passed = percentage >= quiz.passingScore;
  const gradingStatus = needsManualGrading ? "partially-graded" : "auto-graded";

  return {
    score,
    maxScore,
    percentage,
    passed,
    answers: detailedAnswers,
    gradingStatus,
    needsManualGrading,
  };
};
courseSchema.methods.submitQuiz = async function (
  studentId,
  quizId,
  answers,
  timeSpent = 0
) {
  const enrollment = this.enrollments.find((e) =>
    e.studentId.equals(studentId)
  );
  if (!enrollment) {
    throw new Error("Student not enrolled in this course");
  }

  const quiz = this.content.id(quizId);
  if (!quiz || quiz.type !== "quiz") {
    throw new Error("Quiz not found");
  }

  // Check attempt limit
  const existingAttempts = enrollment.progress
    .filter((p) => p.contentItemId.equals(quizId))
    .reduce((sum, p) => sum + p.attempts, 0);

  if (existingAttempts >= quiz.maxAttempts) {
    throw new Error(
      `Maximum attempts (${quiz.maxAttempts}) reached for this quiz`
    );
  }

  const results = this.calculateQuizResults(quizId, answers);
  const now = new Date();

  // Find or create progress record
  let progress = enrollment.progress.find((p) =>
    p.contentItemId.equals(quizId)
  );
  if (!progress) {
    progress = {
      contentItemId: quizId,
      contentItemType: "quiz",
      answers: [],
      score: 0,
      maxScore: results.maxScore,
      percentage: 0,
      passed: false,
      attempts: 0,
      bestScore: 0,
      bestAttempt: 0,
      status: "in-progress",
      gradingStatus: "not-graded",
    };
    enrollment.progress.push(progress);
  }

  // Update progress
  progress.answers = results.answers;
  progress.score = results.score;
  progress.percentage = results.percentage;
  progress.passed = results.passed;
  progress.completed = true;
  progress.completedAt = now;
  progress.lastAccessed = now;
  progress.timeSpent = (progress.timeSpent || 0) + timeSpent;
  progress.attempts += 1;
  progress.status = "completed";
  progress.gradingStatus = results.gradingStatus;

  // Update best score
  if (results.score > progress.bestScore) {
    progress.bestScore = results.score;
    progress.bestAttempt = progress.attempts;
  }

  // Update enrollment
  enrollment.lastAccessed = now;
  enrollment.accessHistory.push({
    accessedAt: now,
    duration: timeSpent,
    contentItemId: quizId,
    action: "submitted",
  });

  // Check if all content is completed
  this.checkCourseCompletion(studentId);

  await this.save();
  return {
    ...results,
    attemptNumber: progress.attempts,
    remainingAttempts: quiz.maxAttempts - progress.attempts,
  };
};
// Grade student answers (for teachers)
courseSchema.methods.gradeStudentAnswers = async function (
  instructorId,
  studentId,
  quizId,
  gradedAnswers
) {
  // Verify instructor
  if (!this.instructor.equals(instructorId)) {
    const isTA = this.teachingAssistants.some((ta) =>
      ta.user.equals(instructorId)
    );
    if (!isTA) {
      throw new Error("Not authorized to grade this course");
    }
  }

  const enrollment = this.enrollments.find((e) =>
    e.studentId.equals(studentId)
  );
  if (!enrollment) {
    throw new Error("Student not enrolled in this course");
  }

  const progress = enrollment.progress.find((p) =>
    p.contentItemId.equals(quizId)
  );
  if (!progress) {
    throw new Error("Quiz attempt not found");
  }

  let newScore = 0;
  const now = new Date();

  // Update each answer with teacher's grading
  gradedAnswers.forEach((gradedAnswer) => {
    const answer = progress.answers.id(gradedAnswer.answerId);
    if (answer) {
      answer.marksObtained = gradedAnswer.marks;
      answer.teacherFeedback = gradedAnswer.feedback;
      answer.gradedBy = instructorId;
      answer.gradedAt = now;
      answer.isCorrect = gradedAnswer.marks >= answer.maxMarks * 0.5; // Considered correct if >= 50%

      newScore += gradedAnswer.marks;
    }
  });

  // Update progress
  progress.score = newScore;
  progress.percentage = Math.round((newScore / progress.maxScore) * 100);
  progress.passed =
    progress.percentage >= (this.content.id(quizId).passingScore || 70);
  progress.gradingStatus = progress.answers.some((a) => !a.gradedAt)
    ? "partially-graded"
    : "manually-graded";

  // Update enrollment
  enrollment.accessHistory.push({
    accessedAt: now,
    duration: 0,
    contentItemId: quizId,
    action: "graded",
  });

  await this.save();
  return progress;
};

// Check if student has completed the course
courseSchema.methods.checkCourseCompletion = function (studentId) {
  const enrollment = this.enrollments.find((e) =>
    e.studentId.equals(studentId)
  );
  if (!enrollment || enrollment.completed) return false;

  // Check if all content items are completed
  const allContentIds = this.content.map((item) => item._id.toString());
  const completedContentIds = enrollment.progress
    .filter((p) => p.completed)
    .map((p) => p.contentItemId.toString());

  const allCompleted = allContentIds.every((id) =>
    completedContentIds.includes(id)
  );

  if (allCompleted) {
    enrollment.completed = true;
    enrollment.completedAt = new Date();
    enrollment.status = "completed";
    return true;
  }

  return false;
};

// Issue certificate to student
courseSchema.methods.issueCertificate = async function (
  studentId,
  issuedBy,
  certificateData = {}
) {
  const enrollment = this.enrollments.find((e) =>
    e.studentId.equals(studentId)
  );
  if (!enrollment) {
    throw new Error("Student not enrolled in this course");
  }

  if (!enrollment.completed) {
    throw new Error("Student has not completed the course");
  }

  const verificationCode = generateVerificationCode(); // Implement this function

  enrollment.certificate = {
    certificateId: certificateData.certificateId || `CERT-${Date.now()}`,
    issuedAt: new Date(),
    issuedBy: issuedBy,
    downloadUrl: certificateData.downloadUrl || "",
    verificationCode,
  };

  enrollment.status = "certified";

  await this.save();
  return enrollment.certificate;
};

// Calculate average rating
courseSchema.methods.updateAverageRating = function () {
  if (this.ratings.length === 0) {
    this.averageRating = 0;
    return;
  }

  const sum = this.ratings.reduce((acc, rating) => acc + rating.rating, 0);
  this.averageRating = sum / this.ratings.length;
};

// Update course stats
courseSchema.methods.updateCourseStats = function () {
  this.totalStudents = this.enrollments.length;
  this.totalLessons = this.content.filter(
    (item) => item.type === "tutorial"
  ).length;
  this.totalQuizzes = this.content.filter(
    (item) => item.type === "quiz"
  ).length;

  // Calculate completion rate
  if (this.enrollments.length > 0) {
    const completedCount = this.enrollments.filter((e) => e.completed).length;
    this.analytics.completionRate = Math.round(
      (completedCount / this.enrollments.length) * 100
    );
  }

  // Calculate average score
  const allScores = this.enrollments
    .flatMap((e) => e.progress.map((p) => p.percentage))
    .filter((p) => p !== undefined);

  if (allScores.length > 0) {
    const sum = allScores.reduce((a, b) => a + b, 0);
    this.analytics.averageScore = Math.round(sum / allScores.length);
  }
};

// Pre-save hooks
courseSchema.pre("save", function (next) {
  // Clean content items
  this.content = this.content.map((item) => {
    if (item.thumbnail && typeof item.thumbnail === "object") {
      item.thumbnail = item.thumbnail.path || null;
    }
    return item;
  });

  if (this.isModified("ratings")) {
    this.updateAverageRating();
  }

  if (this.isModified("content") || this.isModified("enrollments")) {
    this.updateCourseStats();
  }

  next();
});

// Helper function to generate verification code
function generateVerificationCode() {
  return (
    Math.random().toString(36).substring(2, 10) +
    Math.random().toString(36).substring(2, 10)
  );
}

module.exports = mongoose.model("Course", courseSchema);
