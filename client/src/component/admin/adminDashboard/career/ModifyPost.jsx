/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiTrash2,
  FiEdit,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiLink,
  FiFileText,
  FiCheckCircle,
  FiUsers,
  FiPlus,
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import axios from "axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const ModifyPost = () => {
  const base_url =
    import.meta.env.VITE_API_KEY_Base_URL || "http://localhost:3500";
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingJob, setEditingJob] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [description, setDescription] = useState("");
  const [customFormFields, setCustomFormFields] = useState([]);
  const jobsPerPage = 8;

  // Fetch jobs
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${base_url}/api/jobs`);
        setJobs(response.data || []);
      } catch (err) {
        toast.error("Failed to load jobs");
        console.error("Error fetching jobs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [base_url]);

  // Filter jobs
  const filteredJobs = jobs.filter((job) =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const indexOfLast = currentPage * jobsPerPage;
  const indexOfFirst = indexOfLast - jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  // Handle edit click
  const handleEditClick = (job) => {
    setEditingJob(job);
    setShowEditForm(job._id);
    setDescription(job.description || "");

    // Normalize field IDs - ensure all fields have consistent 'id' property
    const normalizedFields = (job.customFormFields || []).map((field) => ({
      ...field,
      id:
        field.id ||
        field._id ||
        `db_field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    }));

    setCustomFormFields(normalizedFields);
  };

  // Handle delete
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${base_url}/api/jobs/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setJobs(jobs.filter((job) => job._id !== id));
      toast.success("Job post deleted successfully");
    } catch (error) {
      toast.error("Failed to delete job post");
    }
  };

  // Add form field
  const addFormField = (type) => {
    const newField = {
      id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // More unique ID
      type,
      title: "",
      required: true,
    };
    setCustomFormFields([...customFormFields, newField]);
  };

  // Replace the removeFormField function with this:
  const removeFormField = (fieldId) => {
    setCustomFormFields((prevFields) =>
      prevFields.filter((field) => {
        const currentFieldId = field.id || field._id;
        return currentFieldId !== fieldId;
      })
    );
  };
  // Update field title
  const updateFieldTitle = (fieldId, title) => {
    setCustomFormFields((prevFields) =>
      prevFields.map((field) => {
        const currentFieldId = field.id || field._id;
        return currentFieldId === fieldId ? { ...field, title } : field;
      })
    );
  };

  // Update job
  const handleUpdateJob = async (e) => {
    e.preventDefault();

    if (!editingJob.title.trim()) {
      toast.error("Job title is required");
      return;
    }

    if (
      !description ||
      description.trim() === "" ||
      description === "<p><br></p>"
    ) {
      toast.error("Description is required");
      return;
    }

    try {
      const jobData = {
        title: editingJob.title,
        description: description,
        applyLink: editingJob.applyLink,
        hasCustomForm: editingJob.hasCustomForm,
        customFormFields: editingJob.hasCustomForm ? customFormFields : [],
      };

      const response = await axios.put(
        `${base_url}/api/jobs/${editingJob._id}`,
        jobData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setJobs(
        jobs.map((job) =>
          job._id === editingJob._id ? response.data.data : job
        )
      );
      toast.success("Job post updated successfully!");
      setShowEditForm(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update job post");
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-white p-6 flex justify-center items-center"
      >
        <div className="text-gray-500">Loading jobs...</div>
      </motion.div>
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
        <div className="w-full mb-8 pb-6 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900">
            Job Post Management
          </h1>
          <p className="text-gray-600 mt-2">View and manage all job posts</p>
        </div>

        {/* Search & Stats */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search jobs..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:border-gray-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="bg-gray-100 px-4 py-2 rounded-lg">
            <span className="font-medium text-gray-900">
              {filteredJobs.length}
            </span>
            <span className="text-gray-600 ml-1">jobs found</span>
          </div>
        </div>

        {/* Jobs Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Application Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Form Fields
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {currentJobs.length > 0 ? (
                  currentJobs.map((job) => (
                    <React.Fragment key={job._id}>
                      <motion.tr
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        {/* Job Title */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                              <FiFileText className="h-5 w-5 text-gray-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {job.title}
                              </div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {job.description
                                  .replace(/<[^>]*>/g, "")
                                  .substring(0, 50)}
                                ...
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Application Type */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              job.hasCustomForm
                                ? "bg-purple-100 text-purple-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {job.hasCustomForm
                              ? "Custom Form"
                              : "External Link"}
                          </span>
                        </td>

                        {/* Form Fields */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {job.hasCustomForm ? (
                            <span className="flex items-center">
                              <FiUsers className="mr-1" />
                              {job.customFormFields?.length || 0} fields
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>

                        {/* Created Date */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(job.createdAt).toLocaleDateString()}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                          <button
                            onClick={() => handleEditClick(job)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <FiEdit className="inline mr-1" /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(job._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FiTrash2 className="inline mr-1" /> Delete
                          </button>
                        </td>
                      </motion.tr>

                      {/* Edit Form */}
                      {showEditForm === job._id && (
                        <tr>
                          <td colSpan="5" className="p-0">
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3 }}
                              className="bg-gray-50 p-6 border-t border-gray-200"
                            >
                              <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b border-gray-200 flex items-center">
                                <FiEdit className="mr-2 text-gray-600" />
                                Edit Job Post: {job.title}
                              </h2>

                              <form
                                onSubmit={handleUpdateJob}
                                className="space-y-6"
                              >
                                {/* Title */}
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Job Title *
                                  </label>
                                  <input
                                    type="text"
                                    value={editingJob.title}
                                    onChange={(e) =>
                                      setEditingJob({
                                        ...editingJob,
                                        title: e.target.value,
                                      })
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-gray-500 transition-all"
                                    placeholder="Enter job title"
                                    required
                                  />
                                </div>

                                {/* Description */}
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Job Description *
                                  </label>
                                  <div className="border border-gray-300 rounded-lg bg-white">
                                    <ReactQuill
                                      theme="snow"
                                      value={description}
                                      onChange={setDescription}
                                      modules={{
                                        toolbar: [
                                          [{ header: [1, 2, 3, false] }],
                                          [
                                            "bold",
                                            "italic",
                                            "underline",
                                            "strike",
                                            "blockquote",
                                          ],
                                          [
                                            { list: "ordered" },
                                            { list: "bullet" },
                                          ],
                                          ["link", "image"],
                                          ["clean"],
                                        ],
                                      }}
                                    />
                                  </div>
                                </div>

                                {/* Apply Link */}
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Apply Link
                                  </label>
                                  <input
                                    type="url"
                                    value={editingJob.applyLink}
                                    onChange={(e) =>
                                      setEditingJob({
                                        ...editingJob,
                                        applyLink: e.target.value,
                                      })
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-gray-500 transition-all"
                                    placeholder="https://example.com/apply"
                                    disabled={editingJob.hasCustomForm}
                                  />
                                </div>

                                {/* Custom Form Toggle */}
                                <label className="inline-flex items-center space-x-3 cursor-pointer py-4">
                                  <div className="relative w-10 h-6">
                                    <input
                                      type="checkbox"
                                      id="hasCustomForm"
                                      className="sr-only peer"
                                      checked={editingJob.hasCustomForm}
                                      onChange={(e) =>
                                        setEditingJob({
                                          ...editingJob,
                                          hasCustomForm: e.target.checked,
                                        })
                                      }
                                    />
                                    <div className="w-full h-full bg-gray-200 rounded-full peer peer-checked:bg-black transition-colors duration-300">
                                      <motion.div
                                        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                                        animate={{
                                          x: editingJob.hasCustomForm ? 20 : 3,
                                          transition: {
                                            type: "spring",
                                            stiffness: 700,
                                            damping: 30,
                                          },
                                        }}
                                      />
                                    </div>
                                  </div>
                                  <span className="text-sm font-medium text-gray-700">
                                    Use Custom Application Form
                                  </span>
                                </label>

                                {/* Custom Form Builder */}
                                {editingJob.hasCustomForm && (
                                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                                    <div className="flex justify-between items-center mb-4">
                                      <h3 className="font-medium text-gray-700">
                                        Application Form Fields
                                      </h3>
                                      <div className="flex space-x-2">
                                        <motion.button
                                          type="button"
                                          whileHover={{ scale: 1.05 }}
                                          whileTap={{ scale: 0.95 }}
                                          onClick={() => addFormField("text")}
                                          className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm"
                                        >
                                          <FiPlus className="mr-1" /> Text Field
                                        </motion.button>

                                        <motion.button
                                          type="button"
                                          whileHover={{ scale: 1.05 }}
                                          whileTap={{ scale: 0.95 }}
                                          onClick={() => addFormField("date")}
                                          className="flex items-center px-3 py-2 bg-green-100 text-green-700 rounded-md text-sm"
                                        >
                                          <FiPlus className="mr-1" /> Date Field
                                        </motion.button>

                                        <motion.button
                                          type="button"
                                          whileHover={{ scale: 1.05 }}
                                          whileTap={{ scale: 0.95 }}
                                          onClick={() => addFormField("file")}
                                          className="flex items-center px-3 py-2 bg-purple-100 text-purple-700 rounded-md text-sm"
                                        >
                                          <FiPlus className="mr-1" /> File
                                          Upload
                                        </motion.button>
                                      </div>
                                    </div>

                                    {customFormFields.length === 0 ? (
                                      <p className="text-gray-500 text-center py-4">
                                        No fields added yet. Add fields to
                                        create your custom form.
                                      </p>
                                    ) : (
                                      <div className="space-y-3">
                                        {customFormFields.map((field) => (
                                          <div
                                            key={field.id || field._id}
                                            className="flex items-center space-x-3 bg-gray-50 p-3 rounded"
                                          >
                                            <div className="flex-1">
                                              <input
                                                type="text"
                                                value={field.title}
                                                onChange={(e) =>
                                                  updateFieldTitle(
                                                    field.id || field._id,
                                                    e.target.value
                                                  )
                                                }
                                                placeholder={`Enter ${field.type} field title`}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                              />
                                            </div>
                                            <span className="text-sm text-gray-500 capitalize px-2">
                                              {field.type}
                                            </span>
                                            <button
                                              type="button"
                                              onClick={() =>
                                                removeFormField(
                                                  field.id || field._id
                                                )
                                              }
                                              className="text-red-500 hover:text-red-700 p-1"
                                            >
                                              <FiTrash2 />
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Form Actions */}
                                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                                  <button
                                    type="button"
                                    onClick={() => setShowEditForm(false)}
                                    className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="submit"
                                    className="px-5 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center"
                                  >
                                    <FiCheckCircle className="mr-2" />
                                    Update Job Post
                                  </button>
                                </div>
                              </form>
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No job posts found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredJobs.length > jobsPerPage && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">{indexOfFirst + 1}</span> to{" "}
                  <span className="font-medium">
                    {Math.min(indexOfLast, filteredJobs.length)}
                  </span>{" "}
                  of <span className="font-medium">{filteredJobs.length}</span>{" "}
                  jobs
                </p>
                <nav className="inline-flex -space-x-px">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <FiChevronLeft className="h-5 w-5" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 border text-sm font-medium ${
                          currentPage === page
                            ? "bg-gray-50 border-gray-500 text-gray-600"
                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <FiChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ModifyPost;
