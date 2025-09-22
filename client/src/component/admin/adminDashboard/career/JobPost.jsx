/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FiLink,
  FiTrash2,
  FiPlus,
  FiFileText,
  FiCalendar,
  FiUpload,
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import axios from "axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const JobPost = () => {
  const [description, setDescription] = useState("");
  const [form, setForm] = useState({
    title: "",
    applyLink: "",
    hasCustomForm: false,
  });

  const [customFormFields, setCustomFormFields] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle field change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateForm = () => {
    let newErrors = {};
    if (!form.title) newErrors.title = "Job title is required";

    if (!form.applyLink && !form.hasCustomForm) {
      newErrors.applyLink = "Either apply link or custom form is required";
    }

    if (form.hasCustomForm && customFormFields.length === 0) {
      newErrors.customForm = "Add at least one field to the custom form";
    }

    if (
      !description ||
      description.trim() === "" ||
      description === "<p><br></p>"
    ) {
      newErrors.description = "Description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix all errors before submitting");
      return;
    }

    setIsSubmitting(true);
    try {
      const jobData = {
        title: form.title,
        description: description,
        applyLink: form.applyLink,
        hasCustomForm: form.hasCustomForm,
        customFormFields: form.hasCustomForm ? customFormFields : [],
      };

      await axios.post("http://localhost:3500/api/jobs/create", jobData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      toast.success("Job posted successfully!");
      setForm({
        title: "",
        applyLink: "",
        hasCustomForm: false,
      });
      setDescription("");
      setCustomFormFields([]);
    } catch (error) {
      toast.error(error.response?.data?.message || "Job posting failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add a new form field
  const addFormField = (type) => {
    const newField = {
      id: Date.now(),
      type,
      title: "",
      required: true,
    };
    setCustomFormFields([...customFormFields, newField]);
  };

  // Remove a form field
  const removeFormField = (id) => {
    setCustomFormFields(customFormFields.filter((field) => field.id !== id));
  };

  // Update form field title
  const updateFieldTitle = (id, title) => {
    setCustomFormFields(
      customFormFields.map((field) =>
        field.id === id ? { ...field, title } : field
      )
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col items-center p-6"
    >
      <div className="w-full max-w-full">
        {/* Header */}
        <div className="w-full mb-8 pb-6 border-b border-gray-200">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Create Job Post
          </h1>
          <p className="text-gray-600 mt-2">
            Fill in the details below to post a new job opening
          </p>
        </div>

        {/* Form */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-gray-200"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <FiFileText className="mr-2 text-gray-500" /> Job Title *
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={(e) => {
                  handleChange(e);
                  if (errors.title)
                    setErrors((prev) => ({ ...prev, title: "" }));
                }}
                placeholder="Enter job title"
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.title ? "border-red-500" : "border-gray-300"
                } focus:border-gray-500 hover:border-gray-500 transition-all`}
              />

              {errors.title && (
                <p className="text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <FiFileText className="mr-2 text-gray-500" /> Job Description *
              </label>

              <div
                className={`bg-white rounded-lg min-h-[200px] border ${
                  errors.description ? "border-red-500" : "border-gray-300"
                }`}
              >
                <ReactQuill
                  value={description}
                  onChange={(val) => {
                    setDescription(val);
                    if (errors.description) {
                      setErrors((prev) => ({ ...prev, description: "" }));
                    }
                  }}
                  placeholder="Write a detailed job description"
                  modules={{
                    toolbar: [
                      [{ header: [1, 2, 3, false] }],
                      ["bold", "italic", "underline", "strike", "blockquote"],
                      [{ list: "ordered" }, { list: "bullet" }],
                      ["link", "image"],
                      ["clean"],
                    ],
                  }}
                  formats={[
                    "header",
                    "bold",
                    "italic",
                    "underline",
                    "strike",
                    "blockquote",
                    "list",
                    "bullet",
                    "link",
                    "image",
                  ]}
                />
              </div>
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
            </div>

            {/* Apply Link */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <FiLink className="mr-2 text-gray-500" /> Apply Link
              </label>
              <input
                type="url"
                name="applyLink"
                value={form.applyLink}
                onChange={handleChange}
                placeholder="https://example.com/apply"
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.applyLink ? "border-red-500" : "border-gray-300"
                } focus:border-gray-500 hover:border-gray-500 transition-all`}
                disabled={form.hasCustomForm}
              />

              {errors.applyLink && (
                <p className="text-sm text-red-500">{errors.applyLink}</p>
              )}
            </div>

            {/* Custom Form Toggle */}
            <div className="flex items-center space-x-3 py-4">
              <input
                type="checkbox"
                id="hasCustomForm"
                name="hasCustomForm"
                checked={form.hasCustomForm}
                onChange={handleChange}
                className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="hasCustomForm"
                className="text-sm font-medium text-gray-700"
              >
                Create Custom Application Form
              </label>
            </div>

            {/* Custom Form Builder */}
            {form.hasCustomForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="bg-gray-50 p-4 rounded-lg border border-gray-200"
              >
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
                      className="flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-md text-sm"
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
                      <FiPlus className="mr-1" /> File Upload
                    </motion.button>
                  </div>
                </div>

                {errors.customForm && (
                  <p className="text-sm text-red-500 mb-4">
                    {errors.customForm}
                  </p>
                )}

                {customFormFields.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No fields added yet. Click the buttons above to add fields
                    to your form.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {customFormFields.map((field) => (
                      <div
                        key={field.id}
                        className="flex items-center space-x-3 bg-white p-3 rounded border"
                      >
                        <div className="flex-1">
                          <input
                            type="text"
                            value={field.title}
                            onChange={(e) =>
                              updateFieldTitle(field.id, e.target.value)
                            }
                            placeholder={`Enter ${field.type} field title`}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </div>
                        <div className="text-sm text-gray-500 capitalize">
                          {field.type}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFormField(field.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Submit */}
            <div className="pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 px-4 rounded-lg font-medium text-white ${
                  isSubmitting
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                } transition-all shadow-md flex items-center justify-center`}
              >
                {isSubmitting ? "Posting Job..." : "Post Job"}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default JobPost;
