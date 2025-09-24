const express = require("express");
const Courserouter = express.Router();
const Course = require("../models/Course");
const mongoose = require("mongoose");

// Get all courses for a student (enrolled courses)
Courserouter.get("/student-courses/:userid", async (req, res) => {
  try {
    const courses = await Course.find({
      "enrollments.studentId": req.params.userid
    })
      .select(
        "title description thumbnail instructor duration totalStudents averageRating"
      )
      .populate("instructor", "name email avatar")
      .lean();
    console.log(req.params);

    // Add progress information for each course
    const coursesWithProgress = courses.map((course) => {
      const enrollment = course.enrollments.find(
        (e) => e.studentId.toString() === req.user._id.toString()
      );

      // Calculate progress
      const totalItems = course.content.length;
      const completedItems =
        enrollment?.progress?.filter((p) => p.completed).length || 0;
      const progress =
        totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

      // Calculate quiz scores
      const quizResults =
        enrollment?.progress
          ?.filter((p) => p.contentItemType === "quiz")
          ?.map((quiz) => ({
            quizId: quiz.contentItemId,
            score: quiz.score,
            maxScore: quiz.maxScore,
            percentage: quiz.percentage,
            passed: quiz.passed
          })) || [];

      return {
        ...course,
        progress,
        quizResults,
        enrollmentDate: enrollment?.enrolledAt,
        completed: enrollment?.completed || false
      };
    });

    res.json(coursesWithProgress);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// Get single course with student progress
Courserouter.get("/single-courses/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("instructor", "name email avatar")
      .populate("enrollments.studentId", "name email avatar")
      .lean();

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Find student's enrollment
    const enrollment = course.enrollments.find(
      (e) => e.studentId._id.toString() === req.user._id.toString()
    );

    if (!enrollment) {
      return res
        .status(403)
        .json({ message: "You are not enrolled in this course" });
    }

    // Map content with progress
    const contentWithProgress = course.content.map((item) => {
      const progress = enrollment.progress.find(
        (p) => p.contentItemId.toString() === item._id.toString()
      );

      return {
        ...item,
        completed: progress?.completed || false,
        progress: progress?.progress || 0,
        score: progress?.score,
        maxScore: progress?.maxScore,
        attempts: progress?.attempts,
        lastAccessed: progress?.lastAccessed
      };
    });

    // Calculate overall progress
    const totalItems = course.content.length;
    const completedItems = enrollment.progress.filter(
      (p) => p.completed
    ).length;
    const overallProgress =
      totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    res.json({
      ...course,
      content: contentWithProgress,
      overallProgress,
      enrollmentStatus: {
        enrolledAt: enrollment.enrolledAt,
        completed: enrollment.completed,
        certificate: enrollment.certificate
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Enroll in a course
Courserouter.post("/enroll/:courseId", async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if already enrolled
    const isEnrolled = course.enrollments.some(
      (e) => e.studentId.toString() === req.user._id.toString()
    );

    if (isEnrolled) {
      return res
        .status(400)
        .json({ message: "You are already enrolled in this course" });
    }

    // Add enrollment
    course.enrollments.push({
      studentId: req.user._id,
      enrolledAt: new Date()
    });

    course.totalStudents += 1;
    await course.save();

    res.json({
      success: true,
      message: "Successfully enrolled in the course"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Submit quiz answers
Courserouter.post("/submit-quiz", async (req, res) => {
  try {
    const { courseId, contentItemId, answers } = req.body;
    const studentId = req.user._id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if student is enrolled
    const enrollment = course.enrollments.find(
      (e) => e.studentId.toString() === studentId.toString()
    );

    if (!enrollment) {
      return res
        .status(403)
        .json({ message: "You are not enrolled in this course" });
    }

    const quiz = course.content.id(contentItemId);
    if (!quiz || quiz.type !== "quiz") {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // Calculate results
    const results = course.calculateQuizResults(contentItemId, answers);
    const now = new Date();

    // Find or create progress record
    let progress = enrollment.progress.find(
      (p) => p.contentItemId.toString() === contentItemId.toString()
    );

    if (!progress) {
      progress = {
        contentItemId: quiz._id,
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
        gradingStatus: "not-graded"
      };
      enrollment.progress.push(progress);
    }

    // Update progress
    progress.answers = results.answers.map((answer) => ({
      questionId: answer.questionId,
      questionText: answer.questionText,
      questionType: answer.questionType,
      answer: answer.answer,
      isCorrect: answer.isCorrect,
      correctAnswer: answer.correctAnswer,
      marksObtained: answer.marksObtained,
      maxMarks: answer.maxMarks,
      explanation: answer.explanation,
      needsManualGrading: answer.needsManualGrading
    }));

    progress.score = results.score;
    progress.percentage = results.percentage;
    progress.passed = results.passed;
    progress.completed = true;
    progress.completedAt = now;
    progress.lastAccessed = now;
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
      duration: 0,
      contentItemId: quiz._id,
      action: "quiz-submitted"
    });

    // Check course completion
    const allContentIds = course.content.map((item) => item._id.toString());
    const completedContentIds = enrollment.progress
      .filter((p) => p.completed)
      .map((p) => p.contentItemId.toString());

    const allCompleted = allContentIds.every((id) =>
      completedContentIds.includes(id)
    );

    if (allCompleted) {
      enrollment.completed = true;
      enrollment.completedAt = now;
      enrollment.status = "completed";
    }

    await course.save();

    // Generate certificate if course is completed
    let certificateUrl = null;
    if (allCompleted) {
      certificateUrl = `/certificates/${course._id}/${studentId}`;
      // In a real app, you would generate and save the certificate here
    }

    res.json({
      success: true,
      score: results.score,
      maxScore: results.maxScore,
      percentage: results.percentage,
      passed: results.passed,
      attempts: progress.attempts,
      remainingAttempts: quiz.maxAttempts - progress.attempts,
      certicateUrl: certificateUrl,
      courseCompleted: allCompleted
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Track content progress (videos, tutorials)
Courserouter.post("/track-progress", async (req, res) => {
  try {
    const { courseId, contentItemId, progress, duration, action } = req.body;
    const studentId = req.user._id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if student is enrolled
    const enrollment = course.enrollments.find(
      (e) => e.studentId.toString() === studentId.toString()
    );

    if (!enrollment) {
      return res
        .status(403)
        .json({ message: "You are not enrolled in this course" });
    }

    const contentItem = course.content.id(contentItemId);
    if (!contentItem) {
      return res.status(404).json({ message: "Content item not found" });
    }

    // Find or create progress record
    let progressRecord = enrollment.progress.find(
      (p) => p.contentItemId.toString() === contentItemId.toString()
    );

    const now = new Date();
    const isCompleted = progress >= 95; // Consider 95% or more as completed

    if (!progressRecord) {
      progressRecord = {
        contentItemId: contentItem._id,
        contentItemType: contentItem.type,
        progress: 0,
        completed: false,
        timeSpent: 0,
        status: "in-progress"
      };
      enrollment.progress.push(progressRecord);
    }

    // Update progress
    progressRecord.progress = Math.max(progressRecord.progress, progress);
    progressRecord.timeSpent += duration;
    progressRecord.lastAccessed = now;

    if (isCompleted && !progressRecord.completed) {
      progressRecord.completed = true;
      progressRecord.completedAt = now;
      progressRecord.status = "completed";
    }

    // Update access history
    enrollment.accessHistory.push({
      accessedAt: now,
      duration,
      contentItemId: contentItem._id,
      action: action || "viewed"
    });

    enrollment.lastAccessed = now;
    enrollment.totalTimeSpent += duration;

    // Check course completion
    const allContentIds = course.content.map((item) => item._id.toString());
    const completedContentIds = enrollment.progress
      .filter((p) => p.completed)
      .map((p) => p.contentItemId.toString());

    const allCompleted = allContentIds.every((id) =>
      completedContentIds.includes(id)
    );

    if (allCompleted) {
      enrollment.completed = true;
      enrollment.completedAt = now;
      enrollment.status = "completed";
    }

    await course.save();

    res.json({
      success: true,
      progress: progressRecord.progress,
      completed: progressRecord.completed,
      courseCompleted: allCompleted
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Teacher routes - Get student submissions
Courserouter.get("/:courseId/student-submissions", async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId)
      .populate("enrollments.studentId", "name email avatar")
      .lean();

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Verify instructor
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Extract student submissions
    const submissions = course.enrollments.map((enrollment) => {
      const quizSubmissions = enrollment.progress
        .filter((p) => p.contentItemType === "quiz")
        .map((progress) => {
          const quiz = course.content.id(progress.contentItemId);
          return {
            quizId: progress.contentItemId,
            quizTitle: quiz?.title || "Unknown Quiz",
            answers: progress.answers.map((answer) => {
              const question = quiz?.questions.id(answer.questionId);
              return {
                questionId: answer.questionId,
                questionText: answer.questionText,
                questionType: answer.questionType,
                studentAnswer: answer.answer,
                correctAnswer: answer.correctAnswer,
                isCorrect: answer.isCorrect,
                marksObtained: answer.marksObtained,
                maxMarks: answer.maxMarks,
                teacherFeedback: answer.teacherFeedback,
                needsGrading: answer.needsManualGrading && !answer.gradedBy,
                graded: !!answer.gradedBy
              };
            }),
            score: progress.score,
            maxScore: progress.maxScore,
            percentage: progress.percentage,
            passed: progress.passed,
            attempts: progress.attempts,
            submittedAt: progress.completedAt,
            gradingStatus: progress.gradingStatus
          };
        });

      return {
        studentId: enrollment.studentId._id,
        studentName: enrollment.studentId.name,
        studentEmail: enrollment.studentId.email,
        studentAvatar: enrollment.studentId.avatar,
        enrolledAt: enrollment.enrolledAt,
        completed: enrollment.completed,
        quizSubmissions,
        totalTimeSpent: enrollment.totalTimeSpent
      };
    });

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Teacher routes - Grade student submission
Courserouter.post("/grade-submission", async (req, res) => {
  try {
    const { courseId, studentId, quizId, gradedAnswers } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Verify instructor
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Find student enrollment
    const enrollment = course.enrollments.find(
      (e) => e.studentId.toString() === studentId.toString()
    );

    if (!enrollment) {
      return res
        .status(404)
        .json({ message: "Student not found in this course" });
    }

    // Find quiz progress
    const progress = enrollment.progress.find(
      (p) => p.contentItemId.toString() === quizId.toString()
    );

    if (!progress) {
      return res.status(404).json({ message: "Quiz submission not found" });
    }

    const now = new Date();
    let newScore = 0;

    // Update each answer with teacher's grading
    gradedAnswers.forEach((gradedAnswer) => {
      const answer = progress.answers.id(gradedAnswer.answerId);
      if (answer) {
        answer.marksObtained = gradedAnswer.marks;
        answer.teacherFeedback = gradedAnswer.feedback;
        answer.gradedBy = req.user._id;
        answer.gradedAt = now;
        answer.isCorrect = gradedAnswer.marks >= answer.maxMarks * 0.5;

        newScore += gradedAnswer.marks;
      }
    });

    // Update progress
    progress.score = newScore;
    progress.percentage = Math.round((newScore / progress.maxScore) * 100);
    progress.passed =
      progress.percentage >= (course.content.id(quizId).passingScore || 70);

    // Update grading status
    const allGraded = progress.answers.every((a) => a.gradedBy);
    progress.gradingStatus = allGraded ? "manually-graded" : "partially-graded";

    // Update enrollment
    enrollment.accessHistory.push({
      accessedAt: now,
      duration: 0,
      contentItemId: quizId,
      action: "graded"
    });

    await course.save();

    res.json({
      success: true,
      score: newScore,
      maxScore: progress.maxScore,
      percentage: progress.percentage,
      passed: progress.passed,
      gradingStatus: progress.gradingStatus
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Issue certificate
Courserouter.post(
  "/issue-certificate/:courseId/:studentId",
  async (req, res) => {
    try {
      const { courseId, studentId } = req.params;
      const { certificateUrl } = req.body;

      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      // Verify instructor
      if (course.instructor.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Not authorized" });
      }

      // Find student enrollment
      const enrollment = course.enrollments.find(
        (e) => e.studentId.toString() === studentId.toString()
      );

      if (!enrollment) {
        return res
          .status(404)
          .json({ message: "Student not found in this course" });
      }

      if (!enrollment.completed) {
        return res
          .status(400)
          .json({ message: "Student has not completed the course" });
      }

      // Generate certificate ID
      const certificateId = `CERT-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // Update enrollment with certificate
      enrollment.certificate = {
        certificateId,
        issuedAt: new Date(),
        issuedBy: req.user._id,
        downloadUrl: certificateUrl,
        verificationCode: Math.random().toString(36).substr(2, 12).toUpperCase()
      };

      enrollment.status = "certified";
      await course.save();

      res.json({
        success: true,
        certificate: enrollment.certificate
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = Courserouter;
