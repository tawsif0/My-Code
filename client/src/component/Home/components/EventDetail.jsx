/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiArrowLeft,
  FiUsers,
  FiDollarSign,
  FiTag,
} from "react-icons/fi";
import { toast } from "react-hot-toast";

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    userName: "",
    userEmail: "",
    userPhone: "",
    message: "",
  });
  const [errors, setErrors] = useState({
    userName: "",
    userEmail: "",
    userPhone: "",
  });

  // Fetch event details
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${base_url}/api/events/${id}`);
        if (response.data.success) {
          setEvent(response.data.data);
        }
      } catch (err) {
        console.error("Failed to load event details", err);
        toast.error("Failed to load event details");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id, base_url]);

  useEffect(() => {
    // Make all event description links open in a new tab
    const links = document.querySelectorAll(".prose a");
    links.forEach((link) => {
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
    });
  }, [event]);

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
      await axios.post(`${base_url}/api/events/${id}/register`, formData);
      toast.success("Event Registration successful!");
      setFormData({ userName: "", userEmail: "", userPhone: "", message: "" });
      setErrors({});
    } catch (err) {
      toast.error("Failed to register for the event. Try again!");
    } finally {
      setIsLoading(false);
    }
  };

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

  if (loading) {
    return (
      <section className="py-36">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-pulse">
            <div className="h-12 w-48 bg-gray-300 rounded-lg mx-auto mb-6"></div>
            <div className="h-96 w-full bg-gray-300 rounded-lg mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  if (!event) {
    return (
      <section className="py-36">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Event Not Found
          </h2>
          <button
            onClick={() => navigate("/events")}
            className="px-6 py-2 bg-[#004080] text-white rounded-lg"
          >
            Back to Events
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="py-26 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.05, x: -2 }}
          onClick={() => navigate("/events")}
          className="flex items-center text-[#004080] hover:text-[#003366] mb-8 transition-colors duration-200 font-medium group"
        >
          <FiArrowLeft className="mr-2 w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to Events
        </motion.button>

        <div className="overflow-visible flex flex-col xl:flex-row gap-8">
          {/* Left Side - Event Details */}
          <div className="xl:w-3/5 relative !overflow-hidden">
            {/* Hero Image Section */}
            <div className="relative h-96 overflow-hidden rounded-2xl shadow-lg">
              <img
                src={`${base_url}/events/${event.image}`}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

              {/* Event Status Badge */}
              <div className="absolute top-6 left-6">
                <motion.span
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold shadow-lg ${
                    event.eventStatus === "launched"
                      ? "bg-green-500 text-white"
                      : "bg-amber-500 text-white"
                  }`}
                >
                  <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                  {event.eventStatus === "launched"
                    ? "Live Event"
                    : "Coming Soon"}
                </motion.span>
              </div>

              {/* Event Title Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                {/* Quick Info Cards at bottom of image */}
                <div className="flex flex-wrap gap-4 mt-6">
                  <div className="bg-white/20 backdrop-blur-md rounded-xl p-3 flex items-center">
                    <FiCalendar className="w-5 h-5 mr-2" />
                    <span className="text-sm font-medium">
                      {formatDate(event.startDate)}
                    </span>
                  </div>
                  <div className="bg-white/20 backdrop-blur-md rounded-xl p-3 flex items-center">
                    <FiClock className="w-5 h-5 mr-2" />
                    <span className="text-sm font-medium">
                      {formatTime(event.startTime)}
                    </span>
                  </div>
                  <div className="bg-white/20 backdrop-blur-md rounded-xl p-3 flex items-center">
                    <FiMapPin className="w-5 h-5 mr-2" />
                    <span className="text-sm font-medium">
                      {event.location}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Event Details Content */}
            <div className="p-3 space-y-8 mt-8">
              {/* Event Details Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Date & Time Card */}
                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100"
                >
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                      <FiCalendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">
                        Date & Time
                      </h4>
                      <p className="text-gray-700 font-medium">
                        {formatDate(event.startDate)}
                        {event.endDate && event.endDate !== event.startDate
                          ? ` - ${formatDate(event.endDate)}`
                          : ""}
                      </p>
                      <p className="text-gray-600 text-sm mt-1">
                        {formatTime(event.startTime)} -{" "}
                        {formatTime(event.endTime)}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Location Card */}
                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100"
                >
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                      <FiMapPin className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">Location</h4>
                      <p className="text-gray-700 font-medium">
                        {event.location}
                      </p>
                      {event.onlineEvent && (
                        <p className="text-green-600 text-sm mt-1">
                          Online event
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Event Description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white p-8 rounded-2xl"
              >
                <h3 className="text-3xl md:text-4xl font-bold mb-4 flex items-center">
                  <div className="w-1 h-8 bg-[#004080] rounded-full mr-4"></div>
                  {event.title}
                </h3>
                <div
                  className="prose prose-lg max-w-none text-gray-700 leading-relaxed
                    prose-ul:list-disc prose-ol:list-decimal prose-li:ml-5
                    prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-800
                    prose-headings:text-gray-900 prose-headings:font-bold
                    prose-p:mb-4 prose-img:rounded-xl prose-img:shadow-md"
                  dangerouslySetInnerHTML={{
                    __html: event.description,
                  }}
                />
              </motion.div>
            </div>
          </div>

          {/* Right Side - Registration Form */}
          <div className="xl:w-2/5">
            <div className="sticky top-20 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-auto max-h-[100vh]">
              <div className="p-8">
                {/* Form Header */}
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-16 h-16 bg-gradient-to-br from-[#004080] to-[#0066cc] rounded-2xl mx-auto mb-4 flex items-center justify-center"
                  >
                    <FiUsers className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Reserve Your Spot
                  </h3>
                  <p className="text-gray-600">
                    Secure your place at this exclusive event
                  </p>
                </div>

                {/* Registration Form */}
                <form onSubmit={handleSubmit}>
                  <div className="space-y-6">
                    {/* Full Name */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
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
                          if (errors.userName) {
                            setErrors({ ...errors, userName: "" });
                          }
                        }}
                        className={`w-full px-5 py-3 rounded-xl border-2 transition-all duration-300 ${
                          errors.userName
                            ? "border-red-400 focus:border-red-500 bg-red-50"
                            : "border-gray-300 focus:border-[#004080] bg-white hover:border-gray-400"
                        } focus:outline-none focus:ring-0 shadow-sm hover:shadow-md`}
                        placeholder="Enter your full name"
                      />
                      {errors.userName && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-3 text-sm text-red-600 flex items-center"
                        >
                          <span className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center mr-2 text-xs">
                            !
                          </span>
                          {errors.userName}
                        </motion.p>
                      )}
                    </div>

                    {/* Email Address */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
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
                          if (errors.userEmail) {
                            setErrors({ ...errors, userEmail: "" });
                          }
                        }}
                        className={`w-full px-5 py-3 rounded-xl border-2 transition-all duration-300 ${
                          errors.userEmail
                            ? "border-red-400 focus:border-red-500 bg-red-50"
                            : "border-gray-300 focus:border-[#004080] bg-white hover:border-gray-400"
                        } focus:outline-none focus:ring-0 shadow-sm hover:shadow-md`}
                        placeholder="Enter your email address"
                      />
                      {errors.userEmail && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-3 text-sm text-red-600 flex items-center"
                        >
                          <span className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center mr-2 text-xs">
                            !
                          </span>
                          {errors.userEmail}
                        </motion.p>
                      )}
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
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
                          if (errors.userPhone) {
                            setErrors({ ...errors, userPhone: "" });
                          }
                        }}
                        className={`w-full px-5 py-3 rounded-xl border-2 transition-all duration-300 ${
                          errors.userPhone
                            ? "border-red-400 focus:border-red-500 bg-red-50"
                            : "border-gray-300 focus:border-[#004080] bg-white hover:border-gray-400"
                        } focus:outline-none focus:ring-0 shadow-sm hover:shadow-md`}
                        placeholder="Enter your phone number"
                      />
                      {errors.userPhone && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-3 text-sm text-red-600 flex items-center"
                        >
                          <span className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center mr-2 text-xs">
                            !
                          </span>
                          {errors.userPhone}
                        </motion.p>
                      )}
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Message (Optional)
                      </label>
                      <textarea
                        name="message"
                        rows="2"
                        value={formData.message}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            message: e.target.value,
                          })
                        }
                        className="w-full px-5 py-2 rounded-xl border-2 border-gray-300 focus:border-[#004080] bg-white hover:border-gray-400 transition-all duration-300 focus:outline-none focus:ring-0 resize-none shadow-sm hover:shadow-md"
                        placeholder="Any additional information or questions..."
                      ></textarea>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-8">
                    <motion.button
                      whileHover={{
                        scale: 1.02,
                        boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
                      }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isLoading}
                      className="w-full px-6 py-5 bg-gradient-to-r from-[#004080] to-[#0066cc] text-white font-bold rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <svg
                            className="animate-spin -ml-1 mr-3 h-6 w-6 text-white"
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
                          Processing Registration...
                        </div>
                      ) : (
                        <span className="relative z-10">
                          🎫 Register for Event
                        </span>
                      )}
                    </motion.button>

                    <p className="text-xs text-gray-500 text-center mt-4">
                      By registering, you agree to receive event updates via
                      email
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventDetail;
