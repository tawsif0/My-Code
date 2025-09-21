/* eslint-disable no-unused-vars */
import React, { useRef, useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "react-toastify";
import logo from "../../../../public/images/logo.png";
import { useAuth } from "../../../context/useAuth";
import { FiHome, FiLogOut, FiShoppingCart } from "react-icons/fi";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOthersDropdownOpen, setIsOthersDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { studentData, studentLoading, clearStudentData } = useAuth();

  const headerRef = useRef(null);
  const dropdownRef = useRef(null);
  const mobileDropdownRef = useRef(null);

  const base_url =
    import.meta.env.VITE_API_KEY_Base_URL || "http://localhost:3500";

  // Authentication check - fixed logic
  const hasToken = !!localStorage.getItem("studentToken");
  const hasStudentData = !!studentData;
  const isStudentLoggedIn = !studentLoading && hasStudentData && hasToken;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        mobileDropdownRef.current &&
        !mobileDropdownRef.current.contains(event.target)
      ) {
        setIsOthersDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const mainNavLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Services", path: "/services" },
    { name: "Countries", path: "/countries" },
    { name: "Consultation", path: "/appointment" },
    {
      name: "Courses",
      path: "/courses",
    },
    {
      name: "Blogs & News",
      path: "/blog",
    },
    {
      name: "Events",
      path: "/events",
    },
    {
      name: "Careers",
      path: "/career",
    },
    {
      name: "Contact",
      path: "/contact",
    },
  ];

  const profileDropdownLinks = [
    { name: "Dashboard", path: "/student/dashboard", icon: <FiHome /> },
    {
      name: "Logout",
      path: "/logout",
      icon: <FiLogOut />,
      action: () => {
        localStorage.removeItem("studentToken");
        localStorage.removeItem("studentData");
        clearStudentData();
        window.location.reload();
      },
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("studentToken");
    localStorage.removeItem("studentData");
    clearStudentData();
    window.location.reload();
  };

  return (
    <motion.header
      ref={headerRef}
      initial={{ y: 0, opacity: 1 }}
      animate={{ y: 0, opacity: 1 }}
      className={`fixed w-full z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/95 backdrop-blur-xl shadow-2xl py-2"
          : "bg-white/90 backdrop-blur-lg py-3"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo - Left */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="flex-shrink-0"
          >
            <Link
              to="/"
              className="flex items-center group"
              onClick={() => setIsMenuOpen(false)}
            >
              <img
                src={logo}
                alt="Logo"
                className={`h-12 w-auto transition-all duration-300 ${
                  scrolled ? "scale-90" : "scale-100"
                }`}
              />
            </Link>
          </motion.div>

          {/* Navigation Links - Center */}
          <div className="hidden lg:flex flex-1 justify-center items-center space-x-4">
            {mainNavLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `py-2.5 rounded-xl transition-all duration-300 text-sm font-medium flex items-center space-x-1.5 group/navlink ${
                    isActive
                      ? "text-[#004080] font-bold"
                      : "text-gray-700 hover:text-[#004080]"
                  }`
                }
              >
                <span className="text-lg">{link.icon}</span>
                <span>{link.name}</span>
              </NavLink>
            ))}

            {/* Others Dropdown - Futuristic Design */}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2 lg:space-x-2">
            {/* Cart Icon (only shown when logged in) */}
            {isStudentLoggedIn && (
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Link
                  to="/cart"
                  className="relative flex items-center justify-center p-2 text-gray-600 hover:text-[#004080] transition-colors duration-300 bg-gray-100 rounded-xl hover:bg-gray-200"
                >
                  <FiShoppingCart className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#004080] text-white text-[10px] rounded-full flex items-center justify-center shadow-sm">
                    0
                  </span>
                </Link>
              </motion.div>
            )}

            {/* User Profile (only shown when logged in) */}
            {isStudentLoggedIn ? (
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    setIsProfileDropdownOpen(!isProfileDropdownOpen)
                  }
                  className="cursor-pointer flex items-center space-x-2 lg:p-1 rounded-xl hover:bg-gray-100 transition-colors duration-300 border border-gray-200 bg-white/80"
                >
                  {studentData?.profile_picture ? (
                    <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-sm">
                      <img
                        src={`${base_url}/students/${studentData.profile_picture}`}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src =
                            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80";
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                      {studentData?.full_name
                        ? studentData.full_name.charAt(0).toUpperCase()
                        : "U"}
                    </div>
                  )}
                  <motion.svg
                    animate={{ rotate: isProfileDropdownOpen ? 180 : 0 }}
                    className="w-4 h-4 text-gray-600 transition-transform duration-300 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </motion.svg>
                </motion.button>

                <AnimatePresence>
                  {isProfileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{
                        duration: 0.2,
                        type: "spring",
                        damping: 20,
                      }}
                      className="absolute top-full right-0 mt-2 w-46 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 py-3 z-50"
                    >
                      <div className="px-4 py-2 border-b border-white/20">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {studentData?.full_name || "User"}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {studentData?.email || "user@example.com"}
                        </p>
                      </div>
                      {profileDropdownLinks.map((link) =>
                        link.action ? (
                          <motion.button
                            key={link.name}
                            whileHover={{ x: 5 }}
                            onClick={handleLogout}
                            className="cursor-pointer flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:text-[#004080] transition-colors duration-200"
                          >
                            <span className="text-base">{link.icon}</span>
                            <span>{link.name}</span>
                          </motion.button>
                        ) : (
                          <motion.div key={link.name} whileHover={{ x: 5 }}>
                            <Link
                              to={link.path}
                              className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:text-[#004080] transition-colors duration-200"
                              onClick={() => setIsProfileDropdownOpen(false)}
                            >
                              <span className="text-base">{link.icon}</span>
                              <span>{link.name}</span>
                            </Link>
                          </motion.div>
                        )
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              // Register button
              <div className="hidden lg:block">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/student"
                    className="px-5 py-2.5 font-medium text-white bg-gradient-to-r from-[#004080] to-[#0066cc] rounded-xl hover:from-[#003366] hover:to-[#004080] transition-all duration-300 shadow-lg hover:shadow-xl text-sm"
                  >
                    Register
                  </Link>
                </motion.div>
              </div>
            )}

            {/* Mobile menu button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="lg:hidden focus:outline-none rounded-xl hover:bg-gray-100 transition-colors duration-300 bg-white/80"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6 text-gray-800"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </motion.button>
          </div>
        </div>

        {/* Mobile menu with animation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="lg:hidden mt-4 pb-4 rounded-2xl bg-white/95 backdrop-blur-xl shadow-2xl border border-white/20"
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3, type: "spring", damping: 20 }}
            >
              <div className="flex flex-col space-y-1 p-3">
                {/* Main nav links */}
                {mainNavLinks.map((link) => (
                  <NavLink
                    key={link.name}
                    to={link.path}
                    className={({ isActive }) =>
                      `flex items-center px-4 py-3 rounded-xl transition-all duration-300 space-x-3 ${
                        isActive
                          ? "text-[#004080] font-bold "
                          : "text-gray-700 hover:text-[#004080] font-medium hover:bg-gray-50/80"
                      }`
                    }
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="text-xl">{link.icon}</span>
                    <span>{link.name}</span>
                  </NavLink>
                ))}

                {/* Register button in mobile */}
                {!isStudentLoggedIn && (
                  <motion.div whileTap={{ scale: 0.95 }} className="pt-2">
                    <Link
                      to="/student"
                      className="block px-4 py-3.5 font-medium text-white bg-gradient-to-r from-[#004080] to-[#0066cc] rounded-xl hover:from-[#003366] hover:to-[#004080] transition-all duration-300 shadow-lg text-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Register
                    </Link>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default Header;
