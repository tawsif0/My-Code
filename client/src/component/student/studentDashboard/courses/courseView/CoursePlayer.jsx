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
  FiUser,
  FiUsers,
  FiCalendar,
  FiAlertCircle,
} from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import ReactPlayer from "react-player";

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
  const [timeWatched, setTimeWatched] = useState(0); // Track time watched in seconds
  const [lastTrackedTime, setLastTrackedTime] = useState(0); // Last time we sent to backend
  const videoRef = useRef(null);
  const videoContainerRef = useRef(null);
  const youtubeIframeRef = useRef(null);
  const timeTrackingInterval = useRef(null);
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const studentdata = JSON.parse(localStorage.getItem("studentData"));
  const [hasNextContent, setHasNextContent] = useState(false);
  // Get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem("authToken");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
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
            timeSpent: item.timeSpent || 0,
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
    if (!course) return;

    const currentItem = course.content[currentContent];

    if (currentItem?.type === "quiz") {
      // Only auto-open if it's a new quiz navigation, not when reopening
      if (!showQuiz) {
        setShowQuiz(true);
      }
      setIsPlaying(false);

      // Only set as submitted if it's actually completed with answers
      if (
        currentItem?.completed &&
        currentItem?.answers &&
        currentItem.answers.length > 0
      ) {
        setQuizSubmitted(true);
        setQuizScore(currentItem.score);
        setAwaitingGrading(currentItem.gradingStatus === "partially-graded");

        // Pre-populate answers if already submitted
        const submittedAnswers = {};
        currentItem.answers.forEach((answer) => {
          submittedAnswers[answer.questionId] = answer.answer;
        });
        setQuizAnswers(submittedAnswers);
      } else {
        // Only reset quiz state if not completed
        if (!currentItem.completed) {
          setQuizSubmitted(false);
          setQuizAnswers({});
          setQuizScore(null);
          setAwaitingGrading(false);
        }
      }
    } else {
      setShowQuiz(false);
      setIsPlaying(true);
    }
  }, [currentContent, course]);

  useEffect(() => {
    if (!course) return;

    const currentItem = course.content[currentContent];
    if (!currentItem || currentItem.type === "quiz") return;

    if (isPlaying) {
      timeTrackingInterval.current = setInterval(() => {
        setTimeWatched((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timeTrackingInterval.current);
    }

    return () => {
      clearInterval(timeTrackingInterval.current);
    };
  }, [isPlaying, currentContent, course]);

  // Send time updates to backend periodically
  useEffect(() => {
    if (!course || timeWatched <= lastTrackedTime) return;

    const currentItem = course.content[currentContent];
    if (!currentItem || currentItem.type === "quiz") return;

    const shouldSendUpdate =
      timeWatched - lastTrackedTime >= 10 ||
      (timeWatched > 0 && timeWatched !== lastTrackedTime);

    if (shouldSendUpdate) {
      const trackTime = async (courseId) => {
        await axios.post(
          `${base_url}/api/course-player/${courseId}/track-video-time`,
          {
            contentItemId: currentItem._id,
            secondsWatched: timeWatched,
            totalDuration: currentItem.duration || 0,
            user_id: studentdata.id,
          },
          getAuthHeaders()
        );
        setLastTrackedTime(timeWatched);
      };

      trackTime(courseId);
    }
  }, [timeWatched, lastTrackedTime, currentContent, course, id, base_url]);

  useEffect(() => {
    return () => {
      if (timeWatched > lastTrackedTime) {
        const currentItem = course?.content[currentContent];
        if (currentItem && currentItem.type !== "quiz") {
          axios
            .post(
              `${base_url}/api/course-player/${id}/track-video-time`,
              {
                contentItemId: currentItem._id,
                secondsWatched: timeWatched,
                totalDuration: currentItem.duration || 0,
                user_id: studentdata.id,
              },
              getAuthHeaders()
            )
            .catch((error) => {
              console.error("Error tracking final watch time:", error);
            });
        }
      }
      clearInterval(timeTrackingInterval.current);
    };
  }, [currentContent]);

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
      setTimeWatched(0);
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
      const currentItem = course.content[currentContent];
      try {
        await axios.post(
          `${base_url}/api/course-player/${id}/track-video-time`,
          {
            contentItemId: currentItem._id,
            secondsWatched: timeWatched,
            totalDuration: currentItem.duration || 0,
            user_id: studentdata.id,
          },
          getAuthHeaders()
        );
      } catch (error) {
        console.error("Error tracking progress:", error);
      }

      setCurrentContent(currentContent + 1);
      setCurrentTime(0);
      setTimeWatched(0);
      setLastTrackedTime(0);
      setProgress((prev) => ({
        ...prev,
        [currentItem._id]: {
          ...prev[currentItem._id],
          completed: true,
          progress: 100,
        },
      }));
    }
  };

  const handlePrev = () => {
    if (currentContent > 0) {
      setCurrentContent(currentContent - 1);
      setCurrentTime(0);
      setTimeWatched(0);
      setLastTrackedTime(0);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setQuizAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
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
          user_id: studentdata.id,
        },
        getAuthHeaders()
      );

      // Update state based on response
      setQuizScore(response.data.score);
      setQuizSubmitted(true);
      setCertificateUrl(response.data.certificateUrl || null);

      const isFullyGraded = response.data.gradingStatus !== "partially-graded";
      setCourseCompleted(isFullyGraded && response.data.courseCompleted);
      setAwaitingGrading(response.data.gradingStatus === "partially-graded");

      // Update the course state to reflect the quiz completion
      setCourse((prevCourse) => {
        const updatedContent = [...prevCourse.content];
        updatedContent[currentContent] = {
          ...updatedContent[currentContent],
          completed: true,
          score: response.data.score,
          gradingStatus: response.data.gradingStatus,
          answers: response.data.answers,
        };

        return {
          ...prevCourse,
          content: updatedContent,
        };
      });

      setProgress((prev) => ({
        ...prev,
        [quiz._id]: {
          ...prev[quiz._id],
          completed: true,
          progress: 100,
        },
      }));

      // Show success message based on grading status
      toast.success(
        response.data.passed && isFullyGraded
          ? "Quiz submitted successfully!"
          : response.data.gradingStatus === "partially-graded"
          ? "Quiz submitted - awaiting teacher grading for some questions"
          : "Quiz submitted - review your answers"
      );
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
    const completedItems = Object.values(progress).filter(
      (item) => item?.completed
    ).length;
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
      mute: isMuted ? "1" : "0",
    });

    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  };

  const downloadCertificate = async (courseId) => {
    try {
      // Check if course is actually completed (not just progress 100%)
      if (!courseCompleted) {
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
          responseType: "blob", // Important for file downloads
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
      toast.error("Failed to download certificate");
      console.error("Certificate download error:", error);
    }
  };

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

  const currentItem = course.content[currentContent];
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
                        setTimeWatched(Math.floor(e.target.currentTime));
                      }}
                      onDurationChange={(e) => {
                        if (!currentItem.duration) {
                          const updatedItem = {
                            ...currentItem,
                            duration: e.target.duration,
                          };
                          setCourse((prev) => ({
                            ...prev,
                            content: prev.content.map((item) =>
                              item._id === currentItem._id ? updatedItem : item
                            ),
                          }));
                        }
                      }}
                      onWaiting={() => {
                        setIsPlaying(false);
                      }}
                      onPlaying={() => {
                        setIsPlaying(true);
                      }}
                      onEnded={() => {
                        setProgress((prev) => ({
                          ...prev,
                          [currentItem._id]: {
                            ...prev[currentItem._id],
                            completed: true,
                            progress: 100,
                          },
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
                    {/* Top bar with filename and watch time */}
                    <div className="flex justify-between items-center mb-2">
                      {currentItem.content?.filename && (
                        <div className="text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full truncate max-w-[70%]">
                          {currentItem.content.filename}
                        </div>
                      )}
                      <div className="text-white text-sm bg-black/50 px-3 py-1 rounded-full">
                        Watched: {formatTime(timeWatched)} /
                        {formatTime(currentItem.duration || 0)}
                      </div>
                    </div>

                    {/* Progress bar with hover time preview */}
                    <div className="relative w-full h-2 bg-gray-600 rounded-full mb-3 group/progress">
                      <div
                        className="absolute top-0 left-0 h-full bg-indigo-500 rounded-full"
                        style={{
                          width: `${
                            (currentTime / (currentItem.duration || 1)) * 100
                          }%`,
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
                  <p className="text-gray-300 mb-6">
                    {currentItem.description.replace(/<[^>]+>/g, "")}
                  </p>

                  {/* Add attendance status display here */}
                  {currentItem.attendanceStatus && (
                    <div className="mb-4">
                      <span
                        className={`px-4 py-2 rounded-full text-sm font-medium ${
                          currentItem.attendanceStatus === "present"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {currentItem.attendanceStatus === "present"
                          ? "Present"
                          : "Absent"}
                      </span>
                    </div>
                  )}

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
                              minute: "2-digit",
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
                  onClick={() => {
                    setCurrentContent(index);
                    setTimeWatched(0);
                    setLastTrackedTime(0);

                    // Only reset quiz state if it's a different quiz OR if current quiz hasn't been submitted
                    if (item.type === "quiz") {
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
                  className={`p-4 rounded-xl cursor-pointer border transition-all ${
                    currentContent === index
                      ? "border-indigo-300 bg-indigo-50"
                      : "border-gray-200 hover:border-gray-300"
                  } ${
                    progress[item._id]?.completed
                      ? item.type === "quiz" &&
                        item.gradingStatus === "partially-graded"
                        ? "bg-yellow-50 border-yellow-200" // Yellow for quizzes awaiting grading
                        : "bg-green-50 border-green-200" // Green for completed items and fully graded quizzes
                      : ""
                  }`}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 relative">
                      {progress[item._id]?.completed ? (
                        // Show different icons based on grading status for quizzes
                        item.type === "quiz" &&
                        item.gradingStatus === "partially-graded" ? (
                          // Yellow alert icon for quizzes awaiting grading
                          <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                            <FiAlertCircle className="text-yellow-600 text-lg" />
                          </div>
                        ) : (
                          // Green checkmark for completed items and fully graded quizzes
                          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                            <FiCheck className="text-green-600 text-lg" />
                          </div>
                        )
                      ) : (
                        // Default icon for incomplete items
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

                      <p className="text-sm text-gray-600 mt-1">
                        {item.description.replace(/<[^>]+>/g, "")}
                      </p>
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

            {overallProgress === 100 && courseCompleted && (
              <div className="mt-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
                <div className="flex items-center">
                  <div className="bg-white/20 p-3 rounded-full mr-4">
                    <FiAward size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Course Completed!</h3>
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
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">{currentItem.title}</h2>
                    <p className="text-gray-600">
                      {currentItem.description.replace(/<[^>]+>/g, "")}
                    </p>
                  </div>
                  <button
                    onClick={closeQuiz}
                    className="text-gray-500 hover:text-gray-700 p-2"
                  >
                    <FiX size={24} />
                  </button>
                </div>

                {!quizSubmitted && !currentItem.completed ? (
                  <div className="space-y-8">
                    {currentItem.questions?.map((question, qIndex) => {
                      const previousAnswer = currentItem.answers?.find(
                        (a) => a.questionId === question._id
                      );
                      const isSubmitted = quizSubmitted || previousAnswer;

                      return (
                        <div key={question._id} className="mb-6">
                          <div className="flex items-start mb-4">
                            <div className="bg-indigo-100 text-indigo-800 w-8 h-8 rounded-full flex items-center justify-center font-medium mr-3 flex-shrink-0">
                              {qIndex + 1}
                            </div>
                            <div>
                              <h3 className="text-lg font-medium mt-1">
                                {question.question}
                              </h3>
                              <p className="text-sm text-gray-500 mt-1">
                                {question.marks} mark
                                {question.marks !== 1 ? "s" : ""}
                              </p>
                              {previousAnswer && (
                                <div
                                  className={`mt-2 text-sm p-2 rounded ${
                                    previousAnswer.isCorrect
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  Your previous answer:{" "}
                                  {Array.isArray(previousAnswer.answer)
                                    ? previousAnswer.answer
                                        .map((a) => question.options[a])
                                        .join(", ")
                                    : question.type === "mcq-single"
                                    ? question.options[previousAnswer.answer]
                                    : previousAnswer.answer}
                                </div>
                              )}
                            </div>
                          </div>

                          {question.type === "mcq-single" && (
                            <div className="space-y-3 ml-11">
                              {question.options?.map((option, oIndex) => {
                                const isChecked =
                                  quizAnswers[question._id] === oIndex ||
                                  previousAnswer?.answer === oIndex;
                                const isCorrectAnswer =
                                  question.correctAnswer === oIndex;

                                return (
                                  <label
                                    key={oIndex}
                                    className={`flex items-center space-x-3 p-4 border rounded-xl cursor-pointer transition-colors ${
                                      isChecked
                                        ? previousAnswer?.isCorrect
                                          ? "border-green-500 bg-green-50"
                                          : "border-indigo-500 bg-indigo-50"
                                        : isCorrectAnswer && previousAnswer
                                        ? "border-green-500 bg-green-50"
                                        : "border-gray-200 hover:border-gray-400"
                                    } ${previousAnswer ? "opacity-70" : ""}`}
                                  >
                                    <input
                                      type="radio"
                                      name={`question-${question._id}`}
                                      checked={isChecked}
                                      onChange={() =>
                                        !previousAnswer &&
                                        handleAnswerChange(question._id, oIndex)
                                      }
                                      disabled={!!previousAnswer}
                                      className="h-5 w-5 text-indigo-600 focus:border-indigo-500"
                                    />
                                    <span>{option}</span>
                                    {previousAnswer && isCorrectAnswer && (
                                      <span className="ml-auto text-green-600">
                                        <FiCheck />
                                      </span>
                                    )}
                                  </label>
                                );
                              })}
                            </div>
                          )}

                          {question.type === "mcq-multiple" && (
                            <div className="space-y-3 ml-11">
                              {question.options?.map((option, oIndex) => {
                                const isChecked =
                                  (quizAnswers[question._id] || []).includes(
                                    oIndex
                                  ) || previousAnswer?.answer?.includes(oIndex);
                                const isCorrectAnswer =
                                  question.correctAnswer?.includes(oIndex);

                                return (
                                  <label
                                    key={oIndex}
                                    className={`flex items-center space-x-3 p-4 border rounded-xl cursor-pointer transition-colors ${
                                      isChecked
                                        ? previousAnswer?.isCorrect
                                          ? "border-green-500 bg-green-50"
                                          : "border-indigo-500 bg-indigo-50"
                                        : isCorrectAnswer && previousAnswer
                                        ? "border-green-500 bg-green-50"
                                        : "border-gray-200 hover:border-gray-400"
                                    } ${previousAnswer ? "opacity-70" : ""}`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => {
                                        if (!previousAnswer) {
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
                                        }
                                      }}
                                      disabled={!!previousAnswer}
                                      className="h-5 w-5 text-indigo-600 focus:border-indigo-500"
                                    />
                                    <span>{option}</span>
                                    {previousAnswer && isCorrectAnswer && (
                                      <span className="ml-auto text-green-600">
                                        <FiCheck />
                                      </span>
                                    )}
                                  </label>
                                );
                              })}
                            </div>
                          )}

                          {(question.type === "short-answer" ||
                            question.type === "broad-answer") && (
                            <div className="ml-11">
                              <textarea
                                value={
                                  quizAnswers[question._id] ||
                                  previousAnswer?.answer ||
                                  ""
                                }
                                onChange={(e) =>
                                  !previousAnswer &&
                                  handleAnswerChange(
                                    question._id,
                                    e.target.value
                                  )
                                }
                                disabled={!!previousAnswer}
                                className={`w-full p-4 border rounded-lg  focus:border-indigo-500 ${
                                  previousAnswer
                                    ? previousAnswer.isCorrect
                                      ? "border-green-500 bg-green-50"
                                      : "border-red-500 bg-red-50"
                                    : "border-gray-300"
                                }`}
                                rows={question.type === "short-answer" ? 4 : 6}
                                placeholder={
                                  previousAnswer
                                    ? "Your previous answer is shown above"
                                    : question.type === "short-answer"
                                    ? "Type your answer here..."
                                    : "Type your detailed answer here..."
                                }
                              />
                              {previousAnswer && (
                                <div className="mt-2 p-2 bg-blue-50 rounded-lg text-sm text-blue-800">
                                  <span className="font-medium">
                                    Correct answer:
                                  </span>{" "}
                                  {question.correctAnswer}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    <div className="flex justify-end mt-8">
                      <button
                        onClick={submitQuiz}
                        className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
                      >
                        Submit Quiz
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    {currentItem.gradingStatus === "partially-graded" ||
                    awaitingGrading ? (
                      <>
                        <div className="inline-flex items-center justify-center w-24 h-24 bg-yellow-100 rounded-full mb-6">
                          <FiAlertCircle className="text-yellow-600 text-4xl" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4">
                          Quiz Submitted for Grading
                        </h3>
                        <p className="text-gray-600 mb-6">
                          Some of your answers require teacher review. We'll
                          notify you when grading is complete.
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6">
                          <FiCheck className="text-green-600 text-4xl" />
                        </div>
                        <div className="text-4xl font-bold mb-2">
                          {currentItem.score || quizScore}/
                          {currentItem.questions?.reduce(
                            (total, q) => total + (q.marks || 1),
                            0
                          ) || 0}
                        </div>
                        <p className="text-xl mb-6">
                          {(currentItem.score || quizScore) ===
                          (currentItem.questions?.reduce(
                            (total, q) => total + (q.marks || 1),
                            0
                          ) || 0)
                            ? "Perfect score! You're amazing!"
                            : (currentItem.score || quizScore) >=
                              (currentItem.questions?.reduce(
                                (total, q) => total + (q.marks || 1),
                                0
                              ) || 0) /
                                2
                            ? "Well done! You passed the quiz."
                            : "Keep practicing! Review the material and try again."}
                        </p>

                        {/* Show correct answers for learning - ONLY when grading is complete */}
                        <div className="text-left space-y-6 mb-8">
                          {currentItem.questions?.map((question, qIndex) => {
                            const userAnswer = quizAnswers[question._id];
                            const answerRecord = currentItem.answers?.find(
                              (a) => a.questionId === question._id
                            );
                            const isCorrect = answerRecord?.isCorrect;
                            const needsGrading =
                              answerRecord?.needsManualGrading;
                            const marksObtained =
                              answerRecord?.marksObtained || 0;
                            const maxMarks = question.marks || 1;

                            return (
                              <div
                                key={question._id}
                                className="border border-gray-200 rounded-xl p-5 relative"
                              >
                                {/* Question number and grade badge */}
                                <div className="flex justify-between items-center mb-4">
                                  <div className="bg-indigo-100 text-indigo-800 w-8 h-8 rounded-full flex items-center justify-center font-medium">
                                    {qIndex + 1}
                                  </div>
                                  <div
                                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                                      isCorrect
                                        ? "bg-green-100 text-green-800"
                                        : needsGrading
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {marksObtained}/{maxMarks}
                                  </div>
                                </div>

                                <div className="flex items-start">
                                  <div>
                                    <h4 className="font-medium text-lg">
                                      {question.question}
                                    </h4>
                                    <p className="text-sm text-gray-600 mt-1">
                                      <span className="font-bold !text-gray-900">
                                        Your answer:
                                      </span>{" "}
                                      {Array.isArray(userAnswer)
                                        ? userAnswer
                                            .map((a) => question.options[a])
                                            .join(", ")
                                        : question.type === "mcq-single"
                                        ? question.options[userAnswer]
                                        : userAnswer || "No answer provided"}
                                    </p>
                                    {!needsGrading && (
                                      <p className="text-sm text-gray-600 mt-2">
                                        <span className="font-bold !text-gray-900">
                                          {question.type === "mcq-single" ||
                                          question.type === "mcq-multiple"
                                            ? "Correct answer:"
                                            : "Expected answer:"}
                                        </span>{" "}
                                        {Array.isArray(question.correctAnswer)
                                          ? question.correctAnswer
                                              .map((a) => question.options[a])
                                              .join(", ")
                                          : question.type === "mcq-single"
                                          ? question.options[
                                              question.correctAnswer
                                            ]
                                          : question.expectedAnswer ||
                                            question.correctAnswer ||
                                            "No expected answer provided"}
                                      </p>
                                    )}
                                    {needsGrading && (
                                      <div className="mt-2 p-3 bg-yellow-50 rounded-lg text-sm text-yellow-800">
                                        <span className="font-medium">
                                          Status:
                                        </span>{" "}
                                        Awaiting teacher grading
                                      </div>
                                    )}
                                    {question.explanation && (
                                      <div className="mt-2 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                                        <span className="font-medium">
                                          Explanation:
                                        </span>{" "}
                                        {question.explanation}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                    <button
                      onClick={continueLearning}
                      className="px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-colors"
                    >
                      {hasNextContent ? "Continue Learning" : "Close Quiz"}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CoursePlayer;
