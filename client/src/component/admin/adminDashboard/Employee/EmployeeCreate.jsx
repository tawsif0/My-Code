import React, { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import {
  FiUser,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiPhone
} from "react-icons/fi";
import toast from "react-hot-toast";
import axios from "axios";

const EmployeeCreate = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    phoneNumber: ""
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Validation state
  const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: "",
    phoneNumber: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    // Clear the error message when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  // Custom validations for each field (frontend validation)
  const validateForm = () => {
    const newErrors = {};

    // Validate username (minimum 3 characters)
    if (!formData.username || formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters long.";
    }

    // Validate email (must be a valid email format)
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailPattern.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    // Validate password (minimum 6 characters)
    if (!formData.password || formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long.";
    }

    // Validate phone number (must be 10 digits)
    const phonePattern = /^^\+[1-9]\d{1,14}$/;
    if (!formData.phoneNumber || !phonePattern.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Please enter a valid  phone number.";
    }

    setErrors(newErrors);

    // Return true if there are no validation errors
    return !Object.values(newErrors).some((error) => error);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Convert email to lowercase before submitting
    const lowerCaseEmail = formData.email.toLowerCase();

    // Update formData with lowercase email
    const formDataToSubmit = { ...formData, email: lowerCaseEmail };

    // Perform form validation
    if (!validateForm()) {
      toast.error("Please correct the errors in the form.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:3500/api/admin/employee",
        formDataToSubmit, // Use formDataToSubmit instead of formData
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      if (response.status === 200 || response.status === 201) {
        setFormData({
          username: "",
          email: "",
          password: "",
          phoneNumber: ""
        });
        toast.success("Employee created successfully!");
      } else {
        throw new Error(response.data.message || "Failed to create employee");
      }
    } catch (error) {
      // Handle server-side validation errors
      if (error.response && error.response.data && error.response.data.errors) {
        const backendErrors = error.response.data.errors;

        // Map backend validation errors to the form fields
        setErrors({
          username: backendErrors.username || "",
          email: backendErrors.email || "",
          password: backendErrors.password || "",
          phoneNumber: backendErrors.phoneNumber || ""
        });

        // Show error messages from backend
        toast.error("Please fix the errors in the form.");
      } else {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Error occurred while creating employee";
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen flex flex-col items-center p-6"
    >
      <div className="w-full mb-8 pb-6 border-b border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900 text-left">
          Add Employee
        </h1>
        <p className="text-gray-600 mt-2">
          Create employee accounts to manage your team effectively
        </p>
      </div>
      <div className="w-full">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 p-8"
        >
          {/* Form Header */}
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-gray-800">
              Create New Employee
            </h2>
            <p className="text-gray-500 mt-2">
              Fill in the details below to add a new team member
            </p>
          </div>

          <div className="space-y-6">
            {/* Username Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`pl-10 w-full px-4 py-3 rounded-lg border ${
                    errors.username ? "border-red-500" : "border-gray-300"
                  } bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200`}
                  placeholder="Enter the username"
                  autoComplete="off"
                />
              </div>
              {errors.username && (
                <p className="text-sm text-red-500 mt-1">{errors.username}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`pl-10 w-full px-4 py-3 rounded-lg border ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  } bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200`}
                  placeholder="Enter the email"
                  autoComplete="off"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            {/* Phone Number Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiPhone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className={`pl-10 w-full px-4 py-3 rounded-lg border ${
                    errors.phoneNumber ? "border-red-500" : "border-gray-300"
                  } bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200`}
                  placeholder="+8801912345678"
                  autoComplete="off"
                />
              </div>
              {errors.phoneNumber && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.phoneNumber}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`pl-10 w-full px-4 py-3 rounded-lg border ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  } bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 pr-10`}
                  placeholder="Enter the password"
                  autoComplete="off"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FiEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <FiEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500 mt-1">{errors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center px-4 py-3 rounded-lg shadow-sm text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700 transition-colors duration-200"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                    Creating...
                  </>
                ) : (
                  "Create Employee"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default EmployeeCreate;
