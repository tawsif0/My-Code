/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  FiEdit2,
  FiSave,
  FiX,
  FiLock,
  FiEye,
  FiEyeOff,
  FiPhone,
  FiUser,
  FiMail,
} from "react-icons/fi";
import axios from "axios";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const EmployeeSettings = () => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    phoneNumber: "",
    createdAt: "",
    profile_picture: null,
  });
  const [editMode, setEditMode] = useState({
    username: false,
    email: false,
    phoneNumber: false,
  });
  const [tempProfile, setTempProfile] = useState({});
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState({
    profile: false,
    password: false,
    photo: false,
  });

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("empToken");
        if (!token) throw new Error("No token found");

        const response = await axios.get(`${base_url}/api/employee/me`, {
          headers: {
            "x-auth-token": token,
          },
        });

        const employeeData = response.data.employee;
        setProfile({
          username: employeeData.username || "",
          email: employeeData.email || "",
          phoneNumber: employeeData.phoneNumber || "",
          createdAt: employeeData.createdAt || "",
          profile_picture: employeeData.profile_picture || null,
        });
      } catch (err) {
        toast.error("Failed to load profile data");
      }
    };

    fetchProfile();
  }, [base_url]);

  // Handle edit toggle
  const handleEditToggle = (field) => {
    if (editMode[field]) {
      setEditMode({ ...editMode, [field]: false });
    } else {
      setTempProfile({ ...profile });
      setEditMode({ ...editMode, [field]: true });
    }
  };

  // Handle profile field changes
  const handleProfileChange = (e, field) => {
    const value = e.target.value;
    setTempProfile({ ...tempProfile, [field]: value });
  };

  // Save updated profile fields
  const saveProfile = async (field) => {
    if (!tempProfile[field] || tempProfile[field] === profile[field]) {
      setEditMode({ ...editMode, [field]: false });
      return;
    }

    try {
      setLoading({ ...loading, profile: true });
      const token = localStorage.getItem("empToken");

      const response = await axios.put(
        `${base_url}/api/employee/update-profile`,
        { [field]: tempProfile[field] },
        {
          headers: {
            "x-auth-token": token,
            "Content-Type": "application/json",
          },
        }
      );

      setProfile((prev) => ({ ...prev, [field]: tempProfile[field] }));
      setEditMode((prev) => ({ ...prev, [field]: false }));
      toast.success(
        `${field.replace(/([A-Z])/g, " $1").trim()} updated successfully!`
      );
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to update ${field}`);
    } finally {
      setLoading({ ...loading, profile: false });
    }
  };

  // Handle password change
  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    switch (field) {
      case "current":
        setShowCurrentPassword(!showCurrentPassword);
        break;
      case "new":
        setShowNewPassword(!showNewPassword);
        break;
      case "confirm":
        setShowConfirmPassword(!showConfirmPassword);
        break;
      default:
        break;
    }
  };

  // Submit new password
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading({ ...loading, password: true });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords don't match");
      setLoading({ ...loading, password: false });
      return;
    }

    try {
      const token = localStorage.getItem("empToken");
      await axios.put(
        `${base_url}/api/employee/change-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: {
            "x-auth-token": token,
          },
        }
      );

      toast.success("Password changed successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordChange(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setLoading({ ...loading, password: false });
    }
  };

  // Handle profile photo change

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gray-50 px-6 py-5 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800">Profile Settings</h1>
        <p className="text-gray-600 mt-1">
          Manage your personal information and security settings
        </p>
      </div>

      <div className="p-6">
        {/* Profile Photo Section */}
        <div className="flex flex-col sm:flex-row items-center mb-8 gap-6">
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl font-semibold text-gray-800">
              {profile.username || "Employee"}
            </h2>
            <p className="text-gray-600">{profile.email}</p>
            <div className="mt-2 flex items-center justify-center sm:justify-start space-x-4 text-sm text-gray-500">
              <span>
                Joined {profile.createdAt ? formatDate(profile.createdAt) : ""}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Information Section */}
        <div className="space-y-6">
          {/* Username Field */}
          <div className="border-b border-gray-100 pb-6">
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <FiUser className="mr-2" size={16} />
                Username
              </label>
              {editMode.username ? (
                <div className="flex space-x-2">
                  <button
                    onClick={() => saveProfile("username")}
                    className="p-1.5 rounded-md bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                    disabled={loading.profile}
                  >
                    <FiSave size={16} />
                  </button>
                  <button
                    onClick={() => handleEditToggle("username")}
                    className="p-1.5 rounded-md bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleEditToggle("username")}
                  className="p-1.5 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  <FiEdit2 size={16} />
                </button>
              )}
            </div>
            {editMode.username ? (
              <input
                type="text"
                value={tempProfile.username || ""}
                onChange={(e) => handleProfileChange(e, "username")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-gray-500"
                placeholder="Enter your username"
              />
            ) : (
              <p className="text-gray-800">
                {profile.username || "Not provided"}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div className="border-b border-gray-100 pb-6">
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <FiMail className="mr-2" size={16} />
                Email Address
              </label>
              {editMode.email ? (
                <div className="flex space-x-2">
                  <button
                    onClick={() => saveProfile("email")}
                    className="p-1.5 rounded-md bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                    disabled={loading.profile}
                  >
                    <FiSave size={16} />
                  </button>
                  <button
                    onClick={() => handleEditToggle("email")}
                    className="p-1.5 rounded-md bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleEditToggle("email")}
                  className="p-1.5 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  <FiEdit2 size={16} />
                </button>
              )}
            </div>
            {editMode.email ? (
              <input
                type="email"
                value={tempProfile.email || ""}
                onChange={(e) => handleProfileChange(e, "email")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-gray-500"
                placeholder="Enter your email"
              />
            ) : (
              <p className="text-gray-800">{profile.email}</p>
            )}
          </div>

          {/* Phone Number Field */}
          <div className="border-b border-gray-100 pb-6">
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <FiPhone className="mr-2" size={16} />
                Phone Number
              </label>
              {editMode.phoneNumber ? (
                <div className="flex space-x-2">
                  <button
                    onClick={() => saveProfile("phoneNumber")}
                    className="p-1.5 rounded-md bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                    disabled={loading.profile}
                  >
                    <FiSave size={16} />
                  </button>
                  <button
                    onClick={() => handleEditToggle("phoneNumber")}
                    className="p-1.5 rounded-md bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleEditToggle("phoneNumber")}
                  className="p-1.5 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  <FiEdit2 size={16} />
                </button>
              )}
            </div>
            {editMode.phoneNumber ? (
              <input
                type="tel"
                value={tempProfile.phoneNumber || ""}
                onChange={(e) => handleProfileChange(e, "phoneNumber")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-gray-500"
                placeholder="Enter phone number"
              />
            ) : (
              <p className="text-gray-800">
                {profile.phoneNumber || "Not provided"}
              </p>
            )}
          </div>

          {/* Password Change Section */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <FiLock className="mr-2" size={16} />
                Password
              </label>
              <button
                onClick={() => setShowPasswordChange(!showPasswordChange)}
                className="text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                {showPasswordChange ? "Cancel" : "Change Password"}
              </button>
            </div>

            <AnimatePresence>
              {showPasswordChange && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-4 mt-3">
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                      {/* Current Password */}
                      <div>
                        <label
                          htmlFor="currentPassword"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            id="currentPassword"
                            name="currentPassword"
                            type={showCurrentPassword ? "text" : "password"}
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-gray-500 pr-10"
                            placeholder="Enter current password"
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility("current")}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showCurrentPassword ? (
                              <FiEye size={18} />
                            ) : (
                              <FiEyeOff size={18} />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* New Password */}
                      <div>
                        <label
                          htmlFor="newPassword"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            id="newPassword"
                            name="newPassword"
                            type={showNewPassword ? "text" : "password"}
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            required
                            minLength="6"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-gray-500 pr-10"
                            placeholder="Enter new password"
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility("new")}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showNewPassword ? (
                              <FiEye size={18} />
                            ) : (
                              <FiEyeOff size={18} />
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Password must be at least 6 characters long
                        </p>
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <label
                          htmlFor="confirmPassword"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-gray-500 pr-10"
                            placeholder="Confirm new password"
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility("confirm")}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showConfirmPassword ? (
                              <FiEye size={18} />
                            ) : (
                              <FiEyeOff size={18} />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="pt-2">
                        <motion.button
                          type="submit"
                          disabled={loading.password}
                          className="cursor-pointer w-full px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                          whileHover={{
                            scale: 1.005,
                            boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.2)",
                          }}
                          whileTap={{ scale: 1.005 }}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          {loading.password ? "Updating..." : "Update Password"}
                        </motion.button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EmployeeSettings;
