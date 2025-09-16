import React, { useState, useRef, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

const Career = () => {
  const heroRef = useRef(null);
  const contentRef = useRef(null);

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

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    position: "General Application",
    file: null,
  });
  const [submitted, setSubmitted] = useState(false);
  const [showCvDrop, setShowCvDrop] = useState(false);
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const formRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    setSubmitted(true);
    setFormData({
      name: "",
      email: "",
      phone: "",
      position: "General Application",
      file: null,
    });
    setTimeout(() => setSubmitted(false), 5000);
  };

  const scrollToForm = (position = "General Application") => {
    setFormData((prev) => ({ ...prev, position }));
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth" });
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

  // Floating CV Drop Button Component
  const FloatingCvDrop = () => (
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute bottom-16 left-0 w-80 bg-white rounded-lg shadow-xl p-4"
        >
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg mb-2 text-gray-800">
              Drop Your CV
            </h3>
            <button
              onClick={() => setShowCvDrop(false)}
              className="text-gray-500 hover:text-gray-700"
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
            <input
              type="file"
              name="file"
              accept=".pdf,.docx"
              required
              onChange={handleChange}
              className="w-full mb-3 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#004080]/10 file:text-[#004080] hover:file:bg-[#004080]/20"
            />
            <button
              type="submit"
              className="w-full bg-[#004080] hover:bg-[#003366] text-white font-medium py-2 px-4 rounded transition duration-300"
            >
              Submit CV
            </button>
          </form>
        </motion.div>
      )}
    </div>
  );

  return (
    <motion.div className="relative">
      <FloatingCvDrop />

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
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => scrollToForm()}
              className="mt-6 inline-block bg-[#004080] hover:bg-[#003366] text-white font-bold py-3 px-6 rounded-lg transition duration-300"
            >
              Submit General Application
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Application Form Section */}
      <section id="apply" className="py-20" ref={formRef}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
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
                Apply Now
              </motion.h2>
              <motion.p
                variants={itemVariants}
                className="text-xl text-gray-600 max-w-2xl mx-auto"
              >
                Submit your CV and we'll contact you when positions open up
              </motion.p>
            </motion.div>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-100 border border-green-400 text-green-700 px-4 py-8 rounded-xl text-center"
              >
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="text-2xl font-bold mb-2">
                  Thank you for your application!
                </h3>
                <p>
                  We'll contact you when suitable positions become available.
                </p>
              </motion.div>
            ) : (
              <motion.form
                variants={fadeIn}
                onSubmit={handleSubmit}
                className="bg-white p-8 rounded-xl shadow-md"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Full Name*
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#004080] focus:ring-2 focus:ring-[#004080]/50 transition duration-300"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Email*
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#004080] focus:ring-2 focus:ring-[#004080]/50 transition duration-300"
                      placeholder="your.email@example.com"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Phone*
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#004080] focus:ring-2 focus:ring-[#004080]/50 transition duration-300"
                      placeholder="+880 1XXX XXXXXX"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="position"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Position*
                    </label>
                    <select
                      id="position"
                      name="position"
                      required
                      value={formData.position}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#004080] focus:ring-2 focus:ring-[#004080]/50 transition duration-300"
                    >
                      <option value="General Application">
                        General Application
                      </option>
                    </select>
                  </div>
                </div>
                <div className="mb-6">
                  <label
                    htmlFor="file"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Upload CV (PDF or DOCX)*
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col w-full border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition duration-300">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4">
                        <svg
                          className="w-10 h-10 mb-3 text-gray-400"
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
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span>{" "}
                          or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          PDF or DOCX (Max. 5MB)
                        </p>
                      </div>
                      <input
                        id="file"
                        name="file"
                        type="file"
                        accept=".pdf,.docx"
                        required
                        onChange={handleChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full bg-[#004080] hover:bg-[#003366] text-white font-bold py-4 px-6 rounded-lg transition duration-300"
                >
                  Submit Application
                </motion.button>
              </motion.form>
            )}
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default Career;
