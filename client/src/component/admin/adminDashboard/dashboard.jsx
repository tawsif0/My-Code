// Dashboard.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import {
  FiUsers,
  FiBarChart2,
  FiTrendingUp,
  FiCalendar,
  FiImage,
  FiStar,
} from "react-icons/fi";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courses, setCourses] = useState([]);
  const [statsOverview, setStatsOverview] = useState({
    totalCourses: 0,
    totalStudents: 0,
  });

  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  // Fetch initial data
  useEffect(() => {
    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      // Fetch courses for dropdown and overview
      const coursesResponse = await axios.get(
        `http://localhost:3500/api/admin/courses`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const coursesData = coursesResponse.data.data || [];
      setCourses(coursesData);

      // Fetch additional stats for overview
      await fetchOverviewStats(coursesData);
    } catch (err) {
      console.error("Error fetching initial data:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const fetchOverviewStats = async (coursesData) => {
    try {
      // Calculate basic stats from courses data
      const totalStudents = coursesData.reduce(
        (sum, course) => sum + (course.totalStudents || 0),
        0
      );

      setStatsOverview({
        totalCourses: coursesData.length,
        totalStudents,
      });
    } catch (err) {
      console.error("Error fetching overview stats:", err);
    }
  };

  const renderLoading = () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-2 border-gray-200 border-t-2 border-t-black rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Loading dashboard...</p>
      </div>
    </div>
  );

  const renderError = () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-500 text-lg mb-4">{error}</p>
        <button
          onClick={fetchInitialData}
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  );

  if (loading) return renderLoading();
  if (error) return renderError();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Content */}
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard Overview
            </h1>
            <p className="text-gray-600 mt-2">
              Welcome to your learning management system dashboard
            </p>
          </div>

          {/* Overview Stats - Updated to 2 columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0 * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Courses
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {statsOverview.totalCourses}
                  </p>
                </div>
                <div className={`p-3 bg-blue-50 rounded-lg`}>
                  <FiBarChart2 className={`text-2xl text-blue-600`} />
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Students
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {statsOverview.totalStudents.toLocaleString()}
                  </p>
                </div>
                <div className={`p-3 bg-green-50 rounded-lg`}>
                  <FiUsers className={`text-2xl text-green-600`} />
                </div>
              </div>
            </motion.div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Courses - Independent height */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-fit"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Recent Courses
                </h3>
                <span className="text-sm text-gray-500">
                  {courses.length} total courses
                </span>
              </div>
              <div className="space-y-4">
                {courses.slice(0, 5).map((course) => (
                  <div
                    key={course._id}
                    className="flex items-center justify-between py-2 group hover:bg-gray-50 rounded-lg px-2 transition-colors"
                  >
                    <div className="flex items-center flex-1">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                        {course.thumbnail?.path ? (
                          <img
                            src={`${base_url}/courses/${course.thumbnail.path}`}
                            alt={course.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <FiImage className="text-gray-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {course.title}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <p className="text-xs text-gray-500 capitalize">
                            {course.type} • {course.level}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Course Rating Section - Independent height */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-fit"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Course Ratings
                </h3>
                <span className="text-sm text-gray-500">Top rated courses</span>
              </div>
              <div className="space-y-4">
                {courses
                  .filter((course) => course.averageRating > 0)
                  .sort((a, b) => b.averageRating - a.averageRating)
                  .slice(0, 5)
                  .map((course) => (
                    <div
                      key={course._id}
                      className="flex items-center justify-between py-2 group hover:bg-gray-50 rounded-lg px-2 transition-colors"
                    >
                      <div className="flex items-center flex-1">
                        <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                          {course.thumbnail?.path ? (
                            <img
                              src={`${base_url}/courses/${course.thumbnail.path}`}
                              alt={course.title}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <FiImage className="text-gray-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {course.title}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <FiStar
                                  key={i}
                                  className={`text-xs ${
                                    i < Math.floor(course.averageRating)
                                      ? "text-yellow-400 fill-current"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-gray-500">
                              {course.averageRating.toFixed(1)}/5
                            </span>
                            <span className="text-xs text-gray-500">
                              • {course.ratings?.length || 0} reviews
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`text-sm font-medium ${
                            course.averageRating >= 4
                              ? "text-green-600"
                              : course.averageRating >= 3
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {course.averageRating >= 4
                            ? "Excellent"
                            : course.averageRating >= 3
                            ? "Good"
                            : "Needs Improvement"}
                        </span>
                      </div>
                    </div>
                  ))}
                {courses.filter((course) => course.averageRating > 0).length ===
                  0 && (
                  <div className="text-center py-4">
                    <FiStar className="text-3xl text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">
                      No ratings available yet
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
