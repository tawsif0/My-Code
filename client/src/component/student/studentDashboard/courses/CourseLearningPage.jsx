/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FiBookOpen,
  FiCheckCircle,
  FiClock,
  FiAward,
  FiBarChart2,
  FiChevronDown,
  FiChevronUp,
  FiArrowLeft
} from "react-icons/fi";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { FiStar } from "react-icons/fi";
import { FiUser } from "react-icons/fi";
import { FiUsers } from "react-icons/fi";
const CourseLearningPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeContent, setActiveContent] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const studentData = JSON.parse(localStorage.getItem("studentData"));

  // Fetch course details
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${base_url}/api/student/courses/${courseId}/content`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("studentToken")}`
            }
          }
        );

        if (response.data.success) {
          setCourse(response.data.course);
          // Expand the first section by default
          if (response.data.course.content.length > 0) {
            setExpandedSections({ 0: true });
          }
        } else {
          toast.error(response.data.message || "Failed to load course");
          navigate("/courses");
        }
      } catch (error) {
        console.error("Error fetching course:", error);
        toast.error(
          error.response?.data?.message || "Failed to load course details"
        );
        navigate("/courses");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId, base_url, navigate]);

  // Handle quiz answer change
  const handleAnswerChange = (questionIndex, answer) => {
    setQuizAnswers((prev) => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  // Submit quiz
  const submitQuiz = async (contentId) => {
    try {
      if (!activeContent || activeContent.type !== "quiz") return;

      const answers = Object.values(quizAnswers);
      if (answers.length !== activeContent.questions.length) {
        toast.error("Please answer all questions before submitting");
        return;
      }

      const response = await axios.post(
        `${base_url}/api/student/courses/${courseId}/content/${contentId}/submit-quiz`,
        { answers },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("studentToken")}`
          }
        }
      );

      if (response.data.success) {
        setQuizScore(response.data.score);
        setQuizSubmitted(true);
        toast.success(`Quiz submitted! Score: ${response.data.score}%`);
      } else {
        toast.error(response.data.message || "Failed to submit quiz");
      }
    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast.error(
        error.response?.data?.message || "Failed to submit quiz answers"
      );
    }
  };

  // Toggle section expansion
  const toggleSection = (index) => {
    setExpandedSections((prev) => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Mark content as completed
  const markAsCompleted = async () => {
    try {
      const response = await axios.put(
        `${base_url}/api/student/courses/${courseId}/progress`,
        { progress: 100 }, // Mark as 100% completed
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("studentToken")}`
          }
        }
      );

      if (response.data.success) {
        toast.success("Content marked as completed!");
        // Refresh course data to update progress
        const updatedResponse = await axios.get(
          `${base_url}/api/student/courses/${courseId}/content`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("studentToken")}`
            }
          }
        );
        setCourse(updatedResponse.data.course);
      }
    } catch (error) {
      console.error("Error marking as completed:", error);
      toast.error(error.response?.data?.message || "Failed to update progress");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-96 bg-gray-200 rounded-lg"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-medium text-gray-800">
            Course not found or you don't have access
          </h2>
          <button
            onClick={() => navigate("/courses")}
            className="mt-4 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Course Header */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate("/courses")}
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            <FiArrowLeft className="mr-2" /> Back to Courses
          </button>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-600">
              Progress: {course.progress || 0}%
            </span>
            <div className="w-32 bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-green-500 h-2.5 rounded-full"
                style={{ width: `${course.progress || 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {activeContent ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Content Header */}
                <div className="p-4 sm:p-6 border-b border-gray-200">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                    {activeContent.title}
                  </h2>
                  <p className="text-gray-600 mt-2">
                    {activeContent.description}
                  </p>
                </div>

                {/* Content Body */}
                <div className="p-4 sm:p-6">
                  {activeContent.type === "video" && (
                    <div className="aspect-w-16 aspect-h-9 bg-black rounded-lg overflow-hidden">
                      <iframe
                        src={activeContent.videoUrl}
                        className="w-full h-96"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={activeContent.title}
                      ></iframe>
                    </div>
                  )}

                  {activeContent.type === "article" && (
                    <div
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: activeContent.content
                      }}
                    ></div>
                  )}

                  {activeContent.type === "quiz" && (
                    <div className="space-y-6">
                      {activeContent.questions.map((question, qIndex) => (
                        <div key={qIndex} className="p-4 bg-gray-50 rounded-lg">
                          <h3 className="font-medium text-gray-800 mb-3">
                            {qIndex + 1}. {question.question}
                          </h3>

                          {question.type === "mcq-single" && (
                            <div className="space-y-2">
                              {question.options.map((option, oIndex) => (
                                <label
                                  key={oIndex}
                                  className="flex items-center space-x-2 cursor-pointer"
                                >
                                  <input
                                    type="radio"
                                    name={`question-${qIndex}`}
                                    checked={quizAnswers[qIndex] === option}
                                    onChange={() =>
                                      handleAnswerChange(qIndex, option)
                                    }
                                    disabled={quizSubmitted}
                                    className="text-gray-800 focus:ring-gray-500"
                                  />
                                  <span>{option}</span>
                                </label>
                              ))}
                            </div>
                          )}

                          {question.type === "mcq-multiple" && (
                            <div className="space-y-2">
                              {question.options.map((option, oIndex) => (
                                <label
                                  key={oIndex}
                                  className="flex items-center space-x-2 cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={
                                      quizAnswers[qIndex] &&
                                      quizAnswers[qIndex].includes(option)
                                    }
                                    onChange={() => {
                                      const currentAnswers =
                                        quizAnswers[qIndex] || [];
                                      const newAnswers =
                                        currentAnswers.includes(option)
                                          ? currentAnswers.filter(
                                              (a) => a !== option
                                            )
                                          : [...currentAnswers, option];
                                      handleAnswerChange(qIndex, newAnswers);
                                    }}
                                    disabled={quizSubmitted}
                                    className="text-gray-800 focus:ring-gray-500"
                                  />
                                  <span>{option}</span>
                                </label>
                              ))}
                            </div>
                          )}

                          {["short-answer", "broad-answer"].includes(
                            question.type
                          ) && (
                            <textarea
                              value={quizAnswers[qIndex] || ""}
                              onChange={(e) =>
                                handleAnswerChange(qIndex, e.target.value)
                              }
                              disabled={quizSubmitted}
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                              rows={question.type === "short-answer" ? 2 : 4}
                              placeholder="Type your answer here..."
                            ></textarea>
                          )}

                          {quizSubmitted && (
                            <div
                              className={`mt-2 p-2 rounded text-sm ${
                                quizScore >= 80
                                  ? "bg-green-100 text-green-800"
                                  : quizScore >= 50
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              <p className="font-medium">
                                {quizAnswers[qIndex] === question.correctAnswer
                                  ? "Correct!"
                                  : "Incorrect"}
                              </p>
                              <p>Correct answer: {question.correctAnswer}</p>
                            </div>
                          )}
                        </div>
                      ))}

                      <div className="flex justify-between items-center">
                        {!quizSubmitted ? (
                          <button
                            onClick={() => submitQuiz(activeContent._id)}
                            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
                          >
                            Submit Quiz
                          </button>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <FiAward className="text-yellow-500" />
                            <span className="font-medium">
                              Your Score: {quizScore}%
                            </span>
                          </div>
                        )}

                        <button
                          onClick={() => setActiveContent(null)}
                          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          Back to Course
                        </button>
                      </div>
                    </div>
                  )}

                  {!["quiz", "video", "article"].includes(
                    activeContent.type
                  ) && (
                    <div className="text-center py-12">
                      <FiBookOpen className="mx-auto text-4xl text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-700">
                        Content not available in preview
                      </h3>
                      <p className="text-gray-500 mt-2">
                        This type of content can only be accessed within the
                        learning interface.
                      </p>
                    </div>
                  )}
                </div>

                {/* Content Footer */}
                {activeContent.type !== "quiz" && (
                  <div className="p-4 sm:p-6 border-t border-gray-200 flex justify-end">
                    <button
                      onClick={markAsCompleted}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
                    >
                      <FiCheckCircle />
                      <span>Mark as Completed</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
                    {course.title}
                  </h1>
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="flex items-center text-yellow-500">
                      <FiStar className="fill-current" />
                      <span className="ml-1 text-gray-700">
                        {course.rating?.toFixed(1) || "4.5"}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <FiUsers className="mr-1" />
                      <span>{course.students?.toLocaleString() || "0"}</span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <FiClock className="mr-1" />
                      <span>{course.duration || "10 hours"}</span>
                    </div>
                  </div>

                  <div className="prose max-w-none">
                    <p>{course.description}</p>
                  </div>

                  <div className="mt-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">
                      What you'll learn
                    </h2>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {course.learningOutcomes?.map((outcome, index) => (
                        <li key={index} className="flex items-start">
                          <FiCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                          <span>{outcome}</span>
                        </li>
                      )) || (
                        <>
                          <li className="flex items-start">
                            <FiCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                            <span>Master key concepts and skills</span>
                          </li>
                          <li className="flex items-start">
                            <FiCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                            <span>Apply knowledge to real-world scenarios</span>
                          </li>
                          <li className="flex items-start">
                            <FiCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                            <span>Build practical projects</span>
                          </li>
                          <li className="flex items-start">
                            <FiCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                            <span>Prepare for certifications</span>
                          </li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Course Content */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-bold text-gray-800">Course Content</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {course.content?.length > 0 ? (
                  course.content.map((section, sIndex) => (
                    <div key={sIndex} className="p-4">
                      <button
                        onClick={() => toggleSection(sIndex)}
                        className="w-full flex justify-between items-center text-left font-medium text-gray-800"
                      >
                        <span>
                          Section {sIndex + 1}: {section.title}
                        </span>
                        {expandedSections[sIndex] ? (
                          <FiChevronUp />
                        ) : (
                          <FiChevronDown />
                        )}
                      </button>

                      {expandedSections[sIndex] && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          transition={{ duration: 0.2 }}
                          className="mt-2 space-y-2 pl-4"
                        >
                          {section.items?.map((item, iIndex) => (
                            <button
                              key={iIndex}
                              onClick={() => setActiveContent(item)}
                              className={`w-full text-left p-2 rounded-lg flex items-center ${
                                activeContent?._id === item._id
                                  ? "bg-gray-100 text-gray-800"
                                  : "text-gray-600 hover:bg-gray-50"
                              }`}
                            >
                              <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-2 text-xs">
                                {iIndex + 1}
                              </span>
                              <span className="truncate">{item.title}</span>
                              {item.completed && (
                                <FiCheckCircle className="ml-auto text-green-500" />
                              )}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    No content available yet
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-bold text-gray-800">About Instructor</h3>
              </div>
              <div className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                    <img
                      src={
                        course.instructor?.avatar ||
                        "https://randomuser.me/api/portraits/men/1.jpg"
                      }
                      alt={course.instructor?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">
                      {course.instructor?.name || "John Doe"}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {course.instructor?.title || "Senior Instructor"}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-gray-600">
                  {course.instructor?.bio ||
                    "Experienced professional with years of teaching experience in this field."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseLearningPage;
