import React, { useState, useEffect, useRef } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";

const ScrollButtons = () => {
  const [direction, setDirection] = useState("down");
  const [showButton, setShowButton] = useState(false);
  const lastScrollY = useRef(0);
  const isScrolling = useRef(false);
  const touchStartY = useRef(0);

  const handleScroll = () => {
    if (isScrolling.current) return;

    const currentScrollY = window.scrollY;
    const scrollThreshold = 30;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    // Determine scroll direction
    if (currentScrollY > lastScrollY.current) {
      setDirection("down");
    } else {
      setDirection("up");
    }

    // Show button only after scrolling past threshold
    setShowButton(currentScrollY > scrollThreshold);

    // Auto-hide down button when near bottom
    if (currentScrollY + windowHeight >= documentHeight - 100) {
      setDirection("up");
    }

    lastScrollY.current = currentScrollY;
  };

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    const touchY = e.touches[0].clientY;
    const deltaY = touchY - touchStartY.current;

    if (Math.abs(deltaY) > 10) {
      // Threshold to prevent false detection
      if (deltaY > 0) {
        setDirection("up");
      } else {
        setDirection("down");
      }
      touchStartY.current = touchY;
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  const scrollTo = (target) => {
    isScrolling.current = true;

    window.scrollTo({
      top: target === "top" ? 20 : document.documentElement.scrollHeight,
      behavior: "smooth",
    });

    // Reset after scroll completes
    setTimeout(() => {
      isScrolling.current = false;
    }, 1000);
  };

  // Button variants for animation
  const buttonVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  };

  return (
    <AnimatePresence>
      {showButton && (
        <motion.div
          className="fixed bottom-6 right-4 sm:bottom-8 sm:right-8 z-50"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={buttonVariants}
          transition={{ duration: 0.3 }}
        >
          {direction === "up" ? (
            <motion.button
              key="up"
              onClick={() => scrollTo("top")}
              className="p-2 sm:p-3 rounded-full shadow-xl focus:outline-none relative overflow-hidden group w-12 h-12 sm:w-14 sm:h-14"
              style={{
                background: "linear-gradient(135deg, #004080 0%, #0066cc 100%)",
                boxShadow: "0 4px 20px rgba(0, 102, 204, 0.3)",
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Scroll to top"
            >
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-full"></div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 sm:h-6 sm:w-6 text-white mx-auto my-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              </svg>
            </motion.button>
          ) : (
            <motion.button
              key="down"
              onClick={() => scrollTo("bottom")}
              className="p-2 sm:p-3 rounded-full shadow-xl focus:outline-none relative overflow-hidden group w-12 h-12 sm:w-14 sm:h-14"
              style={{
                background: "linear-gradient(135deg, #ffd700 0%, #ffcc00 100%)",
                boxShadow: "0 4px 20px rgba(255, 204, 0, 0.3)",
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Scroll to bottom"
            >
              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-full"></div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 sm:h-6 sm:w-6 text-gray-900 mx-auto my-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </motion.button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScrollButtons;
