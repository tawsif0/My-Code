/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPlay,
  FiPause,
  FiVolume2,
  FiVolumeX,
  FiMaximize,
  FiMinimize,
  FiChevronLeft,
  FiCheck,
  FiX,
  FiClock,
  FiAward,
  FiBook,
  FiBarChart2,
  FiBarChart,
  FiCopy,
  FiLink,
  FiFile,
  FiUsers,
  FiCalendar,
  FiAlertCircle,
  FiDownload,
  FiStar,
  FiMessageCircle
} from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import ReactPlayer from "react-player";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
const CoursePlayer = ({ courseId, setActiveView }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [currentContent, setCurrentContent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progress, setProgress] = useState({});
  const [playbackRate, setPlaybackRate] = useState(1);
  const [videoQuality, setVideoQuality] = useState("Auto");
  const [currentTime, setCurrentTime] = useState(0);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [certificateUrl, setCertificateUrl] = useState(null);
  const [courseCompleted, setCourseCompleted] = useState(false);
  const [showCopyLink, setShowCopyLink] = useState(false);
  const [copied, setCopied] = useState(false);
  const [awaitingGrading, setAwaitingGrading] = useState(false);
  const videoRef = useRef(null);
  const videoContainerRef = useRef(null);
  const youtubeIframeRef = useRef(null);
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const studentdata = JSON.parse(localStorage.getItem("studentData"));
  const [hasNextContent, setHasNextContent] = useState(false);
  // Add to your existing state variables
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const currentItem = course?.content[currentContent];
  const [showWaitingModal, setShowWaitingModal] = useState(false);

  // Get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem("studentToken");
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  };

  // Fetch course data
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await axios.get(
          `${base_url}/api/course-player/single-courses/${courseId}?user_id=${studentdata.id}`,
          getAuthHeaders()
        );
        setCourse(response.data);

        // Initialize progress and quiz answers
        const initialProgress = {};
        const initialQuizAnswers = {};

        response.data.content.forEach((item) => {
          initialProgress[item._id] = {
            completed: item.completed || false,
            progress: item.progress || 0,
            timeSpent: item.timeSpent || 0
          };

          if (item.type === "quiz" && item.answers) {
            item.answers.forEach((answer) => {
              initialQuizAnswers[answer.questionId] = answer.answer;
            });
          }
        });

        setProgress(initialProgress);
        setQuizAnswers(initialQuizAnswers);

        if (
          response.data.content[currentContent]?.type === "quiz" &&
          response.data.content[currentContent]?.completed &&
          response.data.content[currentContent]?.answers && // Check if answers exist
          response.data.content[currentContent]?.answers.length > 0 // Check if there are actual answers
        ) {
          setQuizSubmitted(true);
          setQuizScore(response.data.content[currentContent].score);
          setAwaitingGrading(
            response.data.content[currentContent].gradingStatus ===
              "partially-graded"
          );
        }
      } catch (err) {
        setActiveView("myCourses");
        setError("Failed to load course data");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id, base_url, setActiveView]);

  const isValidId = (id) => {
    return id && typeof id === "string" && id.length === 24; // Basic MongoDB ID validation
  };
  useEffect(() => {
    const recordAccess = async () => {
      try {
        if (!isValidId(courseId) || !isValidId(studentdata?.id)) {
          throw new Error("Invalid course or student ID");
        }

        const response = await axios.post(
          `${base_url}/api/course-player/${courseId}/access`,
          { user_id: studentdata.id }, // Add user_id to request body
          getAuthHeaders()
        );

        if (!response.data.success) {
          throw new Error(response.data.message || "Failed to record access");
        }
      } catch (error) {
        console.error("Access recording failed:", error.message);
        toast.error("Couldn't record course access");
      }
    };

    if (course && isValidId(courseId) && isValidId(studentdata?.id)) {
      recordAccess();
    }
  }, [course, courseId, base_url]);
  useEffect(() => {
    if (!course || !currentItem || currentItem.type !== "quiz") return;

    // If quiz is awaiting grading, poll for status updates
    if (currentItem.gradingStatus === "partially-graded" || awaitingGrading) {
      const pollInterval = setInterval(async () => {
        try {
          const response = await axios.get(
            `${base_url}/api/course-player/${courseId}/quiz-status/${currentItem._id}?user_id=${studentdata.id}`,
            getAuthHeaders()
          );

          if (response.data.success) {
            // If quiz has been graded, update state
            if (response.data.gradingStatus === "manually-graded") {
              setAwaitingGrading(false);
              setQuizScore(response.data.score);

              // Update course data with new status
              setCourse((prevCourse) => {
                const updatedContent = [...prevCourse.content];
                const contentIndex = updatedContent.findIndex(
                  (item) => item._id === currentItem._id
                );

                if (contentIndex !== -1) {
                  updatedContent[contentIndex] = {
                    ...updatedContent[contentIndex],
                    completed: response.data.completed,
                    score: response.data.score,
                    gradingStatus: response.data.gradingStatus,
                    percentage: response.data.percentage,
                    passed: response.data.passed
                  };
                }

                return {
                  ...prevCourse,
                  content: updatedContent
                };
              });

              // Update progress state
              setProgress((prev) => ({
                ...prev,
                [currentItem._id]: {
                  ...prev[currentItem._id],
                  completed: response.data.completed,
                  score: response.data.score,
                  gradingStatus: response.data.gradingStatus
                }
              }));

              // Check if course is now completed
              if (response.data.courseCompleted) {
                setCourseCompleted(true);
              }

              clearInterval(pollInterval);
            }
          }
        } catch (error) {
          console.error("Error polling quiz status:", error);
        }
      }, 10000); // Poll every 10 seconds

      return () => clearInterval(pollInterval);
    }
  }, [course, currentItem, awaitingGrading, courseId, base_url]);
  // Add this useEffect to fetch ratings with user data

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoContainerRef.current?.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const togglePlay = async () => {
    if (!videoRef.current) return;

    try {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        await videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error("Error toggling play/pause:", error);
      if (!isPlaying) {
        videoRef.current.load();
        setTimeout(() => {
          videoRef.current
            .play()
            .catch((e) => console.error("Retry play failed:", e));
        }, 300);
      }
    }
  };
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      setIsPlaying(true);
      setCurrentTime(0);
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
      }
    };
  }, [currentContent]);

  useEffect(() => {
    if (!course) return;

    const currentItem = course.content[currentContent];
    if (
      currentItem?.type === "tutorial" &&
      currentItem?.youtubeLink &&
      youtubeIframeRef.current
    ) {
      const newSrc = getYouTubeEmbedUrl(currentItem.youtubeLink);
      if (youtubeIframeRef.current.src !== newSrc) {
        youtubeIframeRef.current.src = newSrc;
      }
    }
  }, [isPlaying, isMuted, currentContent, course]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const copyMeetingLink = () => {
    const currentItem = course.content[currentContent];
    if (currentItem?.meetingLink) {
      navigator.clipboard.writeText(currentItem.meetingLink);
      setCopied(true);
      toast.success("Meeting link copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNext = async () => {
    if (!course) return;

    if (currentContent < course.content.length - 1) {
      setCurrentContent(currentContent + 1);
      setCurrentTime(0);
    }
  };

  const handlePrev = () => {
    if (currentContent > 0) {
      setCurrentContent(currentContent - 1);
      setCurrentTime(0);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setQuizAnswers((prev) => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const submitQuiz = async () => {
    if (!course) return;

    try {
      const quiz = course.content[currentContent];
      const response = await axios.post(
        `${base_url}/api/course-player/submit-quiz`,
        {
          courseId: course._id,
          contentItemId: quiz._id,
          contentItemType: quiz.type,
          answers: quizAnswers,
          user_id: studentdata.id
        },
        getAuthHeaders()
      );

      // Update state based on response
      setQuizScore(response.data.score);
      setQuizSubmitted(true);
      setCertificateUrl(response.data.certificateUrl || null);

      const isFullyGraded = response.data.gradingStatus !== "partially-graded";

      // Only mark as completed if fully graded OR if it's an auto-graded quiz that passed
      const shouldMarkCompleted =
        isFullyGraded ||
        (response.data.passed && !response.data.needsManualGrading);

      setAwaitingGrading(response.data.gradingStatus === "partially-graded");

      // Update the course state
      setCourse((prevCourse) => {
        const updatedContent = [...prevCourse.content];
        updatedContent[currentContent] = {
          ...updatedContent[currentContent],
          completed: shouldMarkCompleted,
          score: response.data.score,
          gradingStatus: response.data.gradingStatus,
          answers: response.data.answers
        };

        return {
          ...prevCourse,
          content: updatedContent
        };
      });

      setProgress((prev) => ({
        ...prev,
        [quiz._id]: {
          ...prev[quiz._id],
          completed: shouldMarkCompleted,
          progress: 100,
          gradingStatus: response.data.gradingStatus
        }
      }));

      // Check if course is now completed
      if (response.data.courseCompleted) {
        setCourseCompleted(true);
      }

      // Show success message based on grading status
      toast.success(
        response.data.passed && isFullyGraded
          ? "Quiz submitted successfully!"
          : response.data.gradingStatus === "partially-graded"
          ? "Quiz submitted - awaiting teacher grading for some questions"
          : "Quiz submitted - review your answers"
      );

      // Close modal after successful submission
      setTimeout(() => {
        setShowQuiz(false);
      }, 1500);
    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast.error("Failed to submit quiz");
    }
  };

  useEffect(() => {
    if (course) {
      setHasNextContent(currentContent < course.content.length - 1);
    }
  }, [currentContent, course]);
  const continueLearning = () => {
    setShowQuiz(false);
    setIsPlaying(true);

    // If there's next content, navigate to it
    if (hasNextContent) {
      handleNext();
    }
  };
  const closeQuiz = () => {
    setShowQuiz(false);
    setIsPlaying(true);
  };
  const calculateOverallProgress = () => {
    if (!course) return 0;

    const totalItems = course.content.length;
    const completedItems = course.content.filter((item) => {
      const progressItem = progress[item._id];

      // For quizzes, only count as completed if fully graded
      if (item.type === "quiz") {
        return (
          progressItem?.completed &&
          progressItem.gradingStatus !== "partially-graded"
        );
      }
      return progressItem?.completed || item.completed;
    }).length;

    return Math.round((completedItems / totalItems) * 100);
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleVideoClick = () => {
    setIsPlaying(!isPlaying);
  };

  const formatTime = (rawSeconds) => {
    if (!isFinite(rawSeconds) || rawSeconds < 0) return "00:00:00"; // handle invalid input

    const totalSeconds = Math.floor(rawSeconds);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const hh = String(hours).padStart(2, "0");
    const mm = String(minutes).padStart(2, "0");
    const ss = String(seconds).padStart(2, "0");

    return `${hh}:${mm}:${ss}`;
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return "";
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = match && match[2].length === 11 ? match[2] : null;

    if (!videoId) return "";

    const params = new URLSearchParams({
      controls: "1",
      modestbranding: "1",
      rel: "0",
      showinfo: "0",
      iv_load_policy: "3",
      cc_load_policy: "0",
      playsinline: "1",
      enablejsapi: "1",
      origin: window.location.origin,
      autoplay: isPlaying ? "1" : "0",
      mute: isMuted ? "1" : "0"
    });

    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  };

  const downloadCertificate = async () => {
    try {
      // Check if all content is completed
      const allCompleted = course.content.every((item) => {
        const progressItem = progress[item._id];
        return progressItem?.completed || item.completed;
      });

      if (!allCompleted) {
        toast.error(
          "Please complete all course requirements to get your certificate"
        );
        return;
      }

      // Show loading indicator
      toast.loading("Generating your certificate...");

      // Generate/download certificate
      const response = await axios.get(
        `${base_url}/api/student/certificate/${courseId}/${studentdata.id}`,
        {
          responseType: "blob" // Important for file downloads
        }
      );

      // Create blob URL for the PDF
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      // Create a temporary anchor element to trigger the download
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${course.title.replace(
          /\s+/g,
          "_"
        )}_Certificate_${studentdata.full_name.replace(/\s+/g, "_")}.pdf`
      );
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.dismiss();
      toast.success("Certificate downloaded successfully");
    } catch (error) {
      toast.dismiss();
      console.error("Certificate download error:", error);

      if (error.response?.status === 404) {
        toast.error("Certificate not available yet. Please contact support.");
      } else {
        toast.error("Failed to download certificate");
      }
    }
  };
  useEffect(() => {
    // Check if course is completed and user hasn't rated it yet
    if (courseCompleted && course && !showRatingModal) {
      const hasRated = course.ratings?.some(
        (rating) =>
          rating.user === studentdata.id || rating.user._id === studentdata.id
      );

      if (!hasRated) {
        // Show rating modal after a short delay
        const timer = setTimeout(() => {
          setShowRatingModal(true);
        }, 2000);

        return () => clearTimeout(timer);
      }
    }
  }, [courseCompleted, course, studentdata.id, showRatingModal]);
  const submitRating = async () => {
    if (rating === 0) return;

    setIsSubmittingRating(true);
    try {
      const response = await axios.post(
        `${base_url}/api/course-player/${courseId}/rate`,
        {
          rating,
          review,
          user_id: studentdata.id // Change from user.id to user_id
        },
        getAuthHeaders() // Make sure to include auth headers
      );

      if (response.data.success) {
        toast.success("Thank you for your feedback!");
        setShowRatingModal(false);
        setRating(0);
        setReview("");

        // Update course with new rating
        setCourse((prev) => ({
          ...prev,
          ratings: [
            ...prev.ratings,
            {
              user: studentdata.id,
              rating,
              review,
              createdAt: new Date()
            }
          ],
          averageRating: response.data.newAverageRating
        }));
      }
    } catch (error) {
      console.error("Error submitting rating:", error);

      // More specific error handling
      if (error.response?.status === 400) {
        toast.error(error.response.data.message || "Invalid rating data");
      } else if (error.response?.status === 404) {
        toast.error("Course not found");
      } else {
        toast.error("Failed to submit rating");
      }
    } finally {
      setIsSubmittingRating(false);
    }
  };
  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const response = await axios.get(
          `${base_url}/api/course-player/${courseId}/ratings`,
          getAuthHeaders()
        );

        if (response.data.success) {
          // Update course with populated ratings
          setCourse((prev) => ({
            ...prev,
            ratings: response.data.ratings,
            averageRating: response.data.averageRating
          }));
        }
      } catch (error) {
        console.error("Error fetching ratings:", error);
      }
    };

    if (courseId) {
      fetchRatings();
    }
  }, [courseId, base_url]);
  // Add this useEffect to properly detect course completion
  useEffect(() => {
    if (course && course.content && course.content.length > 0) {
      // Check if all content items are completed
      const allCompleted = course.content.every((item) => {
        const progressItem = progress[item._id];
        return progressItem?.completed || item.completed;
      });

      // Check if user has already rated this course
      const hasRated = course.ratings?.some(
        (rating) =>
          rating.user === studentdata.id || rating.user._id === studentdata.id
      );

      if (allCompleted && !courseCompleted) {
        setCourseCompleted(true);

        // Show rating modal after completion (if not already rated)
        if (!hasRated && !showRatingModal) {
          const timer = setTimeout(() => {
            setShowRatingModal(true);
          }, 2000);
          return () => clearTimeout(timer);
        }
      } else if (!allCompleted && courseCompleted) {
        setCourseCompleted(false);
      }
    }
  }, [course, progress, courseCompleted, showRatingModal, studentdata.id]);
  // Add this useEffect to your CoursePlayer component

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading course content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
          <div className="text-red-500 mb-4">
            <FiX size={48} className="mx-auto" />
          </div>
          <h2 className="text-xl font-bold mb-2">Error Loading Course</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => setActiveView("myCourses")}
            className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium"
          >
            <FiChevronLeft className="mr-1" /> Back to course
          </button>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No course data available</p>
        </div>
      </div>
    );
  }

  const overallProgress = calculateOverallProgress();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-full mx-auto px-6 py-4 flex justify-between items-center">
          <button
            onClick={() => setActiveView("myCourses")}
            className="flex items-center text-gray-600 hover:text-gray-800 font-medium"
          >
            <FiChevronLeft className="mr-1" /> Back to course
          </button>
        </div>
      </header>
      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Video/content area - Left side */}
        <div className="lg:w-2/3">
          <div
            ref={videoContainerRef}
            className="relative max-w-full max-h-full flex items-center justify-center"
          >
            {currentItem.type === "tutorial" && (
              <div className="w-full max-h-full max-w-full aspect-video relative bg-black rounded-xl overflow-hidden group">
                {/* Video player */}
                {currentItem.youtubeLink ? (
                  <>
                    <iframe
                      ref={youtubeIframeRef}
                      src={getYouTubeEmbedUrl(currentItem.youtubeLink)}
                      className="w-full h-full"
                      frameBorder="0"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      title={currentItem.title || "YouTube Video"}
                      onLoad={() => {
                        // Mark YouTube video as completed when it loads
                        if (
                          currentItem.type === "tutorial" &&
                          currentItem.youtubeLink
                        ) {
                          const markAsCompleted = async () => {
                            try {
                              await axios.post(
                                `${base_url}/api/course-player/${courseId}/track-tutorial-time`,
                                {
                                  contentItemId: currentItem._id,
                                  user_id: studentdata.id
                                },
                                getAuthHeaders()
                              );
                              setProgress((prev) => ({
                                ...prev,
                                [currentItem._id]: {
                                  ...prev[currentItem._id],
                                  completed: true,
                                  progress: 100
                                }
                              }));
                            } catch (error) {
                              console.error(
                                "Error marking YouTube tutorial as completed:",
                                error
                              );
                            }
                          };
                          markAsCompleted();
                        }
                      }}
                    />

                    {/* YouTube info overlay */}
                    <div className="absolute top-4 right-4 bg-black/70 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      Using YouTube controls to play/pause and adjust settings
                    </div>
                  </>
                ) : currentItem.content?.path ? (
                  <>
                    <video
                      ref={videoRef}
                      src={`${base_url}/courses/${currentItem.content.path}`}
                      className="w-full h-full object-cover"
                      autoPlay={isPlaying}
                      muted={isMuted}
                      playsInline
                      onClick={togglePlay}
                      onTimeUpdate={(e) => {
                        setCurrentTime(e.target.currentTime);
                      }}
                      onDurationChange={(e) => {
                        if (!currentItem.duration) {
                          const updatedItem = {
                            ...currentItem,
                            duration: e.target.duration
                          };
                          setCourse((prev) => ({
                            ...prev,
                            content: prev.content.map((item) =>
                              item._id === currentItem._id ? updatedItem : item
                            )
                          }));
                        }
                      }}
                      onWaiting={() => {
                        setIsPlaying(false);
                      }}
                      onPlay={() => {
                        setIsPlaying(true);
                        // Mark as completed immediately when video starts playing
                        if (currentItem.type === "tutorial") {
                          const markAsCompleted = async () => {
                            try {
                              await axios.post(
                                `${base_url}/api/course-player/${courseId}/track-tutorial-time`,
                                {
                                  contentItemId: currentItem._id,
                                  user_id: studentdata.id
                                },
                                getAuthHeaders()
                              );
                              // Update local state to reflect completion
                              setProgress((prev) => ({
                                ...prev,
                                [currentItem._id]: {
                                  ...prev[currentItem._id],
                                  completed: true,
                                  progress: 100
                                }
                              }));
                            } catch (error) {
                              console.error(
                                "Error marking tutorial as completed:",
                                error
                              );
                            }
                          };
                          markAsCompleted();
                        }
                      }}
                      onEnded={() => {
                        setProgress((prev) => ({
                          ...prev,
                          [currentItem._id]: {
                            ...prev[currentItem._id],
                            completed: true,
                            progress: 100
                          }
                        }));
                      }}
                    />

                    {/* Loading indicator only when buffering */}
                    {!isPlaying && videoRef.current?.readyState < 3 && (
                      <div className="absolute inset-0 flex items-center justify-center z-10">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white">
                    Video content not available
                  </div>
                )}

                {/* Custom controls overlay - only for non-YouTube videos */}
                {!currentItem.youtubeLink && (
                  <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4">
                    {/* Progress bar with hover time preview */}
                    <div className="relative w-full h-2 bg-gray-600 rounded-full mb-3 group/progress">
                      <div
                        className="absolute top-0 left-0 h-full bg-indigo-500 rounded-full"
                        style={{
                          width: `${
                            (currentTime / (currentItem.duration || 1)) * 100
                          }%`
                        }}
                      ></div>
                      <div className="absolute top-0 left-0 h-full w-full opacity-0 group-hover/progress:opacity-100">
                        <input
                          type="range"
                          min="0"
                          max={currentItem.duration || 1}
                          value={currentTime}
                          onChange={(e) => {
                            if (videoRef.current) {
                              videoRef.current.currentTime = e.target.value;
                              setCurrentTime(e.target.value);
                            }
                          }}
                          className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Bottom controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Play/Pause button */}
                        <button
                          onClick={() => {
                            if (videoRef.current) {
                              isPlaying
                                ? videoRef.current.pause()
                                : videoRef.current.play();
                            }
                            togglePlay();
                          }}
                          className="text-white hover:text-indigo-300 transition-colors p-2"
                        >
                          {isPlaying ? (
                            <FiPause
                              size={24}
                              className="hover:scale-110 transition-transform"
                            />
                          ) : (
                            <FiPlay
                              size={24}
                              className="hover:scale-110 transition-transform"
                            />
                          )}
                        </button>

                        {/* Volume control */}
                        <div className="flex items-center group/volume">
                          <button
                            onClick={() => {
                              if (videoRef.current) {
                                videoRef.current.muted = !isMuted;
                              }
                              toggleMute();
                            }}
                            className="text-white hover:text-indigo-300 transition-colors p-2"
                          >
                            {isMuted ? (
                              <FiVolumeX
                                size={20}
                                className="hover:scale-110 transition-transform"
                              />
                            ) : (
                              <FiVolume2
                                size={20}
                                className="hover:scale-110 transition-transform"
                              />
                            )}
                          </button>
                        </div>

                        {/* Current time */}
                        <div className="text-white text-sm font-mono">
                          {formatTime(currentTime)} /{" "}
                          {formatTime(currentItem.duration || 0)}
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        {/* Playback speed */}
                        <div className="relative group/speed">
                          <button className="text-white text-sm bg-black/50 hover:bg-black/70 px-3 py-1 rounded transition-colors">
                            {playbackRate}x
                          </button>
                          <div className="absolute bottom-full left-0 mb-2 bg-gray-800 rounded-lg shadow-lg p-2 hidden group-hover/speed:block">
                            {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                              <button
                                key={speed}
                                onClick={() => {
                                  setPlaybackRate(speed);
                                  if (videoRef.current) {
                                    videoRef.current.playbackRate = speed;
                                  }
                                }}
                                className={`block w-full text-left px-3 py-1 rounded ${
                                  playbackRate === speed
                                    ? "bg-indigo-600 text-white"
                                    : "text-gray-300 hover:bg-gray-700"
                                }`}
                              >
                                {speed}x
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Fullscreen button */}
                        <button
                          onClick={toggleFullscreen}
                          className="text-white hover:text-indigo-300 transition-colors p-2"
                        >
                          {isFullscreen ? (
                            <FiMinimize
                              size={20}
                              className="hover:scale-110 transition-transform"
                            />
                          ) : (
                            <FiMaximize
                              size={20}
                              className="hover:scale-110 transition-transform"
                            />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            {currentItem.type === "live" && (
              <div className="w-full max-h-full max-w-full aspect-video bg-gray-900 relative flex flex-col items-center justify-center p-6">
                <div className="text-center max-w-2xl">
                  <div className="bg-indigo-100 text-indigo-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiUsers size={24} />
                  </div>
                  <h2 className="text-2xl font-bold !text-white mb-2">
                    {currentItem.title}
                  </h2>
                  <div
                    className="prose prose-lg max-w-none text-sm text-gray-300 mb-6  line-clamp-1"
                    dangerouslySetInnerHTML={{
                      __html: currentItem.description
                    }}
                  />
                  {/* Show attendance status from teacher */}
                  {currentItem.attendanceStatus === "present" && (
                    <div className="mt-4 bg-green-100 text-green-800 px-4 py-2 rounded-lg">
                      <FiCheck className="inline mr-2" />
                      Attendance confirmed by teacher
                    </div>
                  )}

                  {currentItem.attendanceStatus === "absent" && (
                    <div className="mt-4 bg-red-100 text-red-800 px-4 py-2 rounded-lg">
                      <FiX className="inline mr-2" />
                      Marked absent by teacher
                    </div>
                  )}

                  {!currentItem.attendanceStatus ||
                    (currentItem.attendanceStatus === "pending" && (
                      <div className="mt-4 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg">
                        <FiClock className="inline mr-2" />
                        Attendance pending teacher confirmation
                      </div>
                    ))}

                  <div className="bg-white rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <FiCalendar className="text-indigo-600 mr-2" />
                        <span className="font-medium">
                          Scheduled:{" "}
                          {new Date(currentItem.schedule).toLocaleString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            }
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        readOnly
                        value={currentItem.meetingLink}
                        className="w-full p-3 pr-10 border border-gray-300 rounded-lg bg-gray-50"
                      />
                      <button
                        onClick={copyMeetingLink}
                        className="absolute right-2 top-2 p-2 text-indigo-600 hover:text-indigo-800"
                        title="Copy meeting link"
                      >
                        {copied ? <FiCheck /> : <FiCopy />}
                      </button>
                    </div>
                  </div>

                  <a
                    href={currentItem.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium inline-flex items-center"
                  >
                    <FiLink className="mr-2" />
                    Join Live Session
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Navigation buttons */}
          <div className="bg-white p-4 border-t border-gray-200">
            <div className="max-w-5xl mx-auto flex justify-between">
              <button
                onClick={handlePrev}
                disabled={currentContent === 0}
                className={`flex items-center px-5 py-3 rounded-lg ${
                  currentContent === 0
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <FiChevronLeft className="mr-2" /> Previous
              </button>
              <button
                onClick={handleNext}
                disabled={currentContent === course.content.length - 1}
                className={`flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors ${
                  currentContent === course.content.length - 1
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                Next Lesson{" "}
                <FiChevronLeft className="ml-2 transform rotate-180" />
              </button>
            </div>
          </div>
          {currentItem.type === "quiz" && !showQuiz && (
            <div className="bg-white p-4 border-t border-gray-200">
              <div className="max-w-5xl mx-auto flex justify-center">
                <button
                  onClick={() => {
                    setShowQuiz(true);
                    setIsPlaying(false);
                  }}
                  className="flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
                >
                  <FiBarChart2 className="mr-2" />
                  Open Quiz
                </button>
              </div>
            </div>
          )}
          {course.attachments && course.attachments.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-lg mb-4">Course Attachments</h3>
              <div className="space-y-3">
                {course.attachments.map((file) => {
                  // Calculate file size in appropriate format
                  const fileSize =
                    file.size > 0
                      ? file.size >= 1024 * 1024
                        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
                        : `${(file.size / 1024).toFixed(1)} KB`
                      : "0.0 KB";

                  // Function to handle file download
                  {
                    /* const handleDownload = async () => {
                    try {
                      // Show loading state
                      toast.loading(`Downloading ${file.filename}...`);

                      // Create a temporary link element
                      const link = document.createElement("a");
                      link.href = `${base_url}/courses/${file.path}`;
                      link.download = file.filename;
                      link.target = "_blank";
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);

                      // Dismiss loading toast and show success
                      toast.dismiss();
                      toast.success(`Download started: ${file.filename}`);
                    } catch (error) {
                      toast.dismiss();
                      toast.error("Failed to download file");
                      console.error("Download error:", error);
                    }
                  }; */
                  }
                  // Function to handle file download
                  const handleDownload = async () => {
                    try {
                      toast.loading(`Downloading ${file.filename}...`);

                      // Fetch the file as a blob
                      const response = await fetch(
                        `${base_url}/courses/${file.path}`,
                        {
                          method: "GET",
                          headers: {
                            // You can add Authorization header here if needed
                          }
                        }
                      );

                      if (!response.ok)
                        throw new Error("Network response was not ok");

                      const blob = await response.blob();
                      const url = window.URL.createObjectURL(blob);

                      // Create a temporary link
                      const link = document.createElement("a");
                      link.href = url;
                      link.download = file.filename; // Force download
                      document.body.appendChild(link);
                      link.click();

                      // Clean up
                      link.remove();
                      window.URL.revokeObjectURL(url);

                      toast.dismiss();
                      toast.success(`Download started: ${file.filename}`);
                    } catch (error) {
                      toast.dismiss();
                      toast.error("Failed to download file");
                      console.error("Download error:", error);
                    }
                  };

                  return (
                    <div
                      key={file._id}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100"
                    >
                      <div className="flex items-center flex-1">
                        <div className="p-2 bg-gray-100 rounded-lg mr-3">
                          <FiFile className="text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {file.filename}
                          </p>
                          <p className="text-xs text-gray-500">{fileSize}</p>
                        </div>
                      </div>
                      <button
                        onClick={handleDownload}
                        className="ml-3 p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors"
                        title={`Download ${file.filename}`}
                      >
                        <FiDownload className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <div className="mt-8 p-6 bg-white rounded-2xl shadow-sm border border-gray-200">
            <h3 className="font-bold text-2xl mb-6 text-gray-800">
              Student Reviews
            </h3>

            {course.averageRating > 0 ? (
              <div className="space-y-6">
                {/* Rating Summary */}
                <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl shadow-sm">
                  <div className="flex items-center">
                    <div className="text-4xl font-bold text-yellow-500 mr-4">
                      {course.averageRating &&
                      typeof course.averageRating === "number" ? (
                        <div className="text-4xl font-bold text-yellow-500 mr-4">
                          {course.averageRating.toFixed(1)}
                        </div>
                      ) : (
                        <div className="text-4xl font-bold text-gray-400 mr-4">
                          0.0
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex mb-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={`text-xl ${
                              star <= Math.round(course.averageRating || 0)
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <p className="text-sm text-gray-600">
                        Based on {course.ratings?.length || 0} reviews
                      </p>
                    </div>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {course.averageRating &&
                      typeof course.averageRating === "number"
                        ? course.averageRating.toFixed(1)
                        : "0.0"}
                    </span>
                  </div>
                </div>

                {/* Reviews Carousel */}
                {course.ratings?.length > 0 && (
                  <div className="relative overflow-hidden">
                    <div className="flex space-x-6 py-4 carousel-container">
                      {/* Duplicate reviews for infinite effect */}
                      {[...course.ratings, ...course.ratings]
                        .slice(0, 20)
                        .map((rating, index) => (
                          <div
                            key={`${rating._id}-${index}`}
                            className="flex-shrink-0 w-80 bg-white rounded-2xl shadow-lg border border-gray-100 p-6 carousel-item"
                          >
                            {/* Student Info */}
                            <div className="flex items-center mb-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center mr-3">
                                {rating.user?.profile_picture ? (
                                  <img
                                    src={`${base_url}/students/${rating.user.profile_picture}`}
                                    alt={rating.user.full_name || "Student"}
                                    className="w-12 h-12 rounded-full object-cover"
                                    onError={(e) => {
                                      e.target.style.display = "none";
                                      e.target.nextSibling.style.display =
                                        "flex";
                                    }}
                                  />
                                ) : (
                                  <span className="text-white font-bold text-lg">
                                    {rating.user?.full_name
                                      ?.charAt(0)
                                      ?.toUpperCase() ||
                                      (typeof rating.user === "string"
                                        ? "S"
                                        : "A")}
                                  </span>
                                )}
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-800">
                                  {typeof rating.user === "object"
                                    ? rating.user?.full_name ||
                                      "Anonymous Student"
                                    : "Anonymous Student"}
                                </h4>
                                <div className="flex items-center">
                                  <div className="flex text-yellow-400 mr-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <span key={star} className="text-sm">
                                        {star <= rating.rating ? "★" : "☆"}
                                      </span>
                                    ))}
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    {rating.createdAt
                                      ? new Date(
                                          rating.createdAt
                                        ).toLocaleDateString()
                                      : "Recent"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Review Text */}
                            <div className="bg-gray-50 rounded-xl p-4">
                              <p className="text-gray-700 text-sm leading-relaxed">
                                {rating.review && rating.review.trim() !== ""
                                  ? rating.review.length > 120
                                    ? `${rating.review.substring(0, 120)}...`
                                    : rating.review
                                  : "Awesome Course! Loved it"}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>

                    {/* Gradient Overlays */}
                    <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10"></div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-2xl">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiStar className="text-gray-400 w-8 h-8" />
                </div>
                <p className="text-gray-500 text-lg">No reviews yet</p>
                <p className="text-gray-400 text-sm mt-1">
                  Be the first to share your experience!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Content tracking - Right side */}
        <div className="lg:w-1/3 bg-white border-l border-gray-200 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Course Content</h2>
              <div className="text-sm text-gray-600">
                {overallProgress}% complete
              </div>
            </div>
            <div className="mb-6">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full"
                  style={{ width: `${overallProgress}%` }}
                ></div>
              </div>
            </div>
            <div className="space-y-2">
              {course.content.map((item, index) => (
                <motion.div
                  key={item._id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 rounded-xl cursor-pointer border transition-all ${
                    currentContent === index
                      ? "border-indigo-300 bg-indigo-50"
                      : "border-gray-200 hover:border-gray-300"
                  } ${
                    progress[item._id]?.completed
                      ? "bg-green-50 border-green-200" // Green for completed items
                      : progress[item._id]?.gradingStatus ===
                          "partially-graded" ||
                        item.gradingStatus === "partially-graded"
                      ? "bg-yellow-50 border-yellow-200" // Yellow for quizzes awaiting grading
                      : ""
                  }`}
                  onClick={() => {
                    setCurrentContent(index);
                    if (item.type === "quiz") {
                      // Check if quiz is already completed - don't open modal if completed
                      if (item.completed || progress[item._id]?.completed) {
                        // Don't open the modal for completed quizzes
                        setShowQuiz(false);
                        return;
                      }

                      // Check if quiz is awaiting grading
                      if (
                        (progress[item._id]?.gradingStatus ===
                          "partially-graded" ||
                          item.gradingStatus === "partially-graded") &&
                        !progress[item._id]?.completed
                      ) {
                        setShowWaitingModal(true);
                        setShowQuiz(false);
                        return;
                      }

                      const isDifferentQuiz = currentContent !== index;
                      const isCurrentQuizCompleted = item.completed;

                      if (isDifferentQuiz || !isCurrentQuizCompleted) {
                        setQuizSubmitted(false);
                        setQuizAnswers({});
                        setQuizScore(null);
                        setAwaitingGrading(false);
                      }
                      setShowQuiz(true);
                      setIsPlaying(false);
                    } else {
                      setShowQuiz(false);
                      setIsPlaying(true);
                    }
                  }}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 relative">
                      {progress[item._id]?.completed ? (
                        // Green checkmark for completed items
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                          <FiCheck className="text-green-600 text-lg" />
                        </div>
                      ) : progress[item._id]?.gradingStatus ===
                          "partially-graded" ||
                        item.gradingStatus === "partially-graded" ? (
                        <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                          <FiAlertCircle className="text-yellow-600 text-lg" />
                        </div>
                      ) : (
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            currentContent === index
                              ? "bg-indigo-100 text-indigo-600"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {item.type === "quiz" ? (
                            <FiBarChart2 />
                          ) : item.type === "live" ? (
                            <FiUsers />
                          ) : (
                            <FiPlay className="ml-1" />
                          )}
                        </div>
                      )}
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex justify-between items-center space-x-2">
                        <h3
                          className={`font-semibold text-xl ${
                            currentContent === index
                              ? "text-indigo-700"
                              : "text-gray-800"
                          } transition-colors duration-300 ease-in-out hover:text-indigo-600 w-[300px]`} // Adjust the width as needed
                        >
                          {item.title}
                        </h3>

                        {item.type === "quiz" && (
                          <span className="text-xs text-gray-600 flex items-center">
                            <FiBarChart className="mr-1 text-gray-400 transition-transform duration-300 ease-in-out transform hover:rotate-180" />
                            <span className="text-gray-600">
                              {item.questions?.length || 0} questions
                            </span>
                          </span>
                        )}
                      </div>

                      <div
                        className="prose prose-lg max-w-none text-sm text-gray-600 mt-1  line-clamp-1"
                        dangerouslySetInnerHTML={{
                          __html: item.description
                        }}
                      />
                      {item.type === "tutorial" && (
                        <span className="inline-block mt-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Tutorial Video
                        </span>
                      )}
                      {item.type === "quiz" && (
                        <span className="inline-block mt-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                          Quiz
                        </span>
                      )}
                      {item.type === "live" && (
                        <span className="inline-block mt-2 text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
                          Live Class
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            {calculateOverallProgress() === 100 && courseCompleted && (
              <div className="mt-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
                <div className="flex items-center">
                  <div className="bg-white/20 p-3 rounded-full mr-4">
                    <FiAward size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg !text-white">
                      Course Completed!
                    </h3>
                    <p className="text-sm opacity-90">
                      Congratulations on finishing this course!
                    </p>
                  </div>
                </div>
                <button
                  onClick={downloadCertificate}
                  className="mt-4 w-full bg-white text-indigo-600 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  Download Certificate
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Quiz Modal */}
      <AnimatePresence>
        {showQuiz && currentItem?.type === "quiz" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden"
            >
              <div className="p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {currentItem.title}
                    </h2>
                    {currentItem.description && (
                      <div
                        className="prose prose-lg max-w-none text-sm text-gray-600 mt-1 line-clamp-1"
                        dangerouslySetInnerHTML={{
                          __html: currentItem.description
                        }}
                      />
                    )}
                  </div>
                  <button
                    onClick={closeQuiz}
                    className="text-gray-500 hover:text-gray-700 p-2 transition-colors"
                  >
                    <FiX size={24} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {!quizSubmitted && !currentItem.completed ? (
                  <div className="p-6">
                    <div className="space-y-8">
                      {currentItem.questions?.map((question, qIndex) => (
                        <div
                          key={question._id}
                          className="bg-white rounded-lg border border-gray-200 p-6"
                        >
                          <div className="flex items-start mb-4">
                            <div className="bg-indigo-100 text-indigo-800 w-8 h-8 rounded-full flex items-center justify-center font-medium mr-4 flex-shrink-0">
                              {qIndex + 1}
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-medium text-gray-900">
                                {question.question}
                              </h3>
                              <p className="text-sm text-gray-500 mt-1">
                                {question.marks} mark
                                {question.marks !== 1 ? "s" : ""}
                              </p>
                            </div>
                          </div>

                          {question.type === "mcq-single" && (
                            <div className="space-y-3 ml-12">
                              {question.options?.map((option, oIndex) => (
                                <label
                                  key={oIndex}
                                  className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer transition-all hover:border-indigo-300 hover:bg-indigo-50"
                                >
                                  <input
                                    type="radio"
                                    name={`question-${question._id}`}
                                    checked={
                                      quizAnswers[question._id] === oIndex
                                    }
                                    onChange={() =>
                                      handleAnswerChange(question._id, oIndex)
                                    }
                                    className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                  />
                                  <span className="text-gray-700">
                                    {option}
                                  </span>
                                </label>
                              ))}
                            </div>
                          )}

                          {question.type === "mcq-multiple" && (
                            <div className="space-y-3 ml-12">
                              {question.options?.map((option, oIndex) => (
                                <label
                                  key={oIndex}
                                  className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer transition-all hover:border-indigo-300 hover:bg-indigo-50"
                                >
                                  <input
                                    type="checkbox"
                                    checked={(
                                      quizAnswers[question._id] || []
                                    ).includes(oIndex)}
                                    onChange={() => {
                                      const currentAnswers =
                                        quizAnswers[question._id] || [];
                                      const newAnswers =
                                        currentAnswers.includes(oIndex)
                                          ? currentAnswers.filter(
                                              (a) => a !== oIndex
                                            )
                                          : [...currentAnswers, oIndex];
                                      handleAnswerChange(
                                        question._id,
                                        newAnswers
                                      );
                                    }}
                                    className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                  />
                                  <span className="text-gray-700">
                                    {option}
                                  </span>
                                </label>
                              ))}
                            </div>
                          )}

                          {(question.type === "short-answer" ||
                            question.type === "broad-answer") && (
                            <div className="ml-12">
                              {question.type === "short-answer" ? (
                                <textarea
                                  value={quizAnswers[question._id] || ""}
                                  onChange={(e) =>
                                    handleAnswerChange(
                                      question._id,
                                      e.target.value
                                    )
                                  }
                                  className="w-full p-4 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
                                  rows={4}
                                  placeholder="Type your answer here..."
                                />
                              ) : (
                                <div className="mb-8">
                                  <ReactQuill
                                    theme="snow"
                                    value={quizAnswers[question._id] || ""}
                                    onChange={(value) =>
                                      handleAnswerChange(question._id, value)
                                    }
                                    placeholder="Type your detailed answer here..."
                                    modules={{
                                      toolbar: [
                                        ["bold", "italic", "underline"],
                                        [
                                          { list: "ordered" },
                                          { list: "bullet" }
                                        ],
                                        ["clean"]
                                      ]
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-8">
                    {currentItem.gradingStatus === "partially-graded" ||
                    awaitingGrading ? (
                      <div className="text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full mb-6">
                          <FiClock className="text-yellow-600 text-3xl" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                          Quiz Submitted for Grading
                        </h3>
                        <p className="text-gray-600 mb-6 text-lg">
                          Your quiz has been submitted and is awaiting teacher
                          grading. You will be notified when grading is
                          complete.
                        </p>
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 max-w-2xl mx-auto">
                          <div className="flex">
                            <div className="flex-shrink-0">
                              <FiAlertCircle className="h-5 w-5 text-yellow-400" />
                            </div>
                            <div className="ml-3">
                              <p className="text-sm text-yellow-700">
                                <strong>Note:</strong> Your course cannot be
                                completed until all quizzes are graded by your
                                teacher.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-8">
                        <div className="text-center">
                          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                            <FiCheck className="text-green-600 text-3xl" />
                          </div>
                          <div className="text-4xl font-bold text-gray-900 mb-2">
                            {currentItem.score || quizScore}/
                            {currentItem.questions?.reduce(
                              (total, q) => total + (q.marks || 1),
                              0
                            ) || 0}
                          </div>
                          <p className="text-xl text-gray-600 mb-8">
                            {(currentItem.score || quizScore) ===
                            (currentItem.questions?.reduce(
                              (total, q) => total + (q.marks || 1),
                              0
                            ) || 0)
                              ? "Perfect score! 🎉"
                              : (currentItem.score || quizScore) >=
                                (currentItem.questions?.reduce(
                                  (total, q) => total + (q.marks || 1),
                                  0
                                ) || 0) /
                                  2
                              ? "Well done! You passed! ✅"
                              : "Keep practicing! You'll do better next time. 💪"}
                          </p>
                        </div>

                        {currentItem.gradingStatus === "manually-graded" && (
                          <div className="space-y-6">
                            <h4 className="text-xl font-semibold text-gray-900 border-b pb-2">
                              Quiz Review
                            </h4>
                            {currentItem.questions?.map((question, qIndex) => {
                              const userAnswer = quizAnswers[question._id];
                              const answerRecord = currentItem.answers?.find(
                                (a) => a.questionId === question._id
                              );
                              const isCorrect = answerRecord?.isCorrect;
                              const marksObtained =
                                answerRecord?.marksObtained || 0;
                              const maxMarks = question.marks || 1;

                              return (
                                <div
                                  key={question._id}
                                  className={`border rounded-xl p-6 ${
                                    isCorrect
                                      ? "border-green-200 bg-green-50"
                                      : "border-red-200 bg-red-50"
                                  }`}
                                >
                                  <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center">
                                      <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center font-medium mr-3 ${
                                          isCorrect
                                            ? "bg-green-100 text-green-800"
                                            : "bg-red-100 text-red-800"
                                        }`}
                                      >
                                        {qIndex + 1}
                                      </div>
                                      <h5 className="text-lg font-medium text-gray-900">
                                        {question.question}
                                      </h5>
                                    </div>
                                    <div
                                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                                        isCorrect
                                          ? "bg-green-100 text-green-800"
                                          : "bg-red-100 text-red-800"
                                      }`}
                                    >
                                      {marksObtained}/{maxMarks}
                                    </div>
                                  </div>

                                  <div className="space-y-3 ml-11">
                                    <div className="bg-white p-4 rounded-lg border">
                                      <p className="text-sm font-medium text-gray-700 mb-1">
                                        Your answer:
                                      </p>
                                      <div
                                        className="prose prose-lg max-w-none text-sm text-gray-900"
                                        dangerouslySetInnerHTML={{
                                          __html: Array.isArray(userAnswer)
                                            ? userAnswer
                                                .map((a) => question.options[a])
                                                .join(", ")
                                            : question.type === "mcq-single"
                                            ? question.options[userAnswer] ||
                                              "No answer provided"
                                            : userAnswer || "No answer provided"
                                        }}
                                      />
                                    </div>

                                    <div className="bg-white p-4 rounded-lg border">
                                      <p className="text-sm font-medium text-gray-700 mb-1">
                                        {question.type === "mcq-single" ||
                                        question.type === "mcq-multiple"
                                          ? "Correct answer:"
                                          : "Expected answer:"}
                                      </p>
                                      <div
                                        className="prose prose-lg max-w-none text-sm text-gray-900"
                                        dangerouslySetInnerHTML={{
                                          __html: Array.isArray(
                                            question.correctAnswer
                                          )
                                            ? question.correctAnswer
                                                .map((a) => question.options[a])
                                                .join(", ")
                                            : question.type === "mcq-single"
                                            ? question.options[
                                                question.correctAnswer
                                              ]
                                            : question.expectedAnswer ||
                                              question.correctAnswer ||
                                              "No expected answer provided"
                                        }}
                                      />
                                    </div>

                                    {answerRecord?.teacherFeedback && (
                                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                        <p className="text-sm font-medium text-blue-700 mb-1">
                                          Teacher feedback:
                                        </p>
                                        <p className="text-blue-900">
                                          {answerRecord.teacherFeedback}
                                        </p>
                                      </div>
                                    )}

                                    {question.explanation && (
                                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <p className="text-sm font-medium text-gray-700 mb-1">
                                          Explanation:
                                        </p>
                                        <p className="text-gray-900">
                                          {question.explanation}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {!quizSubmitted && !currentItem.completed ? (
                <div className="p-6 border-t border-gray-200 bg-gray-50 sticky bottom-0">
                  <div className="flex justify-end">
                    <button
                      onClick={submitQuiz}
                      className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors shadow-sm"
                    >
                      Submit Quiz
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 border-t border-gray-200 bg-gray-50 sticky bottom-0">
                  <div className="flex justify-center">
                    <button
                      onClick={continueLearning}
                      className="px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-colors shadow-sm"
                    >
                      {hasNextContent ? "Continue Learning" : "Close Quiz"}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Rating Modal */}
      <AnimatePresence>
        {showRatingModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                  <FiAward className="text-indigo-600 text-2xl" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Course Completed!</h2>
                <p className="text-gray-600 mb-6">
                  Congratulations on completing "{course.title}"! Please share
                  your experience.
                </p>

                {/* Star Rating */}
                <div className="flex justify-center mb-6">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="text-2xl p-1 focus:outline-none"
                    >
                      {star <= (hoverRating || rating) ? (
                        <span className="text-yellow-400">★</span>
                      ) : (
                        <span className="text-gray-300">☆</span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Review Textarea */}
                <div className="mb-6">
                  <textarea
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder="Share your thoughts about this course (optional)"
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    rows={4}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowRatingModal(false);
                      setRating(0);
                      setReview("");
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    disabled={isSubmittingRating}
                  >
                    Maybe Later
                  </button>
                  <button
                    onClick={submitRating}
                    disabled={rating === 0 || isSubmittingRating}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmittingRating ? "Submitting..." : "Submit Review"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Waiting for Grading Modal */}
      <AnimatePresence>
        {showWaitingModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                  <FiClock className="text-yellow-600 text-2xl" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Quiz Under Review</h2>
                <p className="text-gray-600 mb-6">
                  Your quiz submission is being reviewed by the instructor.
                  Please check back later for your results.
                </p>
                <button
                  onClick={() => setShowWaitingModal(false)}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  OK
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CoursePlayer;
