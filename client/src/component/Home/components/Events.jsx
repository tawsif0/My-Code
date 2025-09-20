import React, { useState, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import axios from "axios";
import { FiCalendar, FiClock, FiMapPin } from "react-icons/fi";
import { Link } from "react-router-dom";

const Events = () => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [sectionRef, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${base_url}/api/events/active`);
        if (response.data.success) {
          setEvents(response.data.data);
        }
      } catch (err) {
        console.error("Failed to load launched events", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [base_url]);

  useEffect(() => {
    const links = document.querySelectorAll(".prose a");
    links.forEach((link) => {
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
    });
  }, [events]);

  const displayedEvents = showAllEvents ? events : events.slice(0, 3);

  const formatDate = (dateString) => {
    const options = { month: "short", day: "numeric", year: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        when: "beforeChildren"
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }
  };

  const headerVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        delay: 0.2
      }
    }
  };

  const noEventsVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        delay: 0.5
      }
    }
  };

  if (loading) {
    return (
      <section className="py-36">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-gray-300 rounded-full mx-auto mb-6"></div>
            <div className="h-12 w-96 bg-gray-300 rounded-lg mx-auto mb-4"></div>
            <div className="h-6 w-80 bg-gray-300 rounded-lg mx-auto mb-16"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="bg-white rounded-xl shadow-lg p-6 h-96 w-full max-w-sm"
                >
                  <div className="h-48 bg-gray-300 rounded mb-4"></div>
                  <div className="h-6 bg-gray-300 rounded mb-3"></div>
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded mb-4"></div>
                  <div className="h-20 bg-gray-300 rounded mb-6"></div>
                  <div className="h-12 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="py-36">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={containerVariants}
          className="text-center mb-16"
        >
          <motion.span
            variants={itemVariants}
            className="cursor-pointer mb-8 px-3 py-1.5 bg-[#004080] text-white font-semibold rounded-full shadow-lg inline-flex items-center justify-center transform hover:scale-105 transition-transform duration-300 group"
          >
            Events
          </motion.span>
          <motion.h2
            variants={headerVariants}
            className="text-4xl md:text-5xl font-bold mb-4 !text-gray-900"
          >
            Upcoming <span className="text-[#004080]">Events</span>
          </motion.h2>
          <motion.p
            variants={headerVariants}
            className="text-lg text-gray-600 max-w-2xl mx-auto"
          >
            Join our exclusive events designed to help you achieve your academic
            dreams abroad.
          </motion.p>
        </motion.div>

        {events.length > 0 ? (
          <>
            <motion.div
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              variants={containerVariants}
              className={`${
                displayedEvents.length === 2
                  ? "flex flex-col lg:flex-row lg:justify-between w-full lg:px-20 lg:gap-7 gap-6"
                  : displayedEvents.length === 1
                  ? "flex justify-center"
                  : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center"
              }`}
            >
              {displayedEvents.map((event, index) => (
                <motion.div
                  key={event._id}
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                  className={`bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full w-full sm:max-w-[300px] md:max-w-[350px] lg:max-w-sm
        ${displayedEvents.length === 2 && index === 0 ? "lg:ml-auto" : ""}
        ${displayedEvents.length === 2 && index === 1 ? "lg:mr-auto" : ""}`}
                >
                  {/* Event Image */}
                  <div className="relative h-48">
                    <img
                      src={`${base_url}/events/${event.image}`}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4 bg-[#004080] text-white text-sm font-semibold px-3 py-1 rounded-full">
                      {event.eventStatus === "launched"
                        ? "Live"
                        : "Coming Soon"}
                    </div>
                  </div>

                  {/* Event Content */}
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {event.title}
                    </h3>

                    <div className="flex items-center mb-3 text-gray-600">
                      <FiCalendar className="w-4 h-4 text-[#004080] mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm font-medium">
                        {formatDate(event.startDate)}
                        {event.endDate && event.endDate !== event.startDate
                          ? ` - ${formatDate(event.endDate)}`
                          : ""}
                      </span>
                    </div>

                    <div className="flex items-center mb-3 text-gray-600">
                      <FiClock className="w-4 h-4 text-[#004080] mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm font-medium">
                        {formatTime(event.startTime)} -{" "}
                        {formatTime(event.endTime)}
                      </span>
                    </div>

                    <div className="flex items-center mb-4 text-gray-600">
                      <FiMapPin className="w-4 h-4 text-[#004080] mr-2 mt-0.5 flex-shrink-0" />
                      <span>{event.location}</span>
                    </div>

                    <div
                      className="mb-6 text-gray-700 flex-grow text-sm prose prose-lg leading-relaxed
    prose-headings:text-gray-900 prose-headings:font-bold
    prose-p:mb-4 prose-img:rounded-xl prose-img:shadow-md
    prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-4
    prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-4
    prose-li:mb-2
    prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-800 prose-a:inline-flex prose-a:items-center prose-a:gap-1
    prose-strong:font-semibold prose-strong:text-gray-900
    prose-blockquote:border-l-blue-600 prose-blockquote:bg-gray-100 prose-blockquote:px-6 prose-blockquote:py-4 prose-blockquote:rounded-r-lg
                  max-w-none line-clamp-2"
                      dangerouslySetInnerHTML={{ __html: event.description }}
                    />

                    <div className="mt-auto">
                      <Link
                        to={`/events/${event._id}`}
                        className="w-full bg-[#004080] hover:bg-[#003366] text-white font-medium py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-[1.02] block text-center"
                      >
                        Register Now
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {events.length > 3 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.6 }}
                className="text-center mt-12"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAllEvents(!showAllEvents)}
                  className="px-8 py-3 border-2 border-[#004080] text-[#004080] hover:bg-[#004080] hover:text-white font-medium rounded-full transition duration-300"
                >
                  {showAllEvents ? "Show Less Events" : "Show More Events"}
                </motion.button>
              </motion.div>
            )}
          </>
        ) : (
          <motion.div
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={noEventsVariants}
            className="text-center py-16"
          >
            <div className="max-w-md mx-auto">
              <div className="relative mb-6 flex justify-center">
                <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-12 h-12 text-[#004080]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 15v2m-6-6V9a6 6 0 1112 0v2m-6 6a2 2 0 100-4 2 2 0 000 4z"
                    />
                  </svg>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Exciting Events Coming Soon!
              </h3>

              <p className="text-gray-600 mb-8">
                We're curating exceptional experiences for you. Stay tuned for
                our upcoming events that will transform your academic journey.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default Events;
