import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import AdminLogin from "./component/admin/adminLogin";
import ForgotPassword from "./component/admin/ForgotPassword";
import ResetPassword from "./component/admin/ResetPassword";
import AdminDashboard from "./component/admin/adminDashboard/adminDashboard";
import TeacherAuth from "./component/teacher/teacherAuth";
import StudentAuth from "./component/student/studentAuth";
import ResetPasswordTeacher from "./component/teacher/ResetPassword";
import ForgotPasswordTeacher from "./component/teacher/ForgotPassword";
import ForgotPasswordStudent from "./component/student/ForgotPassword";
import ResetPasswordStudent from "./component/student/ResetPassword";
import StudentDashboard from "./component/student/studentDashboard/studentDashboard";
import TeacherDashboard from "./component/teacher/teacherDashboard/teacherDashboard";

import CourseOverview from "./component/student/studentDashboard/courses/courseView/CourseOverview";
import CoursePlayer from "./component/student/studentDashboard/courses/courseView/CoursePlayer";

import AppRoutes from "./component/Home/App";
import EmployeeLogin from "./component/employee/EmployeeLogin";
import EmployeeDashboard from "./component/employee/employeeDashboard/employeeDashboard";
import ResetPasswordEmployee from "./component/employee/ResetPassword";
import ForgotPasswordEmployee from "./component/employee/ForgotPassword";

const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  return !!token;
};

const getUserRole = () => {
  return localStorage.getItem("role"); // "admin" or "subadmin"
};

const App = () => {
  // eslint-disable-next-line no-unused-vars
  const role = getUserRole();

  const [authMode, setAuthMode] = useState("register");
  return (
    <>
      <Toaster
        position="top-center"
        containerStyle={{
          position: "fixed",
          zIndex: 9999, // Higher than your modal's z-index
        }}
        toastOptions={{
          className:
            "backdrop-blur-sm bg-white/80 border border-gray-200 shadow-xl rounded-xl text-gray-900 font-medium px-6 py-4 transition-all duration-300",
          style: {
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.8), rgba(245,245,245,0.6))",
            border: "1px solid rgba(0,0,0,0.1)",
            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
            borderRadius: "1rem",
            fontSize: "1rem",
            padding: "1.2rem 1.5rem",
          },
          success: {
            iconTheme: {
              primary: "#000",
              secondary: "#ecfdf5",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fef2f2",
            },
          },
        }}
      />
      <Router>
        <Routes>
          <Route path="/*" element={<AppRoutes />} />
          <Route path="/admin" element={<AdminLogin />} />

          <Route path="/admin/forgotPassword" element={<ForgotPassword />} />
          <Route path="/admin/reset-password" element={<ResetPassword />} />

          <Route
            path="/admin/dashboard"
            element={
              isAuthenticated() ? (
                <AdminDashboard />
              ) : (
                <Navigate to="/admin" replace />
              )
            }
          />

          {/* Teacher route */}
          <Route
            path="/teacher"
            element={
              <TeacherAuth authMode={authMode} setAuthMode={setAuthMode} />
            }
          />
          <Route
            path="/teacher/forgotPassword"
            element={<ForgotPasswordTeacher setAuthMode={setAuthMode} />}
          />
          <Route
            path="/teacher/reset-password"
            element={<ResetPasswordTeacher />}
          />
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          {/* Student route */}
          <Route
            path="/student"
            element={
              <StudentAuth authMode={authMode} setAuthMode={setAuthMode} />
            }
          />
          <Route
            path="/student/forgotPassword"
            element={<ForgotPasswordStudent setAuthMode={setAuthMode} />}
          />
          <Route
            path="/student/reset-password"
            element={<ResetPasswordStudent setAuthMode={setAuthMode} />}
          />
          <Route path="/student/dashboard" element={<StudentDashboard />} />

          {/* ------------------------------teacher-all-route---------------------------------------- */}

          {/* ------------------------------Employee-all-route---------------------------------------- */}
          <Route path="/employee/login" element={<EmployeeLogin />} />
          <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
          <Route
            path="/employee/forgotPassword"
            element={<ForgotPasswordEmployee />}
          />
          <Route
            path="/employee/reset-password"
            element={<ResetPasswordEmployee />}
          />
          {/* ----------------------------------student-all-route---------------------------------- */}
          <Route
            path="/student/course-overview/:id"
            element={<CourseOverview />}
          />
          <Route path="/student/learn/:id" element={<CoursePlayer />} />
        </Routes>
      </Router>
    </>
  );
};

export default App;
