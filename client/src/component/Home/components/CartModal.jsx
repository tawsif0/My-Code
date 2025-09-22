/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiShoppingCart,
  FiX,
  FiCreditCard,
  FiStar,
  FiImage,
  FiCheckCircle,
  FiArrowRight,
  FiBookOpen,
  FiClock,
  FiAward,
} from "react-icons/fi";
import toast from "react-hot-toast";
import axios from "axios";
import { useCart } from "../../../context/useCart";
import { useNavigate } from "react-router-dom";

const CartModal = ({ isOpen, onClose, positionRef }) => {
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState({ top: 0, right: 0 });
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const studentData = JSON.parse(localStorage.getItem("studentData"));
  const { cart, removeFromCart, refreshCart, loading: cartLoading } = useCart();
  const navigate = useNavigate();
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen && positionRef.current) {
      const rect = positionRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 10,
        right: window.innerWidth - rect.right,
      });
    }
  }, [isOpen, positionRef]);

  useEffect(() => {
    if (isOpen) {
      refreshCart();
    }
  }, [isOpen, refreshCart]);

  const handleRemoveFromCart = async (courseId, silent = false) => {
    const success = await removeFromCart(courseId);
    if (success && !silent) {
      toast.success("Course removed from cart");
    } else if (!success && !silent) {
      toast.error("Failed to remove course");
    }
    return success;
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
          await handleRemoveFromCart(courseId, true);
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
        onClose();
        navigate("/student/dashboard?view=myCourses");
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

  const handleViewFullCart = () => {
    onClose();
    navigate("/student/dashboard?view=cart");
  };

  const total = cart.reduce((sum, item) => sum + (item.price || 0), 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 lg:bg-transparent z-40 lg:z-auto"
            onClick={onClose}
          />

          {/* Cart Modal positioned under the cart button */}
          <motion.div
            ref={modalRef}
            id="cart-modal"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="
    fixed lg:absolute z-50 w-full lg:w-96 max-w-[95vw] lg:max-w-sm
    right-[10px] lg:right-[-7px]
  "
            style={{
              top: `48px`,
            }}
          >
            {/* Arrow indicator */}
            <div className="hidden lg:block absolute -top-2 right-4 w-4 h-4 rotate-45 bg-white border-t border-l border-gray-200"></div>

            {/* Modal content */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl border border-gray-200 overflow-hidden mt-2 lg:mt-0">
              {/* Header */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#004080] to-[#0066cc] text-white">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-full">
                    <FiShoppingCart className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold !text-white">
                      Your Learning Cart
                    </h2>
                    <p className="text-xs text-white/80">
                      {cart.length} {cart.length === 1 ? "course" : "courses"}{" "}
                      selected
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-white/10 rounded-full transition-colors"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <div className="overflow-y-auto max-h-[70vh] lg:max-h-96">
                {cart.length > 0 ? (
                  <div className="p-4">
                    {/* Cart Items */}
                    <div className="space-y-3 mb-4">
                      {cart.map((course) => (
                        <motion.div
                          key={course.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -50 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-100 shadow-sm"
                        >
                          <div className="flex-shrink-0 relative">
                            {course.thumbnail ? (
                              <img
                                src={`${base_url}/courses/${course.thumbnail.path}`}
                                alt={course.title}
                                className="w-16 h-12 object-cover rounded-md shadow-sm"
                                onError={(e) => {
                                  e.target.src =
                                    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80";
                                }}
                              />
                            ) : (
                              <div className="w-16 h-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-md flex items-center justify-center">
                                <FiBookOpen className="text-[#004080]" />
                              </div>
                            )}
                          </div>

                          <div className="flex-grow min-w-0">
                            <h4 className="font-medium text-gray-900 text-sm line-clamp-2">
                              {course.title}
                            </h4>
                            <div className="mt-1 flex items-center justify-between">
                              <p className="text-sm font-bold text-[#004080]">
                                {course.price > 0 ? (
                                  <>৳{(course.price || 0).toFixed(2)}</>
                                ) : (
                                  <span className="text-green-600 text-xs">
                                    Free
                                  </span>
                                )}
                              </p>
                              <button
                                onClick={() => handleRemoveFromCart(course.id)}
                                className="text-red-500 hover:text-red-700 text-xs flex items-center"
                              >
                                <FiX className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Order Summary */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-3">
                      <h3 className="text-md font-bold text-gray-900 mb-3 flex items-center">
                        <FiCreditCard className="mr-2 text-[#004080]" />
                        Order Summary
                      </h3>

                      <div className="space-y-2 mb-3">
                        {cart.map((course) => (
                          <div
                            key={course.id}
                            className="flex justify-between items-center text-sm"
                          >
                            <span className="text-gray-600 truncate max-w-[60%]">
                              {course.title}
                            </span>
                            <span className="font-medium text-[#004080]">
                              {course.price > 0
                                ? `৳${(course.price || 0).toFixed(2)}`
                                : "Free"}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                        <span className="font-bold text-gray-900">Total</span>
                        <span className="font-bold text-lg text-[#004080]">
                          ৳{total.toFixed(2)}
                        </span>
                      </div>

                      <div className="mt-4 space-y-2">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleEnrollCourses}
                          disabled={loading}
                          className="w-full py-3 bg-gradient-to-r from-[#004080] to-[#0066cc] text-white rounded-lg font-bold flex items-center justify-center disabled:opacity-50 text-sm"
                        >
                          <FiCheckCircle className="mr-2" />
                          {loading ? "Processing..." : `Enroll Now`}
                        </motion.button>

                        <button
                          onClick={handleViewFullCart}
                          className="w-full py-2 border border-[#004080] text-[#004080] rounded-lg font-medium flex items-center justify-center hover:bg-[#004080] hover:text-white transition-all text-sm"
                        >
                          View Full Cart <FiArrowRight className="ml-2" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full flex items-center justify-center mb-3">
                      <FiShoppingCart className="w-6 h-6 text-[#004080]" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      Your cart is empty
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Discover amazing courses to boost your skills
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartModal;
