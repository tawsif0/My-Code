/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { motion } from "framer-motion";
import { AiOutlineMail } from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast"; // Correct import for Toaster

const ForgotPasswordTeacher = ({ setAuthMode }) => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(Array(4).fill("")); // Array to store OTP digits
  const [isOtpSent, setIsOtpSent] = useState(false); // Toggle OTP sent state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Handle email submit for sending OTP
  const handleEmailSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await axios.post(
        // "http://localhost:3500/api/auth/forgot-password",
        { email }
      );

      if (response.data.success) {
        toast.success("OTP sent to your email!");
        setIsOtpSent(true);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Failed to send OTP. Please try again!");
    }
    setIsSubmitting(false);
  };

  // Handle OTP input change
  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return; // Prevent non-numeric input

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Focus next input if value is entered
    if (e.target.nextSibling && value) {
      e.target.nextSibling.focus();
    }
  };

  // Handle OTP submit for verification and password reset
  const handleOtpSubmit = async () => {
    const otpCode = otp.join(""); // Join OTP digits

    if (otpCode.length === 4) {
      try {
        const response = await axios.post(
          // "http://localhost:3500/api/auth/verify-otp", // API to verify OTP
          {
            email,
            otp: otpCode
          }
        );

        if (response.data.success) {
          // If OTP is valid, navigate to reset password page
          toast.success("OTP Matched!");
          navigate("/teacher/reset-password", {
            state: { email, otp: otpCode }
          });
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        toast.error("OTP validation failed. Please try again!");
      }
    } else {
      toast.error("Please enter a valid 4-digit OTP.");
    }
  };
  const handleBackToLogin = () => {
    setAuthMode("login"); // Update authMode to "login"
    navigate("/teacher"); // Navigate back to the login page
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative w-full max-w-lg rounded-2xl bg-white shadow-xl p-10 border border-gray-100"
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">
            Forgot Password
          </h1>
          <p className="text-gray-600 text-lg">
            {isOtpSent
              ? "Enter the OTP sent to your email"
              : "Enter your email to receive the OTP"}
          </p>
        </motion.div>

        <form>
          {!isOtpSent ? (
            <>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-2"
              >
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 uppercase tracking-wider"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <AiOutlineMail size={20} />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="teacher@example.com"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 pl-12 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/30 transition-all duration-200"
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="pt-4"
              >
                <button
                  type="button"
                  onClick={handleEmailSubmit}
                  className="w-full bg-black text-white font-medium rounded-xl py-4 px-6 flex items-center justify-center space-x-3 transition-all duration-300 hover:bg-gray-800"
                >
                  {isSubmitting ? "Sending..." : "Send Code"}
                </button>
              </motion.div>
            </>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-2"
              >
                <label
                  htmlFor="otp"
                  className="block text-sm font-medium text-gray-700 uppercase tracking-wider"
                >
                  Enter OTP
                </label>
                <div className="flex justify-between space-x-4">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleOtpChange(e, index)}
                      className="w-1/2 h-15 text-center bg-gray-50 border border-gray-200 rounded-xl py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/30 transition-all duration-200"
                    />
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="pt-4"
              >
                <button
                  type="button"
                  onClick={handleOtpSubmit}
                  className="w-full bg-black text-white font-medium rounded-xl py-4 px-6 flex items-center justify-center space-x-3 transition-all duration-300 hover:bg-gray-800"
                >
                  Submit OTP
                </button>
              </motion.div>
            </>
          )}
        </form>

        <div className="text-center mt-6">
          <button
            onClick={handleBackToLogin}
            className="text-sm text-gray-600 hover:text-black transition-colors duration-200"
          >
            Back to Login
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordTeacher;
