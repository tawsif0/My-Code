/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { FiEdit2, FiSave, FiX, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import axios from "axios";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const Settings = () => {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    avatarColor: "bg-gradient-to-r from-purple-500 to-pink-500",
  });
  const [editMode, setEditMode] = useState({
    name: false,
    email: false,
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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        const response = await axios.get(
          "http://localhost:3500/api/auth/admin",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const gradients = [
          "bg-gradient-to-r from-purple-500 to-pink-500",
          "bg-gradient-to-r from-blue-500 to-teal-400",
          "bg-gradient-to-r from-amber-500 to-pink-500",
          "bg-gradient-to-r from-emerald-500 to-blue-500",
          "bg-gradient-to-r from-violet-500 to-fuchsia-500",
        ];
        const randomGradient =
          gradients[Math.floor(Math.random() * gradients.length)];

        setProfile({
          name: response.data.username || "Admin User",
          email: response.data.email || "admin@example.com",
          avatarColor: randomGradient,
          passwordChangedAt: response.data.passwordChangedAt, // <-- Store it
        });
      } catch (err) {
        toast.error("Failed to load profile data");
      }
    };

    fetchProfile();
  }, []);
  const timeAgo = (dateString) => {
    if (!dateString) return "unknown time";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays < 1) return "today";
    if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12)
      return `${diffMonths} month${diffMonths > 1 ? "s" : ""} ago`;

    const diffYears = Math.floor(diffMonths / 12);
    return `${diffYears} year${diffYears > 1 ? "s" : ""} ago`;
  };

  const handleEditToggle = (field) => {
    if (editMode[field]) {
      // Cancel edit mode
      setEditMode({ ...editMode, [field]: false });
    } else {
      // Enter edit mode
      setTempProfile({ ...profile });
      setEditMode({ ...editMode, [field]: true });
    }
  };

  const handleProfileChange = (e, field) => {
    setTempProfile({ ...tempProfile, [field]: e.target.value });
  };

  const saveProfile = async (field) => {
    if (!tempProfile[field] || tempProfile[field] === profile[field]) {
      setEditMode({ ...editMode, [field]: false });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        "http://localhost:3500/api/auth/update-profile",
        { [field]: tempProfile[field] },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProfile({ ...profile, [field]: tempProfile[field] });
      setEditMode({ ...editMode, [field]: false });
      toast.success(
        `${
          field.charAt(0).toUpperCase() + field.slice(1)
        } updated successfully!`
      );
    } catch (err) {
      toast.error(`Failed to update ${field}`);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

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

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords don't match");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        "http://localhost:3500/api/auth/change-password",
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
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
      setLoading(false);
    }
  };

  const profileInitial = profile.name.charAt(0).toUpperCase();

  return (
    <div className="max-w-full mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-[10px] shadow-md overflow-hidden border border-gray-100 p-6"
      >
        {/* Header */}
        <div className="w-full mb-8 pb-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 text-left">
            Account Settings
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your profile and security settings
          </p>
        </div>
        {/* Profile Section */}
        <div className="p-2">
          <div className="flex items-center mb-8">
            <div
              className={`w-20 h-20 rounded-full ${profile.avatarColor} text-white flex items-center justify-center text-3xl font-bold shadow-lg`}
            >
              {profileInitial}
            </div>
            <div className="ml-6">
              <h2 className="text-xl font-semibold text-gray-800">
                {profile.name}
              </h2>
              <p className="text-gray-600">{profile.email}</p>
            </div>
          </div>

          <div className="space-y-6 p-4">
            {/* Name Field */}
            <div className="border-b border-gray-200 pb-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-gray-500">Name</h3>
                {editMode.name ? (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => saveProfile("name")}
                      className="p-1.5 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                    >
                      <FiSave size={16} />
                    </button>
                    <button
                      onClick={() => handleEditToggle("name")}
                      className="p-1.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleEditToggle("name")}
                    className="p-1.5 rounded-full bg-gray-700 text-gray-100 hover:bg-black transition-colors"
                  >
                    <FiEdit2 size={16} />
                  </button>
                )}
              </div>
              {editMode.name ? (
                <input
                  type="text"
                  value={tempProfile.name || ""}
                  onChange={(e) => handleProfileChange(e, "name")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-gray-500 "
                />
              ) : (
                <p className="text-lg font-medium text-gray-800">
                  {profile.name}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div className="border-b border-gray-200 pb-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-gray-500">Email</h3>
                {editMode.email ? (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => saveProfile("email")}
                      className="p-1.5 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                    >
                      <FiSave size={16} />
                    </button>
                    <button
                      onClick={() => handleEditToggle("email")}
                      className="p-1.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleEditToggle("email")}
                    className="p-1.5 rounded-full bg-gray-700 text-gray-100 hover:bg-black transition-colors"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-gray-500 "
                />
              ) : (
                <p className="text-lg font-medium text-gray-800">
                  {profile.email}
                </p>
              )}
            </div>

            {/* Password Section */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-gray-500">Password</h3>
                <button
                  onClick={() => setShowPasswordChange(!showPasswordChange)}
                  className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <FiLock className="mr-1" size={14} />
                  {showPasswordChange ? "Hide" : "Change Password"}
                </button>
              </div>
              <p className="text-gray-600 mb-4">
                {showPasswordChange
                  ? "Enter your current and new password"
                  : `Last changed ${timeAgo(profile.passwordChangedAt)}`}
              </p>

              <AnimatePresence>
                {showPasswordChange && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <form
                      onSubmit={handlePasswordSubmit}
                      className="space-y-4 mt-4"
                    >
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-gray-500  pr-10"
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-gray-500  pr-10"
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-gray-500  pr-10"
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

                      <div className="flex justify-end space-x-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowPasswordChange(false)}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-lg hover:bg-gray-200 hover:text-black transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                          {loading ? "Updating..." : "Update Password"}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Settings;
