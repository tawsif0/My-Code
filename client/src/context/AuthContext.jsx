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
    userInfo: JSON.parse(localStorage.getItem("admin") || "null"),
  });

  // Get student auth data
  const getStudentAuthData = () => ({
    token: localStorage.getItem("studentToken"),
    studentInfo: JSON.parse(localStorage.getItem("studentData") || "null"),
  });

  // Initialize student data from localStorage immediately
  useEffect(() => {
    const { token, studentInfo } = getStudentAuthData();

    if (token && studentInfo) {
      setStudentData(studentInfo);
      setStudentLoading(false);
    } else {
      setStudentLoading(false);
    }
  }, []);

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
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAdminData(response.data.profile);
    } catch (err) {
      setAdminError(
        err.response?.data?.message || "Failed to fetch admin profile"
      );
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

      const response = await axios.get(
        `${base_url}/api/student/profile/${studentInfo._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const studentData = response.data.student;

      setStudentData(studentData);

      // Update localStorage with fresh data
      localStorage.setItem("studentData", JSON.stringify(studentData));
    } catch (err) {
      setStudentError(
        err.response?.data?.message || "Failed to fetch student profile"
      );

      if (err.response?.status === 401) {
        localStorage.removeItem("studentToken");
        localStorage.removeItem("studentData");
        setStudentData(null);
      }
    } finally {
      setStudentLoading(false);
    }
  }, [base_url]);

  // Initial fetch on mount for admin only
  useEffect(() => {
    fetchAdminProfile();
  }, [fetchAdminProfile]);
  // 1. FIRST: Add updateStudentData
  const updateStudentData = useCallback((updatedData) => {
    // Update context state
    setStudentData(updatedData);

    // Update localStorage
    localStorage.setItem("studentData", JSON.stringify(updatedData));
  }, []);
  // Listen for storage changes
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
        forceUpdateFromStorage,
        updateStudentData,
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
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
