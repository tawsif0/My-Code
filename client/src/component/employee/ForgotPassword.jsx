/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AiOutlineMail } from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast"; // Correct import for Toaster

const ForgotPasswordEmployee = ({ setAuthMode }) => {
  // Remove the 'b' from setAuthModeb
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(Array(6).fill("")); // 6-digit OTP
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(60);
  const navigate = useNavigate();

  // Handle email submit for sending OTP
  const handleEmailSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await axios.post(
        `${base_url}/api/employee/forgot-password`,
        { email }
      );

      if (response.data.success) {
        toast.success(
          response.data.message.includes("successfully")
            ? response.data.message
            : "OTP sent successfully!"
        );
        setIsOtpSent(true);
        setCanResend(false);
        setResendCountdown(60); // 60 seconds countdown
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    }
    setIsSubmitting(false);
  };

  // Handle OTP input change
  const handleOtpChange = (e, index) => {
    const value = e.target.value.replace(/\D/g, ""); // Numbers only

    // Handle backspace/delete
    if (e.nativeEvent.inputType === "deleteContentBackward") {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);

      // Move focus to previous input if current is empty
      if (index > 0 && !value) {
        e.target.previousSibling?.focus();
      }
      return;
    }

    // Handle regular input
    if (value) {
      const newOtp = [...otp];
      newOtp[index] = value.slice(-1); // Only take the last character if pasted
      setOtp(newOtp);

      // Focus next input if value is entered
      if (value && e.target.nextSibling) {
        e.target.nextSibling.focus();
      }
    }
  };
  // Handle OTP submit for verification and password reset
  const handleOtpSubmit = async () => {
    const otpCode = otp.join("");
    setIsSubmitting(true);

    try {
      const response = await axios.post(
        `${base_url}/api/employee/verify-reset-otp`,
        { email, otp: otpCode }
      );

      if (response.data.success) {
        toast.success("OTP verified successfully!");

        navigate("/employee/reset-password", {
          state: {
            email: email,
            otp: otp.join(""),
            tempToken: response.data.tempToken,
          },
        });
      } else {
        toast.error(response.data.message || "Invalid OTP");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "OTP verification failed. Please try again."
      );
      console.error("OTP verification error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    setCanResend(false);
    setResendCountdown(60);
    await handleEmailSubmit();
  };

  useEffect(() => {
    let timer;
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  const handleBackToLogin = () => {
    navigate("/employee/login"); // Navigate back to the login page
  };
  const renderOtpInputs = () => (
    <div className="flex justify-center space-x-2 sm:space-x-3">
      {otp.map((digit, index) => (
        <input
          key={index}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength="1"
          value={digit}
          onChange={(e) => handleOtpChange(e, index)}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !digit && index > 0) {
              const newOtp = [...otp];
              newOtp[index - 1] = "";
              setOtp(newOtp);
              e.target.previousSibling?.focus();
            }
          }}
          className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-500 transition-all"
          autoFocus={index === 0 && isOtpSent}
        />
      ))}
    </div>
  );
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative w-full max-w-md sm:max-w-lg rounded-2xl bg-white shadow-xl p-6 sm:p-10 border border-gray-100"
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
                    autoComplete="off"
                    placeholder="employee@example.com"
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
                className="space-y-6"
              >
                <div className="text-center">
                  <p className="text-gray-600 mb-6">
                    We sent a 6-digit code to{" "}
                    <span className="font-semibold">{email}</span>
                  </p>
                  {renderOtpInputs()}
                </div>

                <div className="text-center">
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="text-sm text-gray-600 hover:text-gray-800 font-medium"
                    >
                      Resend OTP
                    </button>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Resend code in {resendCountdown}s
                    </p>
                  )}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="pt-6"
              >
                <button
                  type="button"
                  onClick={handleOtpSubmit}
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-gray-600 to-gray-500 text-white font-medium rounded-xl py-4 px-6 flex items-center justify-center space-x-3 transition-all duration-300 hover:from-gray-900 hover:to-gray-800 disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 mr-2"
                        viewBox="0 0 24 24"
                      >
                        {/* Loading spinner */}
                      </svg>
                      Verifying...
                    </>
                  ) : (
                    "Verify OTP"
                  )}
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

export default ForgotPasswordEmployee;
