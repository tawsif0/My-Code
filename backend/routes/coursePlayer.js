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
// Track tutorial/video completion - mark as completed immediately on play
Courseplayer.post("/:courseId/track-tutorial-time", async (req, res) => {
  try {
    const { contentItemId, user_id } = req.body;

    const course = await Course.findOne({
      _id: req.params.courseId,
      "enrollments.studentId": user_id,
    });

    if (!course) {
      return res
        .status(404)
        .json({ message: "Course not found or not enrolled" });
    }

    const enrollment = course.enrollments.find(
      (e) => e.studentId.toString() === user_id.toString()
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

    if (!progressRecord) {
      progressRecord = {
        contentItemId: contentItem._id,
        contentItemType: "tutorial",
        progress: 100, // Mark as 100% complete immediately
        completed: true, // Mark as completed immediately
        timeSpent: 0,
        status: "completed",
        completedAt: now,
        lastAccessed: now,
      };
      enrollment.progress.push(progressRecord);
    } else {
      // Update existing record to mark as completed
      progressRecord.progress = 100;
      progressRecord.completed = true;
      progressRecord.status = "completed";
      progressRecord.completedAt = now;
      progressRecord.lastAccessed = now;
    }

    // Update access history
    enrollment.accessHistory.push({
      accessedAt: now,
      duration: 0,
      contentItemId: contentItem._id,
      action: "played",
      progress: 100,
    });

    enrollment.lastAccessed = now;

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
      progress: 100,
      completed: true,
      courseCompleted: allCompleted,
    });
  } catch (error) {
    console.error("Error tracking tutorial time:", error);
    res
      .status(500)
      .json({ message: "Failed to track tutorial time", error: error.message });
  }
});

// Remove the duplicate track-video-time endpoint since we only need one
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
      ? currentPercentage >= (quiz.passingScore || 40)
      : autoGradedPercentage >= (quiz.passingScore || 40);

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
    progress.completed = !needsManualGrading; // Only complete if no manual grading needed
    progress.completedAt = needsManualGrading ? null : now;
    progress.lastAccessed = now;
    progress.attempts += 1;
    progress.status = needsManualGrading ? "in-progress" : "completed";
    progress.gradingStatus = gradingStatus;
    progress.autoGradedScore = autoGradedScore;
    progress.autoGradedMaxScore = autoGradedMaxScore;

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
    const allCompleted = checkCourseCompletion(course, studentId);

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
function checkCourseCompletion(course, studentId) {
  const enrollment = course.enrollments.find(
    (e) => e.studentId.toString() === studentId.toString()
  );

  if (!enrollment || enrollment.completed) return false;

  // Check if all content items are properly completed
  const allContentIds = course.content.map((item) => item._id.toString());

  const completedContentIds = enrollment.progress
    .filter((p) => {
      const contentItem = course.content.id(p.contentItemId);

      // For quizzes, only count as completed if fully graded
      if (contentItem && contentItem.type === "quiz") {
        return p.completed && p.gradingStatus === "manually-graded";
      }

      // For live sessions, only count as completed if teacher marked as present
      if (contentItem && contentItem.type === "live") {
        return p.completed && contentItem.attendanceStatus === "present";
      }

      // For tutorials, use normal completion logic
      return p.completed;
    })
    .map((p) => p.contentItemId.toString());

  return allContentIds.every((id) => completedContentIds.includes(id));
}
// Add this to your Courseplayer routes
Courseplayer.get("/:courseId/quiz-status/:contentItemId", async (req, res) => {
  try {
    const { courseId, contentItemId } = req.params;
    const studentId = req.query.user_id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const enrollment = course.enrollments.find(
      (e) => e.studentId.toString() === studentId.toString()
    );

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    const progress = enrollment.progress.find(
      (p) => p.contentItemId.toString() === contentItemId.toString()
    );

    if (!progress) {
      return res.status(404).json({ message: "Progress not found" });
    }

    res.json({
      success: true,
      completed: progress.completed,
      gradingStatus: progress.gradingStatus,
      score: progress.score,
      maxScore: progress.maxScore,
      percentage: progress.percentage,
      passed: progress.passed,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// POST - Submit a rating
Courseplayer.post("/:courseId/rate", async (req, res) => {
  try {
    const { courseId } = req.params;
    const { rating, review, user_id } = req.body;

    // Validate input
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5 stars",
      });
    }

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Find the course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check if user has enrolled in the course
    const enrollment = course.enrollments.find(
      (e) => e.studentId.toString() === user_id
    );

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "You must be enrolled in this course to rate it",
      });
    }

    // Check if user has already rated this course
    const existingRating = course.ratings.find(
      (r) => r.user && r.user.toString() === user_id
    );

    if (existingRating) {
      return res.status(400).json({
        success: false,
        message: "You have already rated this course",
      });
    }

    // Add the new rating
    const mongoose = require("mongoose");
    course.ratings.push({
      user: new mongoose.Types.ObjectId(user_id), // Ensure it's stored as ObjectId
      rating: parseInt(rating),
      review: review || "",
      createdAt: new Date(),
    });

    // Mark the enrollment as rated
    enrollment.hasRated = true;
    course.markModified("enrollments");

    // Recalculate average rating
    const validRatings = course.ratings.filter((r) => r.user !== null);
    const totalRatings = validRatings.length;
    const sumRatings = validRatings.reduce((sum, r) => sum + r.rating, 0);
    course.averageRating =
      totalRatings > 0 ? parseFloat((sumRatings / totalRatings).toFixed(1)) : 0;

    await course.save();

    res.json({
      success: true,
      message: "Rating submitted successfully",
      newAverageRating: course.averageRating,
      hasRated: true,
    });
  } catch (error) {
    console.error("Rating submission error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// GET - Fetch ratings with pagination
Courseplayer.get("/:courseId/ratings", async (req, res) => {
  try {
    const { courseId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const course = await Course.findById(courseId)
      .populate({
        path: "ratings.user",
        select: "full_name profile_picture",
      })
      .select("ratings averageRating");
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Filter out ratings with null users
    const validRatings = course.ratings.filter(
      (rating) => rating.user !== null
    );

    // Sort by creation date (newest first)
    validRatings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedRatings = validRatings.slice(startIndex, endIndex);

    // Recalculate average rating from valid ratings only
    const averageRating =
      validRatings.length > 0
        ? parseFloat(
            (
              validRatings.reduce((sum, r) => sum + r.rating, 0) /
              validRatings.length
            ).toFixed(1)
          )
        : 0;

    res.json({
      success: true,
      ratings: paginatedRatings,
      averageRating,
      totalRatings: validRatings.length,
      currentPage: page,
      totalPages: Math.ceil(validRatings.length / limit),
    });
  } catch (error) {
    console.error("Get ratings error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Add to your backend routes (coursePlayer.js)
Courseplayer.post("/:courseId/complete-live-session", async (req, res) => {
  try {
    const { courseId } = req.params;
    const { contentItemId, user_id, attended } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Find enrollment
    const enrollment = course.enrollments.find(
      (e) => e.studentId.toString() === user_id
    );

    if (!enrollment) {
      return res.status(400).json({
        success: false,
        message: "Student not enrolled in this course",
      });
    }

    // Find or create progress record
    let progress = enrollment.progress.find(
      (p) => p.contentItemId.toString() === contentItemId
    );

    if (!progress) {
      progress = {
        contentItemId,
        contentItemType: "live",
        completed: false,
        score: 0,
        percentage: 0,
        passed: true,
        attempts: 0,
        status: "not-started",
        gradingStatus: "not-graded",
      };
      enrollment.progress.push(progress);
    }

    // Update progress
    progress.completed = attended;
    progress.completedAt = new Date();
    progress.status = attended ? "completed" : "not-started";
    progress.lastAccessed = new Date();

    // Update the content item attendance status
    const contentItem = course.content.id(contentItemId);
    if (contentItem) {
      contentItem.attendanceStatus = attended ? "present" : "absent";
      contentItem.completed = attended;
    }

    // Check if course is now completed
    course.checkCourseCompletion(user_id);

    await course.save();

    res.json({
      success: true,
      message: "Live session attendance updated successfully",
    });
  } catch (error) {
    console.error("Live session completion error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});
module.exports = Courseplayer;
