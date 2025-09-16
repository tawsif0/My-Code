const express = require("express");
const Courseplayer = express.Router();
const Course = require("../models/Course");
const mongoose = require("mongoose");

// Get course content for player
Courseplayer.get("/single-courses/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("instructor", "name email avatar")
      .lean();

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Find student's enrollment
    const enrollment = course.enrollments.find(
      (e) => e.studentId.toString() === req.query.user_id.toString()
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
        lastAccessed: progress?.lastAccessed,
        answers: progress?.answers,
        passed: progress?.passed,
        timeSpent: progress?.timeSpent || 0,
        gradingStatus: progress?.gradingStatus,
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
        certificate: enrollment.certificate,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// Track content access
Courseplayer.post("/:courseId/access", async (req, res) => {
  try {
    const course = await Course.findOne({
      _id: req.params.courseId,
      "enrollments.studentId": req.body.user_id,
    });

    if (!course) {
      return res
        .status(404)
        .json({ message: "Course not found or not enrolled" });
    }

    const enrollment = course.enrollments.find(
      (e) => e.studentId.toString() === req.body.user_id.toString()
    );

    enrollment.lastAccessed = new Date();
    await course.save();

    res.json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// Track video watch time
Courseplayer.post("/:courseId/track-watch-time", async (req, res) => {
  try {
    const { contentItemId, duration, currentTime, totalDuration } = req.body;
    const course = await Course.findOne({
      _id: req.params.courseId,
      "enrollments.studentId": req.user._id,
    });

    if (!course) {
      return res
        .status(404)
        .json({ message: "Course not found or not enrolled" });
    }

    const enrollment = course.enrollments.find(
      (e) => e.studentId.toString() === req.user._id.toString()
    );

    const contentItem = course.content.id(contentItemId);
    if (!contentItem) {
      return res.status(404).json({ message: "Content item not found" });
    }

    // Find or create progress record
    let progressRecord = enrollment.progress.find(
      (p) => p.contentItemId.toString() === contentItemId.toString()
    );

    const now = new Date();
    const progressPercentage = Math.min(
      100,
      Math.round((currentTime / totalDuration) * 100)
    );
    const isCompleted = progressPercentage >= 95; // Consider 95% or more as completed

    if (!progressRecord) {
      progressRecord = {
        contentItemId: contentItem._id,
        contentItemType: contentItem.type,
        progress: 0,
        completed: false,
        timeSpent: 0,
        status: "in-progress",
      };
      enrollment.progress.push(progressRecord);
    }

    // Update watch time and progress
    progressRecord.timeSpent += duration;
    progressRecord.progress = Math.max(
      progressRecord.progress,
      progressPercentage
    );
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
      action: "watched",
      progress: progressPercentage,
    });

    enrollment.lastAccessed = now;
    enrollment.totalTimeSpent = (enrollment.totalTimeSpent || 0) + duration;

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
      timeSpent: progressRecord.timeSpent,
      completed: progressRecord.completed,
      courseCompleted: allCompleted,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Track tutorial watch time
Courseplayer.post("/:courseId/track-tutorial-time", async (req, res) => {
  try {
    const { contentItemId, duration, currentTime, totalDuration } = req.body;
    const userId = req.body.user_id;

    const course = await Course.findOne({
      _id: req.params.courseId,
      "enrollments.studentId": userId,
    });

    if (!course) {
      return res
        .status(404)
        .json({ message: "Course not found or not enrolled" });
    }

    const enrollment = course.enrollments.find(
      (e) => e.studentId.toString() === userId.toString()
    );

    const contentItem = course.content.id(contentItemId);
    if (!contentItem || contentItem.type !== "tutorial") {
      return res.status(404).json({ message: "Tutorial content not found" });
    }

    // Find or create progress record
    let progressRecord = enrollment.progress.find(
      (p) => p.contentItemId.toString() === contentItemId.toString()
    );

    const now = new Date();
    const progressPercentage = Math.min(
      100,
      Math.round((currentTime / totalDuration) * 100)
    );
    const isCompleted = progressPercentage >= 95; // Consider 95% or more as completed

    if (!progressRecord) {
      progressRecord = {
        contentItemId: contentItem._id,
        contentItemType: "tutorial",
        progress: 0,
        completed: false,
        timeSpent: 0,
        status: "in-progress",
      };
      enrollment.progress.push(progressRecord);
    }

    // Update watch time and progress
    progressRecord.timeSpent += duration;
    progressRecord.progress = Math.max(
      progressRecord.progress,
      progressPercentage
    );
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
      action: "watched",
      progress: progressPercentage,
    });

    enrollment.lastAccessed = now;
    enrollment.totalTimeSpent = (enrollment.totalTimeSpent || 0) + duration;

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
      timeSpent: progressRecord.timeSpent,
      completed: progressRecord.completed,
      courseCompleted: allCompleted,
    });
  } catch (error) {
    console.error("Error tracking tutorial time:", error);
    res
      .status(500)
      .json({ message: "Failed to track tutorial time", error: error.message });
  }
});

// Track video watch time in seconds

Courseplayer.post("/:courseId/track-video-time", async (req, res) => {
  try {
    const { contentItemId, secondsWatched, totalDuration } = req.body;
    const userId = req.body.user_id;

    const course = await Course.findOne({
      _id: req.params.courseId,
      "enrollments.studentId": userId,
    });

    if (!course) {
      return res
        .status(404)
        .json({ message: "Course not found or not enrolled" });
    }

    const enrollment = course.enrollments.find(
      (e) => e.studentId.toString() === userId.toString()
    );

    const contentItem = course.content.id(contentItemId);
    if (!contentItem || contentItem.type !== "tutorial") {
      return res.status(404).json({ message: "Video content not found" });
    }

    // Find or create progress record
    let progressRecord = enrollment.progress.find(
      (p) => p.contentItemId.toString() === contentItemId.toString()
    );

    const now = new Date();
    const progressPercentage = Math.min(
      100,
      Math.round((secondsWatched / totalDuration) * 100)
    );
    const isCompleted = progressPercentage >= 95; // Consider 95% or more as completed

    if (!progressRecord) {
      progressRecord = {
        contentItemId: contentItem._id,
        contentItemType: "tutorial",
        progress: 0,
        completed: false,
        timeSpent: 0,
        status: "in-progress",
      };
      enrollment.progress.push(progressRecord);
    }

    // Update watch time and progress
    progressRecord.timeSpent = secondsWatched;
    progressRecord.progress = Math.max(
      progressRecord.progress,
      progressPercentage
    );
    progressRecord.lastAccessed = now;

    if (isCompleted && !progressRecord.completed) {
      progressRecord.completed = true;
      progressRecord.completedAt = now;
      progressRecord.status = "completed";
    }

    // Update access history
    enrollment.accessHistory.push({
      accessedAt: now,
      duration: secondsWatched - (progressRecord.timeSpent || 0),
      contentItemId: contentItem._id,
      action: "watched",
      progress: progressPercentage,
    });

    enrollment.lastAccessed = now;
    enrollment.totalTimeSpent =
      (enrollment.totalTimeSpent || 0) +
      (secondsWatched - (progressRecord.timeSpent || 0));

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
      timeSpent: progressRecord.timeSpent,
      completed: progressRecord.completed,
      courseCompleted: allCompleted,
    });
  } catch (error) {
    console.error("Error tracking video time:", error);
    res.status(500).json({
      message: "Failed to track video time",
      error: error.message,
    });
  }
});
// Submit quiz answers
Courseplayer.post("/submit-quiz", async (req, res) => {
  try {
    const { courseId, contentItemId, answers } = req.body;
    const studentId = req.body.user_id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

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

    const existingProgress = enrollment.progress.find(
      (p) =>
        p.contentItemId.toString() === contentItemId.toString() && p.completed
    );

    if (existingProgress) {
      return res.json({
        success: true,
        alreadySubmitted: true,
        score: existingProgress.score,
        maxScore: existingProgress.maxScore,
        percentage: existingProgress.percentage,
        passed: existingProgress.passed,
        answers: existingProgress.answers,
        attempts: existingProgress.attempts,
        certificateUrl: enrollment.certificate,
        courseCompleted: enrollment.completed,
        gradingStatus: existingProgress.gradingStatus,
      });
    }

    let score = 0;
    let maxScore = 0;
    const detailedAnswers = [];
    let needsManualGrading = false;
    let autoGradedScore = 0;
    let autoGradedMaxScore = 0;

    quiz.questions.forEach((question) => {
      maxScore += question.marks;

      const userAnswer = answers[question._id];

      if (userAnswer === undefined || userAnswer === null) {
        // No answer provided for this question
        detailedAnswers.push({
          questionId: question._id,
          questionText: question.question,
          questionType: question.type,
          answer: userAnswer,
          isCorrect: false,
          correctAnswer: question.correctAnswer,
          marksObtained: 0,
          maxMarks: question.marks,
          explanation: question.explanation,
          needsManualGrading: false,
          status: "not-answered",
        });
        return;
      }

      let isCorrect = false;
      let marksObtained = 0;
      let questionNeedsManualGrading = false;

      switch (question.type) {
        case "mcq-single":
          isCorrect = userAnswer === question.correctAnswer;
          if (isCorrect) {
            marksObtained = question.marks;
            score += question.marks;
            autoGradedScore += question.marks;
          }
          autoGradedMaxScore += question.marks;
          break;
        case "mcq-multiple":
          if (
            Array.isArray(userAnswer) &&
            Array.isArray(question.correctAnswer)
          ) {
            isCorrect =
              userAnswer.length === question.correctAnswer.length &&
              userAnswer.every((ans) => question.correctAnswer.includes(ans));
            if (isCorrect) {
              marksObtained = question.marks;
              score += question.marks;
              autoGradedScore += question.marks;
            }
          }
          autoGradedMaxScore += question.marks;
          break;
        case "short-answer":
        case "broad-answer":
          // For manual grading questions, set marks to 0 initially
          // and mark as needing manual grading
          questionNeedsManualGrading = true;
          needsManualGrading = true;
          isCorrect = false; // Will be determined by teacher later
          marksObtained = 0; // Initial score is 0 until graded
          break;
      }

      detailedAnswers.push({
        questionId: question._id,
        questionText: question.question,
        questionType: question.type,
        answer: userAnswer,
        isCorrect,
        correctAnswer: question.correctAnswer,
        marksObtained,
        maxMarks: question.marks,
        explanation: question.explanation,
        needsManualGrading: questionNeedsManualGrading,
        status: questionNeedsManualGrading
          ? "awaiting-grading"
          : isCorrect
          ? "correct"
          : "incorrect",
      });
    });

    // Calculate percentage based on auto-graded questions only
    // Manual graded questions will contribute 0 until graded
    const autoGradedPercentage =
      autoGradedMaxScore > 0
        ? Math.round((autoGradedScore / autoGradedMaxScore) * 100)
        : 0;

    // For now, use auto-graded score only until manual grading is complete
    const currentScore = score;
    const currentPercentage =
      maxScore > 0 ? Math.round((currentScore / maxScore) * 100) : 0;
    // Only consider quiz as passed if no manual grading is needed
    // OR if auto-graded portion already meets passing criteria
    const passed = !needsManualGrading
      ? currentPercentage >= 40
      : autoGradedPercentage >= 40;
    const gradingStatus = needsManualGrading
      ? "partially-graded"
      : "auto-graded";

    let progress = enrollment.progress.find(
      (p) => p.contentItemId.toString() === contentItemId.toString()
    );

    const now = new Date();

    if (!progress) {
      progress = {
        contentItemId: quiz._id,
        contentItemType: "quiz",
        answers: [],
        score: 0,
        maxScore: 0,
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

    progress.answers = detailedAnswers;
    progress.score = currentScore;
    progress.maxScore = maxScore;
    progress.percentage = currentPercentage;
    progress.passed = passed;
    progress.completed = true;
    progress.completedAt = now;
    progress.lastAccessed = now;
    progress.attempts += 1;
    progress.status = "completed";
    progress.gradingStatus = gradingStatus;

    if (currentScore > progress.bestScore) {
      progress.bestScore = currentScore;
      progress.bestAttempt = progress.attempts;
    }

    enrollment.accessHistory.push({
      accessedAt: now,
      duration: 0,
      contentItemId: quiz._id,
      action: "quiz-submitted",
    });

    enrollment.lastAccessed = now;

    // Check if all content is completed (but don't mark course as completed
    // if there are quizzes awaiting manual grading)
    const allContentIds = course.content.map((item) => item._id.toString());
    const completedContentIds = enrollment.progress
      .filter((p) => p.completed && p.gradingStatus !== "partially-graded")
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

    let certificateUrl = null;
    if (allCompleted) {
      certificateUrl = `/certificates/${course._id}/${studentId}`;
    }

    res.json({
      success: true,
      score: currentScore,
      maxScore,
      percentage: currentPercentage,
      passed,
      answers: detailedAnswers,
      attempts: progress.attempts,
      remainingAttempts: (quiz.maxAttempts || 3) - progress.attempts,
      certificateUrl,
      courseCompleted: allCompleted,
      gradingStatus,
      needsManualGrading,
      autoGradedScore,
      autoGradedMaxScore,
      autoGradedPercentage,
    });
  } catch (error) {
    console.log("Quiz submission error:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = Courseplayer;
