import React, { useState, useEffect } from "react";
import Sidebar from "./sidebar";
import TeacherSettings from "./settings";
import CreateCourse from "./course/CreateCourse";
import CourseList from "./course/CourseList";
import Studentpaper from "./paper/Studentpaper";
import Liveclass from "./liveclass/Liveclass";

const TeacherDashboard = () => {
  const [activeView, setActiveView] = useState(() => {
    const savedView = localStorage.getItem("teacherActiveView");
    try {
      return savedView ? JSON.parse(savedView) : "dashboard";
    } catch {
      return "dashboard";
    }
  });

  useEffect(() => {
    if (typeof activeView === "string") {
      localStorage.setItem("teacherActiveView", JSON.stringify(activeView));
    } else {
      localStorage.setItem("teacherActiveView", JSON.stringify(activeView));
    }
  }, [activeView]);
  const renderView = () => {
    const currentView =
      typeof activeView === "object" ? activeView.view : activeView;
    switch (currentView) {
      case "settings":
        return <TeacherSettings />;
      case "createCourse":
        return <CreateCourse />;
      case "courseList":
        return <CourseList />;
      case "answerPaper":
        return <Studentpaper />;
      case "liveClass":
        return <Liveclass />;

      default:
        return <h1 className="p-6 text-xl font-bold">Dashboard Overview</h1>;
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

export default TeacherDashboard;
