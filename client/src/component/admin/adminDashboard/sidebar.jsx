/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  FiHome,
  FiSettings,
  FiChevronLeft,
  FiChevronRight,
  FiUsers,
  FiBell,
  FiChevronDown,
  FiChevronUp,
  FiLogOut,
  FiUser,
  FiLayers,
  FiBook,
  FiGlobe,
  FiCalendar,
  FiFlag,
  FiEdit,
  FiBookOpen,
  FiPhoneCall
} from "react-icons/fi";

import axios from "axios";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/useAuth";
import { TiBusinessCard } from "react-icons/ti";
const Sidebar = ({
  activeView,
  setActiveView,
  notificationCount = 0,
  setNotificationCount
}) => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const [isOpen, setIsOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState({});
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const role = localStorage.getItem("role") || ""; // Default empty string
  const navigate = useNavigate();
  const admin_info = JSON.parse(localStorage.getItem("admin") || "null"); // Safe parsing
  const { adminData, adminLoading, adminError, fetchAdminProfile } = useAuth();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (admin_info?._id && token) {
      fetchAdminProfile();
    }
  }, []);
  useEffect(() => {
    const fetchNotificationCount = async () => {
      const response = await axios.get(
        `${base_url}/api/admin/notifications/count`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setNotificationCount(response.data.count);
    };
    // Initial fetch
    fetchNotificationCount();
    // Set up polling every 15 seconds
    const intervalId = setInterval(fetchNotificationCount, 15000);
    return () => clearInterval(intervalId);
  }, [token, setNotificationCount]);

  const baseNavItems = [
    { name: "dashboard", icon: <FiHome />, component: "dashboard" },
    {
      name: "Homepage",
      icon: <FiHome />,
      children: [
        { name: "Create Hero ", component: "createHero" },
        { name: "Modify Hero ", component: "modifyHero" }
      ]
    },
    {
      name: "Events",
      icon: <FiCalendar />,
      children: [
        { name: "Create Event", component: "createEvent" },
        { name: "Modify Event", component: "modifyEvent" },
        { name: "Event Users", component: "eventUser" }
      ]
    },
    {
      name: "Country",
      icon: <FiFlag />,
      children: [
        { name: "Criteria ", component: "criteriaCountry" },
        { name: "Modify & List Ctiterias ", component: "modifyListCtiterias" },
        { name: "Country Create ", component: "createCountry" },
        { name: "Modify Country ", component: "modifyCountry" }
      ]
    },
    {
      name: "Blog",
      icon: <FiEdit />,
      children: [
        { name: "Blog Category ", component: "categoryBlog" },
        { name: "Modify Blog Category ", component: "modifyBlogCategory" },
        { name: "Blog Create ", component: "createBlog" },
        { name: "Modify Blog ", component: "modifyBlog" }
      ]
    },
    {
      name: "News",
      icon: <FiBookOpen />,
      children: [
        { name: "News Category ", component: "categoryNews" },
        { name: "Modify News Category ", component: "modifyNewsCategory" },
        { name: "News Create ", component: "createNews" },
        { name: "Modify News ", component: "modifyNews" }
      ]
    },
    {
      name: "Contact User",
      icon: <FiPhoneCall />,
      children: [{ name: "User List", component: "userList" }]
    },
    {
      name: "Career",
      icon: <TiBusinessCard />,
      children: [
        { name: "Job Post", component: "jobPost" },
        { name: "Applied User", component: "appliedUser" }
      ]
    },
    {
      name: "Teachers",
      icon: <FiUsers />,
      children: [
        { name: "Create Teacher", component: "TeacherRegistration" },
        { name: "Teachers List ", component: "teacherList" }
      ]
    },
    {
      name: "Students",
      icon: <FiUsers />,
      children: [
        { name: "Create Student", component: "StudentRegistration" },
        { name: "Students List", component: "studentList" }
      ]
    },
    {
      name: "Courses",
      icon: <FiLayers />,
      children: [
        { name: "Create Category ", component: "createCategory" },
        { name: "Modify & list Categories ", component: "modifyCategory" },
        { name: "Create Courses", component: "createCourse" },
        { name: "Course List", component: "courseList" }
      ]
    },
    {
      name: "Employees",
      icon: <FiUser />,
      children: [
        { name: "Create Employee", component: "employeeRegistration" },
        { name: "Employee List", component: "employeeList" }
      ]
    },
    {
      name: "Consultancy",
      icon: <FiBook />,
      children: [
        { name: "Consultancy Mangement", component: "consultancyMangement" }
      ]
    },
    {
      name: "Visa Processing",
      icon: <FiGlobe />,
      children: [{ name: "Visa Requests", component: "visaRequests" }]
    },
    {
      name: "notifications",
      icon: (
        <div className="relative">
          <FiBell />
          {notificationCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white"
            >
              {Math.min(notificationCount, 99)}
            </motion.span>
          )}
        </div>
      ),
      component: "notifications"
    },
    { name: "settings", icon: <FiSettings />, component: "settings" }
  ];

  // Safely add Subadmin menu only for Admins
  if (role === "admin") {
    baseNavItems.splice(1, 0, {
      name: "subadmin",
      icon: <FiUsers />,
      children: [
        { name: "create subadmin", component: "subadminCreate" },
        { name: "list subadmin", component: "subadminList" }
      ]
    });
  }
  const toggleMenu = (menuName) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName]
    }));
  };

  const handleToggleSidebar = () => {
    if (isOpen) {
      setExpandedMenus({});
    }
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    // Remove all authentication-related items
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    localStorage.removeItem("role");
    // Add this line to remove the active view
    localStorage.removeItem("adminActiveView");

    toast.success("Logout successful!");
    setTimeout(() => {
      navigate("/admin", { replace: true });
    }, 800);
  };

  return (
    <motion.aside
      initial={{ width: isOpen ? 256 : 80 }}
      animate={{ width: isOpen ? 256 : 80 }}
      transition={{ type: "spring", damping: 20 }}
      className={`bg-gradient-to-b from-gray-50 to-gray-100 h-full flex flex-col border-r border-gray-200 shadow-xl overflow-hidden`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 h-16">
        {isOpen ? (
          <motion.h1
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xl font-bold text-black"
          >
            {role === "admin" ? "Admin Portal" : "Sub Admin Portal"}
          </motion.h1>
        ) : (
          <div
            className={`w-8 h-8 rounded-full ${
              adminData?.avatarColor ||
              (role === "admin" ? "bg-gray-800" : "bg-gray-900")
            } text-white flex items-center justify-center font-bold shadow-md`}
          >
            {adminData?.username?.charAt(0)?.toUpperCase() ||
              (role === "admin" ? "A" : "S")}
          </div>
        )}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleToggleSidebar}
          className="p-0.7 rounded-lg hover:bg-gray-200 cursor-pointer text-gray-600 transition-colors"
        >
          {isOpen ? <FiChevronLeft /> : <FiChevronRight />}
        </motion.button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <ul className="space-y-1">
          {baseNavItems.map((item) => (
            <li key={item.name}>
              {item.children ? (
                <>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleMenu(item.name)}
                    className={`flex items-center cursor-pointer justify-between w-full mb-[10px] px-4 py-2.5 rounded-md ${
                      expandedMenus[item.name]
                        ? "bg-gray-300 text-gray-900"
                        : "text-gray-700 hover:bg-gray-200"
                    } transition-colors`}
                  >
                    <div className="flex items-center">
                      <span className="w-5 h-5 flex items-center justify-center">
                        {item.icon}
                      </span>
                      {isOpen && (
                        <span className="ml-3 capitalize font-medium">
                          {item.name}
                        </span>
                      )}
                    </div>
                    {isOpen &&
                      (expandedMenus[item.name] ? (
                        <FiChevronUp />
                      ) : (
                        <FiChevronDown />
                      ))}
                  </motion.button>

                  <AnimatePresence>
                    {expandedMenus[item.name] && isOpen && (
                      <motion.ul
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        {item.children.map((child) => (
                          <motion.li key={child.name} whileHover={{ x: 5 }}>
                            <button
                              onClick={() => setActiveView(child.component)}
                              className={`text-sm py-2.5 cursor-pointer px-8 w-full text-left rounded-md transition-colors ${
                                activeView === child.component
                                  ? "bg-gray-800 text-white font-medium shadow-sm"
                                  : "text-gray-600 hover:bg-gray-100"
                              }`}
                            >
                              {child.name}
                            </button>
                          </motion.li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveView(item.component)}
                  className={`flex items-center w-full px-4 cursor-pointer py-2.5 mb-[10px] rounded-md transition-all ${
                    activeView === item.component
                      ? "bg-gray-900 text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <span className="w-5 h-5 flex items-center justify-center">
                    {item.icon}
                  </span>
                  {isOpen && (
                    <span className="ml-3 capitalize font-medium">
                      {item.name}
                    </span>
                  )}
                </motion.button>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer Profile */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <motion.div
          className="flex items-center gap-3"
          whileHover={{ scale: isOpen ? 1 : 1.02 }}
        >
          <div
            className={`w-10 h-10 rounded-full text-white flex items-center justify-center font-bold shadow-md flex-shrink-0 ${
              adminData?.avatarColor ||
              (role === "admin" ? "bg-gray-800" : "bg-gray-900")
            }`}
          >
            {adminData?.username?.charAt(0)?.toUpperCase() ||
              (role === "admin" ? "A" : "S")}
          </div>

          {isOpen && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-1 min-w-0"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-[700] text-gray-900 truncate">
                  {adminData?.username}
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="p-1 rounded-md hover:bg-gray-100 cursor-pointer transition-colors"
                  title="Logout"
                >
                  <FiLogOut className="w-4 h-4 text-gray-500 hover:text-red-500" />
                </motion.button>
              </div>
              <p className="text-xs text-gray-600 font-[600] truncate mt-0.5">
                {adminData?.email || "No email found"}
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-transparent bg-opacity-70 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
            className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-md"
          >
            <div className="p-8 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-500 dark:bg-gray-800 mb-4">
                <FiLogOut className="h-5 w-5 text-gray-100" />
              </div>

              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Ready to leave?
              </h3>
              <p className="text-sm text-gray-700 mb-6">
                Are you sure you want to sign out of your account?
              </p>

              <div className="flex justify-center space-x-3">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowLogoutConfirm(false)}
                  className="px-5 py-2.5 text-sm font-medium rounded-lg cursor-pointer bg-red-500 text-white hover:bg-red-600 transition-all shadow-sm"
                >
                  Cancel
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={confirmLogout}
                  className="px-5 py-2.5 text-sm font-medium rounded-lg bg-black cursor-pointer text-white hover:bg-gray-800 transition-all shadow-sm"
                >
                  Logout
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.aside>
  );
};

export default Sidebar;
