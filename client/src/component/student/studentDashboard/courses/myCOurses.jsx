/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiBookOpen,
  FiCheckCircle,
  FiClock,
  FiAward,
  FiX,
  FiPlay,
  FiSearch,
  FiFilter,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import ProgressBar from "@ramonak/react-progress-bar";

const ProgressStats = ({ course }) => {
  return (
    <div className="space-y-2 mb-4">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Overall Progress</span>
        <span className="font-medium">{course.progress}%</span>
      </div>
      <ProgressBar
        completed={course.progress}
        height="8px"
        bgColor={course.completed ? "#10B981" : "#000"}
        baseBgColor="#E5E7EB"
        isLabelVisible={false}
      />

      {course.stats.totalQuestions > 0 && (
        <>
          <div className="grid grid-cols-3 gap-2 text-xs mt-3">
            <div className="bg-green-50 p-2 rounded text-center">
              <div className="font-bold text-green-700">
                {course.stats.correctAnswers}
              </div>
              <div className="text-green-600">Correct</div>
            </div>
            <div className="bg-red-50 p-2 rounded text-center">
              <div className="font-bold text-red-700">
                {course.stats.incorrectAnswers}
              </div>
              <div className="text-red-600">Incorrect</div>
            </div>
            <div className="bg-blue-50 p-2 rounded text-center">
              <div className="font-bold text-gray-700">
                {course.stats.accuracy}%
              </div>
              <div className="text-gray-600">Accuracy</div>
            </div>
          </div>

          <div className="flex justify-between text-xs mt-2">
            <span className="text-gray-500">Score:</span>
            <span className="font-medium">
              {course.stats.totalMarksObtained} / {course.stats.totalMaxMarks}
              <span className="ml-1">({course.stats.overallPercentage}%)</span>
            </span>
          </div>
        </>
      )}

      <div className="text-xs text-gray-500 mt-1">
        {course.completedItems} of {course.totalItems} lessons completed
      </div>
    </div>
  );
};

const MyCourses = ({ setActiveView }) => {
  const navigate = useNavigate();
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [filteredCourses, setFilteredCourses] = useState(myCourses);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceFilter, setPriceFilter] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterLevel, setFilterLevel] = useState("all");
  const [categories, setCategories] = useState([]);
  const studentData = JSON.parse(localStorage.getItem("studentData"));
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  const fetchUserCourses = async () => {
    try {
      setLoading(true);
      let categoriesList = [];
      try {
        const categoriesResponse = await axios.get(
          `${base_url}/api/auth/categories`
        );
        if (categoriesResponse.data && Array.isArray(categoriesResponse.data)) {
          setCategories(categoriesResponse.data);
        } else if (categoriesResponse.data?.categories) {
          setCategories(categoriesResponse.data.categories);
        } else {
          toast.error("Failed to load categories - unexpected response");
        }
      } catch (categoriesError) {
        toast.error("Failed to load categories");
      }

      const response = await axios.get(
        `${base_url}/api/student/enrolled-courses/${studentData.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("studentToken")}`,
          },
        }
      );

      // First fetch all teachers to map instructors
      const teachersResponse = await axios.get(
        `${base_url}/api/student/teachers`
      );
      const teachersList = teachersResponse.data?.teachers || [];
      if (response.data.success) {
        const formattedCourses = response.data.enrolledCourses.map((item) => {
          const course = item.courseDetails || {};
          const enrollment = item.enrollmentInfo || {};
          // Find instructor details from teachers list
          const instructor = teachersList.find(
            (teacher) =>
              teacher._id.toString() === course.instructor?.toString()
          );

          // Determine course type (live, premium, free)
          let courseType;
          if (course.type === "live") {
            courseType = "live";
          } else {
            courseType = course.price > 0 ? "premium" : "free";
          }

          // Handle thumbnail path
          let thumbnailPath = course.thumbnail?.filename
            ? `${base_url}/courses/${course.thumbnail.path}`
            : course.thumbnail ||
              "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80";

          // Calculate progress
          let progress = enrollment.progress || 0;
          let completedItems = 0;
          let totalItems = course.totalContentItems || 0;
          let isCompleted = enrollment.completed || false;

          if (
            enrollment.progressDetails &&
            Array.isArray(enrollment.progressDetails)
          ) {
            completedItems = enrollment.progressDetails.filter(
              (item) => item.completed
            ).length;
            if (totalItems > 0) {
              progress = Math.round((completedItems / totalItems) * 100);
            }
            isCompleted = isCompleted || progress === 100;
          }

          return {
            id: course._id,
            title: course.title,
            description: course.description,
            thumbnail: thumbnailPath,
            instructor: instructor
              ? instructor.full_name
              : "Unknown Instructor",
            instructorThumbnail: instructor?.profile_photo
              ? `${base_url}/uploads/teachers/${instructor?.profile_photo}`
              : null,
            price: course.price || 0,
            type: courseType,
            progress: progress,
            lastAccessed: enrollment.lastAccessed,
            completed: isCompleted,
            enrolledAt: enrollment.enrolledAt
              ? new Date(enrollment.enrolledAt).toLocaleDateString()
              : "Unknown date",
            categories:
              course.categories?.map((cat) =>
                typeof cat === "object" ? cat.name : cat
              ) || [],
            level: course.level || "beginner",
            totalItems,
            completedItems,
            lastActivity: enrollment.lastAccessed
              ? `Last active: ${new Date(
                  enrollment.lastAccessed
                ).toLocaleDateString()}`
              : "Not started yet",
            certificate: enrollment.certificate,
            isLive: course.type === "live",
            stats: enrollment.stats || {
              totalQuestions: 0,
              correctAnswers: 0,
              incorrectAnswers: 0,
              accuracy: 0,
              totalMarksObtained: 0,
              totalMaxMarks: 0,
              overallPercentage: 0,
            },
          };
        });
        // 5. Set courses and extract unique categories
        setMyCourses(formattedCourses);
        setFilteredCourses(formattedCourses);
      }
    } catch (error) {
      toast.error("Failed to load courses");
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserCourses();
  }, []);

  useEffect(() => {
    let results = myCourses;

    if (searchTerm) {
      results = results.filter(
        (course) =>
          course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (course.instructor &&
            course.instructor
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          (course.description &&
            course.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (priceFilter === "free") {
      results = results.filter(
        (course) => course.price === 0 && !course.isLive
      );
    } else if (priceFilter === "paid") {
      results = results.filter((course) => course.price > 0 && !course.isLive);
    } else if (priceFilter === "live") {
      results = results.filter((course) => course.isLive);
    }

    if (filterType !== "all") {
      results = results.filter((course) => {
        if (filterType === "live") {
          return course.isLive;
        } else if (filterType === "premium") {
          return course.type === "premium" && !course.isLive;
        } else {
          return course.type === "free" && !course.isLive;
        }
      });
    }

    if (filterCategory !== "all") {
      results = results.filter((course) =>
        course.categories?.some((cat) => {
          const categoryName =
            typeof cat === "object" ? cat.name || cat.title : cat;
          return categoryName
            .toLowerCase()
            .includes(filterCategory.toLowerCase());
        })
      );
    }

    if (filterLevel !== "all") {
      results = results.filter(
        (course) => course.level?.toLowerCase() === filterLevel.toLowerCase()
      );
    }

    setFilteredCourses(results);
  }, [
    searchTerm,
    priceFilter,
    myCourses,
    filterType,
    filterCategory,
    filterLevel,
  ]);

  useEffect(() => {
    setFilteredCourses(myCourses);
  }, [myCourses]);

  const recordCourseAccess = async (courseId) => {
    try {
      const response = await axios.post(
        `${base_url}/api/student/${courseId}/access`,
        {}, // Empty body
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("studentToken")}`,
            "Content-Type": "application/json",
          },
          validateStatus: (status) => status < 500, // Don't throw for 4xx errors
        }
      );

      if (response.data.success) {
        console.log("Access recorded:", response.data);
        setMyCourses((prevCourses) =>
          prevCourses.map((course) =>
            course.id === courseId
              ? {
                  ...course,
                  lastAccessed: new Date().toISOString(),
                  lastActivity: `Last active: ${new Date().toLocaleDateString()}`,
                }
              : course
          )
        );
        return true;
      } else {
        console.error("Failed to record access:", response.data.message);
        toast.error(response.data.message || "Failed to record course access");
        return false;
      }
    } catch (error) {
      console.error("Error recording access:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to record course access";

      toast.error(errorMsg);
      return false;
    }
  };

  const handleStartCourse = async (courseId) => {
    try {
      // await recordCourseAccess(courseId);
      setActiveView({
        view: "videoPlayer",
        courseId: courseId,
      });
    } catch (error) {
      toast.error("Failed to start course");
      console.error("Start course error:", error);
    }
  };

  const handleViewCertificate = async (courseId) => {
    try {
      const course = myCourses.find((c) => c.id === courseId);
      if (!course) {
        toast.error("Course not found");
        return;
      }

      // 🔹 Allow both completed normal courses and live courses
      if (!course.completed && !course.isLive) {
        toast.error("Please complete the course to get your certificate");
        return;
      }

      toast.loading("Generating your certificate...");

      const response = await axios.get(
        `${base_url}/api/student/certificate/${courseId}/${studentData.id}`,
        {
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${course.title.replace(
          /\s+/g,
          "_"
        )}_Certificate_${studentData.full_name.replace(/\s+/g, "_")}.pdf`
      );
      document.body.appendChild(link);
      link.click();
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

  return (
    <div className="min-h-screen text-gray-900 bg-gray-50">
      {/* Header */}
      <header className="bg-white py-6 px-4 sm:px-6 lg:px-8 border-b border-gray-200 shadow-sm">
        <div className="max-w-full mx-auto">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                My Learning Dashboard
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Track your learning progress and achievements
              </p>
            </div>
            <button
              onClick={() => setActiveView("courseList")}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-all shadow-md flex items-center justify-center w-full md:w-auto"
            >
              <FiBookOpen className="mr-2" />
              Browse More Courses
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-full mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600 mr-3">
                <FiBookOpen size={20} />
              </div>
              <div>
                <div className="text-gray-500 text-sm">Total Courses</div>
                <div className="text-2xl font-bold text-gray-800">
                  {myCourses.length}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-3">
                <FiCheckCircle size={20} />
              </div>
              <div>
                <div className="text-gray-500 text-sm">Completed</div>
                <div className="text-2xl font-bold text-gray-800">
                  {myCourses.filter((c) => c.completed).length}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-3">
                <FiClock size={20} />
              </div>
              <div>
                <div className="text-gray-500 text-sm">In Progress</div>
                <div className="text-2xl font-bold text-gray-800">
                  {
                    myCourses.filter((c) => c.progress > 0 && !c.completed)
                      .length
                  }
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-3">
                <FiAward size={20} />
              </div>
              <div>
                <div className="text-gray-500 text-sm">Certificates</div>
                <div className="text-2xl font-bold text-gray-800">
                  {myCourses.filter((c) => c.certificate).length}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
            <div className="relative flex-1 max-w-8xl">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search courses..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent hover:border-gray-400 text-sm sm:text-base transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <motion.div
                className="flex items-center cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSearchTerm("");
                  setPriceFilter("all");
                  setFilterType("all");
                  setFilterCategory("all");
                  setFilterLevel("all");
                  toast.success("All filters cleared", {
                    icon: <FiRefreshCw className="text-green-500" />,
                  });
                }}
              >
                <FiFilter className="text-gray-500 text-sm sm:text-base mr-1" />
                <span className="text-xs sm:text-sm text-gray-600">
                  Reset Filters
                </span>
              </motion.div>

              <div className="relative group">
                <select
                  className="block appearance-none w-full bg-white border border-gray-300 hover:border-gray-400 px-3 py-2 pr-8 rounded-lg shadow-sm focus:outline-none focus:border-gray-500 cursor-pointer text-sm sm:text-base transition-all"
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                >
                  <option value="all">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4 6L8 10L12 6"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Remove the old tabs section and replace with this filter type selector */}
        <div className="flex items-center gap-2 mb-6 px-1">
          <div className="flex space-x-2">
            <button
              onClick={() => setFilterType("all")}
              className={`px-3 py-1 rounded-full ${
                filterType === "all"
                  ? "bg-black text-white text-md"
                  : "bg-gray-100 text-gray-800 text-xs"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType("free")}
              className={`px-3 py-1 rounded-full ${
                filterType === "free"
                  ? "bg-gray-800 text-white text-md"
                  : "bg-gray-100 text-gray-800 text-xs"
              }`}
            >
              Free
            </button>
            <button
              onClick={() => setFilterType("premium")}
              className={`px-3 py-1  rounded-full ${
                filterType === "premium"
                  ? "bg-yellow-500 text-white text-md"
                  : "bg-gray-100 text-gray-800 text-xs"
              }`}
            >
              Premium
            </button>
            <button
              onClick={() => setFilterType("live")}
              className={`px-3 py-1 rounded-full ${
                filterType === "live"
                  ? "bg-purple-600 text-white text-md"
                  : "bg-gray-100 text-gray-800 text-xs"
              }`}
            >
              Live
            </button>
          </div>
        </div>

        {/* Courses List */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-100 rounded-xl overflow-hidden animate-pulse h-[380px]"
              >
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4 space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 px-3">
            {filteredCourses.map((course) => (
              <motion.div
                key={course.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-all overflow-hidden group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -5 }}
              >
                <div className="relative">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.src =
                        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80";
                    }}
                  />
                  {/* In the course card JSX, add this badge near the price: */}
                  <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                    <div
                      className={`text-white px-2 py-1 text-xs rounded-full ${
                        course.isLive
                          ? "bg-purple-600"
                          : course.price === 0
                          ? "bg-gray-800"
                          : "bg-yellow-500"
                      }`}
                    >
                      {course.isLive
                        ? "LIVE"
                        : course.price === 0
                        ? "FREE"
                        : "PREMIUM"}
                    </div>
                  </div>
                  {course.completed && (
                    <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 text-xs rounded-full flex items-center">
                      <FiCheckCircle className="mr-1" /> Completed
                    </div>
                  )}
                </div>

                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
                      {course.title}
                    </h3>
                  </div>

                  <div className="flex items-center space-x-2 mb-3 py-2 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 overflow-hidden flex items-center justify-center">
                        {course.instructorThumbnail ? (
                          <img
                            src={course.instructorThumbnail}
                            alt={course.instructor}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src =
                                "https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-1.2.1&auto=format&fit=crop&w=80&q=80";
                            }}
                          />
                        ) : (
                          <svg
                            className="w-4 h-4 text-gray-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Taught by</p>
                      <p className="text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors">
                        {course.instructor}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {course.categories
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((category, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full"
                        >
                          {typeof category === "object"
                            ? category.name
                            : category}
                        </span>
                      ))}
                    {course.categories.filter(Boolean).length > 2 && (
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                        +{course.categories.filter(Boolean).length - 2} more
                      </span>
                    )}
                  </div>

                  <ProgressStats course={course} />

                  <div className="flex justify-between items-center mt-auto">
                    <div className="text-xs text-gray-500">
                      Enrolled: {course.enrolledAt}
                    </div>
                    <button
                      onClick={() =>
                        course.completed
                          ? handleViewCertificate(course.id)
                          : handleStartCourse(course.id)
                      }
                      className={`px-3 py-2 rounded-lg text-sm font-medium ${
                        course.completed
                          ? "bg-green-100 text-green-700 hover:bg-green-200 flex items-center"
                          : "bg-indigo-100 text-gray-700 hover:bg-gray-200 flex items-center"
                      } transition-colors`}
                    >
                      {course.completed ? (
                        <>
                          <FiAward className="mr-1" />
                          Certificate
                        </>
                      ) : (
                        <>
                          <FiPlay className="mr-1" />
                          {course.progress === 0 ? "Start" : "Continue"}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200"
          >
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <FiBookOpen className="text-gray-400 text-4xl" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {filterType === "all"
                ? "You haven't enrolled in any courses yet"
                : filterType === "free"
                ? "No free courses enrolled"
                : filterType === "premium"
                ? "No premium courses enrolled"
                : "No live courses enrolled"}
            </h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              {activeTab === "all"
                ? "Browse our courses and start learning today!"
                : activeTab === "free"
                ? "Explore our free courses to start learning without any cost."
                : "Check out our premium courses for advanced learning experiences."}
            </p>
            <button
              onClick={() => setActiveView("courseList")}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg shadow-md hover:bg-gray-700 transition-all"
            >
              Browse Courses
            </button>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default MyCourses;
