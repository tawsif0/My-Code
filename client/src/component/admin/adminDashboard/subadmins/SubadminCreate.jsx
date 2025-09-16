/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { FiEye, FiEyeOff, FiUser, FiMail, FiLock } from "react-icons/fi";

const SubadminCreate = () => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "username":
        if (!value) error = "Username is required";
        else if (value.length < 3)
          error = "Username must be at least 3 characters";
        break;
      case "email":
        if (!value) error = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          error = "Invalid email format";
        break;
      case "password":
        if (!value) error = "Password is required";
        else if (value.length < 8)
          error = "Password must be at least 8 characters";
        break;
      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
    return !error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      validateField(name, value);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const validateForm = () => {
    let isValid = true;
    isValid = validateField("username", form.username) && isValid;
    isValid = validateField("email", form.email) && isValid;
    isValid = validateField("password", form.password) && isValid;
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:3500/api/auth/subadmin",
        {
          ...form,
          email: form.email.toLowerCase(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Subadmin created successfully");

      setForm({ username: "", email: "", password: "" });
      setErrors({ username: "", email: "", password: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Error creating subadmin");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen w-full flex flex-col p-6"
    >
      {/* New Header Section */}
      <div className="flex justify-between sticky top-0 left-0 py-4 px-[10px] bg-white items-center mb-8  border-b border-gray-200">
        <h2 className="text-2xl font-bold text-black">Sub-Admin Creation</h2>
      </div>

      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="w-full p-[10px]"
      >
        <motion.form
          onSubmit={handleSubmit}
          className="bg-white rounded-[10px] shadow-sm p-8 border border-gray-200 overflow-hidden"
        >
          <div className="mb-8 text-center">
            <h2 className="text-[20px] md:text-[26px] font-[800] text-gray-800 mb-2">
              Add New Sub-Admin
            </h2>
            <p className="text-gray-600">
              Fill in the details below to create a new sub-admin account
            </p>
          </div>

          <div className="space-y-6">
            {/* Username Field */}
            <div className="space-y-2">
              <label className="flex items-center text-[18px] font-medium text-gray-700">
                <FiUser className="mr-2 text-gray-500" /> Username
              </label>
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter username"
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.username ? "border-red-500" : "border-gray-300"
                } focus:ring-2 focus:ring-black focus:border-gray-600 `}
              />
              {errors.username && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-500"
                >
                  {errors.username}
                </motion.p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="flex items-center text-[18px] font-medium text-gray-700">
                <FiMail className="mr-2 text-gray-500" /> Email
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter email address"
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.email ? "border-red-500" : "border-gray-300"
                } focus:ring-2 focus:ring-black focus:border-gray-600`}
              />
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-500"
                >
                  {errors.email}
                </motion.p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="flex items-center text-[18px] font-medium text-gray-700">
                <FiLock className="mr-2 text-gray-500" /> Password
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter secure password"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 focus:ring-black focus:border-gray-600 pr-10`}
                  required
                  minLength="8"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <FiEye /> : <FiEyeOff />}
                </button>
              </div>
              {errors.password ? (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-500"
                >
                  {errors.password}
                </motion.p>
              ) : (
                <p className="text-xs text-gray-500">
                  Minimum 8 characters required
                </p>
              )}
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSubmitting}
            className={`w-full mt-8 py-3 px-4 cursor-pointer rounded-lg font-medium text-white ${
              isSubmitting ? "bg-gray-600" : "bg-black hover:bg-gray-800"
            } transition-all shadow-md flex items-center justify-center`}
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
                Creating Sub-Admin...
              </>
            ) : (
              "Create Sub-Admin"
            )}
          </motion.button>
        </motion.form>
      </motion.div>
    </motion.div>
  );
};

export default SubadminCreate;
