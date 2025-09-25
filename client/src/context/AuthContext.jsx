import React, { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";

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

  // Teacher state
  const [teacherData, setTeacherData] = useState(null);
  const [teacherLoading, setTeacherLoading] = useState(true);
  const [teacherError, setTeacherError] = useState(null);

  // Employee state
  const [employeeData, setEmployeeData] = useState(null);
  const [employeeLoading, setEmployeeLoading] = useState(true);
  const [employeeError, setEmployeeError] = useState(null);

  // Get auth data
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
    const { token: sToken, studentInfo } = getStudentAuthData();
    if (sToken && studentInfo) setStudentData(studentInfo);
    setStudentLoading(false);

    const { token: tToken, teacherInfo } = getTeacherAuthData();
    if (tToken && teacherInfo) setTeacherData(teacherInfo);
    setTeacherLoading(false);

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

  // Admin fetch
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
          headers: { Authorization: `Bearer ${token}` },
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

  // Student fetch
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
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setStudentData(response.data.student);
      localStorage.setItem(
        "studentData",
        JSON.stringify(response.data.student)
      );
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
      } else setTeacherData(null);
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

  // Update functions
  const updateStudentData = useCallback((data) => {
    setStudentData(data);
    localStorage.setItem("studentData", JSON.stringify(data));
  }, []);

  const updateTeacherData = useCallback((data) => {
    setTeacherData(data);
    localStorage.setItem("teacherData", JSON.stringify(data));
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

  return (
    <AuthContext.Provider
      value={{
        // Admin
        adminData,
        adminLoading,
        adminError,
        fetchAdminProfile,
        clearAdminData,
        adminRole: adminData?.role || localStorage.getItem("role"),

        // Student
        studentData,
        studentLoading,
        studentError,
        fetchStudentProfile,
        updateStudentData,
        clearStudentData,

        // Teacher
        teacherData,
        teacherLoading,
        teacherError,
        fetchTeacherProfile,
        updateTeacherData,
        clearTeacherData,

        // Employee
        employeeData,
        employeeLoading,
        employeeError,
        clearEmployeeData,

        // Helpers
        isAuthenticated: () =>
          !!localStorage.getItem("token") ||
          !!localStorage.getItem("studentToken") ||
          !!localStorage.getItem("teacherToken") ||
          !!localStorage.getItem("empToken"),

        getUserRole: () =>
          localStorage.getItem("role") ||
          (employeeData
            ? "employee"
            : teacherData
            ? "teacher"
            : studentData
            ? "student"
            : "admin"),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
