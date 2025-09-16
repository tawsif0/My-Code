/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiShoppingCart,
  FiX,
  FiArrowLeft,
  FiCreditCard,
  FiStar,
  FiImage,
  FiCheckCircle,
} from "react-icons/fi";
import toast from "react-hot-toast";
import axios from "axios";

const Cart = ({ setActiveView }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const studentData = JSON.parse(localStorage.getItem("studentData"));

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await axios.get(`${base_url}/api/student/cart`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("studentToken")}`,
          },
        });

        if (response.data.success) {
          const formattedCart = response.data.cart.items.map((item) => ({
            id: item.courseId._id,
            title: item.courseId.title,
            thumbnail: item.courseId.thumbnail,
            price: item.price,
          }));
          setCart(formattedCart);
        }
      } catch (error) {
        console.error("Error fetching cart:", error);
        toast.error("Failed to load cart");
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  const removeFromCart = async (courseId, silent = false) => {
    if (!courseId) {
      console.error("Invalid course ID");
      setCart((prevCart) => prevCart.filter((item) => item?.id));
      return;
    }

    try {
      if (studentData?.id && localStorage.getItem("studentToken")) {
        await axios.delete(`${base_url}/api/student/cart/${courseId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("studentToken")}`,
          },
        });
      }

      setCart((prevCart) => prevCart.filter((item) => item?.id !== courseId));
      if (!silent) toast.success("Course removed from cart");
    } catch (error) {
      console.error("Error removing item from cart:", error);
      if (!silent) toast.error("Failed to remove course");
    }
  };

  const handleEnrollCourses = async () => {
    try {
      setLoading(true);

      // Process enrollments
      const enrollCourse = async (courseId) => {
        try {
          await axios.post(
            `${base_url}/api/student/${courseId}/enroll`,
            { user_id: studentData?.id },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("studentToken")}`,
              },
            }
          );
          await removeFromCart(courseId, true);
          return true;
        } catch (error) {
          console.error(`Failed to enroll in course ${courseId}:`, error);
          return false;
        }
      };

      // Process all courses in cart
      const results = await Promise.all(
        cart.map((item) => item?.id && enrollCourse(item.id))
      );

      const successCount = results.filter(Boolean).length;
      if (successCount > 0) {
        toast.success(`Successfully enrolled in ${successCount} courses!`);
        setActiveView("myCourses");
      } else {
        toast.error("Failed to enroll in any courses");
      }
    } catch (error) {
      console.error("Enrollment process error:", error);
      toast.error("Failed to complete enrollment");
    } finally {
      setLoading(false);
    }
  };

  const total = cart.reduce((sum, item) => sum + (item.price || 0), 0);
  const validCartItems = cart.filter((item) => item.id && item.title);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      {/* Header */}
      <header className="bg-white py-6 px-4 sm:px-6 lg:px-8 border-b border-gray-200 shadow-md">
        <div className="max-w-full mx-auto flex justify-between items-center">
          <motion.button
            whileHover={{ x: -2 }}
            onClick={() => setActiveView("courseList")}
            className="flex items-center text-gray-600 hover:text-black font-medium"
          >
            <FiArrowLeft className="mr-2" /> Back to Courses
          </motion.button>
          <div className="flex items-center">
            <span className="bg-black text-white px-3 py-1 rounded-full text-sm font-medium">
              {validCartItems.length}{" "}
              {validCartItems.length === 1 ? "Item" : "Items"}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-full mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {validCartItems.length > 0 ? (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items */}
            <div className="lg:w-2/3">
              <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200 bg-white">
                  <h2 className="text-2xl font-bold text-black">
                    {validCartItems.length}{" "}
                    {validCartItems.length === 1 ? "Course" : "Courses"} in Cart
                  </h2>
                  <p className="text-gray-600 mt-2">
                    Review your selections before checkout
                  </p>
                </div>

                <div className="divide-y divide-gray-200 max-h-[calc(100vh-300px)] overflow-y-auto">
                  <AnimatePresence>
                    {validCartItems.map((course) => (
                      <motion.div
                        key={course.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                        className="p-6 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row">
                          <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-6">
                            {course.thumbnail ? (
                              <img
                                src={`${base_url}/courses/${course.thumbnail.path}`}
                                alt={course.title}
                                className="w-full sm:w-40 h-24 object-cover rounded-lg shadow-sm"
                              />
                            ) : (
                              <div className="w-full sm:w-40 h-24 bg-gray-200 rounded mr-3 flex items-center justify-center">
                                <FiImage className="text-gray-400" />
                              </div>
                            )}
                          </div>

                          <div className="flex-grow">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="text-lg font-bold text-black line-clamp-1">
                                  {course.title}
                                </h4>
                              </div>
                              <button
                                onClick={() => removeFromCart(course.id)}
                                className="text-gray-400 hover:text-red-500 p-1 -mt-2 -mr-2 transition-colors"
                              >
                                <FiX size={20} />
                              </button>
                            </div>

                            <div className="flex items-center text-sm text-gray-600 mb-3">
                              <span className="flex items-center mr-4">
                                <FiStar className="text-yellow-400 mr-1" />
                                {course.rating || 0} (
                                {(course.students || 0).toLocaleString()})
                              </span>
                            </div>

                            <div className="flex justify-between items-end">
                              <div>
                                {course.price > 0 ? (
                                  <span className="text-xl font-bold text-black">
                                    ৳ {(course.price || 0).toFixed(2)}
                                  </span>
                                ) : (
                                  <span className="text-xl font-bold text-green-600">
                                    Free
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:w-1/3">
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 sticky top-6">
                <h2 className="text-2xl font-bold text-black mb-6 flex items-center">
                  <FiCreditCard className="mr-3 text-black" />
                  Order Summary
                </h2>

                <div className="space-y-4 mb-6">
                  {validCartItems.map((course) => (
                    <div
                      key={course.id}
                      className="flex justify-between items-start"
                    >
                      <div className="flex items-start">
                        {course.thumbnail ? (
                          <img
                            src={`${base_url}/courses/${course.thumbnail.path}`}
                            alt={course.title}
                            className="w-12 h-9 object-cover rounded mr-3 shadow-sm"
                          />
                        ) : (
                          <div className="w-12 h-9 bg-gray-200 rounded mr-3 flex items-center justify-center">
                            <FiImage className="text-gray-400" />
                          </div>
                        )}
                        <div>
                          <h4 className="text-sm font-medium text-black line-clamp-1">
                            {course.title || "Untitled Course"}
                          </h4>
                        </div>
                      </div>
                      <span className="text-sm font-bold">
                        ৳{(course.price || 0).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between text-xl font-bold pt-2 border-t border-gray-200 mt-2">
                  <span className="text-black">Total</span>
                  <span className="text-black">৳ {total.toFixed(2)}</span>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleEnrollCourses}
                  className="w-full mt-6 py-3 px-4 bg-black text-white rounded-lg shadow-md hover:bg-gray-900 transition-colors flex items-center justify-center font-bold"
                >
                  <FiCheckCircle className="mr-2" />
                  Enroll Now
                </motion.button>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-start">
                    <div>
                      <h4 className="text-sm font-bold text-black">
                        What's included
                      </h4>
                      <ul className="mt-2 text-sm text-gray-600 list-disc list-inside space-y-1">
                        <li>Lifetime access</li>
                        <li>Certificate of completion</li>
                        <li>30-day money-back guarantee</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-16"
          >
            <div className="mx-auto w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-md">
              <FiShoppingCart size={40} className="text-gray-500" />
            </div>
            <h3 className="text-3xl font-bold text-black mb-4">
              Your cart is empty
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
              Discover amazing courses to boost your skills and add them to your
              cart
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveView("courseList")}
              className="px-8 py-3 bg-black text-white rounded-lg shadow-md hover:bg-gray-900 transition-colors font-bold text-lg"
            >
              Browse Courses
            </motion.button>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Cart;
