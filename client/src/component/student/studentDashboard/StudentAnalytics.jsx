/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiBookOpen,
  FiCheckCircle,
  FiClock,
  FiGlobe,
  FiAward,
  FiArrowRight,
  FiPlay,
  FiTrendingUp,
  FiBarChart2,
} from "react-icons/fi";
import toast from "react-hot-toast";
import axios from "axios";

const MyCourses = ({ setActiveView }) => {
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visaStats, setVisaStats] = useState({
    approved: 0,
    completed: 0,
  });

  const studentData = JSON.parse(localStorage.getItem("studentData"));
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  const fetchUserCourses = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${base_url}/api/student/enrolled-courses/${studentData.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("studentToken")}`,
          },
        }
      );

      // Fetch visa requests for stats
      const visaResponse = await axios.get(`${base_url}/api/student/status`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("studentToken")}`,
        },
      });

      // Calculate visa stats
      if (visaResponse.data.success && visaResponse.data.visaRequests) {
        const visaRequests = visaResponse.data.visaRequests;
        const approved = visaRequests.filter(
          (req) => req.status === "approved"
        ).length;
        const completed = visaRequests.filter(
          (req) => req.status === "completed"
        ).length;

        setVisaStats({
          approved,
          completed,
        });
      }

      if (response.data.success) {
        const formattedCourses = response.data.enrolledCourses.map((item) => {
          const course = item.courseDetails || {};
          const enrollment = item.enrollmentInfo || {};

          // Calculate progress
          let progress = 0;
          let completedItems = 0;
          let totalItems = course.totalContentItems || 0;
          let isCompleted = enrollment.completed || false;

          if (enrollment.progress && Array.isArray(enrollment.progress)) {
            completedItems = enrollment.progress.filter(
              (item) => item.completed
            ).length;
            if (totalItems > 0) {
              progress = Math.round((completedItems / totalItems) * 100);
            }
            // Ensure completion status is accurate
            isCompleted = enrollment.completed || progress === 100;
          } else if (
            enrollment.progressDetails &&
            Array.isArray(enrollment.progressDetails)
          ) {
            // Fallback to progressDetails if progress doesn't exist
            completedItems = enrollment.progressDetails.filter(
              (item) => item.completed
            ).length;
            if (totalItems > 0) {
              progress = Math.round((completedItems / totalItems) * 100);
            }
            isCompleted = enrollment.completed || progress === 100;
          }

          return {
            id: course._id,
            title: course.title || "Untitled Course",
            description: course.description || "No description available",
            completed: isCompleted,
            enrolledAt: enrollment.enrolledAt
              ? new Date(enrollment.enrolledAt).toLocaleDateString()
              : "Unknown date",
            totalItems,
            completedItems,
            progress,
            lastActivity: enrollment.lastAccessed
              ? `Last active: ${new Date(
                  enrollment.lastAccessed
                ).toLocaleDateString()}`
              : "Not started yet",
          };
        });
        setMyCourses(formattedCourses);
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

  const StatCard = ({ icon: Icon, label, value, color, delay = 0 }) => (
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

        {/* Progress bar for completion-based stats */}
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

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pb-8"
      >
        <div className="max-w-full mx-auto">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                Student Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Track your learning journey and unlock your potential
              </p>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 mb-12">
        <StatCard
          icon={FiBookOpen}
          label="Total Courses"
          value={myCourses.length}
          color="from-blue-500 to-blue-600"
          delay={0}
        />
        <StatCard
          icon={FiCheckCircle}
          label="Completed"
          value={myCourses.filter((c) => c.completed).length}
          color="from-green-500 to-green-600"
          delay={0.1}
        />
        <StatCard
          icon={FiClock}
          label="In Progress"
          value={myCourses.filter((c) => c.progress > 0 && !c.completed).length}
          color="from-purple-500 to-purple-600"
          delay={0.2}
        />
        <StatCard
          icon={FiGlobe}
          label="Visa Approved"
          value={visaStats.approved}
          color="from-orange-500 to-orange-600"
          delay={0.3}
        />
        <StatCard
          icon={FiAward}
          label="Visa Completed"
          value={visaStats.completed}
          color="from-red-500 to-red-600"
          delay={0.4}
        />
      </div>
    </div>
  );
};

export default MyCourses;
