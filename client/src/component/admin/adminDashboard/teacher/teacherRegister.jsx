/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import {
  FiEye,
  FiEyeOff,
  FiUser,
  FiMail,
  FiLock,
  FiPhone,
  FiFileText,
  FiLink,
  FiDollarSign,
} from "react-icons/fi";

const TeacherRegistration = ({ setNotificationCount }) => {
  const [customSpecialization, setCustomSpecialization] = useState("");
  const [form, setForm] = useState({
    email: "",
    password: "",
    full_name: "",
    phone: "",
    specialization: "",
    qualifications: "",
    linkedin_url: "",
    hourly_rate: "",
  });

  const [files, setFiles] = useState({
    cv: null,
    certificates: [],
    profile_photo: null,
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    full_name: "",
    phone: "",
    specialization: "",
    qualifications: "",
    cv: "",
    certificates: "",
    profile_photo: "",
  });

  const [fileSizeErrors, setFileSizeErrors] = useState({
    cv: "",
    certificates: "",
    profile_photo: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
  const MAX_PROFILE_PHOTO_SIZE = 2 * 1024 * 1024; // 2MB for profile photo

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
      case "specialization":
        if (!value) {
          error = "Specialization is required";
        } else if (value === "Other" && !customSpecialization.trim()) {
          error = "Please specify your specialization";
        }
        break;

      case "qualifications":
        if (!value) error = "Qualifications are required";
        else if (value.length < 20) error = "Minimum 20 characters required";
        break;
      case "cv":
        if (!files.cv) error = "CV is required";
        break;
      case "certificates":
        if (files.certificates.length === 0)
          error = "At least one certificate is required";
        break;
      case "linkedin_url":
        if (
          value &&
          !/^(https?:\/\/)?(www\.)?linkedin\.com\/in\/.+/.test(value)
        )
          error = "Invalid LinkedIn URL";
        break;
      case "hourly_rate":
        if (value && isNaN(value)) error = "Must be a number";
        else if (value && parseFloat(value) < 10) error = "Minimum $10/hour";
        break;
      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
    return !error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newValue = name === "email" ? value.toLowerCase() : value;

    setForm((prev) => ({ ...prev, [name]: newValue }));

    // If the specialization is "Other", clear the customSpecialization field
    if (name === "specialization" && value !== "Other") {
      setCustomSpecialization("");
    }

    if (errors[name]) validateField(name, newValue);
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    let hasSizeError = false;

    // Clear previous size errors for this field
    setFileSizeErrors((prev) => ({ ...prev, [name.replace("[]", "")]: "" }));

    // Validate file sizes
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      let maxSize = MAX_FILE_SIZE;

      if (name === "profile_photo") {
        maxSize = MAX_PROFILE_PHOTO_SIZE;
      }

      if (file.size > maxSize) {
        const sizeInMB = (maxSize / (1024 * 1024)).toFixed(2);
        const fieldName = name.replace("[]", "");
        setFileSizeErrors((prev) => ({
          ...prev,
          [fieldName]: `File "${file.name}" exceeds ${sizeInMB}MB limit`,
        }));
        hasSizeError = true;
      }
    }

    if (hasSizeError) return;

    if (name === "certificates[]") {
      setFiles((prev) => ({
        ...prev,
        certificates: [...prev.certificates, ...selectedFiles],
      }));
    } else if (name === "cv") {
      setFiles((prev) => ({
        ...prev,
        cv: selectedFiles[0],
      }));
    } else if (name === "profile_photo") {
      setFiles((prev) => ({
        ...prev,
        profile_photo: selectedFiles[0],
      }));
    }

    // Clear required error if file is uploaded
    const fieldName = name.replace("[]", "");
    if (selectedFiles.length > 0 && errors[fieldName]) {
      setErrors((prev) => ({ ...prev, [fieldName]: "" }));
    }
  };

  const removeCertificate = (index) => {
    const updatedCertificates = [...files.certificates];
    updatedCertificates.splice(index, 1);
    setFiles((prev) => ({ ...prev, certificates: updatedCertificates }));

    if (updatedCertificates.length === 0) {
      setErrors((prev) => ({
        ...prev,
        certificates: "At least one certificate is required",
      }));
    }
  };

  const validateForm = () => {
    let isValid = true;
    isValid = validateField("email", form.email) && isValid;
    isValid = validateField("password", form.password) && isValid;
    isValid = validateField("full_name", form.full_name) && isValid;
    isValid = validateField("phone", form.phone) && isValid;
    isValid = validateField("specialization", form.specialization) && isValid;
    isValid = validateField("qualifications", form.qualifications) && isValid;
    isValid = validateField("cv", files.cv) && isValid;
    isValid = validateField("certificates", files.certificates) && isValid;

    // Check for file size errors
    if (
      fileSizeErrors.cv ||
      fileSizeErrors.certificates ||
      fileSizeErrors.profile_photo
    ) {
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix all errors before submitting");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      // Handle specialization: if "Other" is selected, use customSpecialization
      const specializationToSend =
        form.specialization === "Other"
          ? customSpecialization
          : form.specialization;

      Object.entries(form).forEach(([key, value]) => {
        if (key === "specialization") return; // Skip specialization from default loop
        if (value) formData.append(key, value);
      });

      // Append specialization separately
      if (specializationToSend) {
        formData.append("specialization", specializationToSend);
      }

      if (files.cv) {
        formData.append("cv", files.cv);
      }

      if (files.profile_photo) {
        formData.append("profile_photo", files.profile_photo);
      }

      files.certificates.forEach((cert) => {
        formData.append("certificates[]", cert);
      });

      const response = await axios.post(
        "http://localhost:3500/api/auth/teacher-register",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setNotificationCount(response.data.data.notifications.pending_count);

      toast.success("Registration submitted for approval");

      // Reset form
      setForm({
        email: "",
        password: "",
        full_name: "",
        phone: "",
        specialization: "",
        qualifications: "",
        linkedin_url: "",
        hourly_rate: "",
      });
      setCustomSpecialization(""); // Reset custom specialization
      setFiles({
        cv: null,
        certificates: [],
        profile_photo: null,
      });
      setErrors({
        email: "",
        password: "",
        full_name: "",
        phone: "",
        specialization: "",
        qualifications: "",
        cv: "",
        certificates: "",
        profile_photo: "",
      });
      setFileSizeErrors({
        cv: "",
        certificates: "",
        profile_photo: "",
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setIsSubmitting(false);
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
        <h1 className="text-2xl font-bold text-gray-900 text-left">
          Teacher Registration
        </h1>
        <p className="text-gray-600 mt-2">Register expertise teachers here</p>
      </div>

      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="w-full"
      >
        <motion.form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-xl p-8 border border-gray-200"
        >
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Join Our Teaching Team
            </h2>
            <p className="text-gray-600">
              Please fill in all mandatory fields to complete your registration
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
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
                  placeholder="teacher@example.com"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.email ? "border-red-500" : "border-gray-700"
                  } focus:ring-2 focus:ring-black focus:border-gray-500`}
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
                    placeholder="At least 8 characters with 1 number & special char"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.password ? "border-red-500" : "border-gray-700"
                    } focus:ring-2 focus:ring-black focus:border-gray-500 pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-700"
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
                    errors.full_name ? "border-red-500" : "border-gray-700"
                  } focus:ring-2 focus:ring-black focus:border-gray-500`}
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
                    errors.phone ? "border-red-500" : "border-gray-700"
                  } focus:ring-2 focus:ring-black focus:border-gray-500`}
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

            {/* Right Column */}
            <div className="space-y-6">
              {/* Specialization */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <FiFileText className="mr-2 text-gray-500" /> Specialization *
                </label>
                <select
                  name="specialization"
                  value={form.specialization}
                  onChange={handleChange}
                  onBlur={() =>
                    validateField("specialization", form.specialization)
                  }
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.specialization ? "border-red-500" : "border-gray-700"
                  }  focus:border-gray-500`}
                >
                  <option value="">Select your specialization</option>
                  <option value="IELTS">IELTS</option>
                  <option value="GRE">GRE</option>
                  <option value="SAT">SAT</option>
                  <option value="TOEFL">TOEFL</option>
                  <option value="GMAT">GMAT</option>
                  <option value="Other">Other</option>
                </select>
                {form.specialization === "Other" && (
                  <input
                    type="text"
                    placeholder="Enter your specialization"
                    value={customSpecialization}
                    onChange={(e) => setCustomSpecialization(e.target.value)}
                    onBlur={() =>
                      validateField("specialization", form.specialization)
                    }
                    className={`w-full px-4 py-3 mt-3 rounded-lg border ${
                      errors.specialization
                        ? "border-red-500"
                        : "border-gray-700"
                    } focus:ring-2 focus:ring-black focus:border-gray-500`}
                  />
                )}

                {errors.specialization && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-500"
                  >
                    {errors.specialization}
                  </motion.p>
                )}
              </div>

              {/* Qualifications */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <FiFileText className="mr-2 text-gray-500" /> Qualifications *
                </label>
                <textarea
                  name="qualifications"
                  value={form.qualifications}
                  onChange={handleChange}
                  onBlur={() =>
                    validateField("qualifications", form.qualifications)
                  }
                  placeholder="Your degrees, certifications, and experience"
                  rows="3"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.qualifications ? "border-red-500" : "border-gray-700"
                  } `}
                />
                {errors.qualifications && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-500"
                  >
                    {errors.qualifications}
                  </motion.p>
                )}
              </div>

              {/* LinkedIn URL */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <FiLink className="mr-2 text-gray-500" /> LinkedIn Profile
                </label>
                <input
                  name="linkedin_url"
                  value={form.linkedin_url}
                  onChange={handleChange}
                  onBlur={() =>
                    validateField("linkedin_url", form.linkedin_url)
                  }
                  placeholder="linkedin.com/in/username"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.linkedin_url ? "border-red-500" : "border-gray-700"
                  } focus:ring-2 focus:ring-black focus:border-gray-500`}
                />
                {errors.linkedin_url && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-500"
                  >
                    {errors.linkedin_url}
                  </motion.p>
                )}
              </div>

              {/* Hourly Rate */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <FiDollarSign className="mr-2 text-gray-500" /> Hourly Rate
                  (USD)
                </label>
                <input
                  name="hourly_rate"
                  type="number"
                  min="10"
                  step="0.01"
                  value={form.hourly_rate}
                  onChange={handleChange}
                  onBlur={() => validateField("hourly_rate", form.hourly_rate)}
                  placeholder="25.00"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.hourly_rate ? "border-red-500" : "border-gray-700"
                  } focus:ring-2 focus:ring-black focus:border-gray-500 appearance-none`}
                />
                {errors.hourly_rate && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-500"
                  >
                    {errors.hourly_rate}
                  </motion.p>
                )}
              </div>
            </div>
          </div>

          {/* File Uploads Section */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* CV Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                CV (PDF, max 5MB) *
              </label>
              <div
                className={`border-2 border-dashed ${
                  errors.cv || fileSizeErrors.cv
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-lg p-4 min-h-[60px] text-center hover:bg-gray-50`}
              >
                {files.cv ? (
                  <div className="flex items-center justify-between">
                    <p className="text-gray-900 text-sm truncate max-w-[180px]">
                      {files.cv.name}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setFiles((prev) => ({ ...prev, cv: null }));
                        setErrors((prev) => ({
                          ...prev,
                          cv: "CV is required",
                        }));
                        setFileSizeErrors((prev) => ({ ...prev, cv: "" }));
                      }}
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
                      Click to upload CV
                    </p>
                    <p className="text-xs text-gray-400">PDF only</p>
                    <input
                      type="file"
                      name="cv"
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".pdf"
                    />
                  </label>
                )}
              </div>
              {fileSizeErrors.cv && (
                <p className="text-sm text-red-500">{fileSizeErrors.cv}</p>
              )}
              {errors.cv && !fileSizeErrors.cv && (
                <p className="text-sm text-red-500">{errors.cv}</p>
              )}
            </div>

            {/* Certificates Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Certificates (PDF/Image, max 5MB each , max 10) *
              </label>
              <div
                className={`border-2 border-dashed ${
                  errors.certificates || fileSizeErrors.certificates
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-lg p-4 min-h-[60px] text-center hover:bg-gray-50 transition-colors duration-200`}
              >
                {files.certificates.length === 0 ? (
                  <label className="block cursor-pointer">
                    <p className="text-gray-500 text-sm mb-1">
                      Click to upload certificates
                    </p>
                    <p className="text-xs text-gray-400">PDF or images</p>
                    <input
                      type="file"
                      name="certificates[]"
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      multiple
                    />
                  </label>
                ) : (
                  <>
                    <ul className="mb-3 space-y-1 text-left text-sm text-gray-800">
                      {files.certificates.map((cert, index) => (
                        <li
                          key={index}
                          className="flex justify-between items-center mb-1.5 hover:bg-gray-50 rounded"
                        >
                          <span className="truncate max-w-[180px]">
                            {cert.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              removeCertificate(index);
                              setFileSizeErrors((prev) => ({
                                ...prev,
                                certificates: "",
                              }));
                            }}
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
                        </li>
                      ))}
                    </ul>
                    <label className="inline-flex items-center cursor-pointer group">
                      <span className="relative inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm group-hover:shadow">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                        Add More
                        <input
                          type="file"
                          name="certificates[]"
                          onChange={handleFileChange}
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                          multiple
                        />
                      </span>
                    </label>
                  </>
                )}
              </div>
              {fileSizeErrors.certificates && (
                <p className="text-sm text-red-500">
                  {fileSizeErrors.certificates}
                </p>
              )}
              {errors.certificates && !fileSizeErrors.certificates && (
                <p className="text-sm text-red-500">{errors.certificates}</p>
              )}
            </div>

            {/* Profile Photo Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Profile Photo (JPG/PNG, max 2MB)
              </label>
              <div
                className={`border-2 border-dashed ${
                  fileSizeErrors.profile_photo
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-lg p-4 min-h-[60px] text-center hover:bg-gray-50`}
              >
                {files.profile_photo ? (
                  <div className="flex items-center justify-between">
                    <p className="text-gray-900 text-sm truncate max-w-[180px]">
                      {files.profile_photo.name}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setFiles((prev) => ({ ...prev, profile_photo: null }));
                        setFileSizeErrors((prev) => ({
                          ...prev,
                          profile_photo: "",
                        }));
                      }}
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
                      name="profile_photo"
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".jpg,.jpeg,.png"
                    />
                  </label>
                )}
              </div>
              {fileSizeErrors.profile_photo && (
                <p className="text-sm text-red-500">
                  {fileSizeErrors.profile_photo}
                </p>
              )}
            </div>
          </div>

          <div className="mt-8">
            <p className="text-sm text-gray-500 mb-4">
              * Mandatory fields. Your application will be reviewed by our team
              before approval.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white ${
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
                  Submitting...
                </>
              ) : (
                "Submit Application"
              )}
            </motion.button>
          </div>
        </motion.form>
      </motion.div>
    </motion.div>
  );
};

export default TeacherRegistration;
