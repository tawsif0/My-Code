/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import axios from "axios";
import { FiCalendar, FiClock, FiMapPin, FiX } from "react-icons/fi";
import { toast } from "react-hot-toast";
const Events = () => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [sectionRef, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    userName: "",
    userEmail: "",
    userPhone: "",
    message: "",
  });
  // Fetch only launched events from backend
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${base_url}/api/events/active`);
        if (response.data.success) {
          setEvents(response.data.data);
        }
      } catch (err) {
        console.error("Failed to load launched events", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [base_url]);
  const [errors, setErrors] = useState({
    userName: "",
    userEmail: "",
    userPhone: "",
  });

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      userName: "",
      userEmail: "",
      userPhone: "",
    };

    // Name validation
    if (!formData.userName.trim()) {
      newErrors.userName = "Full name is required";
      valid = false;
    }

    // Email validation
    if (!formData.userEmail.trim()) {
      newErrors.userEmail = "Email is required";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.userEmail)) {
      newErrors.userEmail = "Email format is invalid";
      valid = false;
    }

    // Phone validation
    if (!formData.userPhone.trim()) {
      newErrors.userPhone = "Phone number is required";
      valid = false;
    } else if (!/^[+]?[\d\s\-()]{10,}$/.test(formData.userPhone)) {
      newErrors.userPhone = "Please enter a valid phone number";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      await axios.post(
        `${base_url}/api/events/${selectedEvent._id}/register`,
        formData
      );
      toast.success("Event Registration successful!");
      setSelectedEvent(null);
      setFormData({ userName: "", userEmail: "", userPhone: "", message: "" });
      setErrors({});
    } catch (err) {
      toast.error("Failed to register the event. Try again!");
    } finally {
      setIsLoading(false);
    }
  };
  const displayedEvents = showAllEvents ? events : events.slice(0, 3);

  // Format date to be more readable
  const formatDate = (dateString) => {
    const options = { month: "short", day: "numeric", year: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  // Format time to 12-hour format
  const formatTime = (timeString) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
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

  const noEventsVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        delay: 0.5,
      },
    },
  };

  if (loading) {
    return (
      <section className="py-36">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-gray-300 rounded-full mx-auto mb-6"></div>
            <div className="h-12 w-96 bg-gray-300 rounded-lg mx-auto mb-4"></div>
            <div className="h-6 w-80 bg-gray-300 rounded-lg mx-auto mb-16"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="bg-white rounded-xl shadow-lg p-6 h-96"
                >
                  <div className="h-48 bg-gray-300 rounded mb-4"></div>
                  <div className="h-6 bg-gray-300 rounded mb-3"></div>
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded mb-4"></div>
                  <div className="h-20 bg-gray-300 rounded mb-6"></div>
                  <div className="h-12 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="py-36">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={containerVariants}
          className="text-center mb-16"
        >
          <motion.span
            variants={itemVariants}
            className="cursor-pointer mb-8 px-3 py-1.5 bg-[#004080] text-white font-semibold rounded-full shadow-lg inline-flex items-center justify-center transform hover:scale-105 transition-transform duration-300 group"
          >
            Events
          </motion.span>
          <motion.h2
            variants={headerVariants}
            className="text-4xl md:text-5xl font-bold mb-4 !text-gray-900"
          >
            Upcoming <span className="text-[#004080]">Events</span>
          </motion.h2>
          <motion.p
            variants={headerVariants}
            className="text-lg text-gray-600 max-w-2xl mx-auto"
          >
            Join our exclusive events designed to help you achieve your academic
            dreams abroad.
          </motion.p>
        </motion.div>

        {/* Events Grid or No Events State */}
        {events.length > 0 ? (
          <>
            <motion.div
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              variants={containerVariants}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {displayedEvents.map((event) => (
                <motion.div
                  key={event._id}
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full"
                >
                  {/* Event Image */}
                  <div className="relative h-48">
                    <img
                      src={`${base_url}/events/${event.image}`}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4 bg-[#004080] text-white text-sm font-semibold px-3 py-1 rounded-full">
                      {event.eventStatus === "launched"
                        ? "Live"
                        : "Coming Soon"}
                    </div>
                  </div>

                  {/* Event Content */}
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {event.title}
                    </h3>

                    {/* Date with Calendar Icon */}
                    <div className="flex items-center mb-3 text-gray-600">
                      <FiCalendar className="w-4 h-4 text-[#004080] mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm font-medium">
                        {formatDate(event.startDate)}
                        {event.endDate && event.endDate !== event.startDate
                          ? ` - ${formatDate(event.endDate)}`
                          : ""}
                      </span>
                    </div>

                    {/* Time with Clock Icon */}
                    <div className="flex items-center mb-3 text-gray-600">
                      <FiClock className="w-4 h-4 text-[#004080] mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm font-medium">
                        {formatTime(event.startTime)} -{" "}
                        {formatTime(event.endTime)}
                      </span>
                    </div>

                    <div className="flex items-center mb-4 text-gray-600">
                      <FiMapPin className="w-4 h-4 text-[#004080] mr-2 mt-0.5 flex-shrink-0" />
                      <span>{event.location}</span>
                    </div>

                    <p className="mb-6 text-gray-700 flex-grow">
                      {event.description}
                    </p>

                    <div className="mt-auto">
                      <button
                        onClick={() => setSelectedEvent(event)}
                        className="w-full bg-[#004080] hover:bg-[#003366] text-white font-medium py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-[1.02]"
                      >
                        Register Now
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
            {selectedEvent && (
              <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-md relative"
                >
                  {/* Header with gradient */}
                  <div className="bg-gradient-to-r from-[#004080] to-[#003366] text-white p-6 rounded-t-2xl">
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-bold !text-white">
                        Register for {selectedEvent.title}
                      </h2>
                      <button
                        onClick={() => {
                          setSelectedEvent(null);
                          setErrors({});
                        }}
                        className="text-white hover:text-[#ffd700] transition-colors"
                      >
                        <FiX className="w-6 h-6" />
                      </button>
                    </div>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="userName"
                        value={formData.userName}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            userName: e.target.value,
                          });
                          // Clear error when user starts typing
                          if (errors.userName) {
                            setErrors({ ...errors, userName: "" });
                          }
                        }}
                        className={`w-full px-4 py-3 rounded-lg border ${
                          errors.userName
                            ? "border-red-500 focus:border-red-500"
                            : "border-gray-300 focus:border-[#004080]"
                        } hover:border-[#004080] transition-all`}
                      />
                      {errors.userName && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.userName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="userEmail"
                        value={formData.userEmail}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            userEmail: e.target.value,
                          });
                          // Clear error when user starts typing
                          if (errors.userEmail) {
                            setErrors({ ...errors, userEmail: "" });
                          }
                        }}
                        className={`w-full px-4 py-3 rounded-lg border ${
                          errors.userEmail
                            ? "border-red-500 focus:border-red-500"
                            : "border-gray-300 focus:border-[#004080]"
                        } hover:border-[#004080] transition-all`}
                      />
                      {errors.userEmail && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.userEmail}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="userPhone"
                        value={formData.userPhone}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            userPhone: e.target.value,
                          });
                          // Clear error when user starts typing
                          if (errors.userPhone) {
                            setErrors({ ...errors, userPhone: "" });
                          }
                        }}
                        className={`w-full px-4 py-3 rounded-lg border ${
                          errors.userPhone
                            ? "border-red-500 focus:border-red-500"
                            : "border-gray-300 focus:border-[#004080]"
                        } hover:border-[#004080] transition-all`}
                      />
                      {errors.userPhone && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.userPhone}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Message (Optional)
                      </label>
                      <textarea
                        name="message"
                        rows="3"
                        value={formData.message}
                        onChange={(e) =>
                          setFormData({ ...formData, message: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#004080] hover:border-[#004080] transition-all"
                      ></textarea>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isLoading}
                      className="w-full px-5 py-3 bg-gradient-to-r from-[#ffd700] to-[#ffc700] text-black font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-black"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Processing...
                        </div>
                      ) : (
                        "Register Now"
                      )}
                    </motion.button>
                  </form>
                </motion.div>
              </div>
            )}

            {/* Show More/Less Button */}
            {events.length > 3 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.6 }}
                className="text-center mt-12"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAllEvents(!showAllEvents)}
                  className="px-8 py-3 border-2 border-[#004080] text-[#004080] hover:bg-[#004080] hover:text-white font-medium rounded-full transition duration-300"
                >
                  {showAllEvents ? "Show Less Events" : "Show More Events"}
                </motion.button>
              </motion.div>
            )}
          </>
        ) : (
          // No Events State
          <motion.div
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={noEventsVariants}
            className="text-center py-16"
          >
            <div className="max-w-md mx-auto">
              <div className="relative mb-6">
                <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto flex items-center justify-center">
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
                      d="M8 7V3a4 4 0 118 0v4m-4 8a4 4 0 11-8 0V9a4 4 0 018 0v6z"
                    />
                  </svg>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Exciting Events Coming Soon!
              </h3>

              <p className="text-gray-600 mb-8">
                We're curating exceptional experiences for you. Stay tuned for
                our upcoming events that will transform your academic journey.
              </p>

              <button className="px-6 py-3 bg-[#004080] hover:bg-[#003366] text-white rounded-lg font-medium transition duration-300">
                Notify Me About Future Events
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default Events;
