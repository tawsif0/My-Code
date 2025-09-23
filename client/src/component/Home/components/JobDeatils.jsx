/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FiCalendar,
  FiMapPin,
  FiArrowLeft,
  FiExternalLink,
  FiFileText,
  FiTrash,
} from "react-icons/fi";
import { toast } from "react-hot-toast";

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applicationData, setApplicationData] = useState({
    applicantName: "",
    applicantEmail: "",
    applicantPhone: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});

  // Fetch job details
  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${base_url}/api/jobs/${id}`);
        setJob(response.data);
      } catch (err) {
        console.error("Failed to load job details", err);
        toast.error("Failed to load job details");
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id, base_url]);
  // Scroll to top when job data is loaded and component is ready
  useEffect(() => {
    if (!loading) {
      // Small delay to ensure DOM is fully rendered
      const timer = setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }, 150);

      return () => clearTimeout(timer);
    }
  }, [loading, id]);

  // Also add this to handle direct navigation
  useEffect(() => {
    // Quick scroll to top on initial mount
    window.scrollTo(0, 0);
  }, []);
  useEffect(() => {
    // Make all job description links open in a new tab
    const links = document.querySelectorAll(".prose a");
    links.forEach((link) => {
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
    });
  }, [job]);

  const handleInputChange = (fieldName, value) => {
    setApplicationData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));

    if (fieldErrors[fieldName]) {
      setFieldErrors((prev) => ({
        ...prev,
        [fieldName]: "",
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    // Only validate custom form fields if they exist
    if (job.hasCustomForm && job.customFormFields) {
      job.customFormFields.forEach((field) => {
        const fieldKey = `field_${field._id}`;
        const fileFieldKey = `file_${field._id}`;

        if (field.required) {
          if (field.type === "file") {
            if (!applicationData[fileFieldKey]) {
              errors[fileFieldKey] = `${field.title} is required`;
            }
          } else {
            if (!applicationData[fieldKey]?.trim()) {
              errors[fieldKey] = `${field.title} is required`;
            }
          }
        }
      });
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFileChange = (fieldId, e) => {
    const file = e.target.files[0];
    const fieldKey = `file_${fieldId}`;

    if (!file) return; // if user cancels

    if (file.size > 5 * 1024 * 1024) {
      setFieldErrors((prev) => ({
        ...prev,
        [fieldKey]: "File size must be less than 5MB",
      }));
      e.target.value = "";
      return;
    }

    handleInputChange(fieldKey, file); // make sure file is stored here
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("jobId", job._id);

      // Only append custom form fields
      if (job.hasCustomForm && job.customFormFields) {
        job.customFormFields.forEach((field) => {
          const fieldKey = `field_${field._id}`;
          const fileFieldKey = `file_${field._id}`;

          if (field.type === "file" && applicationData[fileFieldKey]) {
            formData.append(`file_${field._id}`, applicationData[fileFieldKey]);
          } else if (applicationData[fieldKey]) {
            formData.append(`field_${field._id}`, applicationData[fieldKey]);
          }
        });
      }

      await axios.post(`${base_url}/api/jobs/apply`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Application submitted successfully!");

      // Reset only custom form fields
      const resetData = {};
      if (job.customFormFields) {
        job.customFormFields.forEach((field) => {
          resetData[`field_${field._id}`] = "";
          if (field.type === "file") {
            resetData[`file_${field._id}`] = null;
          }
        });
      }
      setApplicationData(resetData);
      setFieldErrors({});
    } catch (error) {
      toast.error(error.response?.data?.message || "Application failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExternalApply = () => {
    if (job.applyLink) {
      window.open(job.applyLink, "_blank");
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <section className="py-36">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-pulse">
            <div className="h-12 w-48 bg-gray-300 rounded-lg mx-auto mb-6"></div>
            <div className="h-96 w-full bg-gray-300 rounded-lg mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  if (!job) {
    return (
      <section className="py-36">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Job Not Found
          </h2>
          <button
            onClick={() => navigate("/career")}
            className="px-6 py-2 bg-[#004080] text-white rounded-lg"
          >
            Back to Careers
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="py-26 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.05, x: -2 }}
          onClick={() => navigate("/career")}
          className="flex items-center text-[#004080] hover:text-[#003366] mb-8 transition-colors duration-200 font-medium group"
        >
          <FiArrowLeft className="mr-2 w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to Careers
        </motion.button>

        <div className="overflow-visible flex flex-col xl:flex-row gap-8">
          {/* Left Side - Job Details */}
          <div className="xl:w-3/5 relative !overflow-hidden">
            {/* Job Details Content */}
            <div className="space-y-8">
              {/* Job Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                      {job.title}
                    </h1>

                    {/* Meta Information */}
                    <div className="flex flex-wrap gap-6 mb-4">
                      <div className="flex items-center text-lg text-gray-600">
                        <FiCalendar className="mr-3 text-[#004080] w-5 h-5" />
                        <span>Posted {formatDate(job.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Application Type Badge */}
                  <div className="flex flex-col items-end space-y-2">
                    {job.hasCustomForm ? (
                      <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        <FiFileText className="mr-2 w-4 h-4" />
                        Custom Application Form
                      </span>
                    ) : job.applyLink ? (
                      <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        <FiExternalLink className="mr-2 w-4 h-4" />
                        External Application
                      </span>
                    ) : null}

                    {!job.hasCustomForm && job.applyLink && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleExternalApply}
                        className="bg-gradient-to-r from-[#004080] to-[#0056b3] hover:from-[#0056b3] hover:to-[#004080] text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2"
                      >
                        <span>Apply on External Site</span>
                        <FiExternalLink className="ml-1" />
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Job Description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <div className="w-1 h-8 bg-[#004080] rounded-full mr-4"></div>
                  Job Description
                </h3>
                <div
                  className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: job.description,
                  }}
                />
              </motion.div>
            </div>
          </div>

          {/* Right Side - Application Form (Only show for custom form jobs) */}
          {job.hasCustomForm && (
            <div className="xl:w-2/5">
              <div className="sticky top-17 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-auto">
                <div className="p-8">
                  {/* Form Header */}
                  <div className="text-center mb-8">
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="w-16 h-16 bg-gradient-to-br from-[#004080] to-[#0066cc] rounded-2xl mx-auto mb-4 flex items-center justify-center"
                    >
                      <FiFileText className="w-8 h-8 text-white" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Apply for this Position
                    </h3>
                    <p className="text-gray-600">
                      Submit your application for {job.title}
                    </p>
                  </div>

                  {/* Application Form */}
                  <form onSubmit={handleSubmitApplication}>
                    <div className="space-y-6">
                      {/* Custom Form Fields */}

                      {job.customFormFields &&
                        job.customFormFields.length > 0 && (
                          <div>
                            <div className="space-y-4">
                              {job.customFormFields.map((field) => (
                                <div key={field._id}>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {field.title}
                                    {field.required && (
                                      <span className="text-red-500 ml-1">
                                        *
                                      </span>
                                    )}
                                  </label>

                                  {field.type === "text" && (
                                    <>
                                      <input
                                        type="text"
                                        value={
                                          applicationData[
                                            `field_${field._id}`
                                          ] || ""
                                        }
                                        onChange={(e) =>
                                          handleInputChange(
                                            `field_${field._id}`,
                                            e.target.value
                                          )
                                        }
                                        className={`w-full px-4 py-3 border rounded-lg transition-colors ${
                                          fieldErrors[`field_${field._id}`]
                                            ? "border-red-500 focus:border-red-500"
                                            : "border-gray-300 focus:border-[#004080]"
                                        } focus:outline-none focus:ring-2 focus:ring-[#004080]/20`}
                                        placeholder={`Enter ${field.title}`}
                                      />
                                      {/* ADD ERROR MESSAGE FOR TEXT FIELDS */}
                                      {fieldErrors[`field_${field._id}`] && (
                                        <p className="text-red-500 text-sm mt-1">
                                          {fieldErrors[`field_${field._id}`]}
                                        </p>
                                      )}
                                    </>
                                  )}

                                  {field.type === "date" && (
                                    <>
                                      <input
                                        type="date"
                                        value={
                                          applicationData[
                                            `field_${field._id}`
                                          ] || ""
                                        }
                                        onChange={(e) =>
                                          handleInputChange(
                                            `field_${field._id}`,
                                            e.target.value
                                          )
                                        }
                                        className={`w-full px-4 py-3 border rounded-lg transition-colors ${
                                          fieldErrors[`field_${field._id}`]
                                            ? "border-red-500 focus:border-red-500"
                                            : "border-gray-300 focus:border-[#004080]"
                                        } focus:outline-none focus:ring-2 focus:ring-[#004080]/20`}
                                      />
                                      {/* ADD ERROR MESSAGE FOR DATE FIELDS */}
                                      {fieldErrors[`field_${field._id}`] && (
                                        <p className="text-red-500 text-sm mt-1">
                                          {fieldErrors[`field_${field._id}`]}
                                        </p>
                                      )}
                                    </>
                                  )}

                                  {field.type === "file" && (
                                    <div className="relative">
                                      {!applicationData[`file_${field._id}`] ? (
                                        <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#004080] transition-colors">
                                          <span className="text-gray-500 text-sm">
                                            Click to upload or drag and drop
                                            your file
                                          </span>
                                          <input
                                            type="file"
                                            onChange={(e) =>
                                              handleFileChange(field._id, e)
                                            }
                                            className="hidden"
                                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                          />
                                        </label>
                                      ) : (
                                        <div className="flex items-center justify-between bg-gray-100 px-4 py-2 rounded-lg border border-gray-300">
                                          <p className="text-sm text-gray-700 truncate max-w-[70%]">
                                            {
                                              applicationData[
                                                `file_${field._id}`
                                              ]?.name
                                            }
                                          </p>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleInputChange(
                                                `file_${field._id}`,
                                                null
                                              )
                                            }
                                            className="text-red-500 hover:text-red-700 transition-colors"
                                            aria-label="Remove file"
                                          >
                                            <FiTrash className="w-5 h-5" />
                                          </button>
                                        </div>
                                      )}
                                      <p className="text-xs text-gray-500 mt-1">
                                        Maximum file size: 5MB. Accepted
                                        formats: PDF, DOC, DOCX, JPG, PNG
                                      </p>
                                      {/* FILE FIELDS ALREADY HAVE ERROR DISPLAY */}
                                      {fieldErrors[`file_${field._id}`] && (
                                        <p className="text-red-500 text-sm mt-1">
                                          {fieldErrors[`file_${field._id}`]}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="pt-8">
                      <motion.button
                        whileHover={{
                          scale: 1.02,
                          boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
                        }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full px-6 py-5 bg-gradient-to-r from-[#004080] to-[#0066cc] text-white font-bold rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        {isSubmitting ? (
                          <div className="flex items-center justify-center">
                            <svg
                              className="animate-spin -ml-1 mr-3 h-6 w-6 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Submitting Application...
                          </div>
                        ) : (
                          <span className="relative z-10">
                            📄 Submit Application
                          </span>
                        )}
                      </motion.button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default JobDetails;
