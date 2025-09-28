import React, { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Use environment variable if available, fallback to localhost
  const base_url =
    import.meta.env.VITE_API_KEY_Base_URL || "http://localhost:3500";

  // Admin state
  const [adminData, setAdminData] = useState(null);
  const [adminLoading, setAdminLoading] = useState(true);
  const [adminError, setAdminError] = useState(null);

  // Student state
  const [studentData, setStudentData] = useState(null);
  const [studentLoading, setStudentLoading] = useState(true);
  const [studentError, setStudentError] = useState(null);

  // Teacher state
  const [teacherData, setTeacherData] = useState(null);
  const [teacherLoading, setTeacherLoading] = useState(true);
  const [teacherError, setTeacherError] = useState(null);

  // Employee state
  const [employeeData, setEmployeeData] = useState(null);
  const [employeeLoading, setEmployeeLoading] = useState(true);
  const [employeeError, setEmployeeError] = useState(null);

  // Get auth data functions
  const getAdminAuthData = () => ({
    token: localStorage.getItem("token"),
    userInfo: JSON.parse(localStorage.getItem("admin") || "null"),
  });

  const getStudentAuthData = () => ({
    token: localStorage.getItem("studentToken"),
    studentInfo: JSON.parse(localStorage.getItem("studentData") || "null"),
  });

  const getTeacherAuthData = () => ({
    token: localStorage.getItem("teacherToken"),
    teacherInfo: JSON.parse(localStorage.getItem("teacherData") || "null"),
  });

  const getEmployeeAuthData = () => ({
    token: localStorage.getItem("empToken"),
  });

  // Initialize student, teacher, and employee from localStorage
  useEffect(() => {
    // Initialize student data
    const { token: sToken, studentInfo } = getStudentAuthData();
    if (sToken && studentInfo) {
      setStudentData(studentInfo);
      setStudentLoading(false);
    } else {
      setStudentLoading(false);
    }

    // Initialize teacher data
    const { token: tToken, teacherInfo } = getTeacherAuthData();
    if (tToken && teacherInfo) {
      setTeacherData(teacherInfo);
      setTeacherLoading(false);
    } else {
      setTeacherLoading(false);
    }

    // Initialize employee data
    const { token: eToken } = getEmployeeAuthData();
    if (!eToken) {
      setEmployeeLoading(false);
      return;
    }

    const fetchEmployeeData = async () => {
      try {
        const response = await axios.get(`${base_url}/api/employee/me`, {
          headers: { "x-auth-token": eToken },
        });

        const gradients = [
          "bg-gradient-to-r from-purple-500 to-pink-500",
          "bg-gradient-to-r from-blue-500 to-teal-400",
          "bg-gradient-to-r from-amber-500 to-pink-500",
          "bg-gradient-to-r from-emerald-500 to-blue-500",
          "bg-gradient-to-r from-violet-500 to-fuchsia-500",
        ];
        const randomGradient =
          gradients[Math.floor(Math.random() * gradients.length)];

        setEmployeeData({
          username: response.data.employee.username,
          email: response.data.employee.email,
          phoneNumber: response.data.employee.phoneNumber,
          avatarColor: randomGradient,
        });
      } catch (err) {
        toast.error("Failed to load employee data");
        setEmployeeError(
          err.response?.data?.message || "Failed to fetch employee"
        );
      } finally {
        setEmployeeLoading(false);
      }
    };

    fetchEmployeeData();
  }, [base_url]);

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

  // Teacher fetch
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
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const teacherDataResp =
        response.data.data || response.data.teacher || null;
      if (teacherDataResp) {
        setTeacherData(teacherDataResp);
        localStorage.setItem("teacherData", JSON.stringify(teacherDataResp));
      } else {
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

  // Initial fetch on mount for admin
  useEffect(() => {
    fetchAdminProfile();
  }, [fetchAdminProfile]);

  // Update functions
  const updateStudentData = useCallback((updatedData) => {
    // Update context state
    setStudentData(updatedData);
    // Update localStorage
    localStorage.setItem("studentData", JSON.stringify(updatedData));
  }, []);

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
      const employeeAuth = getEmployeeAuthData();

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

      if (!teacherAuth.token || !teacherAuth.teacherInfo) {
        clearTeacherData();
      } else {
        setTeacherData(teacherAuth.teacherInfo);
        fetchTeacherProfile();
      }

      // Handle employee auth changes
      if (!employeeAuth.token) {
        clearEmployeeData();
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

  // Clear functions
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

  const clearTeacherData = () => {
    setTeacherData(null);
    setTeacherError(null);
    setTeacherLoading(false);
  };

  const clearEmployeeData = () => {
    setEmployeeData(null);
    setEmployeeError(null);
    setEmployeeLoading(false);
  };

  // Refresh functions
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

        // Teacher
        teacherData,
        teacherLoading,
        teacherError,
        fetchTeacherProfile: refreshTeacherData,
        updateTeacherData,
        clearTeacherData,

        // Employee
        employeeData,
        employeeLoading,
        employeeError,
        clearEmployeeData,

        // Combined helper functions
        isAuthenticated: () => {
          return (
            !!localStorage.getItem("token") ||
            !!localStorage.getItem("studentToken") ||
            !!localStorage.getItem("teacherToken") ||
            !!localStorage.getItem("empToken")
          );
        },
        getUserRole: () => {
          return (
            localStorage.getItem("role") ||
            (employeeData
              ? "employee"
              : teacherData
              ? "teacher"
              : studentData
              ? "student"
              : "admin")
          );
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
