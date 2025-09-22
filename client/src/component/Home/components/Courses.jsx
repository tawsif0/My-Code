import React, { useState, useEffect, useContext } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  FiBookOpen,
  FiVideo,
  FiUsers,
  FiClock,
  FiStar,
  FiEye,
  FiShoppingCart,
  FiCheck,
} from "react-icons/fi";
import AuthContext from "../../../context/AuthContext"; // Adjust path as needed
import { useNavigate } from "react-router-dom";
import { useCart } from "../../../context/useCart";

const Courses = () => {
  const navigate = useNavigate();
  const { studentData } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("free");
  const [hoveredCourse, setHoveredCourse] = useState(null);
  const [showAllCourses, setShowAllCourses] = useState(false);
  const [courses, setCourses] = useState([]);
  // const [loading, setLoading] = useState(true);
  const [sectionRef, sectionInView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });
  const [categories, setCategories] = useState([]);
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterLevel, setFilterLevel] = useState("all");
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  const {
    addToCart,
    removeFromCart,
    isInCart,
    loading: cartLoading,
  } = useCart();

  const base_url =
    import.meta.env.VITE_API_KEY_Base_URL || "http://localhost:3500";

  const isAuthenticated = studentData && localStorage.getItem("studentToken");

  useEffect(() => {
    const fetchData = async () => {
      // setLoading(true);
      try {
        // Fetch all data in parallel
        const [coursesResponse, categoriesResponse, teachersResponse] =
          await Promise.all([
            axios.get(`${base_url}/api/auth/all-courses`),
            axios.get(`${base_url}/api/auth/categories`),
            axios.get(`${base_url}/api/auth/teachers`),
          ]);

        if (coursesResponse.data.success) {
          const teachersList = teachersResponse.data?.teachers || [];

          const formattedCourses = coursesResponse.data.courses.map(
            (course) => {
              // Find instructor - handle both object ID and populated instructor
              let instructor = null;
              if (course.instructor) {
                if (
                  typeof course.instructor === "object" &&
                  course.instructor._id
                ) {
                  // Instructor is populated
                  instructor = course.instructor;
                } else {
                  // Instructor is just an ID, find in teachers list
                  instructor = teachersList.find((teacher) => {
                    return (
                      teacher._id.toString() === course.instructor.toString()
                    );
                  });
                }
              }

              // Determine course type
              let courseType;
              if (course.type === "live") {
                courseType = "live";
              } else {
                courseType = course.price > 0 ? "premium" : "free";
              }

              // Calculate total content items (lessons + live sessions)
              const totalContent = course.content ? course.content.length : 0;
              const liveSessions = course.content
                ? course.content.filter((item) => item.type === "live").length
                : 0;
              const regularLessons = totalContent - liveSessions;

              // Get next session for live courses
              let nextSession;
              if (course.type === "live" && course.content?.length > 0) {
                const liveSessionItems = course.content.filter(
                  (item) => item.type === "live" && item.schedule
                );
                if (liveSessionItems.length > 0) {
                  const upcomingSessions = liveSessionItems
                    .filter(
                      (session) => new Date(session.schedule) > new Date()
                    )
                    .sort(
                      (a, b) => new Date(a.schedule) - new Date(b.schedule)
                    );

                  nextSession =
                    upcomingSessions.length > 0
                      ? upcomingSessions[0].schedule
                      : liveSessionItems[liveSessionItems.length - 1].schedule;
                }
              }

              return {
                id: course._id,
                title: course.title || "Untitled Course",
                description: course.description || "No description available",
                thumbnail: course.thumbnail?.filename
                  ? `${base_url}/courses/${course.thumbnail.path}`
                  : course.thumbnail ||
                    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
                instructor: instructor
                  ? instructor.full_name || "Unknown Instructor"
                  : "Unknown Instructor",
                instructorThumbnail: instructor?.profile_photo
                  ? `${base_url}/teachers/${instructor.profile_photo}`
                  : null,
                rating: course.averageRating || 0,
                students: course.totalStudents || 0,
                price: course.price || 0,
                type: courseType,
                categories:
                  course.categories?.map((cat) =>
                    typeof cat === "object" ? cat.name : cat
                  ) || [],
                level: course.level || "beginner",
                nextSession,
                isLive: course.type === "live",
                totalContent, // Total content items
                regularLessons, // Regular lessons count
                liveSessions, // Live sessions count
              };
            }
          );

          setCourses(formattedCourses);
        }

        if (categoriesResponse.data.success) {
          setCategories(categoriesResponse.data.categories);
        }

        // Fetch cart and enrollment data if user is logged in

        if (isAuthenticated) {
          try {
            // Fetch enrolled courses
            const enrolledResponse = await axios.get(
              `${base_url}/api/student/enrolled-courses/${studentData._id}`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem(
                    "studentToken"
                  )}`,
                },
              }
            );

            if (enrolledResponse.data.success) {
              const enrolledIds = enrolledResponse.data.enrolledCourses
                .map((ec) => ec?.courseDetails?._id)
                .filter(Boolean);
              setEnrolledCourses(enrolledIds);
            }
          } catch (error) {
            console.error("Error fetching enrolled courses:", error);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error(error.response?.data?.message || "Failed to load courses");
      }
    };

    fetchData();
  }, [base_url, isAuthenticated, studentData]);

  const isEnrolled = (courseId) => {
    return enrolledCourses.some((id) => id.toString() === courseId.toString());
  };

  const handleAddToCart = async (course, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Check if user is logged in
    if (!isAuthenticated) {
      toast.error("Please login to add courses to cart");
      navigate("/student");
      return;
    }

    if (isEnrolled(course.id)) {
      toast.error("You are already enrolled in this course");
      return;
    }

    if (isInCart(course.id)) {
      toast.error("Course already in cart");
      return;
    }

    const success = await addToCart(course);
    if (!success) {
      toast.error("Failed to add course to cart");
    }
  };
  const handleRemoveFromCart = async (courseId) => {
    const success = await removeFromCart(courseId);
    if (!success) {
      toast.error("Failed to add course to cart");
    }
  };
  // Filter courses based on active tab and filters
  const getFilteredCourses = () => {
    let results = [...courses];

    // Filter by tab type
    switch (activeTab) {
      case "free":
        results = results.filter((course) => course.type === "free");
        break;
      case "premium":
        results = results.filter((course) => course.type === "premium");
        break;
      case "live":
        results = results.filter((course) => course.type === "live");
        break;
      default:
        break;
    }

    // Filter by category
    if (filterCategory !== "all") {
      results = results.filter((course) =>
        course.categories?.some(
          (cat) => cat.toLowerCase() === filterCategory.toLowerCase()
        )
      );
    }

    // Filter by level
    if (filterLevel !== "all") {
      results = results.filter(
        (course) => course.level?.toLowerCase() === filterLevel.toLowerCase()
      );
    }

    return results;
  };

  // Get courses to display based on tab and showAll state
  const getDisplayedCourses = () => {
    const filteredCourses = getFilteredCourses();
    return showAllCourses ? filteredCourses : filteredCourses.slice(0, 3);
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

  const headerVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        delay: 0.2,
      },
    },
  };

  const tabsVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delay: 0.4,
        duration: 0.6,
      },
    },
  };

  // Get unique category options from courses
  const categoryOptions =
    categories.length > 0
      ? categories.map((cat) => (typeof cat === "object" ? cat.name : cat))
      : Array.from(
          new Set(courses.flatMap((c) => c.categories || []).filter(Boolean))
        );

  // if (loading) {
  //   return (
  //     <section className="relative py-36 overflow-hidden">
  //       <div className="container mx-auto px-4 relative">
  //         <div className="text-center">
  //           <div className="animate-pulse">
  //             <div className="h-8 w-48 bg-gray-300 rounded-full mx-auto mb-4"></div>
  //             <div className="h-12 w-96 bg-gray-300 rounded mx-auto mb-6"></div>
  //             <div className="h-6 w-80 bg-gray-300 rounded mx-auto mb-12"></div>
  //           </div>
  //           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
  //             {[1, 2, 3].map((item) => (
  //               <div key={item} className="bg-white rounded-xl shadow-md p-6">
  //                 <div className="animate-pulse">
  //                   <div className="h-40 bg-gray-300 rounded mb-4"></div>
  //                   <div className="h-6 bg-gray-300 rounded mb-2"></div>
  //                   <div className="h-4 bg-gray-300 rounded mb-4"></div>
  //                   <div className="h-10 bg-gray-300 rounded"></div>
  //                 </div>
  //               </div>
  //             ))}
  //           </div>
  //         </div>
  //       </div>
  //     </section>
  //   );
  // }

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
            We offer free, premium, and live courses to help you achieve your
            study abroad dreams. Quality education tailored for your success.
          </motion.p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial="hidden"
          animate={sectionInView ? "visible" : "hidden"}
          variants={tabsVariants}
          className="flex justify-center mb-8"
        >
          <div className="inline-flex rounded-full bg-gray-200 p-1">
            {["free", "premium", "live"].map((tab) => (
              <motion.button
                key={tab}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-5 py-2 text-sm md:px-6 md:py-2 md:text-base font-medium rounded-full transition-all duration-300 ${
                  activeTab === tab
                    ? "bg-white text-[#004080] shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
                onClick={() => {
                  setActiveTab(tab);
                  setShowAllCourses(false);
                }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)} Courses
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Category Filter Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={sectionInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap justify-center gap-3 mb-8 px-4"
        >
          {/* All Categories */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-5 py-2.5 rounded-full text-sm sm:text-base font-medium transition-all duration-300 ${
              filterCategory === "all"
                ? "bg-[#004080] text-white shadow-lg"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => {
              setFilterCategory("all");
              setShowAllCourses(false);
            }}
          >
            All Categories
          </motion.button>

          {/* Dynamic Category Buttons */}
          {categoryOptions.map((categoryName, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-5 py-2.5 rounded-full text-sm sm:text-base font-medium transition-all duration-300 ${
                filterCategory === categoryName.toLowerCase()
                  ? "bg-[#004080] text-white shadow-lg"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              onClick={() => {
                setFilterCategory(categoryName.toLowerCase());
                setShowAllCourses(false);
              }}
            >
              {categoryName}
            </motion.button>
          ))}
        </motion.div>

        {/* Level Filter Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap justify-center gap-3 mb-12 px-4"
        >
          {[
            { value: "all", label: "All Levels" },
            { value: "beginner", label: "Beginner" },
            { value: "intermediate", label: "Intermediate" },
            { value: "advanced", label: "Advanced" },
          ].map((level) => (
            <motion.button
              key={level.value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-5 py-2.5 rounded-full text-sm sm:text-base font-medium transition-all duration-300 ${
                filterLevel === level.value
                  ? "bg-[#004080] text-white shadow-lg"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              onClick={() => setFilterLevel(level.value)}
            >
              {level.label}
            </motion.button>
          ))}
        </motion.div>

        {/* Courses Grid */}
        <motion.div
          initial="hidden"
          animate={sectionInView ? "visible" : "hidden"}
          variants={containerVariants}
          className={`${
            getDisplayedCourses().length === 1
              ? "flex justify-center"
              : getDisplayedCourses().length === 2
              ? "flex flex-col md:flex-row justify-center items-center w-full gap-6"
              : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          }`}
        >
          {getDisplayedCourses().map((course, index) => (
            <motion.div
              key={course.id}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className={`relative group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 w-full sm:max-w-[300px] lg:max-w-[350px] flex flex-col
    ${getDisplayedCourses().length === 2 && index === 0 ? "lg:ml-auto" : ""}
    ${getDisplayedCourses().length === 2 && index === 1 ? "lg:mr-auto" : ""}
    ${hoveredCourse === course.id ? "transform scale-[1.02]" : ""}`}
              onMouseEnter={() => setHoveredCourse(course.id)}
              onMouseLeave={() => setHoveredCourse(null)}
            >
              <div
                className={`absolute top-4 right-4 z-10 px-3 py-1 text-xs font-semibold rounded-full ${
                  course.type === "free"
                    ? "bg-green-100 text-green-800"
                    : course.type === "premium"
                    ? "bg-purple-100 text-purple-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {course.type.toUpperCase()}
              </div>

              {/* Course header with image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    e.target.src =
                      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                {course.isLive && (
                  <div className="absolute top-3 left-3 bg-white text-purple-600 p-1 rounded-full shadow-sm">
                    <FiVideo className="text-sm" />
                  </div>
                )}
              </div>

              {/* Course Content */}
              <div className="p-5 flex flex-col flex-grow">
                {/* Title and Level */}
                <div className="mb-3">
                  <h3 className="text-lg font-bold line-clamp-2 text-gray-800 mb-1">
                    {course.title}
                  </h3>
                  <span className="text-xs text-gray-500 capitalize">
                    {course.level}
                  </span>
                </div>

                {/* Instructor */}
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 overflow-hidden flex items-center justify-center">
                      {course.instructorThumbnail ? (
                        <img
                          src={course.instructorThumbnail}
                          alt={course.instructor}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src =
                              "https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-1.2.1&auto=format&fit=crop&w=80&q=80";
                          }}
                        />
                      ) : (
                        <svg
                          className="w-4 h-4 text-gray-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Taught by</p>
                    <p className="text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors">
                      {course.instructor}
                    </p>
                  </div>
                </div>

                {/* Description */}
                {course.description && (
                  <div
                    className="prose prose-lg max-w-none text-sm text-gray-600 mb-4 line-clamp-1"
                    dangerouslySetInnerHTML={{
                      __html: course.description,
                    }}
                  />
                )}

                {/* Stats */}
                <div className="mb-4 text-sm text-gray-500">
                  {course.type === "free" ? (
                    <div className="flex items-center justify-between">
                      {/* Left side: Rating + Students */}
                      <div className="flex items-center gap-x-3">
                        <span className="flex items-center">
                          <FiStar className="mr-1 text-yellow-400" />
                          {course.rating > 0
                            ? course.rating.toFixed(1)
                            : "No ratings"}
                        </span>
                        <span className="flex items-center">
                          <FiUsers className="mr-1" />
                          {course.students.toLocaleString()}
                        </span>
                      </div>
                      {/* Right side: Lessons */}
                      <div className="flex items-center">
                        <FiBookOpen className="mr-1" />
                        {course.totalContent} lessons
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-1">
                        {/* Left side: Rating + Students */}
                        <div className="flex items-center gap-x-3">
                          <span className="flex items-center">
                            <FiStar className="mr-1 text-yellow-400" />
                            {course.rating > 0
                              ? course.rating.toFixed(1)
                              : "No ratings"}
                          </span>
                          <span className="flex items-center">
                            <FiUsers className="mr-1" />
                            {course.students.toLocaleString()}
                          </span>
                        </div>
                        {/* Right side: Price */}
                        {course.price > 0 && (
                          <div className="font-bold text-[#004080] text-lg">
                            ৳{course.price}
                          </div>
                        )}
                      </div>
                      {/* Lessons below */}
                      <div className="flex items-center">
                        <FiBookOpen className="mr-1" />
                        {course.totalContent} lessons
                      </div>
                    </>
                  )}
                </div>

                {/* Live course specific info */}
                {course.isLive && course.nextSession && (
                  <div className="mb-4">
                    <div className="bg-purple-50 text-purple-800 text-xs px-3 py-2 rounded-lg">
                      <div className="flex items-center">
                        <FiClock className="mr-2 flex-shrink-0" />
                        <span className="truncate">
                          {new Date(course.nextSession).toLocaleString(
                            "en-US",
                            {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons - Fixed at bottom */}
              <div className="mt-auto p-5 pt-0">
                {isEnrolled(course.id) ? (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full bg-green-50 text-green-700 py-2 rounded-lg text-sm text-center flex items-center justify-center"
                  >
                    <FiCheck className="mr-2" /> Enrolled
                  </motion.span>
                ) : isInCart(course.id) ? (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemoveFromCart(course.id);
                    }}
                    className="w-full bg-white text-red-600 border border-red-200 hover:border-red-300 py-2 rounded-lg text-sm hover:bg-red-50 flex items-center justify-center transition-all"
                  >
                    <FiShoppingCart className="mr-2" /> Remove from Cart
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleAddToCart(course);
                    }}
                    className={`w-full py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center ${
                      course.type === "free"
                        ? "bg-blue-100 text-[#004080] hover:bg-blue-200"
                        : course.type === "premium"
                        ? "bg-purple-100 text-purple-600 hover:bg-purple-200"
                        : "bg-red-100 text-red-600 hover:bg-red-200"
                    }`}
                    disabled={cartLoading}
                  >
                    <FiShoppingCart className="mr-2" />
                    {course.type === "free" && "Add to Cart"}
                    {course.type === "premium" && (
                      <>Add to Cart - ৳{course.price}</>
                    )}
                    {course.type === "live" && (
                      <>Add to Cart - ৳{course.price}</>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* View More / View Less Button */}
        {getFilteredCourses().length > 3 && (
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
        )}

        {/* Empty state */}
        {getFilteredCourses().length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            {/* SVG Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mx-auto mb-4 w-16 h-16 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 6.75v10.5a.75.75 0 00.75.75h13.5a.75.75 0 00.75-.75V6.75m-15 0A2.25 2.25 0 016.75 4.5h10.5a2.25 2.25 0 012.25 2.25m-15 0v10.5m15-10.5v10.5m-12-9h9m-9 3h9m-9 3h5.25"
              />
            </svg>

            <div className="text-gray-500 text-lg">
              No {activeTab} courses available at the moment.
            </div>
            <p className="text-gray-400 mt-2">
              Check back later for new course offerings.
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default Courses;
