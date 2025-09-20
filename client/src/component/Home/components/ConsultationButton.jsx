import React from "react";
import { useNavigate } from "react-router-dom";

const ConsultationButton = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/appointment");
  };

  return (
    <button
      onClick={handleClick}
      className="fixed right-6 bottom-24 z-50 group"
      aria-label="Book Consultation"
    >
      <div className="relative">
        {/* Elegant main button */}
        <div className="w-16 h-16 md:w-18 md:h-18 bg-gradient-to-b from-[#004080] to-[#00264d] rounded-full flex items-center justify-center shadow-lg border-2 border-white/20 transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl">
          {/* Subtle inner glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-full"></div>

          {/* Reflective shine */}
          <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/15 to-transparent rounded-t-full"></div>

          {/* Icon with book imagery */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            <svg
              className="w-7 h-7 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <div className="w-1 h-1 bg-white/70 rounded-full mt-1"></div>
          </div>
        </div>

        {/* Subtle notification dot */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#ffd700] rounded-full border border-white"></div>

        {/* Elegant tooltip */}
        <div className="absolute right-full top-1/2 transform -translate-y-1/2 mr-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="relative bg-white/20 text-[#004080] text-xs font-medium px-4 py-2 rounded-xl shadow-lg whitespace-nowrap backdrop-blur-md border border-white/30">
            Book Consultation
            <div
              className="absolute left-full top-1/2 transform -translate-y-1/2 w-0 h-0 
      border-t-6 border-b-6 border-l-6 border-l-white/20 
      border-t-transparent border-b-transparent"
            ></div>
          </div>
        </div>
      </div>
    </button>
  );
};

export default ConsultationButton;
