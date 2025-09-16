/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  AiOutlineEye,
  AiOutlineEyeInvisible,
  AiOutlineLock,
  AiOutlineMail
} from "react-icons/ai";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom"; // Import Link for routing
import axios from "axios"; // You need to install axios to make API requests
import toast from "react-hot-toast"; // Correct import for Toaster

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState(""); // New state for username
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    username: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false); // To check if registration is already done
  const navigate = useNavigate();

  // Check if rememberMe is saved in localStorage
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("email");
    const rememberedPassword = localStorage.getItem("password");
    if (rememberedEmail && rememberedPassword) {
      setEmail(rememberedEmail);
      setPassword(rememberedPassword);
      setRememberMe(true);
    }

    axios
      .get("http://localhost:3500/api/auth/checkAdmin")
      .then((response) => {
        setIsRegistered(response.data.success);
      })
      .catch((error) => {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Unable to check admin";
        toast.error(errorMessage);
        setIsRegistered(false);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

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
    } else if (password.length < 8) {
      newErrors.password = "Minimum 8 characters";
      valid = false;
    }

    setErrors(newErrors);

    if (valid) {
      try {
        const response = await axios.post(
          "http://localhost:3500/api/auth/login",
          {
            email: email.toLowerCase(),
            password
          }
        );

        if (response.data.success) {
          const { token, admin } = response.data;

          // Store token & user info
          localStorage.setItem("token", token);
          localStorage.setItem("admin", JSON.stringify(admin));
          localStorage.setItem("role", admin.role); // 👈 NEW

          // Save Remember Me
          if (rememberMe) {
            localStorage.setItem("email", email);
            localStorage.setItem("password", password);
          } else {
            localStorage.removeItem("email");
            localStorage.removeItem("password");
          }

          navigate("/admin/dashboard");

          toast.success("Login successful!");
          setEmail("");
          setPassword("");
        } else {
          toast.error(response.data.message); // Show error toast
        }
      } catch (error) {
        toast.error("Failed to login. Please try again!", {
          style: {
            background: "#fff",
            color: "#000",
            border: "1px solid #e5e7eb",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
          },
          iconTheme: {
            primary: "#ff0000", // bright red
            secondary: "#ffffff" // white
          }
        }); // Show error toast
      }
      setIsSubmitting(false);
    } else {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    let valid = true;
    let newErrors = { email: "", password: "", username: "" };

    if (!username) {
      newErrors.username = "Username is required";
      valid = false;
    }

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
    } else if (password.length < 8) {
      newErrors.password = "Minimum 8 characters";
      valid = false;
    }

    setErrors(newErrors);

    if (valid) {
      try {
        const response = await axios.post(
          "http://localhost:3500/api/auth/register",
          {
            email: email.toLowerCase(),
            password: password,
            username: username
          },
          {
            headers: {
              "Content-Type": "application/json"
            }
          }
        );

        if (response.data.success) {
          setIsRegistered(true); // Mark the registration as successful
          setErrors({ email: "", password: "", username: "" });
          toast.success(
            "The Admin registration is successful! You can now log in.",
            {
              style: {
                background: "#fff",
                color: "#000",
                border: "1px solid #e5e7eb",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
              },
              iconTheme: {
                primary: "#000",
                secondary: "#fff"
              }
            }
          ); // Show success toast
          setUsername("");
          setEmail("");
          setPassword("");
        } else {
          toast.error(response.data.message); // Show error toast
        }
      } catch (error) {
        toast.error("Registration failed. Please try again!"); // Show error toast
      }
      setIsSubmitting(false);
    } else {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "email") setEmail(value);
    if (name === "password") setPassword(value);
    if (name === "username") setUsername(value);
    setErrors((prev) => ({ ...prev, [name]: "" }));
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
        className="relative w-full max-w-lg rounded-2xl bg-white shadow-xl p-10 border border-gray-100"
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">
            Admin Portal
          </h1>
          <p className="text-gray-600 text-lg">
            {isRegistered
              ? "Secure access to your dashboard"
              : "Create your admin account"}
          </p>
        </motion.div>

        {/* Show Registration form if admin is not registered yet */}
        {!isRegistered ? (
          <form onSubmit={handleRegister} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-2"
            >
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 uppercase tracking-wide"
              >
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={username}
                  onChange={handleInputChange}
                  placeholder="Enter your username"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/30 transition-all duration-200"
                />
              </div>
              {errors.username && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-red-500 mt-1 ml-1"
                >
                  {errors.username}
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
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 uppercase tracking-wide"
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
                  onChange={handleInputChange}
                  placeholder="admin@example.com"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 pl-12 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/30 transition-all duration-200"
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
                className="block text-sm font-medium text-gray-700 uppercase tracking-wide"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <AiOutlineLock size={20} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 pl-12 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/30 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  {showPassword ? (
                    <AiOutlineEye size={20} />
                  ) : (
                    <AiOutlineEyeInvisible size={20} />
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
              className="pt-4"
            >
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-black text-white font-medium rounded-xl py-4 px-6 flex items-center justify-center space-x-3 transition-all duration-300 hover:bg-gray-800 hover:shadow-md ${
                  isSubmitting ? "opacity-80" : ""
                }`}
              >
                {isSubmitting ? (
                  <span>Registering...</span>
                ) : (
                  <span>Register</span>
                )}
              </button>
            </motion.div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Login Form */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-2"
            >
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 uppercase tracking-wide"
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
                  onChange={handleInputChange}
                  placeholder="admin@example.com"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 pl-12 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/30 transition-all duration-200"
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
                className="block text-sm font-medium text-gray-700 uppercase tracking-wide"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <AiOutlineLock size={20} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 pl-12 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/30 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  {showPassword ? (
                    <AiOutlineEye size={20} />
                  ) : (
                    <AiOutlineEyeInvisible size={20} />
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
              className="flex items-center justify-between pt-2 pl-3"
            >
              <label className="inline-flex items-center space-x-3 cursor-pointer">
                <div className="relative w-10 h-6">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                  />
                  <div className="w-full h-full bg-gray-200 rounded-full peer peer-checked:bg-black transition-colors duration-300">
                    <motion.div
                      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                      animate={{
                        x: rememberMe ? 20 : 3,
                        transition: {
                          type: "spring",
                          stiffness: 700,
                          damping: 30
                        }
                      }}
                    />
                  </div>
                </div>
                <span className="text-sm text-gray-600">Remember me</span>
              </label>

              <Link
                to="/admin/forgotPassword"
                className="text-sm text-gray-600 hover:text-black transition-colors duration-200"
              >
                Forgot password?
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="pt-4"
            >
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-black text-white font-medium rounded-xl py-4 px-6 flex items-center justify-center space-x-3 transition-all duration-300 hover:bg-gray-800 hover:shadow-md ${
                  isSubmitting ? "opacity-80" : ""
                }`}
              >
                {isSubmitting ? <span>Logging In...</span> : <span>Login</span>}
              </button>
            </motion.div>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default AdminLogin;
