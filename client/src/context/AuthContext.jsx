import React, { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  // Admin state
  const [adminData, setAdminData] = useState(null);
  const [adminLoading, setAdminLoading] = useState(true);
  const [adminError, setAdminError] = useState(null);

  // Student state
  const [studentData, setStudentData] = useState(null);
  const [studentLoading, setStudentLoading] = useState(true);
  const [studentError, setStudentError] = useState(null);

  // Get admin auth data
  const getAdminAuthData = () => ({
    token: localStorage.getItem("token"),
    userInfo: JSON.parse(localStorage.getItem("admin") || "null")
  });

  // Get student auth data
  const getStudentAuthData = () => ({
    token: localStorage.getItem("studentToken"),
    studentInfo: JSON.parse(localStorage.getItem("studentData") || "null")
  });

  // CRITICAL FIX: Initialize student data from localStorage immediately
  useEffect(() => {
    const { token, studentInfo } = getStudentAuthData();

    console.log(
      "AuthContext initializing - Token:",
      !!token,
      "StudentInfo:",
      studentInfo
    );

    if (token && studentInfo) {
      console.log("Setting initial student data:", studentInfo);

      // Add base_url to profile_picture for initial data
      const updatedStudentInfo = { ...studentInfo };
      if (updatedStudentInfo.profile_picture) {
        updatedStudentInfo.profile_picture = `${base_url}/students/${updatedStudentInfo.profile_picture}`;
        console.log(
          "Initial profile picture URL:",
          updatedStudentInfo.profile_picture
        );
      }

      setStudentData(updatedStudentInfo);
      setStudentLoading(false);
    } else {
      setStudentLoading(false);
    }
  }, [base_url]); // Add base_url as dependency

  // Memoized fetch function for admin
  const fetchAdminProfile = useCallback(async () => {
    const { token, userInfo } = getAdminAuthData();

    if (!token || !userInfo?._id) {
      setAdminLoading(false);
      return;
    }

    try {
      setAdminLoading(true);
      setAdminError(null);

      const response = await axios.get(
        `${base_url}/api/admin/profile/${userInfo._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setAdminData(response.data.profile);
    } catch (err) {
      setAdminError(
        err.response?.data?.message || "Failed to fetch admin profile"
      );
      // Clear invalid token/data
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("admin");
        setAdminData(null);
      }
    } finally {
      setAdminLoading(false);
    }
  }, [base_url]);

  // Fetch fresh student profile data
  const fetchStudentProfile = useCallback(async () => {
    const { token, studentInfo } = getStudentAuthData();

    if (!token || !studentInfo?._id) {
      setStudentData(null);
      setStudentLoading(false);
      return;
    }

    try {
      setStudentLoading(true);
      setStudentError(null);

      console.log("Fetching fresh student profile for:", studentInfo._id);

      const response = await axios.get(
        `${base_url}/api/student/profile/${studentInfo._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const studentData = response.data.student;

      // CRITICAL: Add base_url to profile_picture to create the complete URL
      if (studentData.profile_picture) {
        studentData.profile_picture = `${base_url}/students/${studentData.profile_picture}`;
        console.log("Profile picture URL:", studentData.profile_picture);
      }

      setStudentData(studentData);

      // Update localStorage with fresh data (without base_url for storage)
      const storageData = { ...response.data.student };
      localStorage.setItem("studentData", JSON.stringify(storageData));
    } catch (err) {
      console.error("Profile fetch error:", err);
      setStudentError(
        err.response?.data?.message || "Failed to fetch student profile"
      );

      // Clear invalid token/data
      if (err.response?.status === 401) {
        localStorage.removeItem("studentToken");
        localStorage.removeItem("studentData");
        setStudentData(null);
      }
    } finally {
      setStudentLoading(false);
    }
  }, [base_url]);

  // Initial fetch on mount for admin only (student is handled by the initialization useEffect)
  useEffect(() => {
    fetchAdminProfile();
  }, [fetchAdminProfile]);

  // Listen for storage changes (for login/logout from other tabs)
  useEffect(() => {
    const handleStorageChange = () => {
      const adminAuth = getAdminAuthData();
      const studentAuth = getStudentAuthData();

      if (!adminAuth.token || !adminAuth.userInfo) {
        clearAdminData();
      } else {
        fetchAdminProfile();
      }

      if (!studentAuth.token || !studentAuth.studentInfo) {
        clearStudentData();
      } else {
        // Immediately set student data and refetch
        setStudentData(studentAuth.studentInfo);
        fetchStudentProfile();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [fetchAdminProfile, fetchStudentProfile]);

  // Force immediate update from localStorage
  const forceUpdateFromStorage = useCallback(() => {
    const { token, studentInfo } = getStudentAuthData();

    console.log(
      "Force updating from storage - Token:",
      !!token,
      "Data:",
      !!studentInfo
    );

    if (token && studentInfo) {
      setStudentData(studentInfo);
      setStudentLoading(false);
      setStudentError(null);
    } else {
      setStudentData(null);
      setStudentLoading(false);
    }
  }, []);

  const clearAdminData = () => {
    setAdminData(null);
    setAdminError(null);
    setAdminLoading(false);
  };

  const clearStudentData = () => {
    setStudentData(null);
    setStudentError(null);
    setStudentLoading(false);
  };

  // Expose refresh functions
  const refreshAdminData = () => {
    fetchAdminProfile();
  };

  const refreshStudentData = () => {
    fetchStudentProfile();
  };

  return (
    <AuthContext.Provider
      value={{
        // Admin
        adminData,
        adminLoading,
        adminError,
        fetchAdminProfile: refreshAdminData,
        clearAdminData,
        adminRole: adminData?.role || localStorage.getItem("role"),

        // Student
        studentData,
        studentLoading,
        studentError,
        fetchStudentProfile: refreshStudentData,
        forceUpdateFromStorage, // NEW: Force update function
        clearStudentData,

        // Combined helper functions
        isAuthenticated: () => {
          return (
            !!localStorage.getItem("token") ||
            !!localStorage.getItem("studentToken")
          );
        },
        getUserRole: () => {
          return localStorage.getItem("role") || "student";
        }
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
