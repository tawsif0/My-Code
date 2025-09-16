// AppRoutes.jsx
import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import AboutPage from "./pages/AboutPage";
import ServicesPage from "./pages/ServicesPage";
import CoursesPage from "./pages/CoursesPage";
import BlogPage from "./pages/BlogPage";
import BlogPost from "./components/BlogPost";
import EventDetail from "./components/EventDetail";
import ContactPage from "./pages/ContactPage";
import AppointmentPage from "./pages/AppointmentPage";
import ScrollButtons from "./components/ScrollButtons";
import Countries from "./pages/CountryPage";
import EventsPage from "./pages/EventsPage";
import CareerPage from "./pages/CareerPage";
import "./index.css";
import { useLenis } from "./hooks/useLenis";
// Scroll to Top component
function ScrollToTop() {
  useLenis();
  const location = useLocation();

  useEffect(() => {
    const mainContainer = document.querySelector(".relative.min-h-screen");
    if (mainContainer) {
      mainContainer.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }

    return () => {
      if (mainContainer) {
        mainContainer.style.scrollBehavior = "auto";
      }
    };
  }, [location]);

  return null;
}

export default function AppRoutes() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Global Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {/* Color Blobs */}
        <div className="absolute top-0 left-0 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-[#004080] rounded-full mix-blend-multiply filter blur-[100px] opacity-10 animate-blob"></div>
        <div className="absolute top-0 right-0 w-[70vw] h-[70vw] max-w-[700px] max-h-[700px] bg-[#ffd700] rounded-full mix-blend-multiply filter blur-[100px] opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] bg-[#a0cbe8] rounded-full mix-blend-multiply filter blur-[100px] opacity-10 animate-blob animation-delay-4000"></div>

        {/* Geometric Rings */}
        <div className="absolute top-30 left-1/6 w-30 h-30 rounded-full border-4 border-[#004080]/20 animate-float !opacity-27"></div>
        <div className="absolute bottom-1/3 right-1/3 w-32 h-32 rounded-full border-4 border-[#ffd700]/20 animate-float animation-delay-3000"></div>
        <div className="absolute top-1/3 right-1/4 w-24 h-24 rounded-full border-4 border-[#a0cbe8]/20 animate-float animation-delay-6000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-20 h-20 rounded-full border-4 border-[#004080]/20 animate-float animation-delay-9000 !opacity-25"></div>
      </div>
      <Header />
      <ScrollButtons />

      {/* ScrollToTop component to scroll the page on route change */}
      <ScrollToTop />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/about"
          element={<AboutPage />}
          key={window.location.pathname}
        />
        <Route
          path="/services"
          element={<ServicesPage />}
          key={window.location.pathname}
        />
        <Route
          path="/courses"
          element={<CoursesPage />}
          key={window.location.pathname}
        />
        <Route
          path="/countries"
          element={<Countries />}
          key={window.location.pathname}
        />
        <Route
          path="/blog"
          element={<BlogPage />}
          key={window.location.pathname}
        />
        <Route
          path="/blog/:id"
          element={<BlogPost />}
          key={window.location.pathname}
        />
        <Route
          path="/events"
          element={<EventsPage />}
          key={window.location.pathname}
        />
        <Route
          path="/events/:id"
          element={<EventDetail />}
          key={window.location.pathname}
        />
        <Route
          path="/events/:id"
          element={<EventDetail />}
          key={window.location.pathname}
        />
        <Route
          path="/career"
          element={<CareerPage />}
          key={window.location.pathname}
        />
        <Route
          path="/contact"
          element={<ContactPage />}
          key={window.location.pathname}
        />
        <Route
          path="/appointment"
          element={<AppointmentPage />}
          key={window.location.pathname}
        />
      </Routes>
      <Footer />
    </div>
  );
}
