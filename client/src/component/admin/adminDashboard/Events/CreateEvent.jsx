/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiFileText,
  FiImage
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import axios from "axios";
// ✅ add these
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const CreateEvent = () => {
  const [description, setDescription] = useState("");
  const [form, setForm] = useState({
    title: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    location: ""
  });

  const [files, setFiles] = useState({
    image: null
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle field change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFiles({ image: file });
  };

  const validateForm = () => {
    let newErrors = {};
    if (!form.title) newErrors.title = "Event title is required";
    if (!form.startDate) newErrors.startDate = "Start date is required";
    if (!form.endDate) newErrors.endDate = "End date is required";
    if (!form.startTime) newErrors.startTime = "Start time is required";
    if (!form.endTime) newErrors.endTime = "End time is required";
    if (!form.location) newErrors.location = "Location is required";

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
      const formData = new FormData();
      for (const [key, value] of Object.entries(form)) {
        formData.append(key, value);
      }

      // Convert Draft.js to HTML
      formData.append("description", description);

      if (files.image) formData.append("image", files.image);

      await axios.post("http://localhost:3500/api/events/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      toast.success("Event created successfully!");
      setForm({
        title: "",
        startDate: "",
        endDate: "",
        startTime: "",
        endTime: "",
        location: ""
      });
      setDescription("");
      setFiles({ image: null });
    } catch (error) {
      toast.error(error.response?.data?.message || "Event creation failed");
    } finally {
      setIsSubmitting(false);
    }
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
            Create New Event
          </h1>
          <p className="text-gray-600 mt-2">
            Fill in the details below to add a new event
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
                <FiFileText className="mr-2 text-gray-500" /> Event Title *
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
                placeholder="Enter event title"
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.title ? "border-red-500" : "border-gray-300"
                } focus:border-gray-500 hover:border-gray-500 hover:border-gray-500 transition-all`}
              />

              {errors.title && (
                <p className="text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date */}
              {/* Start Date */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <FiCalendar className="mr-2 text-gray-500" /> Start Date *
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={form.startDate}
                  onChange={(e) => {
                    handleChange(e);
                    if (errors.startDate)
                      setErrors((prev) => ({ ...prev, startDate: "" }));
                  }}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.startDate ? "border-red-500" : "border-gray-300"
                  } focus:border-gray-500 hover:border-gray-500 hover:border-gray-500 transition-all`}
                />

                {errors.startDate && (
                  <p className="text-sm text-red-500">{errors.startDate}</p>
                )}
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <FiCalendar className="mr-2 text-gray-500" /> End Date *
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={form.endDate}
                  onChange={(e) => {
                    handleChange(e);
                    if (errors.endDate)
                      setErrors((prev) => ({ ...prev, endDate: "" }));
                  }}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.endDate ? "border-red-500" : "border-gray-300"
                  } focus:border-gray-500 hover:border-gray-500 hover:border-gray-500 transition-all`}
                />

                {errors.endDate && (
                  <p className="text-sm text-red-500">{errors.endDate}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Start Time */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <FiClock className="mr-2 text-gray-500" /> Start Time *
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={form.startTime || ""}
                  onChange={(e) => {
                    handleChange(e);
                    if (errors.startTime)
                      setErrors((prev) => ({ ...prev, startTime: "" }));
                  }}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.startTime ? "border-red-500" : "border-gray-300"
                  } focus:border-gray-500 hover:border-gray-500 hover:border-gray-500 transition-all`}
                />

                {errors.startTime && (
                  <p className="text-sm text-red-500">{errors.startTime}</p>
                )}
              </div>

              {/* End Time */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <FiClock className="mr-2 text-gray-500" /> End Time *
                </label>
                <input
                  type="time"
                  name="endTime"
                  value={form.endTime || ""}
                  onChange={(e) => {
                    handleChange(e);
                    if (errors.endTime)
                      setErrors((prev) => ({ ...prev, endTime: "" }));
                  }}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.endTime ? "border-red-500" : "border-gray-300"
                  } focus:border-gray-500 hover:border-gray-500 transition-all`}
                />

                {errors.endTime && (
                  <p className="text-sm text-red-500">{errors.endTime}</p>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <FiMapPin className="mr-2 text-gray-500" /> Location *
              </label>
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={(e) => {
                  handleChange(e);
                  if (errors.location)
                    setErrors((prev) => ({ ...prev, location: "" }));
                }}
                placeholder="Enter event location"
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.location ? "border-red-500" : "border-gray-300"
                } focus:border-gray-500 hover:border-gray-500 transition-all`}
              />

              {errors.location && (
                <p className="text-sm text-red-500">{errors.location}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <FiFileText className="mr-2 text-gray-500" /> Description *
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
                  placeholder="Write a brief description about the event"
                  modules={{
                    toolbar: [
                      [{ header: [1, 2, 3, false] }],
                      ["bold", "italic", "underline", "strike", "blockquote"],
                      [{ list: "ordered" }, { list: "bullet" }],
                      ["link", "image"],
                      ["clean"]
                    ]
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
                    "image"
                  ]}
                />
              </div>
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
            </div>

            {/* Image Upload */}

            <div className="flex flex-col md:space-x-4 space-y-4 md:space-y-0">
              {/* Upload Section */}
              <div className="w-full space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  <FiImage className="mr-2 inline text-gray-500" /> Event Image
                  (JPG/PNG)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors">
                  {files.image ? (
                    <div className="flex items-center justify-between">
                      <p className="text-gray-900 text-sm truncate max-w-[180px]">
                        {files.image.name}
                      </p>
                      <button
                        type="button"
                        onClick={() => setFiles({ image: null })}
                        className="text-gray-400 hover:text-red-500 ml-2 transition-colors duration-200"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <label className="block cursor-pointer">
                      <p className="text-gray-500 text-sm mb-1">
                        Click to upload image
                      </p>
                      <p className="text-xs text-gray-400">JPG or PNG</p>
                      <input
                        type="file"
                        name="image"
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".jpg,.jpeg,.png"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Details Section */}
              <div className="flex-1 mt-2">
                <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Image Details
                  </h4>
                  {files.image ? (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <span className="truncate max-w-xs">
                          {files.image.name}
                        </span>
                        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                          {(files.image.size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                    </>
                  ) : (
                    <div>No event image selected</div>
                  )}

                  <div className="text-xs text-gray-500 mt-3">
                    <p>• Recommended size: 800×450px (16:9 ratio)</p>
                    <p>• Maximum file size: 5MB</p>
                    <p>• Formats: JPG, PNG</p>
                  </div>
                </div>
              </div>
            </div>

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
                    : "bg-gray-800 hover:bg-gray-900"
                } transition-all shadow-md flex items-center justify-center`}
              >
                {isSubmitting ? "Creating Event..." : "Create Event"}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CreateEvent;
