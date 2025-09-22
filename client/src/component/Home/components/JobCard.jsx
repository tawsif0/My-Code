/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiExternalLink } from "react-icons/fi";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import axios from "axios";
import { toast } from "react-hot-toast";

const JobCard = ({ job }) => {
  const [showModal, setShowModal] = useState(false);
  const [applicationData, setApplicationData] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApply = () => {
    if (job.applyLink && !job.hasCustomForm) {
      window.open(job.applyLink, "_blank");
    } else if (job.hasCustomForm) {
      setShowModal(true);
      // Reset errors and data when modal opens
      setFieldErrors({});
      setApplicationData({});
    }
  };

  const handleInputChange = (fieldId, value, fieldType) => {
    setApplicationData({
      ...applicationData,
      [fieldId]: value,
    });

    // Clear error when user starts typing
    if (fieldErrors[fieldId]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }

    // Validate file size if it's a file input
    if (fieldType === "file" && value && value.size > 5 * 1024 * 1024) {
      setFieldErrors((prev) => ({
        ...prev,
        [fieldId]: "File size must be less than 5MB",
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    job.customFormFields.forEach((field) => {
      if (field.required) {
        if (!applicationData[field._id]) {
          errors[field._id] = `${field.title} is required`;
        } else if (
          field.type === "file" &&
          applicationData[field._id].size > 5 * 1024 * 1024
        ) {
          errors[field._id] = "File size must be less than 5MB";
        }
      }
    });

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix all errors before submitting");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("jobId", job._id);

      // Add all form fields
      Object.keys(applicationData).forEach((key) => {
        const field = job.customFormFields.find((f) => f._id === key);
        if (field && field.type === "file") {
          formData.append(key, applicationData[key]);
        } else {
          formData.append(key, applicationData[key]);
        }
      });

      await axios.post("http://localhost:3500/api/jobs/apply", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      toast.success("Application submitted successfully!");
      setShowModal(false);
      setApplicationData({});
      setFieldErrors({});
    } catch (error) {
      toast.error(error.response?.data?.message || "Application failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (fieldId, e) => {
    const file = e.target.files[0];
    if (file && file.size > 5 * 1024 * 1024) {
      setFieldErrors((prev) => ({
        ...prev,
        [fieldId]: "File size must be less than 5MB",
      }));
      // Clear the file input
      e.target.value = "";
      return;
    }

    handleInputChange(fieldId, file, "file");
  };

  return (
    <>
      <motion.div
        className="bg-white rounded-xl shadow-md overflow-hidden mb-6"
        whileHover={{ y: -5 }}
        transition={{ duration: 0.2 }}
      >
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{job.title}</h3>

          <div className="prose max-w-none mb-4">
            <ReactQuill
              value={job.description}
              readOnly={true}
              theme={"bubble"}
            />
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">
              Posted {new Date(job.createdAt).toLocaleDateString()}
            </span>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleApply}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300 flex items-center"
            >
              Apply Now
              {job.applyLink && !job.hasCustomForm && (
                <FiExternalLink className="ml-2" />
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Application Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  Apply for {job.title}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                  aria-label="Close"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleSubmitApplication}>
                {job.customFormFields.map((field) => (
                  <div key={field._id} className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.title}{" "}
                      {field.required && (
                        <span className="text-red-500">*</span>
                      )}
                    </label>

                    {field.type === "text" && (
                      <div>
                        <input
                          type="text"
                          required={field.required}
                          onChange={(e) =>
                            handleInputChange(field._id, e.target.value, "text")
                          }
                          className={`w-full px-3 py-2 border rounded-md ${
                            fieldErrors[field._id]
                              ? "border-red-500 focus:border-red-500"
                              : "border-gray-300 focus:border-blue-500"
                          }`}
                        />
                        {fieldErrors[field._id] && (
                          <p className="text-sm text-red-500 mt-1">
                            {fieldErrors[field._id]}
                          </p>
                        )}
                      </div>
                    )}

                    {field.type === "date" && (
                      <div>
                        <input
                          type="date"
                          required={field.required}
                          onChange={(e) =>
                            handleInputChange(field._id, e.target.value, "date")
                          }
                          className={`w-full px-3 py-2 border rounded-md ${
                            fieldErrors[field._id]
                              ? "border-red-500 focus:border-red-500"
                              : "border-gray-300 focus:border-blue-500"
                          }`}
                        />
                        {fieldErrors[field._id] && (
                          <p className="text-sm text-red-500 mt-1">
                            {fieldErrors[field._id]}
                          </p>
                        )}
                      </div>
                    )}

                    {field.type === "file" && (
                      <div>
                        <input
                          type="file"
                          required={field.required}
                          onChange={(e) => handleFileChange(field._id, e)}
                          className={`w-full px-3 py-2 border rounded-md ${
                            fieldErrors[field._id]
                              ? "border-red-500 focus:border-red-500"
                              : "border-gray-300 focus:border-blue-500"
                          }`}
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        />
                        {fieldErrors[field._id] && (
                          <p className="text-sm text-red-500 mt-1">
                            {fieldErrors[field._id]}
                          </p>
                        )}
                        {applicationData[field._id] &&
                          !fieldErrors[field._id] && (
                            <p className="text-sm text-green-600 mt-1">
                              File selected: {applicationData[field._id].name}
                            </p>
                          )}
                        <p className="text-xs text-gray-500 mt-1">
                          Maximum file size: 5MB. Accepted formats: PDF, DOC,
                          DOCX, JPG, PNG
                        </p>
                      </div>
                    )}
                  </div>
                ))}

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-700 hover:text-gray-900 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-4 py-2 rounded-md text-white ${
                      isSubmitting
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    } transition-colors`}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default JobCard;
