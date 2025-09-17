/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiFileText,
  FiImage,
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import axios from "axios";
import { EditorState, RichUtils, convertToRaw } from "draft-js";
import "draft-js/dist/Draft.css";
import draftToHtml from "draftjs-to-html";
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
const CreateEvent = () => {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [form, setForm] = useState({
    title: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    location: "",
  });

  const [files, setFiles] = useState({
    image: null,
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

    const rawContent = convertToRaw(editorState.getCurrentContent());
    const hasText = rawContent.blocks.some((block) => block.text.trim() !== "");
    if (!hasText) newErrors.description = "Description is required";

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
      const rawContentState = convertToRaw(editorState.getCurrentContent());
      const descriptionHtml = draftToHtml(rawContentState);

      formData.append("description", descriptionHtml);

      if (files.image) formData.append("image", files.image);

      await axios.post("http://localhost:3500/api/events/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      toast.success("Event created successfully!");
      setForm({
        title: "",
        startDate: "",
        endDate: "",
        startTime: "",
        endTime: "",
        location: "",
      });
      setEditorState(EditorState.createEmpty());
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
                onChange={handleChange}
                placeholder="Enter event title"
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.title ? "border-red-500" : "border-gray-300"
                } focus:border-gray-500 transition-all`}
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
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.startDate ? "border-red-500" : "border-gray-300"
                  } focus:border-gray-500 transition-all`}
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
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.endDate ? "border-red-500" : "border-gray-300"
                  } focus:border-gray-500 transition-all`}
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
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.startTime ? "border-red-500" : "border-gray-300"
                  } focus:border-gray-500 transition-all`}
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
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.endTime ? "border-red-500" : "border-gray-300"
                  } focus:border-gray-500 transition-all`}
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
                onChange={handleChange}
                placeholder="Enter event location"
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.location ? "border-red-500" : "border-gray-300"
                } focus:border-gray-500 transition-all`}
              />
              {errors.location && (
                <p className="text-sm text-red-500">{errors.location}</p>
              )}
            </div>

            {/* Description */}
            {/* Description with Draft.js + Toolbar */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <FiFileText className="mr-2 text-gray-500" /> Description *
              </label>

              <div className="border border-gray-300 rounded-lg bg-white">
                <Editor
                  editorState={editorState}
                  onEditorStateChange={setEditorState}
                  wrapperClassName="demo-wrapper"
                  editorClassName="p-3 min-h-[150px]"
                  toolbarClassName="border-b border-gray-200"
                  toolbar={{
                    options: [
                      "inline",
                      "blockType",
                      "fontSize",
                      "fontFamily",
                      "list",
                      "textAlign",
                      "colorPicker",
                      "link",
                      "embedded",
                      "emoji",
                      "image",
                      "remove",
                      "history",
                    ],
                    inline: {
                      inDropdown: false,
                      className: undefined,
                      component: undefined,
                      dropdownClassName: undefined,
                      options: [
                        "bold",
                        "italic",
                        "underline",
                        "strikethrough",
                        "monospace",
                        "superscript",
                        "subscript",
                      ],
                    },
                    blockType: {
                      inDropdown: true,
                      options: [
                        "Normal",
                        "H1",
                        "H2",
                        "H3",
                        "H4",
                        "H5",
                        "H6",
                        "Blockquote",
                        "Code",
                      ],
                      className: undefined,
                      component: undefined,
                      dropdownClassName: undefined,
                    },
                    fontSize: {
                      options: [
                        8, 9, 10, 11, 12, 14, 16, 18, 24, 30, 36, 48, 60, 72,
                        96,
                      ],
                      className: undefined,
                      component: undefined,
                      dropdownClassName: undefined,
                    },
                    list: {
                      inDropdown: false,
                      className: undefined,
                      component: undefined,
                      dropdownClassName: undefined,
                      options: ["unordered", "ordered", "indent", "outdent"],
                    },
                    textAlign: {
                      inDropdown: false,
                      className: undefined,
                      component: undefined,
                      dropdownClassName: undefined,
                      options: ["left", "center", "right", "justify"],
                    },
                    link: {
                      inDropdown: false,
                      className: undefined,
                      component: undefined,
                      popupClassName: undefined,
                      dropdownClassName: undefined,
                      showOpenOptionOnHover: true,
                      defaultTargetOption: "_blank",
                      options: ["link", "unlink"],
                      linkCallback: undefined,
                      unlinkCallback: undefined,
                    },
                  }}
                  placeholder="Write a brief description about the event"
                  handlePastedText={(text, html, editorState, onChange) => {
                    // Return false to allow default paste behavior with formatting preservation
                    return false;
                  }}
                  handlePastedFiles={() => false}
                  stripPastedStyles={false}
                  spellCheck={true}
                  readOnly={false}
                  tabIndex={1}
                  ariaLabel="Event description editor"
                  ariaOwneeID="editor"
                  ariaActiveDescendantID="editor"
                  ariaAutoComplete="none"
                  ariaDescribedBy="editor"
                  ariaExpanded={false}
                  ariaHaspopup={false}
                  customStyleMap={{
                    STRIKETHROUGH: {
                      textDecoration: "line-through",
                    },
                    SUPERSCRIPT: {
                      verticalAlign: "super",
                      fontSize: "80%",
                    },
                    SUBSCRIPT: {
                      verticalAlign: "sub",
                      fontSize: "80%",
                    },
                  }}
                  blockStyleFn={(contentBlock) => {
                    const type = contentBlock.getType();
                    if (type === "blockquote") {
                      return "editor-blockquote";
                    }
                    if (type === "code-block") {
                      return "editor-code-block";
                    }
                    return null;
                  }}
                />
              </div>

              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
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
