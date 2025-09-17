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

function NewsModify() {
  const [news, setNews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState({
    image: null,
  });
  const [currentImage, setCurrentImage] = useState("");
  // Form state
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
  });
  const [errors, setErrors] = useState({
    title: "",
    description: "",
    category: "",
  });

  const token = localStorage.getItem("token");
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const fetchNews = async () => {
    try {
      const response = await axios.get("http://localhost:3500/api/news", {
        headers: authHeaders,
      });

      // Handle different response structures
      let newsData = [];
      if (Array.isArray(response.data)) {
        newsData = response.data;
      } else if (response.data && Array.isArray(response.data.news)) {
        newsData = response.data.news;
      } else if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data)
      ) {
        newsData = response.data.data;
      }

      setNews(newsData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching news:", err);
      toast.error(
        err.response?.data?.message || err.message || "Failed to load news"
      );
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3500/api/news-categories",
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
    fetchNews();
    fetchCategories();
  }, []);

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      category: "",
    });
    setFiles({ image: null });
    setCurrentImage("");
    setErrors({
      title: "",
      description: "",
      category: "",
    });
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    const toastId = toast.loading("Deleting news post...");
    try {
      await axios.delete(`http://localhost:3500/api/news/${id}`, {
        headers: authHeaders,
      });
      toast.success("News post deleted", { id: toastId });
      fetchNews();
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
      const response = await axios.get(`http://localhost:3500/api/news/${id}`, {
        headers: authHeaders,
      });

      // Handle different response structures
      const newsData =
        response.data.data || response.data.news || response.data;

      setForm({
        title: newsData.title,
        description: newsData.description,
        category: newsData.category?._id || newsData.category || "",
      });

      if (newsData.image) {
        setCurrentImage(`http://localhost:3500/news/${newsData.image}`);
      }

      setEditingId(id);
      setShowForm(true);
    } catch (err) {
      toast.error("Failed to load news data");
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
    fetchNews();
    fetchCategories();
    toast.success("News posts refreshed!");
  };

  // Validation function
  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "title":
        if (!value) error = "News title is required";
        break;
      case "description":
        if (!value) error = "News description is required";
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
  const handleFileChange = (e) => {
    const { name } = e.target;
    const file = e.target.files[0];

    if (!file) return;

    // Validate file type
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/gif",
      "image/webp",
    ];
    if (!validTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, GIF, or WebP images are allowed");
      return;
    }

    // Validate file size (max 5MB for news images)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("News image must be less than 5MB");
      return;
    }

    setFiles((prev) => ({ ...prev, [name]: file }));
    setCurrentImage(URL.createObjectURL(file));
  };
  const removeImage = () => {
    setFiles((prev) => ({ ...prev, image: null }));
    if (!editingId) setCurrentImage("");
  };

  const validateForm = () => {
    let isValid = true;
    isValid = validateField("title", form.title) && isValid;
    isValid = validateField("description", form.description) && isValid;
    isValid = validateField("category", form.category) && isValid;

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
      editingId ? "Updating news post..." : "Creating news post..."
    );

    try {
      // Prepare form data for image upload
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("category", form.category);

      // Add image file if exists
      if (files.image) {
        formData.append("image", files.image);
      }

      if (editingId) {
        // Update existing news
        await axios.put(
          `http://localhost:3500/api/news/${editingId}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              ...authHeaders,
            },
          }
        );
        toast.success("News post updated successfully", { id: toastId });
      } else {
        // Create new news
        await axios.post("http://localhost:3500/api/news", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            ...authHeaders,
          },
        });
        toast.success("News post created successfully", { id: toastId });
      }

      // Reset form and refresh data
      cancelForm();
      fetchNews();
    } catch (err) {
      let errorMessage = editingId
        ? "Failed to update news post"
        : "Failed to create news post";
      if (err.response) {
        if (err.response.status === 413) {
          errorMessage = "File too large (max 5MB)";
        } else if (err.response.status === 415) {
          errorMessage = "Unsupported file type";
        } else if (err.response.data) {
          errorMessage = Array.isArray(err.response.data.message)
            ? err.response.data.message.join(", ")
            : err.response.data.message ||
              err.response.data.error ||
              errorMessage;
        }
      } else if (err.message) {
        errorMessage = err.message;
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
                  {editingId ? "Edit News Post" : "Create New News Post"}
                </h1>
                <p className="text-gray-600 mt-2">
                  {editingId
                    ? "Edit the news post details"
                    : "Create a new news post with description"}
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
                {editingId ? "Edit News Post" : "Create New News Post"}
              </h2>
              <p className="text-gray-600">
                {editingId
                  ? "Update the news post information"
                  : "Fill the form to add a new news post"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* News Title */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <FiType className="mr-2 text-gray-500" /> News Title *
                </label>
                <input
                  name="title"
                  type="text"
                  value={form.title}
                  onChange={handleChange}
                  onBlur={() => validateField("title", form.title)}
                  placeholder="Enter news title"
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

              {/* description */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <FiFileText className="mr-2 text-gray-500" /> Description *
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  onBlur={() => validateField("description", form.description)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.description ? "border-red-500" : "border-gray-300"
                  } focus:border-gray-500 transition-all min-h-[200px]`}
                  placeholder="Write your news description here..."
                />
                {errors.description && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-500"
                  >
                    {errors.description}
                  </motion.p>
                )}
              </div>
              {/* Image Upload */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  News Image (JPG/PNG, max 5MB)
                </label>
                <div className="relative flex-shrink-0">
                  {files.image || currentImage ? (
                    <div className="relative w-full md:w-48 h-32 rounded-md border border-gray-200 bg-gray-100">
                      <img
                        src={
                          files.image
                            ? URL.createObjectURL(files.image)
                            : currentImage
                        }
                        alt="News preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/placeholder-image.jpg";
                        }}
                      />

                      {/* Delete Button - Tight Top Right */}
                      <motion.button
                        onClick={removeImage}
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        whileTap={{ scale: 0.9 }}
                        className="absolute -top-2 -right-2 bg-white p-1.5 rounded-full shadow-md border border-gray-200 hover:bg-red-50 text-red-500"
                        type="button"
                      >
                        <FiTrash2 className="text-[16px]" />
                      </motion.button>

                      {/* Edit Button - Tight Bottom Right */}
                      <motion.label
                        whileHover={{ scale: 1.1, rotate: -5 }}
                        whileTap={{ scale: 0.95 }}
                        className="absolute -bottom-2 -right-2 bg-white p-1 rounded-full shadow-md border border-gray-300 cursor-pointer hover:bg-gray-100 transition-colors"
                      >
                        <FiEdit2 className="text-gray-600 text-[16px]" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                          name="image"
                        />
                      </motion.label>
                    </div>
                  ) : (
                    <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors w-56 flex justify-center items-center border border-gray-300 hover:border-gray-500">
                      <FiUpload className="inline mr-2" />
                      Upload Image
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
                      "Update News Post"
                    ) : (
                      "Create News Post"
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
              News Management
            </h1>
            <p className="text-gray-600 mt-2">
              Manage news posts in the system
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
                  News List
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  View and manage your news posts
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {Array.isArray(news) ? news.length : 0} news posts
                </span>
              </div>
            </div>
          </div>

          {!Array.isArray(news) || news.length === 0 ? (
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
                No news posts
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new news post.
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {news.map((newsItem) => (
                <motion.div
                  key={newsItem._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* News Details */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-4 duration-300">
                            {/* Image Section */}
                            <div className="relative w-40 h-28 rounded-md overflow-hidden flex-shrink-0">
                              {newsItem.image ? (
                                <img
                                  src={`http://localhost:3500/news/${newsItem.image}`}
                                  alt={newsItem.title}
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
                              {/* Overlay */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                            </div>

                            {/* Details Section */}
                            <div className="flex flex-col justify-between">
                              <h2 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors duration-200">
                                {newsItem.title}
                              </h2>
                              <p className="text-sm text-gray-600 mt-1">
                                <span className="font-medium text-gray-800">
                                  Category:
                                </span>{" "}
                                {newsItem.category?.name || "Uncategorized"}
                              </p>
                              <p className="text-xs text-gray-500 mt-2">
                                Created:{" "}
                                {new Date(
                                  newsItem.createdAt
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEditing(newsItem._id)}
                              className="text-gray-600 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100"
                              title="Edit"
                            >
                              <FiEdit2 />
                            </button>
                            <button
                              onClick={() => handleDelete(newsItem._id)}
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

export default NewsModify;
