/* eslint-disable no-unused-vars */
import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const CTA = () => {
  const navigate = useNavigate();

  const handleBookConsultation = () => {
    navigate("/appointment");
  };

  const handleExploreCourses = () => {
    navigate("/courses");
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      boxShadow: "0px 15px 30px rgba(0, 64, 128, 0.3)",
      transition: {
        duration: 0.3,
      },
    },
    tap: {
      scale: 0.98,
    },
  };

  const goldButtonVariants = {
    hover: {
      scale: 1.05,
      boxShadow: "0px 15px 30px rgba(255, 215, 0, 0.3)",
      transition: {
        duration: 0.3,
      },
    },
    tap: {
      scale: 0.98,
    },
  };

  return (
    <section className="relative py-28 px-6 overflow-hidden">
      {/* Premium decorative elements */}

      {/* Geometric patterns - border removed */}

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="text-center"
        >
          {/* Premium title */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="text-center mb-12 md:mb-16"
          >
            <motion.span
              variants={itemVariants}
              className="text-sm font-semibold tracking-wider text-white uppercase mb-4 inline-block bg-[#004080] px-4 py-1.5 rounded-full"
            >
              Start From Today
            </motion.span>
            <motion.h2
              variants={itemVariants}
              className="text-4xl md:text-5xl lg:text-6xl font-bold !text-gray-900 mb-6 mt-7"
            >
              Transform Your Career With{" "}
              <span className="text-[#004080]">Premium & Excellence</span>
            </motion.h2>
            <div className="w-24 h-1 bg-[#004080] mx-auto rounded-full"></div>
            <motion.p
              variants={itemVariants}
              className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto mt-7"
            >
              Our exclusive programs and personalized mentorship are designed to
              propel your career to extraordinary heights. Choose your path to
              success.
            </motion.p>
          </motion.div>
          {/* Premium buttons */}
          <motion.div
            variants={containerVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-8"
          >
            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={handleBookConsultation}
              className="relative px-10 py-5 bg-[#004080] text-white font-medium rounded-xl overflow-hidden group"
              style={{
                boxShadow: "0 8px 20px rgba(0, 64, 128, 0.2)",
              }}
            >
              <span className="relative z-10 flex items-center text-lg">
                <span className="mr-3">Book Free Consultation</span>
                <svg
                  className="w-6 h-6 transition-transform duration-300 group-hover:translate-x-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </span>
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-blue-900 to-[#004080] opacity-0"
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
              <span className="absolute inset-0 border-2 border-white/20 rounded-xl pointer-events-none"></span>
            </motion.button>

            <motion.button
              variants={goldButtonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={handleExploreCourses}
              className="relative px-10 py-5 bg-[#ffd700] text-gray-900 font-medium rounded-xl overflow-hidden group"
              style={{
                boxShadow: "0 8px 20px rgba(255, 215, 0, 0.2)",
              }}
            >
              <span className="relative z-10 flex items-center text-lg">
                <span className="mr-3">Explore Our Courses</span>
                <svg
                  className="w-6 h-6 transition-transform duration-300 group-hover:translate-x-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </span>
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-[#ffd700] opacity-0"
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
              <span className="absolute inset-0 border-2 border-white/20 rounded-xl pointer-events-none"></span>
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
