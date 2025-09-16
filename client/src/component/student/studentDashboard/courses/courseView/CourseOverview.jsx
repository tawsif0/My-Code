/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiArrowLeft,
  FiStar,
  FiUsers,
  FiClock,
  FiBookOpen,
  FiFile,
  FiChevronDown,
  FiChevronUp,
  FiVideo,
  FiFileText,
  FiAward,
  FiYoutube,
} from "react-icons/fi";
import axios from "axios";
import toast from "react-hot-toast";

const CourseOverview = ({ courseId, setActiveView }) => {
  const [expanded, setExpanded] = useState(false);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [instructor, setInstructor] = useState(null);
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  // Fetch course data and instructor
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // First fetch all teachers
        const teachersResponse = await axios.get(
          `${base_url}/api/student/teachers`
        );
        const teachersList = teachersResponse.data?.success
          ? teachersResponse.data.teachers || []
          : [];

        // Then fetch the course
        const courseResponse = await axios.get(
          `${base_url}/api/student/course-overview/${courseId}`
        );

        if (!courseResponse.data.success) {
          throw new Error(courseResponse.data.message || "Course not found");
        }

        const courseData = courseResponse.data.course;

        // Find the instructor
        const courseInstructor = teachersList.find((teacher) => {
          const teacherIdStr = teacher._id.toString();
          const instructorIdStr = courseData.instructor?.toString();
          return teacherIdStr === instructorIdStr;
        });

        setCourse({
          ...courseData,
          thumbnail: courseData.thumbnail?.path
            ? `${base_url}/courses/${courseData.thumbnail.path}`
            : "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        });

        setInstructor(
          courseInstructor || {
            full_name: "Unknown Instructor",
            _id: null,
          }
        );
      } catch (error) {
        console.error("Error fetching course:", error);
        toast.error("Failed to load course details");
        setActiveView("courseList");
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchData();
    }
  }, [courseId, base_url, setActiveView]);

  const toggleDescription = () => setExpanded(!expanded);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-medium text-gray-700">Course not found</h2>
        <button
          onClick={() => setActiveView("courseList")}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Back to Courses
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="text-gray-900"
    >
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl overflow-hidden mb-8">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative z-10 p-6 sm:p-8">
          <button
            onClick={() => setActiveView("courseList")}
            className="mb-6 flex items-center text-gray-200 hover:text-white transition-colors"
          >
            <FiArrowLeft className="mr-2" />
            Back to Courses
          </button>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="lg:w-2/3">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {course.level}
                </span>
                <span className="text-gray-300 text-sm sm:text-base">
                  {course.content?.length || 0} lessons • {course.type} course
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl !text-white md:text-4xl font-bold mb-4">
                {course.title}
              </h1>

              <div className="flex flex-wrap gap-3 mb-6">
                <div className="flex items-center bg-white/10 px-3 py-1 sm:px-4 sm:py-2 rounded-lg backdrop-blur-sm">
                  <FiStar className="text-yellow-400 mr-2" />
                  <span className="text-sm sm:text-base">
                    {course.averageRating?.toFixed(1) || "No ratings"} (
                    {course.ratings?.length || 0})
                  </span>
                </div>
                <div className="flex items-center bg-white/10 px-3 py-1 sm:px-4 sm:py-2 rounded-lg backdrop-blur-sm">
                  <FiUsers className="mr-2" />
                  <span className="text-sm sm:text-base">
                    {course.totalStudents?.toLocaleString() || 0} students
                  </span>
                </div>
              </div>
            </div>

            {/* Thumbnail Section */}
            <div className="lg:w-1/3 w-full">
              <div className="relative group rounded-xl overflow-hidden shadow-xl h-full min-h-[250px]">
                <div className="relative w-full h-full">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-70 object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      e.target.src =
                        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80";
                      e.target.className =
                        "w-full h-full object-contain bg-gray-100 transition-transform duration-500 group-hover:scale-105";
                    }}
                  />
                  {/* Overlay for live sessions */}
                  {course.isLive && course.nextSession && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                      <div className="w-full bg-purple-600/90 text-white text-sm px-3 py-2 rounded-lg">
                        <div className="flex items-center">
                          <FiClock className="mr-2 flex-shrink-0" />
                          <span className="truncate">
                            Next:{" "}
                            {new Date(course.nextSession).toLocaleString(
                              "en-US",
                              {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Course type badge */}
                  <div className="absolute top-4 right-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        course.type === "live" || course.isLive
                          ? "bg-red-500 text-white"
                          : course.price > 0
                          ? "bg-indigo-600 text-white"
                          : "bg-green-500 text-white"
                      }`}
                    >
                      {course.type === "live" || course.isLive
                        ? "LIVE"
                        : course.price > 0
                        ? "PREMIUM"
                        : "FREE"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Course Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-bold mb-4">About This Course</h2>
            <div
              className={`relative ${
                expanded ? "" : "max-h-48 overflow-hidden"
              }`}
            >
              <div
                className="prose prose-sm text-gray-700"
                dangerouslySetInnerHTML={{ __html: course.description }}
              />
              {!expanded && (
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
              )}
            </div>
            <button
              onClick={toggleDescription}
              className="mt-4 text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
            >
              {expanded ? (
                <>
                  <span>Show less</span>
                  <FiChevronUp className="ml-1" />
                </>
              ) : (
                <>
                  <span>Show more</span>
                  <FiChevronDown className="ml-1" />
                </>
              )}
            </button>
          </div>

          {/* Course Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Course Content</h2>
              <div className="text-gray-600">
                {course.content?.length || 0} lessons
              </div>
            </div>

            <div className="space-y-3">
              {course.content?.map((item, index) => {
                // Determine content type display based on course type and content
                let icon, typeLabel;
                if (course.isLive) {
                  icon = <FiVideo className="text-red-600" />;
                  typeLabel = "Live Session";
                } else if (course.price > 0) {
                  // Premium course
                  icon = <FiVideo className="text-indigo-600" />;
                  typeLabel = "Premium Tutorial";
                } else {
                  // Free course
                  icon = <FiYoutube className="text-red-600" />;
                  typeLabel = "Video Tutorial";
                }

                // Override for specific content types if needed
                if (item.type === "quiz") {
                  icon = <FiFileText className="text-purple-600" />;
                  typeLabel = "Quiz";
                }

                return (
                  <motion.div
                    key={item._id || index}
                    whileHover={{ scale: 1.01 }}
                    className="border border-gray-200 hover:border-indigo-300 rounded-lg overflow-hidden transition-all"
                  >
                    <div className="flex items-center p-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                        {icon}
                      </div>

                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {item.title}
                        </h3>
                        <div className="flex items-center mt-1">
                          <span className="text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded mr-2">
                            {typeLabel}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
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

                  return (
                    <div
                      key={file._id}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className="flex items-center">
                        <div className="p-2 bg-gray-100 rounded-lg mr-3">
                          <FiFile className="text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{file.filename}</p>
                          <p className="text-xs text-gray-500">{fileSize}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Instructor Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
            <h3 className="font-semibold text-lg mb-4">Instructor</h3>
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-indigo-100 overflow-hidden flex items-center justify-center mr-4">
                {instructor?.profile_photo ? (
                  <img
                    src={`${base_url}/uploads/teachers/${instructor.profile_photo}`}
                    alt={instructor.full_name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-1.2.1&auto=format&fit=crop&w=80&q=80";
                    }}
                  />
                ) : (
                  <svg
                    className="w-6 h-6 text-gray-600"
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
              <div>
                <h4 className="font-medium text-gray-900">
                  {instructor?.full_name || "Unknown Instructor"}
                </h4>
                <p className="text-sm text-gray-600">Course Instructor</p>
              </div>
            </div>
          </div>

          {/* Course Details Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-lg mb-4">Course Details</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">
                  Level
                </h4>
                <p className="font-medium">
                  {course.level?.charAt(0).toUpperCase() +
                    course.level?.slice(1) || "Beginner"}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">
                  Category
                </h4>
                <div className="flex flex-wrap gap-2">
                  {course.categories?.map((category, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full"
                    >
                      {typeof category === "object" ? category.name : category}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">
                  Price
                </h4>
                <p className="font-medium">
                  {course.price > 0 ? `৳${course.price}` : "Free"}
                </p>
              </div>
            </div>
          </div>

          {/* Certificate Card - Only show if course is completed */}
          {course.isCompleted && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-lg mb-4">Your Achievement</h3>
              <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 flex items-center">
                <div className="bg-indigo-100 p-3 rounded-full mr-4">
                  <FiAward className="text-indigo-600 text-xl" />
                </div>
                <div>
                  <h4 className="font-medium text-indigo-800">
                    Course Completion Certificate
                  </h4>
                  <button className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center">
                    <FiDownload className="mr-1" /> Download Certificate
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CourseOverview;
