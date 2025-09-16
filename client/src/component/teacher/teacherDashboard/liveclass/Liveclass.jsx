/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiEye,
  FiSearch,
  FiX,
  FiCheck,
  FiXCircle,
  FiChevronDown,
  FiChevronUp,
  FiClock,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

const Liveclass = () => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [groupedSubmissions, setGroupedSubmissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [expandedCourses, setExpandedCourses] = useState({});
  const [expandedClasses, setExpandedClasses] = useState({});
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  // Get teacher ID from localStorage
  const teacherData = JSON.parse(localStorage.getItem("teacherData"));
  const teacherId = teacherData?._id;

  // Fetch all live class attendance data
  const fetchLiveClassAttendance = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${base_url}/api/teacher/live-class-attendance`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("teacherToken")}`,
            teacher_id: teacherId,
          },
        }
      );

      // ✅ normalize attendance status
      const attendanceData = response.data.data.map((item) => ({
        ...item,
        attendanceStatus:
          item.attendanceStatus ?? item.progress?.attendanceStatus ?? "pending",
      }));

      setSubmissions(attendanceData);
      groupSubmissionsByCourseAndClass(attendanceData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching live class attendance:", error);
      toast.error("Failed to fetch live class attendance");
      setLoading(false);
    }
  };

  // Group submissions by course and then by class
  const groupSubmissionsByCourseAndClass = (submissionsData) => {
    const grouped = {};

    submissionsData.forEach((submission) => {
      const courseKey = submission.courseId;
      const classKey = `${submission.courseId}-${submission.contentItem._id}`;

      // Initialize course if it doesn't exist
      if (!grouped[courseKey]) {
        grouped[courseKey] = {
          courseId: submission.courseId,
          courseTitle: submission.courseTitle,
          classes: {},
          totalStudents: 0,
          presentStudents: 0,
          absentStudents: 0,
        };
      }

      // Initialize class if it doesn't exist
      if (!grouped[courseKey].classes[classKey]) {
        grouped[courseKey].classes[classKey] = {
          contentItem: submission.contentItem,
          students: [],
          presentCount: 0,
          absentCount: 0,
          totalCount: 0,
        };
      }

      // Add student to class
      grouped[courseKey].classes[classKey].students.push(submission);
      grouped[courseKey].classes[classKey].totalCount++;
      grouped[courseKey].totalStudents++;

      if (submission.attendanceStatus === "present") {
        grouped[courseKey].classes[classKey].presentCount++;
        grouped[courseKey].presentStudents++;
      } else if (submission.attendanceStatus === "absent") {
        grouped[courseKey].classes[classKey].absentCount++;
        grouped[courseKey].absentStudents++;
      }
    });

    setGroupedSubmissions(grouped);

    // Auto-expand all courses initially
    const initialExpandedCourses = {};
    Object.keys(grouped).forEach((courseKey) => {
      initialExpandedCourses[courseKey] = true;
    });
    setExpandedCourses(initialExpandedCourses);

    // Auto-expand all classes initially
    const initialExpandedClasses = {};
    Object.keys(grouped).forEach((courseKey) => {
      Object.keys(grouped[courseKey].classes).forEach((classKey) => {
        initialExpandedClasses[classKey] = true;
      });
    });
    setExpandedClasses(initialExpandedClasses);
  };

  useEffect(() => {
    fetchLiveClassAttendance();
  }, []);

  // Toggle course expansion
  const toggleCourse = (courseKey) => {
    setExpandedCourses((prev) => ({
      ...prev,
      [courseKey]: !prev[courseKey],
    }));
  };

  // Toggle class expansion
  const toggleClass = (classKey) => {
    setExpandedClasses((prev) => ({
      ...prev,
      [classKey]: !prev[classKey],
    }));
  };

  // Mark all students as present in a class
  const markAllPresent = async (courseId, contentId) => {
    try {
      const response = await axios.post(
        `${base_url}/api/teacher/mark-all-present/${courseId}/${contentId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("teacherToken")}`,
            teacher_id: teacherId,
          },
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        fetchLiveClassAttendance();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error marking all as present:", error);
      toast.error(
        error.response?.data?.message || "Failed to mark all as present"
      );
    }
  };

  // Update individual student attendance
  const updateStudentAttendance = async (
    courseId,
    contentId,
    studentId,
    attendanceStatus
  ) => {
    try {
      // Convert "pending" to null for backend
      const backendStatus =
        attendanceStatus === "pending" ? null : attendanceStatus;

      const response = await axios.post(
        `${base_url}/api/teacher/update-live-class-attendance/${courseId}/${contentId}/${studentId}`,
        { attendanceStatus: backendStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("teacherToken")}`,
            teacher_id: teacherId,
          },
        }
      );

      if (response.data.success) {
        toast.success(`Attendance marked as ${attendanceStatus}`);
        fetchLiveClassAttendance();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error updating student attendance:", error);
      toast.error(
        error.response?.data?.message || "Failed to update attendance"
      );
    }
  };

  // View submission details
  const viewSubmission = (submission) => {
    setSelectedSubmission(submission);
    setIsModalOpen(true);
  };

  // Get status color and text - handle null values properly
  const getStatusInfo = (status) => {
    switch (status) {
      case "present":
        return {
          text: "Present",
          bg: "bg-green-100",
          textColor: "text-green-800",
        };
      case "absent":
        return { text: "Absent", bg: "bg-red-100", textColor: "text-red-800" };
      case "pending":
      default:
        return {
          text: "Pending",
          bg: "bg-yellow-100",
          textColor: "text-yellow-800",
        };
    }
  };

  // Update the filter logic to handle null values
  const filteredGroupedSubmissions = Object.keys(groupedSubmissions).reduce(
    (acc, courseKey) => {
      const course = groupedSubmissions[courseKey];
      const filteredClasses = {};

      Object.keys(course.classes).forEach((classKey) => {
        const classItem = course.classes[classKey];
        const filteredStudents = classItem.students.filter((student) => {
          const matchesSearch =
            student.student.name
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            student.student.email
              .toLowerCase()
              .includes(searchTerm.toLowerCase());

          const matchesFilter =
            filter === "all" ||
            (filter === "pending" &&
              (student.attendanceStatus === "pending" ||
                !student.attendanceStatus)) ||
            (filter === "present" && student.attendanceStatus === "present") ||
            (filter === "absent" && student.attendanceStatus === "absent");

          return matchesSearch && matchesFilter;
        });

        if (filteredStudents.length > 0) {
          filteredClasses[classKey] = {
            ...classItem,
            students: filteredStudents,
          };
        }
      });

      if (Object.keys(filteredClasses).length > 0) {
        acc[courseKey] = {
          ...course,
          classes: filteredClasses,
        };
      }

      return acc;
    },
    {}
  );

  return (
    <div className="min-h-screen">
      <div className="flex w-full h-[100vh] bg-white overflow-hidden">
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
                  Live Class Attendance
                </h1>
                <div className="flex flex-col md:flex-row w-full md:w-auto gap-3">
                  <div className="relative w-full md:w-64">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search students..."
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <select
                    className="w-full md:w-auto border border-gray-400 rounded-lg px-4 py-2 focus:outline-none focus:border-gray-500"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  >
                    <option value="all">All Records</option>
                    <option value="pending">Pending Attendance</option>
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
                </div>
              ) : Object.keys(filteredGroupedSubmissions).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(filteredGroupedSubmissions).map(
                    ([courseKey, course]) => (
                      <div
                        key={courseKey}
                        className="bg-white rounded-lg shadow overflow-hidden"
                      >
                        {/* Course Header */}
                        <div
                          className="flex justify-between items-center p-4 bg-blue-50 cursor-pointer hover:bg-blue-100 border-b border-blue-200"
                          onClick={() => toggleCourse(courseKey)}
                        >
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-blue-800">
                              {course.courseTitle}
                            </h3>
                          </div>
                          <div className="flex items-center space-x-4">
                            {expandedCourses[courseKey] ? (
                              <FiChevronUp className="text-blue-600" />
                            ) : (
                              <FiChevronDown className="text-blue-600" />
                            )}
                          </div>
                        </div>

                        {/* Classes List - Collapsible */}
                        {expandedCourses[courseKey] && (
                          <div className="space-y-2 p-2">
                            {Object.entries(course.classes).map(
                              ([classKey, classItem]) => (
                                <div
                                  key={classKey}
                                  className="bg-gray-50 rounded-lg overflow-hidden"
                                >
                                  {/* Class Header */}
                                  <div
                                    className="flex justify-between items-center p-3 bg-gray-100 cursor-pointer hover:bg-gray-200 border-b border-gray-300"
                                    onClick={() => toggleClass(classKey)}
                                  >
                                    <div className="flex-1">
                                      <h4 className="font-medium text-gray-800">
                                        {classItem.contentItem.title}
                                      </h4>
                                      <p className="text-xs text-gray-600">
                                        Scheduled:{" "}
                                        {new Date(
                                          classItem.contentItem.schedule
                                        ).toLocaleString()}{" "}
                                        • Attendance: {classItem.presentCount}{" "}
                                        present, {classItem.absentCount} absent,{" "}
                                        {classItem.totalCount -
                                          classItem.presentCount -
                                          classItem.absentCount}{" "}
                                        pending
                                      </p>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          markAllPresent(
                                            course.courseId,
                                            classItem.contentItem._id
                                          );
                                        }}
                                        className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs hover:bg-green-200"
                                      >
                                        Mark All Present
                                      </button>
                                      {expandedClasses[classKey] ? (
                                        <FiChevronUp className="text-gray-500" />
                                      ) : (
                                        <FiChevronDown className="text-gray-500" />
                                      )}
                                    </div>
                                  </div>

                                  {/* Students List - Collapsible */}
                                  {expandedClasses[classKey] && (
                                    <div className="overflow-x-auto">
                                      <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                          <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">
                                              Student
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">
                                              Status
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">
                                              Actions
                                            </th>
                                          </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                          {classItem.students.map(
                                            (student, index) => {
                                              const statusInfo = getStatusInfo(
                                                student.attendanceStatus
                                              );
                                              return (
                                                <tr
                                                  key={index}
                                                  className="hover:bg-gray-50 transition-colors"
                                                >
                                                  {/* Student (Left) */}
                                                  <td className="px-6 py-3 text-sm text-gray-900">
                                                    <div className="font-medium">
                                                      {student.student.name}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                      {student.student.email}
                                                    </div>
                                                  </td>

                                                  {/* Status (Center) */}
                                                  <td className="px-6 py-3 text-center">
                                                    <span
                                                      className={`px-3 py-1 text-xs rounded-full font-medium ${statusInfo.bg} ${statusInfo.textColor}`}
                                                    >
                                                      {statusInfo.text}
                                                    </span>
                                                  </td>

                                                  {/* Actions (Right) */}
                                                  <td className="px-6 py-3 text-right text-sm font-medium space-x-2">
                                                    <button
                                                      onClick={() =>
                                                        viewSubmission(student)
                                                      }
                                                      className="text-gray-600 hover:text-gray-900 text-xs"
                                                    >
                                                      <FiEye className="inline mr-1" />{" "}
                                                      View
                                                    </button>

                                                    {!student.attendanceStatus ||
                                                    student.attendanceStatus ===
                                                      "pending" ? (
                                                      <>
                                                        <button
                                                          onClick={() =>
                                                            updateStudentAttendance(
                                                              course.courseId,
                                                              classItem
                                                                .contentItem
                                                                ._id,
                                                              student.student
                                                                ._id,
                                                              "present"
                                                            )
                                                          }
                                                          className="text-green-600 hover:text-green-900 text-xs"
                                                        >
                                                          <FiCheck className="inline mr-1" />{" "}
                                                          Present
                                                        </button>
                                                        <button
                                                          onClick={() =>
                                                            updateStudentAttendance(
                                                              course.courseId,
                                                              classItem
                                                                .contentItem
                                                                ._id,
                                                              student.student
                                                                ._id,
                                                              "absent"
                                                            )
                                                          }
                                                          className="text-red-600 hover:text-red-900 text-xs"
                                                        >
                                                          <FiX className="inline mr-1" />{" "}
                                                          Absent
                                                        </button>
                                                      </>
                                                    ) : (
                                                      <button
                                                        onClick={() =>
                                                          updateStudentAttendance(
                                                            course.courseId,
                                                            classItem
                                                              .contentItem._id,
                                                            student.student._id,
                                                            "pending"
                                                          )
                                                        }
                                                        className="text-yellow-600 hover:text-yellow-900 text-xs"
                                                      >
                                                        <FiClock className="inline mr-1" />{" "}
                                                        Reset
                                                      </button>
                                                    )}
                                                  </td>
                                                </tr>
                                              );
                                            }
                                          )}
                                        </tbody>
                                      </table>
                                    </div>
                                  )}
                                </div>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow p-6 text-center">
                  <p className="text-gray-500">No attendance records found</p>
                </div>
              )}

              {/* Attendance Details Modal */}
              {isModalOpen && selectedSubmission && (
                <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] bg-opacity-50 flex items-center justify-center z-[1000] p-4">
                  <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                    {/* Modal Header */}
                    <div className="bg-gray-800 text-white p-4 rounded-t-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <h2 className="text-xl font-bold !text-white">
                            Attendance Details
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
                      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            Live Class
                          </h3>
                          <p className="text-lg font-medium text-gray-800">
                            {selectedSubmission.contentItem.title}
                          </p>
                        </div>
                      </div>

                      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <h3 className="text-sm font-medium text-gray-500 mb-1">
                            Class Schedule
                          </h3>
                          <p className="text-lg font-medium text-gray-800">
                            {new Date(
                              selectedSubmission.contentItem.schedule
                            ).toLocaleString()}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <h3 className="text-sm font-medium text-gray-500 mb-1">
                            Last Accessed
                          </h3>
                          <p className="text-lg font-medium text-gray-800">
                            {selectedSubmission.lastAccessed
                              ? new Date(
                                  selectedSubmission.lastAccessed
                                ).toLocaleString()
                              : "Never"}
                          </p>
                        </div>
                      </div>

                      <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                          <div className="mb-3 md:mb-0">
                            <h3 className="text-lg font-semibold text-gray-800">
                              Attendance Status
                            </h3>
                            <div className="flex items-center mt-1">
                              {selectedSubmission.attendanceStatus &&
                              selectedSubmission.attendanceStatus !==
                                "pending" ? (
                                <span
                                  className={`text-xl font-bold ${
                                    selectedSubmission.attendanceStatus ===
                                    "present"
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {selectedSubmission.attendanceStatus ===
                                  "present"
                                    ? "Present"
                                    : "Absent"}
                                </span>
                              ) : (
                                <span className="text-xl font-bold text-yellow-600">
                                  Pending
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                updateStudentAttendance(
                                  selectedSubmission.courseId,
                                  selectedSubmission.contentItem._id,
                                  selectedSubmission.student._id,
                                  "present"
                                );
                                setIsModalOpen(false);
                              }}
                              className="px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm hover:bg-green-200"
                            >
                              Mark Present
                            </button>
                            <button
                              onClick={() => {
                                updateStudentAttendance(
                                  selectedSubmission.courseId,
                                  selectedSubmission.contentItem._id,
                                  selectedSubmission.student._id,
                                  "absent"
                                );
                                setIsModalOpen(false);
                              }}
                              className="px-4 py-2 bg-red-100 text-red-800 rounded-lg text-sm hover:bg-red-200"
                            >
                              Mark Absent
                            </button>
                            {selectedSubmission.attendanceStatus &&
                              selectedSubmission.attendanceStatus !==
                                "pending" && (
                                <button
                                  onClick={() => {
                                    updateStudentAttendance(
                                      selectedSubmission.courseId,
                                      selectedSubmission.contentItem._id,
                                      selectedSubmission.student._id,
                                      "pending"
                                    );
                                    setIsModalOpen(false);
                                  }}
                                  className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm hover:bg-yellow-200"
                                >
                                  Reset to Pending
                                </button>
                              )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="bg-gray-50 px-6 py-4 border-t flex justify-end">
                      <button
                        onClick={() => setIsModalOpen(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Liveclass;
