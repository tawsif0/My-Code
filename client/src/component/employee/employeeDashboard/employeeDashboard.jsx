import React, { useState, useEffect } from "react";
import Sidebar from "./sidebar";
import Settings from "./settings";
import EmployeeConsultationManagement from "./consultancy/EmployeeConsultationManagement";
import VisaManagement from "./visa/VisaManagement";

const EmployeeDashboard = () => {
  // Initialize state with proper structure from localStorage
  const [activeView, setActiveView] = useState(() => {
    const savedView = localStorage.getItem("employeeActiveView");
    try {
      return savedView ? JSON.parse(savedView) : "dashboard";
    } catch {
      return "dashboard";
    }
  });

  // Update localStorage whenever activeView changes
  useEffect(() => {
    if (typeof activeView === "string") {
      localStorage.setItem("employeeActiveView", JSON.stringify(activeView));
    } else {
      localStorage.setItem("employeeActiveView", JSON.stringify(activeView));
    }
  }, [activeView]);

  const renderView = () => {
    const currentView =
      typeof activeView === "object" ? activeView.view : activeView;

    switch (currentView) {
      case "myConsultancy":
        return <EmployeeConsultationManagement />;
      case "visaManagement":
        return <VisaManagement />;
      case "settings":
        return <Settings />;
      default:
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Employee Dashboard Overview
            </h1>
            <p className="mt-2 text-gray-600">
              Welcome to your employee dashboard. Use the sidebar to manage your
              account settings.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-100 to-gray-300 min-h-screen flex items-center justify-center p-4">
      <div className="flex w-full h-[95vh] bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200">
        <Sidebar activeView={activeView} setActiveView={setActiveView} />
        <div className="flex-1 h-full overflow-auto p-6">{renderView()}</div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
