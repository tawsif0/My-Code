/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiChevronDown,
  FiChevronUp,
  FiUser,
  FiMail,
  FiPhone,
  FiMessageSquare,
  FiCalendar,
  FiUsers,
  FiRefreshCw,
  FiDownload,
  FiSearch,
} from "react-icons/fi";
import { toast } from "react-hot-toast";

function EventUsers() {
  const [events, setEvents] = useState([]);
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [expandedUser, setExpandedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const token = localStorage.getItem("token");
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  // Fetch events with registered users
  const fetchEventUsers = async () => {
    try {
      setLoading(true);
      const [eventsRes, usersRes] = await Promise.all([
        axios.get("http://localhost:3500/api/events", { headers: authHeaders }),
        axios.get("http://localhost:3500/api/events/users", {
          headers: authHeaders,
        }),
      ]);

      const eventsData = eventsRes.data?.data || [];
      const usersData = usersRes.data?.data || [];

      // Group users under events
      const mappedEvents = eventsData.map((event) => ({
        ...event,
        users: usersData.filter((u) => u.eventId?._id === event._id),
      }));

      setEvents(mappedEvents);
    } catch (err) {
      console.error("Error fetching event users:", err);
      toast.error("Failed to load event users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventUsers();
  }, []);

  // Filter events and users based on search term
  const filteredEvents = events.filter((event) => {
    const eventMatches = event.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const userMatches = event.users.some(
      (user) =>
        user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return eventMatches || userMatches;
  });

  const toggleUserDetails = (userId) => {
    // Close previous user details and open the clicked one
    setExpandedUser(expandedUser === userId ? null : userId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-50 to-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading registrations...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-white p-6"
    >
      <div className="w-full">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8 pb-6 border-b border-gray-200"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Event Registrations</h1>
              <p className="text-gray-600 mt-2">
                Manage and view all event registrations in one place
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search events or users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:border-gray-500 hover:border-gray-500"
                />
              </div>

              <button
                onClick={fetchEventUsers}
                className="cursor-pointer flex items-center justify-center px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 hover:from-gray-800 hover:to-gray-900 transition-all shadow-md"
              >
                <FiRefreshCw className="mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </motion.div>

        {filteredEvents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl p-8 text-center"
          >
            <div className="w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiUsers className="w-12 h-12 text-gray-500" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">
              {searchTerm ? "No matches found" : "No events found"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm
                ? "Try a different search term"
                : "Create some events to see registrations here"}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="px-6 py-2 bg-gradient-to-r from-gray-500 to-gray-500 text-white rounded-lg hover:from-gray-600 hover:to-gray-600 transition-all"
              >
                Clear Search
              </button>
            )}
          </motion.div>
        ) : (
          <div className="space-y-6">
            {filteredEvents.map((event) => (
              <motion.div
                key={event._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
              >
                {/* Event Header */}
                <button
                  onClick={() =>
                    setExpandedEvent(
                      expandedEvent === event._id ? null : event._id
                    )
                  }
                  className="cursor-pointer w-full flex justify-between items-center p-6 text-left hover:bg-gray-50 transition-all duration-300"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-gray-500 to-gray-500 rounded-lg flex items-center justify-center">
                      <FiCalendar className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {event.title}
                      </h3>
                      <p className="text-gray-600 flex items-center">
                        <FiUsers className="mr-2" />
                        {event.users.length} registration
                        {event.users.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        event.users.length > 0
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {event.users.length} registered
                    </span>
                    {expandedEvent === event._id ? (
                      <FiChevronUp className="h-6 w-6 text-gray-500" />
                    ) : (
                      <FiChevronDown className="h-6 w-6 text-gray-500" />
                    )}
                  </div>
                </button>

                <AnimatePresence>
                  {expandedEvent === event._id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-6 pb-6"
                    >
                      {event.users.length === 0 ? (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FiUser className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-gray-500">
                            No users registered for this event yet
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {event.users.map((user) => (
                            <motion.div
                              key={user._id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.2 }}
                              className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all duration-300"
                            >
                              {/* User Header - Clickable area for toggling details */}
                              <button
                                onClick={() => toggleUserDetails(user._id)}
                                className="cursor-pointer w-full flex items-center justify-between mb-4"
                              >
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-gradient-to-r from-gray-400 to-gray-400 rounded-full flex items-center justify-center">
                                    <FiUser className="w-5 h-5 text-white" />
                                  </div>
                                  <div className="text-left">
                                    <h4 className="font-semibold text-gray-900">
                                      {user.userName}
                                    </h4>
                                    <p className="text-sm text-gray-500">
                                      {new Date(
                                        user.createdAt
                                      ).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>

                                {expandedUser === user._id ? (
                                  <FiChevronUp className="h-4 w-4 text-gray-500" />
                                ) : (
                                  <FiChevronDown className="h-4 w-4 text-gray-500" />
                                )}
                              </button>

                              {/* User Details */}
                              <AnimatePresence>
                                {expandedUser === user._id && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-3 pt-3 border-t border-gray-100"
                                  >
                                    <div className="flex items-center space-x-3 text-sm">
                                      <FiMail className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                      <a
                                        href={`mailto:${user.userEmail}`}
                                        className="text-gray-600 hover:underline truncate"
                                      >
                                        {user.userEmail}
                                      </a>
                                    </div>

                                    <div className="flex items-center space-x-3 text-sm">
                                      <FiPhone className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                      <a
                                        href={`tel:${user.userPhone}`}
                                        className="text-gray-600 hover:underline"
                                      >
                                        {user.userPhone}
                                      </a>
                                    </div>

                                    {user.message && (
                                      <div className="flex items-start space-x-3 text-sm">
                                        <FiMessageSquare className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                                        <p className="text-gray-700">
                                          {user.message}
                                        </p>
                                      </div>
                                    )}

                                    <div className="text-xs text-gray-400 mt-4">
                                      Registered:{" "}
                                      {new Date(
                                        user.createdAt
                                      ).toLocaleString()}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default EventUsers;
