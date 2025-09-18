/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

import {
  FiEdit,
  FiTrash2,
  FiEdit2,
  FiImage,
  FiUpload,
  FiRefreshCw,
  FiType,
  FiFileText,
  FiX,
  FiArrowLeft,
  FiPlus,
} from "react-icons/fi";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
function BlogModify() {
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState({ image: null });
  const [currentImage, setCurrentImage] = useState("");
  const [content, setContent] = useState("");
  // Form state
  const [form, setForm] = useState({
    title: "",
    category: "",
  });
  const [errors, setErrors] = useState({
    title: "",
    category: "",
  });

  const token = localStorage.getItem("token");
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const fetchBlogs = async () => {
    try {
      const response = await axios.get("http://localhost:3500/api/blogs", {
        headers: authHeaders,
      });

      // Handle different response structures
      let blogsData = [];
      if (Array.isArray(response.data)) {
        blogsData = response.data;
      } else if (response.data && Array.isArray(response.data.blogs)) {
        blogsData = response.data.blogs;
      } else if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data)
      ) {
        blogsData = response.data.data;
      }

      setBlogs(blogsData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching blogs:", err);
      toast.error(
        err.response?.data?.message || err.message || "Failed to load blogs"
      );
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3500/api/blog-categories",
        { headers: authHeaders }
      );

      // Handle different response structures
      let categoriesData = [];
      if (Array.isArray(response.data)) {
        categoriesData = response.data;
      } else if (response.data && Array.isArray(response.data.categories)) {
        categoriesData = response.data.categories;
      } else if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data)
      ) {
        categoriesData = response.data.data;
      }

      setCategories(categoriesData);
    } catch (err) {
      console.error("Error fetching categories:", err);
      toast.error("Failed to load category options");
    }
  };

  useEffect(() => {
    fetchBlogs();
    fetchCategories();
  }, []);

  const resetForm = () => {
    setForm({
      title: "",
      category: "",
    });
    setContent(""); // Reset ReactQuill content
    setErrors({
      title: "",
      content: "",
      category: "",
    });
    setFiles({ image: null });
    setCurrentImage("");
    setEditingId(null);
  };
  const handleFileChange = (e) => {
    const { name } = e.target;
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, or WebP images are allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setFiles((prev) => ({ ...prev, [name]: file }));
    setCurrentImage(URL.createObjectURL(file));
  };

  const removeImage = (e) => {
    e.preventDefault(); // stop form submit
    setFiles({ image: null });
    setCurrentImage(""); // clear DB preview
  };

  const handleDelete = async (id) => {
    const toastId = toast.loading("Deleting blog post...");
    try {
      await axios.delete(`http://localhost:3500/api/blogs/${id}`, {
        headers: authHeaders,
      });
      toast.success("Blog post deleted", { id: toastId });
      fetchBlogs();
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || "Failed to delete",
        { id: toastId }
      );
    }
  };

  const startEditing = async (id) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:3500/api/blogs/${id}`,
        { headers: authHeaders }
      );

      const blogData =
        response.data.data || response.data.blog || response.data;

      setForm({
        title: blogData.title,
        category: blogData.category?._id || blogData.category || "",
      });

      setContent(blogData.content || ""); // Set ReactQuill content

      if (blogData.image) {
        setCurrentImage(`http://localhost:3500/blogs/${blogData.image}`);
      } else {
        setCurrentImage("");
      }

      setEditingId(id);
      setShowForm(true);
    } catch (err) {
      toast.error("Failed to load blog data");
    } finally {
      setLoading(false);
    }
  };
  const cancelForm = () => {
    resetForm();
    setShowForm(false);
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchBlogs();
    fetchCategories();
    toast.success("Blog posts refreshed!");
  };

  // Validation function
  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "title":
        if (!value) error = "Blog title is required";
        break;
      case "content":
        if (!value) error = "Blog content is required";
        break;
      case "category":
        if (!value) error = "Category selection is required";
        break;
      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
    return !error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) validateField(name, value);
  };

  const validateForm = () => {
    let isValid = true;
    isValid = validateField("title", form.title) && isValid;
    isValid = validateField("content", form.content) && isValid;
    isValid = validateField("category", form.category) && isValid;

    // Require image only for new blogs
    if (!editingId && !files.image) {
      toast.error("Blog image is required");
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix all errors before submitting");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading(
      editingId ? "Updating blog post..." : "Creating blog post..."
    );

    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("content", content);
      formData.append("category", form.category);

      if (files.image) {
        formData.append("image", files.image);
      }

      if (editingId) {
        // Update blog
        await axios.put(
          `http://localhost:3500/api/blogs/${editingId}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              ...authHeaders,
            },
          }
        );
        toast.success("Blog post updated successfully", { id: toastId });
      } else {
        // Create blog
        await axios.post("http://localhost:3500/api/blogs", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            ...authHeaders,
          },
        });
        toast.success("Blog post created successfully", { id: toastId });
      }

      cancelForm();
      fetchBlogs();
    } catch (err) {
      let errorMessage = editingId
        ? "Failed to update blog post"
        : "Failed to create blog post";
      if (err.response?.status === 413) {
        errorMessage = "File too large (max 5MB)";
      } else if (err.response?.status === 415) {
        errorMessage = "Unsupported file type";
      } else if (err.response?.data?.message) {
        errorMessage = Array.isArray(err.response.data.message)
          ? err.response.data.message.join(", ")
          : err.response.data.message;
      }

      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-2 border-gray-200 border-t-2 border-t-black rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show form view
  if (showForm) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen flex flex-col items-center p-6"
      >
        <div className="w-full max-w-full">
          <div className="w-full mb-8 pb-6 border-b border-gray-200">
            <div className="flex items-center">
              <button
                onClick={cancelForm}
                className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <FiArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {editingId ? "Edit Blog Post" : "Create New Blog Post"}
                </h1>
                <p className="text-gray-600 mt-2">
                  {editingId
                    ? "Edit the blog post details"
                    : "Create a new blog post with content"}
                </p>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-gray-200"
          >
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                {editingId ? "Edit Blog Post" : "Create New Blog Post"}
              </h2>
              <p className="text-gray-600">
                {editingId
                  ? "Update the blog post information"
                  : "Fill the form to add a new blog post"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Blog Title */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <FiType className="mr-2 text-gray-500" /> Blog Title *
                </label>
                <input
                  name="title"
                  type="text"
                  value={form.title}
                  onChange={handleChange}
                  onBlur={() => validateField("title", form.title)}
                  placeholder="Enter blog title"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.title ? "border-red-500" : "border-gray-300"
                  } focus:border-gray-500 transition-all`}
                />
                {errors.title && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-500"
                  >
                    {errors.title}
                  </motion.p>
                )}
              </div>
              {/* Image Upload */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                  <FiImage className="mr-2 text-gray-600" />
                  Blog Image
                </h3>

                <div className="flex flex-col md:flex-row items-start gap-6">
                  {/* Image Preview Box */}
                  <div className="relative flex-shrink-0">
                    {files.image || currentImage ? (
                      <div className="relative group">
                        <div className="w-full md:w-56 h-40 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 bg-gray-50 shadow-sm">
                          <img
                            src={
                              files.image
                                ? URL.createObjectURL(files.image)
                                : currentImage
                            }
                            alt="Blog preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/placeholder-image.jpg";
                            }}
                          />
                        </div>

                        {/* Edit Button */}
                        <motion.label
                          whileHover={{ scale: 1.1, rotate: -5 }}
                          whileTap={{ scale: 0.95 }}
                          className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow-md border border-gray-300 cursor-pointer hover:bg-gray-50 transition-colors"
                          title="Change image"
                        >
                          <FiEdit className="text-gray-700 text-lg" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                            name="image"
                          />
                        </motion.label>

                        {/* Remove Button */}
                        <motion.button
                          onClick={removeImage}
                          whileHover={{ scale: 1.1, rotate: 10 }}
                          whileTap={{ scale: 0.9 }}
                          className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md border border-gray-200 hover:bg-red-50 text-red-500"
                          type="button"
                          title="Remove image"
                        >
                          <FiTrash2 className="text-lg" />
                        </motion.button>
                      </div>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center justify-center w-56 h-40 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors p-4 text-center">
                        <FiImage className="text-3xl text-gray-400 mb-2" />
                        <span className="text-sm font-medium text-gray-600">
                          Upload Blog Image
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                          JPG, PNG, or WebP
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                          name="image"
                        />
                      </label>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1">
                    <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Image Details
                      </h4>
                      {files.image ? (
                        <>
                          <div className="font-medium mb-1">New upload:</div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="truncate max-w-xs">
                              {files.image.name}
                            </span>
                            <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                              {(files.image.size / 1024).toFixed(1)} KB
                            </span>
                          </div>
                        </>
                      ) : null}

                      <div className="text-xs text-gray-500 mt-3">
                        <p>• Recommended size: 800×450px (16:9 ratio)</p>
                        <p>• Maximum file size: 5MB</p>
                        <p>• Formats: JPG, PNG, WebP</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Category */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <FiType className="mr-2 text-gray-500" /> Category *
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  onBlur={() => validateField("category", form.category)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.category ? "border-red-500" : "border-gray-300"
                  } focus:border-gray-500 transition-all text-gray-900`}
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-500"
                  >
                    {errors.category}
                  </motion.p>
                )}
              </div>

              {/* Content */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <FiFileText className="mr-2 text-gray-500" /> Content *
                </label>
                <div className="border border-gray-300 rounded-lg bg-white">
                  <ReactQuill
                    theme="snow"
                    value={content}
                    onChange={setContent}
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
                {errors.content && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-500"
                  >
                    {errors.content}
                  </motion.p>
                )}
              </div>

              <div className="pt-4">
                <p className="text-sm text-gray-500 mb-4">* Mandatory fields</p>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={cancelForm}
                    className="flex-1 py-3 px-4 rounded-lg font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-all shadow-md"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium text-white ${
                      isSubmitting
                        ? "bg-gray-600 cursor-not-allowed"
                        : "bg-gray-700 hover:bg-gray-800"
                    } transition-all shadow-md flex items-center justify-center`}
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                        {editingId ? "Updating..." : "Creating..."}
                      </>
                    ) : editingId ? (
                      "Update Blog Post"
                    ) : (
                      "Create Blog Post"
                    )}
                  </motion.button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // Show list view
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="min-h-screen flex flex-col items-center p-6"
    >
      <div className="w-full mb-8 pb-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Blog Management
            </h1>
            <p className="text-gray-600 mt-2">
              Manage blog posts in the system
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleRefresh}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gray-700 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
            >
              <FiRefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="w-full max-w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-gray-200"
        >
          <div className="py-1 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                  Blog List
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  View and manage your blog posts
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {Array.isArray(blogs) ? blogs.length : 0} blog posts
                </span>
              </div>
            </div>
          </div>

          {!Array.isArray(blogs) || blogs.length === 0 ? (
            <div className="py-12 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                No blog posts
              </h3>
            </div>
          ) : (
            <div className="grid gap-6">
              {blogs.map((blog) => (
                <motion.div
                  key={blog._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Blog Details */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-4">
                            <div className="relative w-40 h-28 rounded-md overflow-hidden flex-shrink-0">
                              {blog.image ? (
                                <img
                                  src={`http://localhost:3500/blogs/${blog.image}`}
                                  alt={blog.title}
                                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "/placeholder-image.jpg";
                                  }}
                                />
                              ) : (
                                <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse flex items-center justify-center">
                                  <FiImage className="text-gray-400 text-3xl" />
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col">
                              <h2 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                                {blog.title}
                              </h2>
                              <p className="text-sm text-gray-600 mt-1">
                                Category:{" "}
                                {blog.category?.name || "Uncategorized"}
                              </p>
                              <p className="text-xs text-gray-500 mt-2">
                                Created:{" "}
                                {new Date(blog.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEditing(blog._id)}
                              className="text-gray-600 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100"
                              title="Edit"
                            >
                              <FiEdit2 />
                            </button>
                            <button
                              onClick={() => handleDelete(blog._id)}
                              className="text-gray-600 hover:text-red-500 p-2 rounded-full hover:bg-gray-100"
                              title="Delete"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

export default BlogModify;
