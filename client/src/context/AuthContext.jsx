import React, { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const base_url = "http://localhost:3500";

  // Admin state
  const [adminData, setAdminData] = useState(null);
  const [adminLoading, setAdminLoading] = useState(true);
  const [adminError, setAdminError] = useState(null);

  // Student state
  const [studentData, setStudentData] = useState(null);
  const [studentLoading, setStudentLoading] = useState(true);
  const [studentError, setStudentError] = useState(null);

  // Teacher state (NEW)
  const [teacherData, setTeacherData] = useState(null);
  const [teacherLoading, setTeacherLoading] = useState(true);
  const [teacherError, setTeacherError] = useState(null);

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

  // Get teacher auth data (NEW)
  const getTeacherAuthData = () => ({
    token: localStorage.getItem("teacherToken"),
    teacherInfo: JSON.parse(localStorage.getItem("teacherData") || "null")
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

    // initialize teacher from localStorage immediately (NEW)
    const { token: tToken, teacherInfo } = getTeacherAuthData();
    if (tToken && teacherInfo) {
      setTeacherData(teacherInfo);
      setTeacherLoading(false);
    } else {
      setTeacherLoading(false);
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
            Authorization: `Bearer ${token}`
          }
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
            Authorization: `Bearer ${token}`
          }
        }
      );

      const studentDataResp = response.data.student;

      setStudentData(studentDataResp);

      // Update localStorage with fresh data
      localStorage.setItem("studentData", JSON.stringify(studentDataResp));
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

  // Fetch teacher profile (NEW) - matches the pattern used for student/admin
  const fetchTeacherProfile = useCallback(async () => {
    const { token, teacherInfo } = getTeacherAuthData();

    if (!token || !teacherInfo?._id) {
      setTeacherData(null);
      setTeacherLoading(false);
      return;
    }

    try {
      setTeacherLoading(true);
      setTeacherError(null);

      const response = await axios.get(
        `${base_url}/api/teacher/teacher-profile/${teacherInfo._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const teacherDataResp =
        response.data.data || response.data.teacher || null;

      if (teacherDataResp) {
        setTeacherData(teacherDataResp);
        // sync localStorage
        localStorage.setItem("teacherData", JSON.stringify(teacherDataResp));
      } else {
        // If API returned success false or unexpected shape, clear
        setTeacherData(null);
      }
    } catch (err) {
      setTeacherError(err.response?.data?.message || "Failed to fetch teacher");
      if (err.response?.status === 401) {
        localStorage.removeItem("teacherToken");
        localStorage.removeItem("teacherData");
        setTeacherData(null);
      }
    } finally {
      setTeacherLoading(false);
    }
  }, [base_url]);

  // Initial fetch on mount for admin only (keeps original behavior)
  useEffect(() => {
    fetchAdminProfile();
  }, [fetchAdminProfile]);

  // ALSO fetch teacher profile on mount (NEW - this was missing in my earlier snippet)
  useEffect(() => {
    fetchTeacherProfile();
  }, [fetchTeacherProfile]);

  // 1. FIRST: Add updateStudentData
  const updateStudentData = useCallback((updatedData) => {
    // Update context state
    setStudentData(updatedData);

    // Update localStorage
    localStorage.setItem("studentData", JSON.stringify(updatedData));
  }, []);

  // Add updateTeacherData (NEW)
  const updateTeacherData = useCallback((updatedData) => {
    setTeacherData(updatedData);
    localStorage.setItem("teacherData", JSON.stringify(updatedData));
  }, []);

  // Listen for storage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const adminAuth = getAdminAuthData();
      const studentAuth = getStudentAuthData();
      const teacherAuth = getTeacherAuthData();

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

      // Teacher sync (NEW)
      if (!teacherAuth.token || !teacherAuth.teacherInfo) {
        clearTeacherData();
      } else {
        setTeacherData(teacherAuth.teacherInfo);
        fetchTeacherProfile();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [fetchAdminProfile, fetchStudentProfile, fetchTeacherProfile]);

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

  // Clear teacher data (NEW)
  const clearTeacherData = () => {
    setTeacherData(null);
    setTeacherError(null);
    setTeacherLoading(false);
  };

  const refreshAdminData = () => {
    fetchAdminProfile();
  };

  const refreshStudentData = () => {
    fetchStudentProfile();
  };

  const refreshTeacherData = () => {
    fetchTeacherProfile();
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

        // Teacher (NEW)
        teacherData,
        teacherLoading,
        teacherError,
        fetchTeacherProfile: refreshTeacherData,
        updateTeacherData,
        clearTeacherData,

        // Combined helper functions
        isAuthenticated: () => {
          return (
            !!localStorage.getItem("token") ||
            !!localStorage.getItem("studentToken") ||
            !!localStorage.getItem("teacherToken")
          );
        },
        getUserRole: () => {
          return (
            localStorage.getItem("role") ||
            (teacherData ? "teacher" : studentData ? "student" : "admin")
          );
        }
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
