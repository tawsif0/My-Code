import React, { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

// Dummy course images (you can replace with actual image imports)
const courseImages = [
  "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
  "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
  "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
  "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
];

const Courses = () => {
  const [activeTab, setActiveTab] = useState("free");
  const [hoveredCourse, setHoveredCourse] = useState(null);
  const [showAllCourses, setShowAllCourses] = useState(false);
  const [sectionRef, sectionInView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  const freeCourses = [
    {
      id: 1,
      title: "IELTS Preparation",
      description:
        "Comprehensive course covering all sections of the IELTS exam with practice materials and mock tests.",
      duration: "4 weeks",
      lessons: 20,
      icon: "📝",
      image: courseImages[0],
      level: "Beginner"
    },
    {
      id: 2,
      title: "SAT Crash Course",
      description:
        "Essential strategies and practice for the SAT exam with focus on Math and Evidence-Based Reading.",
      duration: "3 weeks",
      lessons: 15,
      icon: "🧮",
      image: courseImages[1],
      level: "Intermediate"
    },
    {
      id: 3,
      title: "GRE Quantitative",
      description:
        "Master the quantitative section of GRE with our focused training modules and practice tests.",
      duration: "5 weeks",
      lessons: 25,
      icon: "📊",
      image: courseImages[2],
      level: "Advanced"
    },
    {
      id: 4,
      title: "TOEFL Speaking",
      description:
        "Improve your TOEFL speaking score with our specialized course focusing on fluency and pronunciation.",
      duration: "3 weeks",
      lessons: 12,
      icon: "🗣️",
      image: courseImages[3],
      level: "Intermediate"
    },
    {
      id: 5,
      title: "Academic Writing",
      description:
        "Learn the essentials of academic writing for university applications and research papers.",
      duration: "4 weeks",
      lessons: 16,
      icon: "✍️",
      image: courseImages[4],
      level: "Beginner"
    },
    {
      id: 6,
      title: "Study Abroad Guide",
      description:
        "Everything you need to know about studying abroad - from applications to cultural adaptation.",
      duration: "2 weeks",
      lessons: 8,
      icon: "🌍",
      image: courseImages[5],
      level: "Beginner"
    }
  ];

  const premiumCourses = [
    {
      id: 1,
      title: "Complete Guide to Higher Study Abroad",
      description:
        "End-to-end guidance for studying abroad including university selection, application process, and visa assistance with personalized counseling.",
      duration: "6 weeks",
      lessons: 30,
      price: "$199",
      icon: "🌍",
      image: courseImages[3],
      level: "All Levels"
    },
    {
      id: 2,
      title: "Statement of Purpose Masterclass",
      description:
        "Learn how to craft a winning SOP that stands out to admission committees with expert reviews.",
      duration: "2 weeks",
      lessons: 8,
      price: "$99",
      icon: "✍️",
      image: courseImages[4],
      level: "Intermediate"
    },
    {
      id: 3,
      title: "Visa Interview Preparation",
      description:
        "Comprehensive training to ace your visa interview with mock sessions and personalized feedback.",
      duration: "3 weeks",
      lessons: 12,
      price: "$149",
      icon: "🛂",
      image: courseImages[5],
      level: "All Levels"
    },
    {
      id: 4,
      title: "University Application Package",
      description:
        "Complete assistance for 5 university applications including document preparation and review.",
      duration: "8 weeks",
      lessons: 20,
      price: "$299",
      icon: "🏛️",
      image: courseImages[0],
      level: "All Levels"
    },
    {
      id: 5,
      title: "Scholarship Application Guide",
      description:
        "Learn how to find and apply for scholarships with successful application templates.",
      duration: "3 weeks",
      lessons: 10,
      price: "$129",
      icon: "💰",
      image: courseImages[1],
      level: "Intermediate"
    },
    {
      id: 6,
      title: "GMAT Advanced Strategies",
      description:
        "Advanced techniques for high scorers with personalized study plans and analytics.",
      duration: "6 weeks",
      lessons: 24,
      price: "$249",
      icon: "📈",
      image: courseImages[2],
      level: "Advanced"
    }
  ];

  // Get courses to display based on tab and showAll state
  const getDisplayedCourses = () => {
    const courses = activeTab === "free" ? freeCourses : premiumCourses;
    return showAllCourses ? courses : courses.slice(0, 3);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        when: "beforeChildren"
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }
  };

  const headerVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        delay: 0.2
      }
    }
  };

  const tabsVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delay: 0.4,
        duration: 0.6
      }
    }
  };

  return (
    <section ref={sectionRef} className="relative py-36 overflow-hidden">
      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate={sectionInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="text-center mb-12 md:mb-16"
        >
          <motion.span
            variants={headerVariants}
            className="mb-8 px-3 py-1.5 bg-[#004080] text-white font-semibold rounded-full shadow-lg inline-flex items-center justify-center transform hover:scale-105 transition-transform duration-300 group"
          >
            Start Learning Today
          </motion.span>
          <motion.h2
            variants={headerVariants}
            className="text-3xl md:text-4xl font-bold mb-4 text-gray-900"
          >
            Transform Your Future
          </motion.h2>
          <motion.p
            variants={headerVariants}
            className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto"
          >
            We offer both free and premium courses to help you achieve your
            study abroad dreams. Quality education tailored for your success.
          </motion.p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial="hidden"
          animate={sectionInView ? "visible" : "hidden"}
          variants={tabsVariants}
          className="flex justify-center mb-12 md:mb-16"
        >
          <div className="inline-flex rounded-full bg-gray-200 p-1">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-5 py-2 text-sm md:px-6 md:py-2 md:text-base font-medium rounded-full transition-all duration-300 ${
                activeTab === "free"
                  ? "bg-white text-[#004080] shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => {
                setActiveTab("free");
                setShowAllCourses(false);
              }}
            >
              Free Courses
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-5 py-2 text-sm md:px-6 md:py-2 md:text-base font-medium rounded-full transition-all duration-300 ${
                activeTab === "premium"
                  ? "bg-white text-[#004080] shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => {
                setActiveTab("premium");
                setShowAllCourses(false);
              }}
            >
              Premium Courses
            </motion.button>
          </div>
        </motion.div>

        {/* Courses Grid */}
        <motion.div
          initial="hidden"
          animate={sectionInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
        >
          {getDisplayedCourses().map((course) => (
            <motion.div
              key={course.id}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className={`relative group overflow-hidden rounded-xl bg-white shadow-md hover:shadow-lg transition-all duration-300 h-full flex flex-col
                ${hoveredCourse === course.id ? "transform scale-[1.02]" : ""}`}
              onMouseEnter={() => setHoveredCourse(course.id)}
              onMouseLeave={() => setHoveredCourse(null)}
            >
              <div
                className={`absolute top-4 right-4 z-10 px-3 py-1 text-xs font-semibold rounded-full ${
                  activeTab === "free"
                    ? "bg-green-100 text-green-800"
                    : "bg-purple-100 text-purple-800"
                }`}
              >
                {activeTab === "free" ? "FREE" : "PREMIUM"}
              </div>
              {/* Course header with image */}
              <div className="relative h-40 overflow-hidden">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              </div>

              {/* Course Title and Tag (Displayed Below Image) */}
              <div className="p-4">
                <h3 className="text-xl font-bold text-gray-900 mt-2">
                  {course.title}
                </h3>
                <span className="text-xs text-gray-500">{course.level}</span>
              </div>

              {/* Course Body */}
              <div className="flex-1 p-5 md:p-6 flex flex-col">
                <p className="mb-4 md:mb-6 text-gray-600 text-sm md:text-base">
                  {course.description}
                </p>

                <div className="flex justify-between items-center mb-4 text-xs md:text-sm text-gray-500">
                  <span className="flex items-center">
                    <svg
                      className="w-3 h-3 md:w-4 md:h-4 mr-1 text-[#004080]"
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
                    {course.duration}
                  </span>
                  <span className="flex items-center">
                    <svg
                      className="w-3 h-3 md:w-4 md:h-4 mr-1 text-[#004080]"
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
                    {course.lessons} lessons
                  </span>
                </div>

                {course.price && (
                  <div className="mb-4">
                    <span className="text-xs text-gray-400">Starting at</span>
                    <div className="text-xl font-bold text-[#004080]">
                      {course.price}
                    </div>
                  </div>
                )}

                {/* Align the button at the bottom */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`mt-auto w-full py-2 md:py-3 px-4 rounded-lg font-medium transition-all duration-300 text-sm md:text-base ${
                    activeTab === "free"
                      ? "bg-blue-100 text-[#004080] hover:bg-blue-200"
                      : "bg-purple-100 text-purple-600 hover:bg-purple-200"
                  }`}
                >
                  {activeTab === "free" ? "Enroll Now" : "Get This Course"}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* View More / View Less Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={sectionInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6 }}
          className="text-center mt-12 md:mt-16"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAllCourses(!showAllCourses)}
            className="px-6 py-2 md:px-8 md:py-3 bg-[#004080] text-white font-medium rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:bg-[#003366]"
          >
            {showAllCourses ? "View Less Courses" : "View All Courses"}
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default Courses;
