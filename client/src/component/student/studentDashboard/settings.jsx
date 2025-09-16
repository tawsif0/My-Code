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
  FiCalendar,
  FiMapPin,
  FiUser,
  FiMail,
} from "react-icons/fi";
import axios from "axios";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const StudentSettings = () => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    address: "",
    profile_picture: null,
    isVerified: false,
    createdAt: "",
  });
  const [editMode, setEditMode] = useState({
    full_name: false,
    email: false,
    phone: false,
    date_of_birth: false,
    address: false,
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
    const date = new Date(
      dateString.includes("-")
        ? dateString
        : dateString.split("/").reverse().join("-")
    );
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  const studentdata = JSON.parse(localStorage.getItem("studentData"));
  // In your formatDateForInput function, add proper parsing:
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    if (dateString.includes("-")) return dateString;
    if (dateString.includes("/")) {
      const [day, month, year] = dateString.split("/");
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }
    return dateString;
  };
  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("studentToken");
        if (!token) throw new Error("No token found");

        const response = await axios.get(
          `http://localhost:3500/api/student/profile/${studentdata.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const studentData = response.data.student;
        setProfile({
          full_name: studentData.full_name || "",
          email: studentData.email || "",
          phone: studentData.phone || "",
          date_of_birth: studentData.date_of_birth || "",
          address: studentData.address || "",
          profile_picture: studentData.profile_picture || null,
          isVerified: studentData.isVerified || false,
          createdAt: studentData.createdAt || "",
        });
      } catch (err) {
        toast.error("Failed to load profile data");
      }
    };

    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      const token = localStorage.getItem("studentToken");
      // Send the update with proper structure
      const response = await axios.put(
        `http://localhost:3500/api/student/profile/${studentdata.id}`, // Include student ID
        {
          [field]: tempProfile[field],
          id: studentdata.id, // Also include ID in body if your backend expects it
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Update local state
      setProfile((prev) => ({ ...prev, [field]: tempProfile[field] }));
      setEditMode((prev) => ({ ...prev, [field]: false }));
      toast.success(`${field.replace(/_/g, " ")} updated successfully!`);
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
      const token = localStorage.getItem("studentToken");
      await axios.put(
        `${base_url}/api/student/profile/${studentdata.id}/password`, // Updated URL
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
      setLoading({ ...loading, password: false });
    }
  };

  // Handle profile photo change
  const handleProfilePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading({ ...loading, photo: true });
      const token = localStorage.getItem("studentToken");
      const formData = new FormData();
      formData.append("profile_picture", file); // Must match the field name expected by multer

      const response = await axios.put(
        `${base_url}/api/student/profile/${studentdata.id}`, // Use the profile update endpoint
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setProfile((prev) => ({
        ...prev,
        profile_picture: response.data.profile_picture || prev.profile_picture,
      }));
      toast.success("Profile photo updated successfully!");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to update profile photo"
      );
    } finally {
      setLoading({ ...loading, photo: false });
    }
  };

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
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gray-100 overflow-hidden border-2 border-gray-300 flex items-center justify-center">
              {profile.profile_picture ? (
                <img
                  src={`${base_url}/students/${profile?.profile_picture}`}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <FiUser className="text-gray-400" size={32} />
              )}
            </div>
            <label
              htmlFor="profilePhoto"
              className="absolute bottom-0 right-0 p-2 bg-gray-800 text-white rounded-full cursor-pointer hover:bg-gray-900 transition-colors"
              title="Change photo"
            >
              <FiEdit2 size={16} />
              <input
                type="file"
                id="profilePhoto"
                onChange={handleProfilePhotoChange}
                className="hidden"
                accept="image/*"
                disabled={loading.photo}
              />
            </label>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl font-semibold text-gray-800">
              {profile.full_name || "Student User"}
            </h2>
            <p className="text-gray-600">{profile.email}</p>
            <div className="mt-2 flex items-center justify-center sm:justify-start space-x-4 text-sm text-gray-500">
              <span>
                Joined {profile.createdAt ? formatDate(profile.createdAt) : ""}
              </span>
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  profile.isVerified
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {profile.isVerified ? "Verified" : "Not Verified"}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Information Section */}
        <div className="space-y-6">
          {/* Full Name Field */}
          <div className="border-b border-gray-100 pb-6">
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <FiUser className="mr-2" size={16} />
                Full Name
              </label>
              {editMode.full_name ? (
                <div className="flex space-x-2">
                  <button
                    onClick={() => saveProfile("full_name")}
                    className="p-1.5 rounded-md bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                    disabled={loading.profile}
                  >
                    <FiSave size={16} />
                  </button>
                  <button
                    onClick={() => handleEditToggle("full_name")}
                    className="p-1.5 rounded-md bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleEditToggle("full_name")}
                  className="p-1.5 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  <FiEdit2 size={16} />
                </button>
              )}
            </div>
            {editMode.full_name ? (
              <input
                type="text"
                value={tempProfile.full_name || ""}
                onChange={(e) => handleProfileChange(e, "full_name")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg  focus:border-gray-500"
                placeholder="Enter your full name"
              />
            ) : (
              <p className="text-gray-800">
                {profile.full_name || "Not provided"}
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg  focus:border-gray-500"
                placeholder="Enter your email"
              />
            ) : (
              <div>
                <p className="text-gray-800">{profile.email}</p>
                {!profile.isVerified && (
                  <p className="text-sm text-yellow-600 mt-1">
                    Your email is not verified. Please check your inbox for
                    verification instructions.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Phone Field */}
          <div className="border-b border-gray-100 pb-6">
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <FiPhone className="mr-2" size={16} />
                Phone Number
              </label>
              {editMode.phone ? (
                <div className="flex space-x-2">
                  <button
                    onClick={() => saveProfile("phone")}
                    className="p-1.5 rounded-md bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                    disabled={loading.profile}
                  >
                    <FiSave size={16} />
                  </button>
                  <button
                    onClick={() => handleEditToggle("phone")}
                    className="p-1.5 rounded-md bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleEditToggle("phone")}
                  className="p-1.5 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  <FiEdit2 size={16} />
                </button>
              )}
            </div>
            {editMode.phone ? (
              <input
                type="tel"
                value={tempProfile.phone || ""}
                onChange={(e) => handleProfileChange(e, "phone")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg  focus:border-gray-500"
                placeholder="Enter phone number"
              />
            ) : (
              <p className="text-gray-800">{profile.phone || "Not provided"}</p>
            )}
          </div>

          {/* Date of Birth Field */}
          <div className="border-b border-gray-100 pb-6">
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <FiCalendar className="mr-2" size={16} />
                Date of Birth
              </label>
              {editMode.date_of_birth ? (
                <div className="flex space-x-2">
                  <button
                    onClick={() => saveProfile("date_of_birth")}
                    className="p-1.5 rounded-md bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                    disabled={loading.profile}
                  >
                    <FiSave size={16} />
                  </button>
                  <button
                    onClick={() => handleEditToggle("date_of_birth")}
                    className="p-1.5 rounded-md bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleEditToggle("date_of_birth")}
                  className="p-1.5 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  <FiEdit2 size={16} />
                </button>
              )}
            </div>
            {editMode.date_of_birth ? (
              <input
                type="date"
                value={formatDateForInput(tempProfile.date_of_birth) || ""}
                onChange={(e) => handleProfileChange(e, "date_of_birth")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg  focus:border-gray-500"
              />
            ) : (
              <p className="text-gray-800">
                {profile.date_of_birth
                  ? formatDateForInput(profile.date_of_birth)
                  : "Not provided"}
              </p>
            )}
          </div>

          {/* Address Field */}
          <div className="border-b border-gray-100 pb-6">
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <FiMapPin className="mr-2" size={16} />
                Address
              </label>
              {editMode.address ? (
                <div className="flex space-x-2">
                  <button
                    onClick={() => saveProfile("address")}
                    className="p-1.5 rounded-md bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                    disabled={loading.profile}
                  >
                    <FiSave size={16} />
                  </button>
                  <button
                    onClick={() => handleEditToggle("address")}
                    className="p-1.5 rounded-md bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleEditToggle("address")}
                  className="p-1.5 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  <FiEdit2 size={16} />
                </button>
              )}
            </div>
            {editMode.address ? (
              <textarea
                value={tempProfile.address || ""}
                onChange={(e) => handleProfileChange(e, "address")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-gray-500"
                rows={3}
                placeholder="Enter your full address"
              />
            ) : (
              <p className="text-gray-800">
                {profile.address || "Not provided"}
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
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-4  mt-3">
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
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg  focus:border-gray-500 pr-10"
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
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg  focus:border-gray-500 pr-10"
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
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg  focus:border-gray-500 pr-10"
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

export default StudentSettings;
