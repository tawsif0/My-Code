/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FiEye,
  FiEyeOff,
  FiUser,
  FiMail,
  FiLock,
  FiPhone,
  FiCalendar,
  FiMapPin
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const StudentAuth = () => {
  const navigate = useNavigate();

  // Registration form state
  const [form, setForm] = useState({
    email: "",
    password: "",
    full_name: "",
    phone: "",
    date_of_birth: "",
    address: ""
  });

  const [files, setFiles] = useState({
    profile_picture: null
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    full_name: "",
    phone: ""
  });

  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation function
  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "email":
        if (!value) error = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          error = "Invalid email format";
        break;
      case "password":
        if (!value) error = "Password is required";
        else if (value.length < 8) error = "Must be at least 8 characters";
        else if (!/\d/.test(value)) error = "Must contain a number";
        else if (!/[!@#$%^&*]/.test(value))
          error = "Must contain a special character";
        break;
      case "full_name":
        if (!value) error = "Full name is required";
        else if (value.trim().split(/\s+/).length < 2)
          error = "Must include first and last name";
        break;
      case "phone":
        if (!value) error = "Phone is required";
        else if (!/^\+[1-9]\d{1,14}$/.test(value))
          error = "Include country code (e.g., +880)";
        break;
      case "date_of_birth":
        if (value && !/^\d{4}-\d{2}-\d{2}$/.test(value))
          error = "Use YYYY-MM-DD format";
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
    if (errors[name]) validateField(name, value);
  };

  const handleFileChange = (e) => {
    const { name } = e.target;
    const file = e.target.files[0];
    setFiles((prev) => ({ ...prev, [name]: file }));
  };

  const validateForm = () => {
    let isValid = true;
    isValid = validateField("email", form.email) && isValid;
    isValid = validateField("password", form.password) && isValid;
    isValid = validateField("full_name", form.full_name) && isValid;
    isValid = validateField("phone", form.phone) && isValid;
    return isValid;
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix all errors before submitting");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      // Append all form fields
      for (const [key, value] of Object.entries(form)) {
        if (value) formData.append(key, value);
      }

      // Handle profile photo upload
      if (files.profile_picture) {
        // Validate file size
        if (files.profile_picture.size > 100 * 1024 * 1024) {
          throw new Error("Profile photo must be less than 100MB");
        }

        // Validate file type
        const validTypes = ["image/jpeg", "image/png", "image/jpg"];
        if (!validTypes.includes(files.profile_picture.type)) {
          throw new Error("Only JPEG, JPG, or PNG images are allowed");
        }

        formData.append("profile_picture", files.profile_picture);
      }

      // Debug: Log FormData contents
      const formDataEntries = {};
      for (let [key, value] of formData.entries()) {
        formDataEntries[key] =
          value instanceof File
            ? `File: ${value.name} (${value.type}, ${value.size} bytes)`
            : value;
      }

      // API call to register student
      const response = await axios.post(
        "http://localhost:3500/api/admin/students",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      // Verify response structure
      if (!response.data?.success) {
        throw new Error(response.data?.message || "Invalid server response");
      }

      toast.success("Registerd the Student Successfully!");
      // Reset form
      setForm({
        email: "",
        password: "",
        full_name: "",
        phone: "",
        date_of_birth: "",
        address: ""
      });
      // Keep the uploaded filename if available
      setFiles({
        profile_picture: null
      });
    } catch (err) {
      let errorMessage = "Registration failed";
      if (err.response) {
        // Handle different error statuses
        if (err.response.status === 413) {
          errorMessage = "File too large (max 100MB)";
        } else if (err.response.status === 415) {
          errorMessage = "Unsupported file type";
        } else if (err.response.data) {
          errorMessage = Array.isArray(err.response.data.message)
            ? err.response.data.message.join(", ")
            : err.response.data.message ||
              err.response.data.error ||
              errorMessage;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col items-center p-6 "
    >
      <div className="w-full max-w-full">
        <div className="w-full mb-8 pb-6 border-b border-gray-200">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Student Registration
          </h1>
          <p className="text-gray-600 mt-2">
            Register students to get good opportunities here
          </p>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-gray-200"
        >
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Become Student
            </h2>
            <p className="text-gray-600">
              Please fill in all mandatory fields to complete your registration
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-6">
            {/* First Row - Email and Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <FiMail className="mr-2 text-gray-500" /> Email *
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  onBlur={() => validateField("email", form.email)}
                  placeholder="student@example.com"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }  focus:border-gray-500 transition-all`}
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

              {/* Password */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <FiLock className="mr-2 text-gray-500" /> Password *
                </label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange}
                    onBlur={() => validateField("password", form.password)}
                    placeholder="At least 8 characters"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.password ? "border-red-500" : "border-gray-300"
                    }  focus:border-gray-500 transition-all pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showPassword ? <FiEye /> : <FiEyeOff />}
                  </button>
                </div>
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-500"
                  >
                    {errors.password}
                  </motion.p>
                )}
              </div>
            </div>

            {/* Second Row - Full Name and Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <FiUser className="mr-2 text-gray-500" /> Full Name *
                </label>
                <input
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  onBlur={() => validateField("full_name", form.full_name)}
                  placeholder="First and Last name"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.full_name ? "border-red-500" : "border-gray-300"
                  }  focus:border-gray-500 transition-all`}
                />
                {errors.full_name && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-500"
                  >
                    {errors.full_name}
                  </motion.p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <FiPhone className="mr-2 text-gray-500" /> Phone *
                </label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  onBlur={() => validateField("phone", form.phone)}
                  placeholder="+8801912345678"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.phone ? "border-red-500" : "border-gray-300"
                  }  focus:border-gray-500 transition-all`}
                />
                {errors.phone && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-500"
                  >
                    {errors.phone}
                  </motion.p>
                )}
              </div>
            </div>

            {/* Third Row - Date of Birth and Address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date of Birth */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <FiCalendar className="mr-2 text-gray-500" /> Date of Birth
                </label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={form.date_of_birth}
                  onChange={handleChange}
                  onBlur={() =>
                    validateField("date_of_birth", form.date_of_birth)
                  }
                  placeholder="DD/MM/YYYY"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.date_of_birth ? "border-red-500" : "border-gray-300"
                  }  focus:border-gray-500 transition-all`}
                />
                {errors.date_of_birth && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-500"
                  >
                    {errors.date_of_birth}
                  </motion.p>
                )}
              </div>

              {/* Address */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <FiMapPin className="mr-2 text-gray-500" /> Address
                </label>
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Your current address"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300  focus:border-gray-500 transition-all"
                />
              </div>
            </div>

            {/* Profile Photo Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Profile Photo (JPG/PNG, max 2MB)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[60px] text-center hover:bg-gray-50 transition-colors">
                {files.profile_picture ? (
                  <div className="flex items-center justify-between">
                    <p className="text-gray-900 text-sm truncate max-w-[180px]">
                      {files.profile_picture.name}
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        setFiles((prev) => ({
                          ...prev,
                          profile_picture: null
                        }))
                      }
                      className="text-gray-400 hover:text-red-500 ml-2 transition-colors duration-200"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <label className="block cursor-pointer">
                    <p className="text-gray-500 text-sm mb-1">
                      Click to upload photo
                    </p>
                    <p className="text-xs text-gray-400">JPG or PNG</p>
                    <input
                      type="file"
                      name="profile_picture"
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".jpg,.jpeg,.png"
                    />
                  </label>
                )}
              </div>
            </div>

            <div className="pt-4">
              <p className="text-sm text-gray-500 mb-4">* Mandatory fields</p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 px-4 rounded-lg font-medium text-white ${
                  isSubmitting
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-gray-700 hover:bg-gray-700"
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
                    Registering...
                  </>
                ) : (
                  "Register Now"
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default StudentAuth;
