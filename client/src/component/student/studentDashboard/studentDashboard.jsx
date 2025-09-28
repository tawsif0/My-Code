import React, { useState, useEffect } from "react";
import Sidebar from "./sidebar";
import Settings from "./settings";
import CourseList from "./courses/coursesList";
import Cart from "./courses/cart";
import MyCourses from "./courses/myCOurses";
import CourseOverview from "./courses/courseView/CourseOverview";
import CoursePlayer from "./courses/courseView/CoursePlayer";
import VisaStatus from "./visa/VisaStatus";
import VisaRequestForm from "./visa/VisaRequestForm";
import { useCart } from "../../../context/useCart";
import StudentAnalytics from "./StudentAnalytics";

const StudentDashboard = () => {
  // Initialize state with proper structure from localStorage
  const [activeView, setActiveView] = useState(() => {
    const savedView = localStorage.getItem("studentActiveView");
    try {
      return savedView ? JSON.parse(savedView) : "dashboard";
    } catch {
      return "dashboard";
    }
  });

  const { refreshCart } = useCart();

  useEffect(() => {
    // Handle URL parameters for view
    const urlParams = new URLSearchParams(window.location.search);
    const viewParam = urlParams.get("view");
    if (viewParam && ["cart", "myCourses"].includes(viewParam)) {
      setActiveView(viewParam);
    }
    refreshCart();
  }, [refreshCart]);

  // Update localStorage whenever activeView changes
  useEffect(() => {
    if (typeof activeView === "string") {
      localStorage.setItem("studentActiveView", JSON.stringify(activeView));
    } else {
      localStorage.setItem("studentActiveView", JSON.stringify(activeView));
    }
  }, [activeView]);

  const renderView = () => {
    // Handle both string and object view states
    const currentView =
      typeof activeView === "object" ? activeView.view : activeView;

    switch (currentView) {
      case "settings":
        return <Settings />;
      case "courseList":
        return <CourseList setActiveView={setActiveView} />;
      case "cart":
        return <Cart setActiveView={setActiveView} />;
      case "myCourses":
        return <MyCourses setActiveView={setActiveView} />;
      case "courseOverview":
        return (
          <CourseOverview
            courseId={activeView.courseId}
            setActiveView={setActiveView}
          />
        );
      case "videoPlayer":
        return (
          <CoursePlayer
            courseId={activeView.courseId}
            setActiveView={setActiveView}
          />
        );
      case "visaRequest":
        return <VisaRequestForm setActiveView={setActiveView} />;
      case "visaStatus":
        return <VisaStatus setActiveView={setActiveView} />;
      default:
        return <StudentAnalytics />;
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-100 to-gray-300 min-h-screen flex items-center justify-center p-4">
      <div className="flex w-full  h-[95vh] bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200">
        <Sidebar activeView={activeView} setActiveView={setActiveView} />
        <div className="flex-1 h-full overflow-auto p-6">{renderView()}</div>
      </div>
    </div>
  );
};

export default StudentDashboard;
