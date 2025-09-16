/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiBookOpen,
  FiVideo,
  FiShoppingCart,
  FiCheck,
  FiStar,
  FiFilter,
  FiSearch,
  FiClock,
  FiUsers,
  FiEye,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

const CourseList = ({ setActiveView }) => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceFilter, setPriceFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [enrolling, setEnrolling] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const studentData = JSON.parse(localStorage.getItem("studentData"));
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterLevel, setFilterLevel] = useState("all");
  const [categories, setCategories] = useState([]);
  const [teachers, setTeachers] = useState([]);

  // Fetch courses, enrolled courses, and cart
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      let teachersList = [];
      try {
        const teachersResponse = await axios.get(
          `${base_url}/api/student/teachers`
        );
        if (teachersResponse.data?.success) {
          teachersList = teachersResponse.data.teachers || [];
        }

        // Fetch all courses
        const coursesResponse = await axios.get(
          `${base_url}/api/student/all-courses`
        );
        const categoriesResponse = await axios.get(
          `${base_url}/api/auth/categories`
        );

        if (coursesResponse.data.success) {
          const formattedCourses = coursesResponse.data.courses.map(
            (course) => {
              const instructor = teachersList.find((teacher) => {
                const teacherIdStr = teacher._id.toString();
                const courseInstructorStr = course.instructor?.toString();
                return teacherIdStr === courseInstructorStr;
              });
              let courseType;
              if (course.type === "live") {
                courseType = "live";
              } else {
                courseType = course.price > 0 ? "premium" : "free";
              }

              // Get next session for live courses
              let nextSession;
              if (course.type === "live" && course.content?.length > 0) {
                const liveSessions = course.content.filter(
                  (item) => item.type === "live"
                );
                if (liveSessions.length > 0) {
                  const upcomingSessions = liveSessions
                    .filter(
                      (session) => new Date(session.schedule) > new Date()
                    )
                    .sort(
                      (a, b) => new Date(a.schedule) - new Date(b.schedule)
                    );

                  nextSession =
                    upcomingSessions.length > 0
                      ? upcomingSessions[0].schedule
                      : liveSessions[liveSessions.length - 1].schedule;
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
                  ? instructor.full_name
                  : "Unknown Instructor",
                instructorThumbnail: instructor?.profile_photo
                  ? `${base_url}/uploads/teachers/${instructor?.profile_photo}`
                  : null,
                rating: course.averageRating || 0,
                students: course.totalStudents || 0,
                price: course.price || 0,
                type: course.price > 0 ? "premium" : "free",
                categories:
                  course.categories?.map((cat) =>
                    typeof cat === "object" ? cat.name : cat
                  ) || [],
                level: course.level || "beginner",
                nextSession, // Add next session time for live courses
                isLive: course.type === "live", // Flag for live courses
                totalSessions:
                  course.type === "live"
                    ? course.content?.filter((item) => item.type === "live")
                        .length || 0
                    : 0,
              };
            }
          );

          setCourses(formattedCourses);
          setFilteredCourses(formattedCourses);
        }

        if (categoriesResponse.data.success) {
          setCategories(categoriesResponse.data.categories);
        }

        // Fetch enrolled courses if student is logged in
        const isAuthenticated =
          studentData?.id && localStorage.getItem("studentToken");

        if (isAuthenticated) {
          try {
            // Fetch enrolled courses
            const enrolledResponse = await axios.get(
              `${base_url}/api/student/enrolled-courses/${studentData.id}`,
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
                .filter(Boolean); // Filter out invalid IDs
              setEnrolledCourses(enrolledIds);
            }
          } catch (enrolledError) {
            console.error("Error fetching enrolled courses:", enrolledError);
            toast.error("Failed to load enrolled courses");
          }

          // Fetch cart from server
          await fetchCart();
        } else {
          try {
            const savedCart =
              JSON.parse(localStorage.getItem("courseCart")) || [];
            const validCart = savedCart.filter(
              (item) => item?.id && item?.title && !isNaN(item?.price)
            );
            setCart(validCart);
            if (validCart.length !== savedCart.length) {
              localStorage.setItem("courseCart", JSON.stringify(validCart));
            }
          } catch (localStorageError) {
            console.error(
              "Error loading cart from localStorage:",
              localStorageError
            );
            localStorage.removeItem("courseCart");
            setCart([]);
          }
        }
      } catch (error) {
        console.error("Error in fetchData:", error);
        toast.error(error.response?.data?.message || "Failed to load data");

        if (error.response?.status === 401) {
          setEnrolledCourses([]);
          setCart([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let results = courses;

    if (searchTerm) {
      results = results.filter(
        (course) =>
          course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (course.instructor &&
            course.instructor
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          (course.description &&
            course.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (priceFilter === "free") {
      results = results.filter(
        (course) => course.price === 0 && !course.isLive
      );
    } else if (priceFilter === "paid") {
      results = results.filter((course) => course.price > 0 && !course.isLive);
    } else if (priceFilter === "live") {
      results = results.filter((course) => course.isLive);
    }

    if (filterType !== "all") {
      results = results.filter((course) => {
        if (filterType === "live") {
          return course.isLive;
        } else if (filterType === "premium") {
          return course.type === "premium" && !course.isLive;
        } else {
          return course.type === "free" && !course.isLive;
        }
      });
    }

    if (filterCategory !== "all") {
      results = results.filter((course) =>
        course.categories?.some(
          (cat) => cat.toLowerCase() === filterCategory.toLowerCase()
        )
      );
    }

    if (filterLevel !== "all") {
      results = results.filter(
        (course) => course.level?.toLowerCase() === filterLevel.toLowerCase()
      );
    }

    setFilteredCourses(results);
  }, [
    searchTerm,
    priceFilter,
    courses,
    filterType,
    filterCategory,
    filterLevel,
  ]);

  const categoryOptions = Array.from(
    new Set(courses.flatMap((c) => c.categories || []).filter(Boolean))
  );

  const fetchCart = async () => {
    try {
      setCartLoading(true);
      const response = await axios.get(`${base_url}/api/student/cart`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("studentToken")}`,
        },
      });

      if (response.data.success) {
        const serverCart = response.data.cart.items
          .map((item) => ({
            id: item.courseId?._id,
            title: item.courseId?.title,
            thumbnail: item.courseId?.thumbnail,
            price: item.price,
            addedAt: item.addedAt,
          }))
          .filter((item) => item.id && item.title); // Filter out invalid items

        setCart(serverCart);
        localStorage.setItem("courseCart", JSON.stringify(serverCart));
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      toast.error("Failed to load cart");
    } finally {
      setCartLoading(false);
    }
  };

  const addToCart = async (course) => {
    if (!course?.id || !course?.title) {
      console.error("Invalid course data");
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

    try {
      setCartLoading(true);

      if (studentData?.id && localStorage.getItem("studentToken")) {
        const response = await axios.post(
          `${base_url}/api/student/cart`,
          { courseId: course.id },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("studentToken")}`,
            },
          }
        );

        if (response.data.success) {
          const newCartItem = {
            id: course.id,
            title: course.title,
            thumbnail: course.thumbnail,
            price: course.price,
            instructor: course.instructor,
            addedAt: new Date().toISOString(),
          };

          setCart((prevCart) => [...prevCart, newCartItem]);
          toast.success("Course added to cart");
        }
      } else {
        const newCartItem = {
          id: course.id,
          title: course.title,
          thumbnail: course.thumbnail,
          price: course.price,
          instructor: course.instructor,
          addedAt: new Date().toISOString(),
        };

        setCart((prevCart) => [...prevCart, newCartItem]);
        localStorage.setItem(
          "courseCart",
          JSON.stringify([...cart, newCartItem])
        );
        toast.success("Course added to cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error(error.response?.data?.message || "Failed to add to cart");
    } finally {
      setCartLoading(false);
    }
  };
  const removeFromCart = async (courseId) => {
    try {
      if (studentData?.id && localStorage.getItem("studentToken")) {
        await axios.delete(`${base_url}/api/student/cart/${courseId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("studentToken")}`,
          },
        });
      }

      const updatedCart = cart.filter((item) => item.id !== courseId);
      setCart(updatedCart);
      localStorage.setItem("courseCart", JSON.stringify(updatedCart));
      toast.success("Course removed from cart");
    } catch (error) {
      console.error("Error removing from cart:", error);
      toast.error(
        error.response?.data?.message || "Failed to remove from cart"
      );
    }
  };
  // Add this useEffect hook near your other effects
  useEffect(() => {
    // Clean up any invalid items on component mount
    const cleanCart = cart.filter((item) => item?.id && item?.title);
    if (cleanCart.length !== cart.length) {
      setCart(cleanCart);
      localStorage.setItem("courseCart", JSON.stringify(cleanCart));
    }
  }, []);
  const isInCart = (courseId) => cart.some((item) => item.id === courseId);
  const isEnrolled = (courseId) => {
    return enrolledCourses.some((id) => id.toString() === courseId.toString());
  };

  return (
    <div className="min-h-screen bg-gray-50 text-black p-0">
      {/* Header */}
      <header className="bg-white py-4 px-4 sm:px-6 lg:px-8 border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-full mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
            Courses
          </h1>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={() => setActiveView("myCourses")}
              className="relative p-1 sm:p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="My Courses"
            >
              <FiBookOpen className="text-lg sm:text-xl text-gray-600" />
              {enrolledCourses.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {enrolledCourses.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveView("cart")}
              className="relative p-1 sm:p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Shopping Cart"
            >
              <FiShoppingCart className="text-lg sm:text-xl text-gray-600" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-full mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Search and Filter Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
            <div className="relative flex-1 max-w-6xl">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search courses..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent hover:border-gray-400 text-sm sm:text-base transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="flex items-center">
                <FiFilter className="text-gray-500 mr-1 sm:mr-2 text-sm sm:text-base" />
                <select
                  value={priceFilter}
                  onChange={(e) => setPriceFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-2 sm:px-3 py-1 sm:py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent hover:border-gray-400 text-sm sm:text-base transition-all"
                >
                  <option value="all">All Courses</option>
                  <option value="free">Free Courses</option>
                  <option value="paid">Premium Courses</option>
                  <option value="live">Live Courses</option>
                </select>
              </div>

              <div className="relative group">
                <select
                  className="block appearance-none w-full bg-white border border-gray-300 hover:border-gray-400 px-4 py-2 pr-8 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent cursor-pointer transition-all"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="all" className="text-gray-400 italic">
                    All Categories
                  </option>
                  {categoryOptions.map((cat) => (
                    <option
                      key={cat}
                      value={cat.toLowerCase()}
                      className="checked:bg-gray-100 hover:bg-gray-100"
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4 6L8 10L12 6"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>

              <div className="relative group">
                <select
                  className="block appearance-none w-full bg-white border border-gray-300 hover:border-gray-400 px-3 py-2 pr-8 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent cursor-pointer text-sm sm:text-base transition-all"
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                >
                  <option value="all">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4 6L8 10L12 6"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Course Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-100 rounded-xl overflow-hidden animate-pulse h-[380px]"
              >
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4 space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {filteredCourses.map((course) => (
              <motion.div
                key={course.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-all overflow-hidden group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -5 }}
              >
                <div className="flex flex-col h-full">
                  <div className="relative overflow-hidden">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.target.src =
                          "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80";
                      }}
                    />
                    <div
                      className={`absolute top-3 right-3 text-white px-3 py-1 text-xs font-medium rounded-full ${
                        course.isLive
                          ? "bg-purple-600"
                          : course.price === 0
                          ? "bg-gray-800"
                          : "bg-yellow-500"
                      }`}
                    >
                      {course.isLive
                        ? "LIVE"
                        : course.price === 0
                        ? "FREE"
                        : "PREMIUM"}
                    </div>
                    {course.isLive && (
                      <div className="absolute top-3 left-3 bg-white text-purple-600 p-1 rounded-full shadow-sm">
                        <FiVideo className="text-sm" />
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold line-clamp-2 text-gray-800">
                        {course.title}
                      </h3>
                      {/* Price display for PREMIUM and LIVE courses */}
                      {(course.isLive || course.price > 0) && (
                        <span className="ml-2 text-lg font-bold text-gray-800">
                          ৳{course.price}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mb-3 py-2 rounded-lg">
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
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                        <span className="flex items-center">
                          <FiStar className="mr-1 text-yellow-400" />{" "}
                          {course.rating > 0
                            ? course.rating.toFixed(1)
                            : "No ratings"}
                        </span>
                        <span className="flex items-center">
                          <FiUsers className="mr-1" />{" "}
                          {course.students.toLocaleString()}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {course.level.charAt(0).toUpperCase() +
                          course.level.slice(1)}
                      </span>
                    </div>
                  </div>

                  {course.isLive && course.nextSession && (
                    <div className="px-4 pb-3">
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

                  <div className="px-4 pb-4 flex flex-col gap-2">
                    <button
                      onClick={() =>
                        setActiveView({
                          view: "courseOverview",
                          courseId: course.id,
                        })
                      }
                      className={`w-full ${
                        course.isLive
                          ? "bg-white border border-purple-400 hover:border-purple-700"
                          : "bg-white border border-gray-300 hover:border-black"
                      } text-${
                        course.isLive ? "gray-800" : "gray-800"
                      } py-2 rounded-lg text-sm hover:shadow-sm transition-all flex items-center justify-center`}
                    >
                      <FiEye className="mr-2" />
                      {course.isLive ? "View Sessions" : "Overview"}
                    </button>

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
                        onClick={() => removeFromCart(course.id)}
                        className="w-full bg-white text-red-600 border border-red-200 hover:border-red-300 py-2 rounded-lg text-sm hover:bg-red-50 flex items-center justify-center transition-all"
                      >
                        <FiShoppingCart className="mr-2" /> Remove
                      </button>
                    ) : (
                      <button
                        onClick={() => addToCart(course)}
                        className="w-full bg-black text-white py-2 rounded-lg text-sm hover:bg-gray-800 flex items-center justify-center transition-all"
                        disabled={isEnrolled(course.id)}
                      >
                        <FiShoppingCart className="mr-2" />
                        {isEnrolled(course.id)
                          ? "Already Enrolled"
                          : "Add to Cart"}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 sm:py-16">
            <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FiBookOpen className="text-gray-400 text-3xl" />
            </div>
            <h3 className="text-lg sm:text-xl font-medium text-gray-800 mb-2">
              No courses found
            </h3>
            <p className="text-sm sm:text-base text-gray-500 max-w-md mx-auto">
              Try adjusting your search or filter to find what you're looking
              for.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default CourseList;
