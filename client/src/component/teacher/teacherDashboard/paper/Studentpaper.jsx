/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiEdit,
  FiEye,
  FiSearch,
  FiFilter,
  FiX,
  FiPlus,
  FiCheck,
  FiXCircle,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";

import toast from "react-hot-toast";
import axios from "axios";
import { MdDelete } from "react-icons/md";

const Studentpaper = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [gradingData, setGradingData] = useState({});
  const [totalScore, setTotalScore] = useState(0);
  const [maxTotalScore, setMaxTotalScore] = useState(0);
  const [percentage, setPercentage] = useState(0);
  const [passed, setPassed] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const [contentItemId, setContentItemId] = useState(null);
  // Get teacher ID from localStorage
  const teacherData = JSON.parse(localStorage.getItem("teacherData"));

  // Fetch all student submissions
  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${base_url}/api/teacher/all-submissions`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("teacherToken")}`,
          },
        }
      );
      setSubmissions(response.data.data);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to fetch submissions");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  // Handle grading submission
  const handleGradeSubmission = async () => {
    try {
      const answersToSubmit = Object.values(gradingData).map((answer) => ({
        answerId: answer.answerId,
        question: answer.question,
        marks: Number(answer.marks),
        feedback: answer.feedback,
        isCorrect: answer.marks >= answer.maxMarks * 0.5,
      }));

      const response = await axios.put(
        `${base_url}/api/teacher/grade-submission`,
        {
          studentEmail: selectedSubmission.student.email,
          contentItemId: contentItemId,
          answers: answersToSubmit,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("teacherToken")}`,
          },
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setIsModalOpen(false);
        fetchSubmissions();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to grade submission"
      );
    }
  };

  // Filter submissions based on search and filter
  const filteredSubmissions = submissions.filter((submission) => {
    const matchesSearch =
      submission.student?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      submission.courseTitle
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      submission.contentItem?.title
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      false;

    const matchesFilter =
      filter === "all" ||
      (filter === "ungraded" &&
        submission.gradingStatus !== "manually-graded") ||
      (filter === "graded" && submission.gradingStatus === "manually-graded");

    return matchesSearch && matchesFilter;
  });

  // Toggle question expansion
  const toggleQuestionExpansion = (questionId) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  // View submission details
  const viewSubmission = (submission) => {
    setSelectedSubmission(submission);

    // Store the contentItemId for later use in grading
    const contentItemId = submission.contentItem._id;

    // Initialize grading data and calculate totals
    const initialGradingData = {};
    let total = 0;
    let maxTotal = 0;
    const initialExpanded = {};

    submission.answers.forEach((answer, index) => {
      // Use answerId as unique key instead of question text
      const answerKey = answer.answerId || `${answer.question}-${index}`;
      initialGradingData[answerKey] = {
        answerId: answer.answerId,
        question: answer.question,
        type: answer.questionType,
        marks: answer.marksObtained || 0,
        feedback: answer.teacherFeedback || "",
        maxMarks: answer.maxMarks,
        studentAnswer: answer.studentAnswer,
        correctAnswer: answer.correctAnswer,
        isCorrect: answer.isCorrect || false,
      };

      // Auto-expand the first question using answerKey
      initialExpanded[answerKey] = index === 0;

      total += answer.marksObtained || 0;
      maxTotal += answer.maxMarks;
    });

    setGradingData(initialGradingData);
    setExpandedQuestions(initialExpanded);
    setTotalScore(total);
    setMaxTotalScore(maxTotal);
    setContentItemId(contentItemId); // Store the contentItemId
    calculateResults(total, maxTotal, submission);
    setIsModalOpen(true);
  };

  // Calculate percentage and pass/fail status
  const calculateResults = (score, maxScore, submission) => {
    const calculatedPercentage =
      maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    const passingScore = 40;
    const isPassed = calculatedPercentage >= passingScore;

    setPercentage(calculatedPercentage);
    setPassed(isPassed);
  };

  // Update grading data and recalculate totals
  const handleGradeChange = (question, field, value) => {
    const updatedGradingData = {
      ...gradingData,
      [question]: {
        ...gradingData[question],
        [field]: value,
        isCorrect:
          field === "marks"
            ? Number(value) >= gradingData[question].maxMarks * 0.5
            : gradingData[question].isCorrect,
      },
    };

    // Calculate new totals
    let newTotal = 0;
    Object.values(updatedGradingData).forEach((answer) => {
      newTotal += Number(answer.marks) || 0;
    });

    setGradingData(updatedGradingData);
    setTotalScore(newTotal);
    calculateResults(newTotal, maxTotalScore, selectedSubmission);
  };

  // Auto-grade function for MCQ questions
  const calculateAutoGradeMCQ = (answerData) => {
    if (!answerData) return 0;

    let isCorrect = false;
    const { type, studentAnswer, correctAnswer } = answerData;

    if (type === "mcq-single") {
      isCorrect = studentAnswer === correctAnswer;
    } else if (type === "mcq-multiple") {
      if (Array.isArray(studentAnswer) && Array.isArray(correctAnswer)) {
        isCorrect =
          studentAnswer.length === correctAnswer.length &&
          studentAnswer.every((ans) => correctAnswer.includes(ans));
      }
    }

    return {
      marks: isCorrect ? answerData.maxMarks : 0,
      isCorrect: isCorrect,
    };
  };
  const autoGradeMCQ = (answerKey) => {
    const answerData = gradingData[answerKey];
    if (!answerData) return 0;

    const autoGradeResult = calculateAutoGradeMCQ(answerData);

    handleGradeChange(answerKey, "marks", autoGradeResult.marks);
    handleGradeChange(answerKey, "isCorrect", autoGradeResult.isCorrect);

    return autoGradeResult.marks;
  };
  // Auto-grade all MCQ questions
  const autoGradeAllMCQs = () => {
    const updatedGradingData = { ...gradingData };
    let newTotal = 0;

    Object.entries(updatedGradingData).forEach(([answerKey, answer]) => {
      if (answer.type === "mcq-single" || answer.type === "mcq-multiple") {
        const autoGradeResult = calculateAutoGradeMCQ(answer);
        updatedGradingData[answerKey] = {
          ...answer,
          marks: autoGradeResult.marks,
          isCorrect: autoGradeResult.isCorrect,
        };
      }
      newTotal += updatedGradingData[answerKey].marks || 0;
    });

    setGradingData(updatedGradingData);
    setTotalScore(newTotal);
    calculateResults(newTotal, maxTotalScore, selectedSubmission);
    toast.success("Auto-graded all MCQ questions");
  };

  // Toggle correct/incorrect status for a question
  const toggleCorrectStatus = (answerKey) => {
    const currentData = gradingData[answerKey];
    const newIsCorrect = !currentData.isCorrect;
    const newMarks = newIsCorrect ? currentData.maxMarks : 0;

    handleGradeChange(answerKey, "isCorrect", newIsCorrect);
    handleGradeChange(answerKey, "marks", newMarks);
  };

  // Format answer display based on type

  const formatAnswer = (answer, type) => {
    // Check if answer is undefined or null, not just falsy
    if (answer === undefined || answer === null) {
      return "No answer provided";
    }

    if (Array.isArray(answer)) {
      return answer.length > 0 ? answer.join(", ") : "No answer provided";
    }

    if (type === "true-false") {
      return answer ? "True" : "False";
    }

    // For numbers (including 0), convert to string
    if (typeof answer === "number") {
      return answer.toString();
    }

    return answer || "No answer provided";
  };

  return (
    <div className=" min-h-screen">
      <div className="flex w-full h-[100vh] bg-white overflow-hidden">
        {/* Main Content Section */}
        <div className="flex-1 h-full overflow-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen"
          >
            <div className="w-full mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold text-gray-800">
                  Student Submissions
                </h1>
                <div className="flex flex-col md:flex-row w-full md:w-auto gap-3">
                  <div className="relative w-full md:w-64">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search submissions..."
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-gray-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <select
                    className="w-full md:w-auto border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:border-gray-500"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  >
                    <option value="all">All Submissions</option>
                    <option value="ungraded">Needs Grading</option>
                    <option value="graded">Graded</option>
                  </select>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Course
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Assignment
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Score
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredSubmissions.length > 0 ? (
                        filteredSubmissions.map((submission, index) => (
                          <tr
                            key={index}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="">
                                  <div className="text-sm font-medium text-gray-900">
                                    {submission.student?.name ||
                                      "Unknown Student"}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {submission.student?.email ||
                                      "No email available"}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {submission.courseTitle || "Untitled Course"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {submission.contentItem?.title ||
                                  "Unknown Content"}
                              </div>
                              <div className="text-sm text-gray-500 capitalize">
                                {submission.contentItem?.type || "unknown"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {submission.score !== undefined &&
                                submission.maxScore !== undefined
                                  ? `${submission.score}/${submission.maxScore}`
                                  : "Not graded"}
                              </div>
                              {submission.percentage !== undefined && (
                                <div className="text-sm text-gray-500">
                                  {submission.percentage}%
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
      ${
        submission.gradingStatus === "manually-graded"
          ? "bg-green-100 text-green-800"
          : submission.gradingStatus === "partially-graded"
          ? "bg-yellow-100 text-yellow-800"
          : "bg-blue-100 text-blue-800"
      }`}
                              >
                                {submission.gradingStatus === "manually-graded"
                                  ? "Graded"
                                  : submission.gradingStatus ===
                                    "partially-graded"
                                  ? "Partially Graded"
                                  : "Not Graded"}
                              </span>
                              {submission.passed !== undefined &&
                                submission.percentage !== undefined && (
                                  <span
                                    className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
        ${
          submission.percentage >= 40
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
        }`}
                                  >
                                    {submission.percentage >= 40
                                      ? "Passed"
                                      : "Failed"}
                                  </span>
                                )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => viewSubmission(submission)}
                                className="text-gray-600 hover:text-gray-900 mr-4 flex items-center"
                              >
                                <FiEye className="inline mr-1" /> View/Grade
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="6"
                            className="px-6 py-4 text-center text-sm text-gray-500"
                          >
                            No quiz submissions found matching your criteria
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Grading Modal */}
            {isModalOpen && selectedSubmission && (
              <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] bg-opacity-50 flex items-center justify-center z-[1000] p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
                  {/* Modal Header */}
                  <div className="bg-gray-800 text-white p-4 rounded-t-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="text-xl font-bold !text-white">
                          Grading: {selectedSubmission.contentItem.title}
                        </h2>
                        <p className="text-sm text-gray-300 mt-1">
                          Student: {selectedSubmission.student.name} (
                          {selectedSubmission.student.email})
                        </p>
                      </div>
                      <button
                        onClick={() => setIsModalOpen(false)}
                        className="text-gray-300 hover:text-white"
                      >
                        <FiX size={24} />
                      </button>
                    </div>
                  </div>

                  {/* Modal Body */}
                  <div className="flex-1 overflow-y-auto p-6">
                    <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">
                          Course
                        </h3>
                        <p className="text-lg font-medium text-gray-800">
                          {selectedSubmission.courseTitle}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">
                          Assignment Type
                        </h3>
                        <p className="text-lg font-medium text-gray-800 capitalize">
                          {selectedSubmission.contentItem.type}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">
                          Submission Date
                        </h3>
                        <p className="text-lg font-medium text-gray-800">
                          {new Date(
                            selectedSubmission.lastAccessed
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Grading Summary */}
                    <div className="mb-6 p-4 rounded-lg border border-gray-200 bg-blue-50">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                        <div className="mb-3 md:mb-0">
                          <h3 className="text-lg font-semibold text-gray-800">
                            Grading Summary
                          </h3>
                          <div className="flex items-center mt-1">
                            <span className="text-2xl font-bold text-gray-800">
                              {totalScore}/{maxTotalScore}
                            </span>
                            <span className="ml-2 text-lg text-gray-600">
                              ({percentage}%)
                            </span>
                            <span
                              className={`ml-3 px-2 py-1 rounded-full text-sm font-medium 
                              ${
                                passed
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {passed ? "Passed" : "Failed"}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={autoGradeAllMCQs}
                            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm flex items-center"
                          >
                            <FiCheck className="mr-2" /> Auto-Grade MCQs
                          </button>
                          <button
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm flex items-center"
                            onClick={() => {
                              // Reset all marks to 0
                              const resetGradingData = {};
                              Object.keys(gradingData).forEach((answerKey) => {
                                resetGradingData[answerKey] = {
                                  ...gradingData[answerKey],
                                  marks: 0,
                                  isCorrect: false,
                                };
                              });
                              setGradingData(resetGradingData);
                              setTotalScore(0);
                              calculateResults(
                                0,
                                maxTotalScore,
                                selectedSubmission
                              );
                            }}
                          >
                            <FiXCircle className="mr-2" /> Reset All
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Questions List */}
                    <div className="space-y-4">
                      {selectedSubmission.answers.map((answer, index) => (
                        <div
                          key={answer.answerId || `${answer.question}-${index}`}
                          className="border rounded-lg overflow-hidden"
                        >
                          {/* Question Header */}
                          <div
                            className="flex justify-between items-center p-4 bg-gray-50 cursor-pointer hover:bg-gray-100"
                            onClick={() =>
                              toggleQuestionExpansion(
                                answer.answerId || `${answer.question}-${index}`
                              )
                            }
                          >
                            <div className="flex items-center">
                              <span className="bg-gray-200 text-gray-800 text-sm font-medium mr-3 px-2.5 py-0.5 rounded">
                                Q{index + 1}
                              </span>
                              <h3 className="font-medium text-gray-800 line-clamp-1">
                                {answer.question}
                              </h3>
                            </div>
                            <div className="flex items-center">
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded mr-3 ${
                                  gradingData[
                                    answer.answerId ||
                                      `${answer.question}-${index}`
                                  ]?.isCorrect
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {gradingData[
                                  answer.answerId ||
                                    `${answer.question}-${index}`
                                ]?.isCorrect
                                  ? "Correct"
                                  : "Incorrect"}
                              </span>
                              <span className="text-sm text-gray-500 mr-3">
                                {gradingData[
                                  answer.answerId ||
                                    `${answer.question}-${index}`
                                ]?.marks || 0}
                                /{answer.maxMarks} pts
                              </span>
                              {expandedQuestions[
                                answer.answerId || `${answer.question}-${index}`
                              ] ? (
                                <FiChevronUp className="text-gray-500" />
                              ) : (
                                <FiChevronDown className="text-gray-500" />
                              )}
                            </div>
                          </div>

                          {/* Question Content - Collapsible */}
                          {expandedQuestions[
                            answer.answerId || `${answer.question}-${index}`
                          ] && (
                            <div className="p-4 bg-white">
                              {/* Question Type and Max Marks */}
                              <div className="flex flex-wrap gap-2 mb-4">
                                <span className="text-xs font-medium px-2.5 py-0.5 rounded bg-blue-100 text-blue-800">
                                  {answer.questionType}
                                </span>
                                <span className="text-xs font-medium px-2.5 py-0.5 rounded bg-purple-100 text-purple-800">
                                  Max Marks: {answer.maxMarks}
                                </span>
                              </div>

                              {/* Student Answer and Correct Answer */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="border rounded-lg p-3 bg-gray-50">
                                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                                    Student Answer:
                                  </h4>
                                  <div className="p-3 bg-white rounded border border-gray-200">
                                    <p className="text-sm text-gray-800 break-words">
                                      {formatAnswer(
                                        answer.studentAnswer,
                                        answer.questionType
                                      )}
                                    </p>
                                  </div>
                                </div>
                                {answer.correctAnswer !== undefined &&
                                  answer.correctAnswer !== null &&
                                  answer.correctAnswer !==
                                    "No expected answer provided" && (
                                    <div className="border rounded-lg p-3 bg-gray-50">
                                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                                        {answer.questionType === "mcq-single" ||
                                        answer.questionType === "mcq-multiple"
                                          ? "Correct Answer:"
                                          : "Expected Answer:"}
                                      </h4>
                                      <div className="p-3 bg-white rounded border border-gray-200">
                                        <p className="text-sm text-gray-800 break-words">
                                          {formatAnswer(
                                            answer.correctAnswer,
                                            answer.questionType
                                          )}
                                        </p>
                                      </div>
                                    </div>
                                  )}
                              </div>

                              {/* Grading Controls */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label
                                    htmlFor={`marks-${index}`}
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                  >
                                    Marks Awarded
                                  </label>
                                  <div className="flex items-center">
                                    <input
                                      type="number"
                                      id={`marks-${index}`}
                                      min="0"
                                      max={answer.maxMarks}
                                      step="0.5"
                                      value={
                                        gradingData[
                                          answer.answerId ||
                                            `${answer.question}-${index}`
                                        ]?.marks || 0
                                      }
                                      onChange={(e) => {
                                        const value = Math.min(
                                          Math.max(Number(e.target.value), 0),
                                          answer.maxMarks
                                        );
                                        handleGradeChange(
                                          answer.answerId ||
                                            `${answer.question}-${index}`,
                                          "marks",
                                          value
                                        );
                                      }}
                                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:border-gray-500  sm:text-sm"
                                    />
                                    <span className="ml-2 text-sm text-gray-500">
                                      / {answer.maxMarks}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Quick Actions */}
                              <div className="flex justify-end mt-4 space-x-2">
                                <button
                                  onClick={() =>
                                    toggleCorrectStatus(
                                      answer.answerId ||
                                        `${answer.question}-${index}`
                                    )
                                  }
                                  className={`px-3 py-1 rounded-md text-sm flex items-center ${
                                    gradingData[
                                      answer.answerId ||
                                        `${answer.question}-${index}`
                                    ]?.isCorrect
                                      ? "bg-red-100 text-red-700 hover:bg-red-200"
                                      : "bg-green-100 text-green-700 hover:bg-green-200"
                                  }`}
                                >
                                  {gradingData[
                                    answer.answerId ||
                                      `${answer.question}-${index}`
                                  ]?.isCorrect ? (
                                    <>
                                      <FiXCircle className="mr-1" /> Mark
                                      Incorrect
                                    </>
                                  ) : (
                                    <>
                                      <FiCheck className="mr-1" /> Mark Correct
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="bg-gray-50 px-6 py-4 border-t flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      Grading as:{" "}
                      <span className="font-medium">
                        {teacherData?.full_name || "Teacher"}
                      </span>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setIsModalOpen(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none  focus:border-gray-500"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleGradeSubmission}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none  focus:border-gray-500"
                      >
                        Submit Grades
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Studentpaper;
