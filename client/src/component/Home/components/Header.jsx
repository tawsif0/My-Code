import React, { useRef, useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";

import logo from "../../../../public/images/logo.png";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Services", path: "/services" },
    { name: "Countries", path: "/countries" },
    { name: "Courses", path: "/courses" },
    { name: "Blogs & News", path: "/blog" },
    { name: "Events", path: "/events" },
    { name: "Careers", path: "/career" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <motion.header
      ref={headerRef}
      initial={{ y: 0, opacity: 1 }}
      animate={{ y: 0, opacity: 1 }}
      className={`fixed w-full z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-lg py-2"
          : "bg-white/90 backdrop-blur-sm py-3"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <motion.div
            whileHover={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
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

          <div className="hidden md:flex space-x-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-full transition-all duration-300 ${
                    isActive
                      ? "text-[#004080] font-bold"
                      : "text-gray-700 hover:text-[#004080] font-medium"
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </div>

          <div className="hidden md:block ml-4">
            <motion.div whileHover={{ scale: 1.05 }}>
              <Link
                to="/appointment"
                className="px-6 py-2.5 font-medium text-gray-700 bg-[#ffd400] rounded-lg hover:text-gray-900 hover:bg-[#ffd700] transition-all duration-300"
              >
                Book Consultation
              </Link>
            </motion.div>
          </div>

          <button
            className="md:hidden focus:outline-none p-2 rounded-full hover:bg-gray-100 transition-colors duration-300"
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
          </button>
        </div>

        {/* Mobile menu with animation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="md:hidden mt-4 pb-4"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col space-y-2">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.name}
                    to={link.path}
                    className={({ isActive }) =>
                      `block px-4 py-3 rounded-lg transition-all duration-300 ${
                        isActive
                          ? "text-[#004080] font-bold "
                          : "text-gray-700 hover:text-[#004080] font-medium"
                      }`
                    }
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.name}
                  </NavLink>
                ))}
                <motion.div whileTap={{ scale: 0.95 }} className="!mt-3">
                  <Link
                    to="/appointment"
                    className=" px-6 py-3 font-medium text-gray-700 bg-[#ffd400] rounded-lg hover:text-gray-900 hover:bg-[#ffd700] transition-all duration-300 text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Book Consultation
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default Header;
