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
  FiSearch,
  FiTrash2,
  FiEye,
} from "react-icons/fi";
import { toast } from "react-hot-toast";

function ShowUser() {
  const [messages, setMessages] = useState([]);
  const [expandedMessage, setExpandedMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch contact messages
  const fetchContactMessages = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:3500/api/contact-users"
      );

      const messagesData = response.data?.data || [];
      setMessages(messagesData);
    } catch (err) {
      console.error("Error fetching contact messages:", err);
      toast.error("Failed to load contact messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContactMessages();
  }, []);

  // Delete a contact message
  const deleteMessage = async (messageId) => {
    try {
      await axios.delete(
        `http://localhost:3500/api/contact-users/${messageId}`
      );

      toast.success("Message deleted successfully");
      // Remove the message from the state
      setMessages(messages.filter((message) => message._id !== messageId));
    } catch (err) {
      console.error("Error deleting message:", err);
      toast.error("Failed to delete message");
    }
  };

  // Filter messages based on search term
  const filteredMessages = messages.filter((message) => {
    return (
      message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.message.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const toggleMessageDetails = (messageId) => {
    setExpandedMessage(expandedMessage === messageId ? null : messageId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-50 to-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading messages...</p>
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
              <h1 className="text-3xl font-bold">Contact Messages</h1>
              <p className="text-gray-600 mt-2">
                View and manage all contact form submissions
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:border-gray-500 hover:border-gray-500"
                />
              </div>

              <button
                onClick={fetchContactMessages}
                className="cursor-pointer flex items-center justify-center px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 hover:from-gray-800 hover:to-gray-900 transition-all shadow-md"
              >
                <FiRefreshCw className="mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </motion.div>

        {filteredMessages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl p-8 text-center"
          >
            <div className="w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiMessageSquare className="w-12 h-12 text-gray-500" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">
              {searchTerm ? "No matches found" : "No messages found"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm
                ? "Try a different search term"
                : "Contact form submissions will appear here"}
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
            {filteredMessages.map((message) => (
              <motion.div
                key={message._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
              >
                {/* Message Header */}
                <button
                  onClick={() => toggleMessageDetails(message._id)}
                  className="cursor-pointer w-full flex justify-between items-center p-6 text-left hover:bg-gray-50 transition-all duration-300"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-gray-500 to-gray-500 rounded-lg flex items-center justify-center">
                      <FiUser className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {message.name}
                      </h3>
                      <p className="text-gray-600 flex items-center">
                        <FiMail className="mr-2" />
                        {message.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">
                      {new Date(message.createdAt).toLocaleDateString()}
                    </span>
                    {expandedMessage === message._id ? (
                      <FiChevronUp className="h-6 w-6 text-gray-500" />
                    ) : (
                      <FiChevronDown className="h-6 w-6 text-gray-500" />
                    )}
                  </div>
                </button>

                <AnimatePresence>
                  {expandedMessage === message._id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-6 pb-6"
                    >
                      <div className="space-y-4">
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all duration-300"
                        >
                          <div className="space-y-4">
                            <div className="flex items-center space-x-3 text-sm">
                              <FiMail className="w-4 h-4 text-gray-500 flex-shrink-0" />
                              <a
                                href={`mailto:${message.email}`}
                                className="text-gray-600 hover:underline truncate"
                              >
                                {message.email}
                              </a>
                            </div>

                            <div className="flex items-center space-x-3 text-sm">
                              <FiPhone className="w-4 h-4 text-gray-500 flex-shrink-0" />
                              <a
                                href={`tel:${message.phone}`}
                                className="text-gray-600 hover:underline"
                              >
                                {message.phone}
                              </a>
                            </div>

                            <div className="flex items-start space-x-3 text-sm">
                              <FiMessageSquare className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                              <p className="text-gray-700">{message.message}</p>
                            </div>

                            <div className="text-xs text-gray-400 mt-4">
                              Submitted:{" "}
                              {new Date(message.createdAt).toLocaleString()}
                            </div>

                            <div className="flex justify-end space-x-2 pt-4 border-t border-gray-100">
                              <button
                                onClick={() => deleteMessage(message._id)}
                                className="flex items-center px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                              >
                                <FiTrash2 className="mr-2" />
                                Delete
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      </div>
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

export default ShowUser;
