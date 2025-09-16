import React, { useState, useEffect } from "react";
import Sidebar from "./sidebar";
import Settings from "./settings";
import CourseList from "./courses/coursesList";
import Cart from "./courses/cart";
import MyCourses from "./courses/myCOurses";
import axios from "axios";
import CourseOverview from "./courses/courseView/CourseOverview";
import CoursePlayer from "./courses/courseView/CoursePlayer";
import VisaStatus from "./visa/VisaStatus";
import VisaRequestForm from "./visa/VisaRequestForm";

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

  const [cart, setCart] = useState([]);

  useEffect(() => {
    const loadAndValidateCart = async () => {
      try {
        const savedCart = JSON.parse(localStorage.getItem("courseCart")) || [];

        if (localStorage.getItem("studentToken")) {
          const response = await axios.get(
            `${import.meta.env.VITE_API_KEY_Base_URL}/api/student/cart`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("studentToken")}`
              }
            }
          );

          if (response.data.success) {
            setCart(response.data.cart.items);
            return;
          }
        }

        setCart(savedCart);
      } catch (error) {
        console.error("Error loading cart:", error);
        const savedCart = JSON.parse(localStorage.getItem("courseCart")) || [];
        setCart(savedCart);
      }
    };

    loadAndValidateCart();
  }, []);

  // Update localStorage whenever cart changes (for guest users)
  useEffect(() => {
    if (!localStorage.getItem("studentToken")) {
      localStorage.setItem("courseCart", JSON.stringify(cart));
    }
  }, [cart]);

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
        return (
          <CourseList
            setActiveView={setActiveView}
            cart={cart}
            setCart={setCart}
          />
        );
      case "cart":
        return (
          <Cart setActiveView={setActiveView} cart={cart} setCart={setCart} />
        );
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
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Dashboard Overview
            </h1>
            <p className="mt-2 text-gray-600">
              Welcome to your student dashboard. Use the sidebar to manage your
              courses and account settings.
            </p>
          </div>
        );
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
