import React, { useState } from "react";
import {
  AiOutlineEye,
  AiOutlineEyeInvisible,
  AiOutlineLock,
  AiOutlineMail,
  AiOutlineUser,
} from "react-icons/ai";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const EmployeeLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Check if rememberMe is saved in localStorage
  React.useEffect(() => {
    const rememberedEmail = localStorage.getItem("empEmail");
    const rememberedPassword = localStorage.getItem("empPassword");
    if (rememberedEmail && rememberedPassword) {
      setEmail(rememberedEmail);
      setPassword(rememberedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate inputs
    let valid = true;
    let newErrors = { email: "", password: "" };

    if (!email) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email";
      valid = false;
    }

    if (!password) {
      newErrors.password = "Password is required";
      valid = false;
    }

    setErrors(newErrors);

    if (valid) {
      try {
        const response = await axios.post(
          "http://localhost:3500/api/employee/login",
          {
            email: email.toLowerCase(),
            password,
          }
        );

        if (response.data.success) {
          const { token, employee } = response.data;

          // Store token & employee info
          localStorage.setItem("empToken", token);
          localStorage.setItem("employee", JSON.stringify(employee));

          // Save Remember Me
          if (rememberMe) {
            localStorage.setItem("empEmail", email);
            localStorage.setItem("empPassword", password);
          } else {
            localStorage.removeItem("empEmail");
            localStorage.removeItem("empPassword");
          }

          navigate("/employee/dashboard");
          toast.success("Login successful!");
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        const errorMessage =
          error.response?.data?.message || "Failed to login. Please try again!";
        toast.error(errorMessage);
      }
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:24px_24px] opacity-20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#00000010_1px,transparent_1px)] bg-[size:20px_20px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative w-full max-w-md rounded-2xl bg-white shadow-xl p-8 border border-gray-100"
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-600 mb-2">
            Employee Portal
          </h1>
          <p className="text-gray-600">Access your work dashboard</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-2"
          >
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email Address
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <AiOutlineMail size={18} />
              </div>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors({ ...errors, email: "" });
                }}
                autoComplete="off"
                placeholder="employee@company.com"
                className={`w-full bg-gray-50 border ${
                  errors.email ? "border-red-300" : "border-gray-200"
                } rounded-lg px-4 pl-10 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500/20 focus:border-gray-500 transition-all duration-200`}
              />
            </div>
            {errors.email && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-500 mt-1 ml-1"
              >
                {errors.email}
              </motion.p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-2"
          >
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <AiOutlineLock size={18} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors({ ...errors, password: "" });
                }}
                autoComplete="off"
                placeholder="••••••••"
                className={`w-full bg-gray-50 border ${
                  errors.password ? "border-red-300" : "border-gray-200"
                } rounded-lg px-4 pl-10 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500/20 focus:border-gray-500 transition-all duration-200`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                {showPassword ? (
                  <AiOutlineEye size={18} />
                ) : (
                  <AiOutlineEyeInvisible size={18} />
                )}
              </button>
            </div>
            {errors.password && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-500 mt-1 ml-1"
              >
                {errors.password}
              </motion.p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-between pt-1"
          >
            <label className="inline-flex items-center space-x-2 cursor-pointer">
              <div className="relative w-9 h-5">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                />
                <div className="w-full h-full bg-gray-200 rounded-full peer peer-checked:bg-gray-500 transition-colors duration-300">
                  <motion.div
                    className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm"
                    animate={{
                      x: rememberMe ? 18 : 3,
                      transition: {
                        type: "spring",
                        stiffness: 700,
                        damping: 30,
                      },
                    }}
                  />
                </div>
              </div>
              <span className="text-sm text-gray-600">Remember me</span>
            </label>

            <Link
              to="/employee/forgotPassword"
              className="text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              Forgot password?
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="pt-2"
          >
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-gray-800 text-white font-medium rounded-lg py-3 px-6 flex items-center justify-center space-x-2 transition-all duration-300 hover:bg-black hover:shadow-md ${
                isSubmitting ? "opacity-80 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                  <span>Logging In...</span>
                </>
              ) : (
                <span>Login</span>
              )}
            </button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
};

export default EmployeeLogin;
