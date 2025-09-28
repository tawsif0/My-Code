/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiBookOpen,
  FiCheckCircle,
  FiClock,
  FiUsers,
  FiDollarSign,
  FiStar,
  FiTrendingUp,
  FiBarChart2,
  FiEye,
  FiAward,
  FiCalendar,
} from "react-icons/fi";
import toast from "react-hot-toast";
import axios from "axios";

const TeacherAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseAnalytics, setCourseAnalytics] = useState(null);

  const teacherData = JSON.parse(localStorage.getItem("teacherData"));
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  const fetchTeacherAnalytics = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${base_url}/api/teacher/analytics/${teacherData.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("teacherToken")}`,
          },
        }
      );

      if (response.data.success) {
        setAnalytics(response.data.data);
      }
    } catch (error) {
      toast.error("Failed to load analytics");
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseAnalytics = async (courseId) => {
    try {
      const response = await axios.get(
        `${base_url}/api/teacher/analytics/course/${courseId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("teacherToken")}`,
          },
        }
      );

      if (response.data.success) {
        setCourseAnalytics(response.data.data);
        setSelectedCourse(courseId);
      }
    } catch (error) {
      toast.error("Failed to load course analytics");
      console.error("Error fetching course analytics:", error);
    }
  };

  useEffect(() => {
    fetchTeacherAnalytics();
  }, []);

  const StatCard = ({
    icon: Icon,
    label,
    value,
    subtext,
    color,
    delay = 0,
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="relative overflow-hidden rounded-2xl p-6 bg-white border border-gray-100 shadow-lg transition-all duration-300 hover:shadow-2xl group"
    >
      {/* Animated background gradient on hover */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
      />

      {/* Subtle border glow effect */}
      <div
        className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${color} opacity-0 group-hover:opacity-20 blur-sm transition-opacity duration-300`}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div
            className={`rounded-xl ${color} bg-opacity-10 group-hover:bg-opacity-20 transition-all duration-300`}
          >
            <Icon
              className={color.replace("from-", "text-").split(" ")[0]}
              size={24}
            />
          </div>
          <motion.div
            whileHover={{ rotate: 180, scale: 1.1 }}
            transition={{ duration: 0.3 }}
            className="p-2 rounded-full bg-gray-100 group-hover:bg-gray-200 transition-colors duration-300"
          >
            <FiTrendingUp className="text-gray-600" size={16} />
          </motion.div>
        </div>
        <div className="text-gray-600 text-sm font-medium mb-1">{label}</div>
        <div className="text-3xl font-bold text-gray-900">{value}</div>
        {subtext && <div className="text-sm text-gray-500 mt-2">{subtext}</div>}
      </div>

      {/* Decorative elements */}
      <div className="absolute -top-10 -right-10 w-20 h-20 bg-gray-100 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute -bottom-5 -left-5 w-15 h-15 bg-gray-50 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-gray-900 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <FiBarChart2 className="mx-auto text-gray-400" size={48} />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            No analytics data available
          </h3>
          <p className="text-gray-600 mt-2">
            Start creating courses to see your analytics
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pb-8"
      >
        <div className="max-w-full mx-auto">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h2 className="text-4xl font-bold text-gray-900">
                Teacher Analytics
              </h2>
              <p className="text-gray-600 mt-2">
                Track your teaching performance and student engagement
              </p>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
        <StatCard
          icon={FiBookOpen}
          label="Total Courses"
          value={analytics.totalCourses}
          color="from-blue-500 to-blue-600"
          delay={0}
        />
        <StatCard
          icon={FiUsers}
          label="Total Students"
          value={analytics.totalStudents}
          subtext={`${analytics.enrollmentStats.thisMonth} this month`}
          color="from-green-500 to-green-600"
          delay={0.1}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          icon={FiCheckCircle}
          label="Course Completion"
          value={`${Math.round(analytics.completionStats.completionRate)}%`}
          subtext={`${analytics.completionStats.completedCourses} of ${analytics.completionStats.totalStudents} students`}
          color="from-teal-500 to-teal-600"
          delay={0.4}
        />
        <StatCard
          icon={FiTrendingUp}
          label="Monthly Growth"
          value={`+${analytics.enrollmentStats.growth}%`}
          subtext="Student enrollment growth"
          color="from-pink-500 to-pink-600"
          delay={0.5}
        />
        <StatCard
          icon={FiAward}
          label="Top Courses"
          value={analytics.topPerformingCourses.length}
          subtext="High performing courses"
          color="from-indigo-500 to-indigo-600"
          delay={0.6}
        />
      </div>
    </div>
  );
};

export default TeacherAnalytics;
