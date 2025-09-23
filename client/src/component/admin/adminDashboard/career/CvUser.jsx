/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiChevronDown,
  FiChevronUp,
  FiUser,
  FiTrash2,
  FiRefreshCw,
  FiDownload,
  FiSearch,
  FiFileText,
  FiMail,
  FiPhone,
  FiCalendar,
} from "react-icons/fi";
import { toast } from "react-hot-toast";

function CvUser() {
  const base_url =
    import.meta.env.VITE_API_KEY_Base_URL || "http://localhost:3500";
  const [cvs, setCvs] = useState([]);
  const [expandedCv, setExpandedCv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch CV applications
  const fetchCvApplications = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:3500/api/cv");

      setCvs(response.data?.data || []);
    } catch (err) {
      console.error("Error fetching CV applications:", err);
      toast.error("Failed to load CV applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCvApplications();
  }, []);

  // Filter CVs based on search term
  const filteredCvs = cvs.filter((cv) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      cv.name?.toLowerCase().includes(searchLower) ||
      cv.email?.toLowerCase().includes(searchLower) ||
      cv.phone?.toLowerCase().includes(searchLower)
    );
  });

  // Download CV file
  const downloadCv = async (cv) => {
    try {
      toast.loading(`Downloading ${cv.name}'s CV...`);

      // Use the correct path - adjust based on your file storage structure
      const downloadUrl = `${base_url}/cv/${cv.file.split("/").pop()}`;

      // Fetch file with axios
      const response = await axios.get(downloadUrl, {
        responseType: "blob",
      });

      // Create blob and download
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `CV_${cv.name}_${cv._id}.pdf`; // You might want to extract the original filename
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.dismiss();
      toast.success(`Downloaded: ${cv.name}'s CV`);
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to download CV");
      console.error("Download error:", error);
    }
  };

  // Delete CV application
  const deleteCv = async (cvId) => {
    try {
      await axios.delete(`http://localhost:3500/api/cv/${cvId}`);
      toast.success("CV application deleted successfully");

      // Refresh the CV list
      fetchCvApplications();
    } catch (err) {
      console.error("Error deleting CV application:", err);
      toast.error("Failed to delete CV application");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">
            Loading CV applications...
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50 p-6"
    >
      <div className="mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8 pb-6 border-b border-gray-200"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                CV Applications
              </h1>
              <p className="text-gray-600 mt-2">
                Manage and view all CV submissions in one place
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent w-64"
                />
              </div>

              <button
                onClick={fetchCvApplications}
                className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors shadow-md"
              >
                <FiRefreshCw className="mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </motion.div>

        {filteredCvs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-lg p-8 text-center"
          >
            <div className="w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiUser className="w-12 h-12 text-gray-500" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">
              {searchTerm ? "No CVs found" : "No CV applications yet"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm
                ? "Try a different search term"
                : "CV applications will appear here once candidates submit their CVs"}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Clear Search
              </button>
            )}
          </motion.div>
        ) : (
          <div className="grid gap-6">
            {filteredCvs.map((cv) => (
              <motion.div
                key={cv._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200"
              >
                {/* CV Header */}
                <button
                  onClick={() =>
                    setExpandedCv(expandedCv === cv._id ? null : cv._id)
                  }
                  className="w-full flex justify-between items-center p-6 text-left hover:bg-gray-50 transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center">
                      <FiUser className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {cv.name}
                      </h3>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-gray-600 flex items-center">
                          <FiMail className="mr-2 w-4 h-4" />
                          {cv.email}
                        </span>
                        {cv.phone && (
                          <span className="text-gray-600 flex items-center">
                            <FiPhone className="mr-2 w-4 h-4" />
                            {cv.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteCv(cv._id);
                      }}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete CV Application"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadCv(cv);
                      }}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      title="Download CV"
                    >
                      <FiDownload className="h-4 w-4" />
                      <span>Download CV</span>
                    </button>

                    {expandedCv === cv._id ? (
                      <FiChevronUp className="h-6 w-6 text-gray-500" />
                    ) : (
                      <FiChevronDown className="h-6 w-6 text-gray-500" />
                    )}
                  </div>
                </button>

                <AnimatePresence>
                  {expandedCv === cv._id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-6 pb-6 border-t border-gray-100"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        {/* Personal Information */}
                        <div className="space-y-4">
                          <h4 className="font-semibold text-gray-900 flex items-center">
                            <FiUser className="mr-2" />
                            Personal Information
                          </h4>

                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="space-y-3">
                              <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                  Full Name
                                </label>
                                <p className="text-gray-900 font-medium">
                                  {cv.name}
                                </p>
                              </div>
                              <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                  Email Address
                                </label>
                                <p className="text-gray-900 font-medium">
                                  <a
                                    href={`mailto:${cv.email}`}
                                    className="text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
                                  >
                                    <FiMail className="w-4 h-4" />
                                    {cv.email}
                                  </a>
                                </p>
                              </div>

                              <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                  Phone Number
                                </label>
                                <p className="text-gray-900 font-medium">
                                  <a
                                    href={`tel:${cv.phone}`}
                                    className="text-green-600 hover:text-green-800 transition-colors flex items-center gap-1"
                                  >
                                    <FiPhone className="w-4 h-4" />
                                    {cv.phone}
                                  </a>
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Application Details */}
                        <div className="space-y-4">
                          <h4 className="font-semibold text-gray-900 flex items-center">
                            <FiFileText className="mr-2" />
                            Application Details
                          </h4>

                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="space-y-3">
                              <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                  Submitted Date
                                </label>
                                <p className="text-gray-900 font-medium flex items-center">
                                  <FiCalendar className="mr-2 w-4 h-4" />
                                  {new Date(
                                    cv.createdAt
                                  ).toLocaleDateString()}{" "}
                                  at{" "}
                                  {new Date(cv.createdAt).toLocaleTimeString()}
                                </p>
                              </div>

                              <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                  CV File
                                </label>
                                <div className="flex items-center justify-between mt-1">
                                  <span className="text-gray-900 font-medium truncate">
                                    {cv.file.split("/").pop() || "CV File"}
                                  </span>
                                  <button
                                    onClick={() => downloadCv(cv)}
                                    className="flex items-center space-x-1 px-2 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors"
                                  >
                                    <FiDownload className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}

        {/* Summary */}
        {filteredCvs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 bg-white rounded-lg shadow p-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-gray-600">
                Showing{" "}
                <span className="font-semibold">{filteredCvs.length}</span> of{" "}
                <span className="font-semibold">{cvs.length}</span> CV
                applications
              </p>
              <p className="text-gray-500 text-sm">
                Last updated: {new Date().toLocaleTimeString()}
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export default CvUser;
