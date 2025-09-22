/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiChevronDown,
  FiChevronUp,
  FiUser,
  FiTrash2,
  FiUsers,
  FiRefreshCw,
  FiDownload,
  FiSearch,
  FiBriefcase,
  FiFileText,
  FiEye
} from "react-icons/fi";
import { toast } from "react-hot-toast";

function AppliedUsers() {
  const base_url =
    import.meta.env.VITE_API_KEY_Base_URL || "http://locahost:3500";
  const [jobs, setJobs] = useState([]);
  const [expandedJob, setExpandedJob] = useState(null);
  const [expandedApplication, setExpandedApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch jobs with applications
  const fetchJobApplications = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:3500/api/jobs/applications"
      );

      const applications = response.data?.applications || [];

      // Group applications by job
      const jobsMap = {};
      applications.forEach((app) => {
        const jobId = app.jobId?._id;
        if (!jobsMap[jobId]) {
          jobsMap[jobId] = {
            ...app.jobId,
            applications: []
          };
        }
        jobsMap[jobId].applications.push(app);
      });

      setJobs(Object.values(jobsMap));
    } catch (err) {
      console.error("Error fetching job applications:", err);
      toast.error("Failed to load job applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter jobs and applications based on search term
  const filteredJobs = jobs.filter((job) => {
    const jobMatches = job.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const applicationMatches = job.applications.some((app) =>
      app.fieldData.some((field) =>
        field.value.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

    return jobMatches || applicationMatches;
  });

  const toggleApplicationDetails = (applicationId) => {
    setExpandedApplication(
      expandedApplication === applicationId ? null : applicationId
    );
  };

  const downloadFile = async (file) => {
    try {
      toast.loading(`Downloading ${file.filename}...`);

      // Use the correct path
      const cleanPath = file.path.replace(/^.*\/jobs\//, "/jobs/");
      const downloadUrl = `${base_url}${cleanPath}`;

      // Fetch file with axios
      const response = await axios.get(downloadUrl, {
        responseType: "blob"
      });

      // Create blob and download
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = file.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.dismiss();
      toast.success(`Downloaded: ${file.filename}`);
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to download file");
      console.error("Download error:", error);
    }
  };
  // Add these functions inside your AppliedUsers component
  const deleteApplication = async (applicationId, jobId) => {
    try {
      await axios.delete(
        `http://localhost:3500/api/jobs/applications/${applicationId}`
      );
      toast.success("Application deleted successfully");

      // Refresh the applications list
      fetchJobApplications();
    } catch (err) {
      console.error("Error deleting application:", err);
      toast.error("Failed to delete application");
    }
  };

  const deleteJob = async (jobId) => {
    try {
      await axios.delete(`http://localhost:3500/api/jobs/${jobId}`);
      toast.success("Job deleted successfully");

      // Refresh the applications list
      fetchJobApplications();
    } catch (err) {
      console.error("Error deleting job:", err);
      toast.error("Failed to delete job");
    }
  };
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-50 to-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading applications...</p>
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
              <h1 className="text-3xl font-bold">Job Applications</h1>
              <p className="text-gray-600 mt-2">
                Manage and view all job applications in one place
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search jobs or applicants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:border-gray-500 hover:border-gray-500"
                />
              </div>

              <button
                onClick={fetchJobApplications}
                className="cursor-pointer flex items-center justify-center px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 hover:from-gray-800 hover:to-gray-900 transition-all shadow-md"
              >
                <FiRefreshCw className="mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </motion.div>

        {filteredJobs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl p-8 text-center"
          >
            <div className="w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiBriefcase className="w-12 h-12 text-gray-500" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">
              {searchTerm ? "No matches found" : "No applications found"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm
                ? "Try a different search term"
                : "Applications will appear here once candidates apply"}
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
            {filteredJobs.map((job) => (
              <motion.div
                key={job._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
              >
                {/* Job Header */}
                <button
                  onClick={() =>
                    setExpandedJob(expandedJob === job._id ? null : job._id)
                  }
                  className="cursor-pointer w-full flex justify-between items-center p-6 text-left hover:bg-gray-50 transition-all duration-300"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <FiBriefcase className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {job.title}
                      </h3>
                      <p className="text-gray-600 flex items-center">
                        <FiUsers className="mr-2" />
                        {job.applications.length} application
                        {job.applications.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteJob(job._id);
                      }}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Job"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>

                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        job.applications.length > 0
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {job.applications.length} applicants
                    </span>
                    {expandedJob === job._id ? (
                      <FiChevronUp className="h-6 w-6 text-gray-500" />
                    ) : (
                      <FiChevronDown className="h-6 w-6 text-gray-500" />
                    )}
                  </div>
                </button>

                <AnimatePresence>
                  {expandedJob === job._id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-6 pb-6"
                    >
                      {job.applications.length === 0 ? (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FiUser className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-gray-500">
                            No applications received for this job yet
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {job.applications.map((application) => (
                            <motion.div
                              key={application._id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.2 }}
                              className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all duration-300"
                            >
                              {/* Application Header */}
                              <button
                                onClick={() =>
                                  toggleApplicationDetails(application._id)
                                }
                                className="cursor-pointer w-full flex items-center justify-between mb-4"
                              >
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center">
                                    <FiUser className="w-5 h-5 text-white" />
                                  </div>
                                  <div className="text-left">
                                    <h4 className="font-semibold text-gray-900">
                                      Application #{application._id.slice(-6)}
                                    </h4>
                                    <p className="text-sm text-gray-500">
                                      Applied:{" "}
                                      {new Date(
                                        application.submittedAt
                                      ).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteApplication(
                                        application._id,
                                        job._id
                                      );
                                    }}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete Application"
                                  >
                                    <FiTrash2 className="h-4 w-4" />
                                  </button>

                                  {expandedApplication === application._id ? (
                                    <FiChevronUp className="h-4 w-4 text-gray-500" />
                                  ) : (
                                    <FiChevronDown className="h-4 w-4 text-gray-500" />
                                  )}
                                </div>
                              </button>

                              {/* Application Details */}
                              <AnimatePresence>
                                {expandedApplication === application._id && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-4 pt-3 border-t border-gray-100"
                                  >
                                    {/* Field Data */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {application.fieldData.map(
                                        (field, index) => {
                                          const jobField =
                                            job.customFormFields?.find(
                                              (f) => f._id === field.fieldId
                                            );
                                          const fieldTitle =
                                            jobField?.title ||
                                            `Field ${index + 1}`;

                                          return (
                                            <div
                                              key={index}
                                              className="bg-white rounded-lg p-3 border border-gray-100"
                                            >
                                              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                {fieldTitle}
                                              </label>
                                              <p className="text-gray-700 mt-1">
                                                {field.value}
                                              </p>
                                            </div>
                                          );
                                        }
                                      )}
                                    </div>

                                    {/* Files */}
                                    {application.files.length > 0 && (
                                      <div>
                                        <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                                          <FiFileText className="mr-2" />
                                          Attached Files (
                                          {application.files.length})
                                        </h5>
                                        <div className="space-y-2">
                                          {application.files.map(
                                            (file, index) => (
                                              <div
                                                key={index}
                                                className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-100"
                                              >
                                                <div className="flex items-center space-x-3">
                                                  <FiFileText className="w-4 h-4 text-gray-500" />
                                                  <span className="text-sm text-gray-700 truncate max-w-xs">
                                                    {file.filename}
                                                  </span>
                                                </div>
                                                <button
                                                  onClick={() =>
                                                    downloadFile(file)
                                                  }
                                                  className="flex items-center space-x-1 px-3 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors"
                                                >
                                                  <FiDownload className="w-4 h-4" />
                                                </button>
                                              </div>
                                            )
                                          )}
                                        </div>
                                      </div>
                                    )}

                                    <div className="text-xs text-gray-400 mt-4">
                                      Submitted:{" "}
                                      {new Date(
                                        application.submittedAt
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

export default AppliedUsers;
