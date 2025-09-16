/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import {
  FiHome,
  FiSettings,
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
  FiChevronUp,
  FiLogOut,
  FiBook,
  FiGlobe
} from "react-icons/fi";
import axios from "axios";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const EmployeeSidebar = ({ activeView, setActiveView }) => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const [isOpen, setIsOpen] = useState(true);
  const [employeeData, setEmployeeData] = useState({
    username: "",
    email: "",
    phoneNumber: "",
    avatarColor: "bg-gradient-to-r from-purple-500 to-pink-500"
  });
  const [loading, setLoading] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState({});
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const token = localStorage.getItem("empToken");
        if (!token) throw new Error("No token found");
        const response = await axios.get(`${base_url}/api/employee/me`, {
          headers: {
            "x-auth-token": token
          }
        });

        const gradients = [
          "bg-gradient-to-r from-purple-500 to-pink-500",
          "bg-gradient-to-r from-blue-500 to-teal-400",
          "bg-gradient-to-r from-amber-500 to-pink-500",
          "bg-gradient-to-r from-emerald-500 to-blue-500",
          "bg-gradient-to-r from-violet-500 to-fuchsia-500"
        ];
        const randomGradient =
          gradients[Math.floor(Math.random() * gradients.length)];

        setEmployeeData({
          username: response.data.employee.username,
          email: response.data.employee.email,
          phoneNumber: response.data.employee.phoneNumber,
          avatarColor: randomGradient
        });
        setLoading(false);
      } catch (err) {
        toast.error("Failed to load employee data");
        setLoading(false);
      }
    };

    fetchEmployeeData();
  }, []);

  const employeeInitial = employeeData.username.charAt(0).toUpperCase();

  const baseNavItems = [
    { name: "dashboard", icon: <FiHome />, component: "dashboard" },
    {
      name: "Consultancy",
      icon: <FiBook />,
      children: [{ name: "My Consultancy", component: "myConsultancy" }]
    },
    {
      name: "Visa Processing", // Add this new menu item
      icon: <FiGlobe />,
      children: [{ name: "Visa Management", component: "visaManagement" }]
    },
    { name: "settings", icon: <FiSettings />, component: "settings" }
  ];

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
    localStorage.removeItem("token");
    localStorage.removeItem("employeeData");
    toast.success("Logout successful!");
    setTimeout(() => {
      navigate("/employee/login", { replace: true });
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
            Employee Portal
          </motion.h1>
        ) : (
          <div
            className={`w-8 h-8 rounded-full ${employeeData.avatarColor} text-white flex items-center justify-center font-bold shadow-md`}
          >
            {employeeInitial}
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleToggleSidebar}
          className="p-0.7 rounded-lg hover:bg-gray-200 text-gray-600 transition-colors"
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
                    className={`flex items-center justify-between w-full p-4 rounded-xl ${
                      expandedMenus[item.name]
                        ? "bg-gray-200 text-gray-900"
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
                              className={`text-sm py-2.5 px-8 w-full text-left rounded-md transition-colors ${
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
                  className={`flex items-center w-full p-4 rounded-xl transition-all ${
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
      <div className="p-4 border-t border-gray-200">
        <motion.div
          className="flex items-center"
          whileHover={isOpen ? { scale: 1.005 } : {}}
        >
          <div
            className={`w-10 h-10 rounded-full ${employeeData.avatarColor} text-white flex items-center justify-center font-bold shadow-md`}
          >
            {employeeInitial}
          </div>

          {isOpen && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-1 min-w-0 ml-3"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-[700] text-gray-900 truncate">
                  {employeeData.username}
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
                {employeeData.email || "No email found"}
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

export default EmployeeSidebar;
