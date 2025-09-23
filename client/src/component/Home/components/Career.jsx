/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import axios from "axios";
import { toast } from "react-hot-toast";
import JobCard from "./JobCard";

gsap.registerPlugin(ScrollTrigger);

// Move FloatingCvDrop outside the main component
const FloatingCvDrop = ({
  showCvDrop,
  setShowCvDrop,
  formData,
  errors,
  handleChange,
  handleSubmit,
  isSubmitting,
  submitted,
  handleFileRemove,
}) => (
  <div className="fixed bottom-6 left-6 z-50">
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setShowCvDrop(!showCvDrop)}
      className="bg-[#004080] text-white p-4 rounded-full shadow-xl flex items-center justify-center"
      aria-label="Upload CV"
    >
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
        />
      </svg>
    </motion.button>

    {showCvDrop && (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="absolute bottom-16 left-0 w-80 bg-white rounded-lg shadow-xl overflow-hidden"
      >
        {!submitted ? (
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-gray-800">Drop Your CV</h3>
              <button
                onClick={() => setShowCvDrop(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="Close CV Upload Form"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-4 space-y-3">
                <div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Full Name"
                    className={`w-full px-3 py-2 border rounded-md transition-colors ${
                      errors.name
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-300 focus:border-[#004080]"
                    } focus:outline-none focus:ring-1 focus:ring-[#004080]/20`}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email Address"
                    className={`w-full px-3 py-2 border rounded-md transition-colors ${
                      errors.email
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-300 focus:border-[#004080]"
                    } focus:outline-none focus:ring-1 focus:ring-[#004080]/20`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Phone Number"
                    className={`w-full px-3 py-2 border rounded-md transition-colors ${
                      errors.phone
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-300 focus:border-[#004080]"
                    } focus:outline-none focus:ring-1 focus:ring-[#004080]/20`}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>

              {/* File Upload Section */}
              <div className="mb-4">
                {!formData.file ? (
                  <div>
                    <input
                      type="file"
                      name="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleChange}
                      className={`w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#004080]/10 file:text-[#004080] hover:file:bg-[#004080]/20 cursor-pointer ${
                        errors.file ? "border border-red-500 rounded-md" : ""
                      }`}
                    />
                    {errors.file && (
                      <p className="text-red-500 text-sm mt-1">{errors.file}</p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-[#004080]/5 border border-[#004080]/20 rounded-md">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <svg
                          className="w-5 h-5 text-[#004080]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate w-40 sm:w-40">
                          {formData.file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleFileRemove}
                      className="flex-shrink-0 ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                      aria-label="Remove file"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#004080] hover:bg-[#003366] text-white font-medium py-3 px-4 rounded-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Submitting...</span>
                  </div>
                ) : (
                  "Submit"
                )}
              </button>
            </form>
          </div>
        ) : (
          // Thank You Message
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 text-center bg-gradient-to-br from-[#004080]/5 to-[#ffd700]/10"
          >
            <div className="mb-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-16 h-16 mx-auto bg-gradient-to-r from-[#004080] to-[#0056b3] rounded-full flex items-center justify-center shadow-lg"
              >
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </motion.div>
            </div>

            <motion.h3
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xl font-bold text-[#004080] mb-2"
            >
              Thank You!
            </motion.h3>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-700 text-sm leading-relaxed mb-4"
            >
              Your CV has been submitted successfully. We'll review your
              application and get back to you soon.
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center space-x-1 mb-4"
            >
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                  className="w-2 h-2 bg-[#ffd700] rounded-full"
                />
              ))}
            </motion.div>

            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              onClick={() => setShowCvDrop(false)}
              className="text-[#004080] hover:text-[#003366] text-sm font-medium underline decoration-2 underline-offset-2 transition-colors"
            >
              Close
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    )}
  </div>
);

const Career = () => {
  const heroRef = useRef(null);
  const contentRef = useRef(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [showCvDrop, setShowCvDrop] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    file: null,
  });

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get("http://localhost:3500/api/jobs");
        setJobs(response.data);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(max-width: 767px)", () => {
        gsap.fromTo(
          heroRef.current,
          { minHeight: "100vh" },
          {
            minHeight: "70vh",
            ease: "none",
            scrollTrigger: {
              trigger: heroRef.current,
              start: "top top",
              end: "+=300",
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
          }
        );
      });

      mm.add("(min-width: 768px)", () => {
        gsap.fromTo(
          heroRef.current,
          { minHeight: "100vh" },
          {
            minHeight: "60vh",
            ease: "none",
            scrollTrigger: {
              trigger: heroRef.current,
              start: "top top",
              end: "+=400",
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
          }
        );
      });

      gsap.killTweensOf(contentRef.current);
      gsap.set(contentRef.current, { clearProps: "all" });
    });

    return () => ctx.revert();
  }, []);

  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  // Simplified handleChange without error clearing
  const handleChange = useCallback((e) => {
    const { name, value, files } = e.target;

    if (name === "file") {
      setFormData((prev) => ({
        ...prev,
        file: files[0],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  }, []);

  // Handle file removal
  const handleFileRemove = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      file: null,
    }));
    setErrors((prev) => ({
      ...prev,
      file: "",
    }));
  }, []);

  const validateForm = () => {
    let newErrors = {};

    // Name validation
    if (!formData.name) newErrors.name = "Name is required";

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    // Phone validation
    if (!formData.phone) newErrors.phone = "Phone number is required";

    // File validation
    if (!formData.file) {
      newErrors.file = "CV file is required";
    } else {
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedTypes.includes(formData.file.type)) {
        newErrors.file = "Only PDF, DOC, or DOCX files are allowed";
      }
      if (formData.file.size > 5 * 1024 * 1024) {
        newErrors.file = "File size cannot exceed 5MB";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("email", formData.email);
      data.append("phone", formData.phone);
      data.append("file", formData.file);

      const res = await axios.post("http://localhost:3500/api/cv", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        toast.success("CV submitted successfully!");
        setSubmitted(true);
        setFormData({ name: "", email: "", phone: "", file: null });
        setErrors({});

        // Auto-close after 5 seconds
        setTimeout(() => {
          setSubmitted(false);
          setShowCvDrop(false);
        }, 5000);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "CV submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        when: "beforeChildren",
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
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

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
      },
    },
  };

  return (
    <motion.div className="relative">
      <FloatingCvDrop
        showCvDrop={showCvDrop}
        setShowCvDrop={setShowCvDrop}
        formData={formData}
        errors={errors}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitted={submitted}
        handleFileRemove={handleFileRemove}
      />

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="min-h-screen relative text-black py-20 md:py-32 overflow-hidden flex items-center"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            ref={ref}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={containerVariants}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.span
              variants={itemVariants}
              className="cursor-pointer mb-8 px-3 py-1.5 bg-[#004080] text-white font-semibold rounded-full shadow-lg inline-flex items-center justify-center transform hover:scale-105 transition-transform duration-300 group"
            >
              Careers
            </motion.span>
            <motion.h1
              variants={itemVariants}
              className="text-4xl md:text-6xl font-bold mb-6 !text-black"
            >
              Build Your <span className="text-[#004080]">Career</span> While
              Building Dreams
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto"
            >
              Join our mission to transform lives through international
              education
            </motion.p>
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="#positions"
                className="inline-block bg-[#ffd700] hover:bg-[#ffd800] text-black font-bold py-3 px-8 rounded-full transition duration-300"
              >
                View Open Positions
              </motion.a>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCvDrop(!showCvDrop)}
                className="inline-block bg-black/40 hover:bg-black/60 text-white font-bold py-3 px-8 rounded-full transition duration-300 border border-white"
              >
                Drop Your CV
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Why Join Us Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={containerVariants}
            className="text-center mb-16"
          >
            <motion.h2
              variants={itemVariants}
              className="text-3xl md:text-4xl font-bold mb-6 text-gray-900"
            >
              Why Join Us?
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: (
                  <svg
                    className="w-12 h-12 text-[#004080]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ),
                title: "Flexible Work Hours",
                description:
                  "Work when you're most productive with our flexible scheduling options",
              },
              {
                icon: (
                  <svg
                    className="w-12 h-12 text-[#004080]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ),
                title: "Connect with Our Global Partners",
                description:
                  "Opportunity to work with our international education partners worldwide",
              },
              {
                icon: (
                  <svg
                    className="w-12 h-12 text-[#004080]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                ),
                title: "Excellent Homely Work Environment",
                description:
                  "Enjoy a comfortable and supportive workplace that feels like home",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 text-center"
              >
                <div className="flex justify-center mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions Section */}
      <section id="positions" className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={containerVariants}
            className="text-center mb-16"
          >
            <motion.h2
              variants={itemVariants}
              className="text-3xl md:text-4xl font-bold mb-6 text-gray-900"
            >
              Current Openings
            </motion.h2>
          </motion.div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : jobs.length > 0 ? (
            <div className="space-y-6 max-w-4xl mx-auto">
              {jobs.map((job) => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>
          ) : (
            <motion.div
              variants={fadeIn}
              className="bg-white rounded-xl shadow-md overflow-hidden p-12 text-center"
            >
              <svg
                className="w-16 h-16 mx-auto text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="text-2xl font-bold mb-2 text-gray-800">
                No Openings at the Moment
              </h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                We're not hiring right now — but don't worry, exciting
                opportunities are always on the horizon. Stay tuned!
              </p>
            </motion.div>
          )}
        </div>
      </section>
    </motion.div>
  );
};

export default Career;
