/* eslint-disable no-unused-vars */
// blogCreate.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { FiType, FiFileText, FiX, FiImage, FiUpload } from "react-icons/fi";

function BlogCreate() {
  const [files, setFiles] = useState({ image: null });
  const [form, setForm] = useState({
    title: "",
    content: "",
    category: "",
  });
  const [errors, setErrors] = useState({
    title: "",
    content: "",
    category: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const token = localStorage.getItem("token");
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  // Fetch categories from the backend
  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3500/api/blog-categories",
        { headers: authHeaders }
      );
      setCategories(response.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to load categories"
      );
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();

    // Listen for custom event when category is created/updated
    const handleCategoryUpdate = () => {
      console.log("Category updated event received");
      fetchCategories();
    };

    window.addEventListener("blogCategoryUpdated", handleCategoryUpdate);

    // Cleanup event listener
    return () => {
      window.removeEventListener("blogCategoryUpdated", handleCategoryUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    if (selectedFiles && selectedFiles.length > 0) {
      setFiles((prev) => ({ ...prev, [name]: selectedFiles[0] }));
    }
  };

  const validateForm = () => {
    let isValid = true;
    isValid = validateField("title", form.title) && isValid;
    isValid = validateField("content", form.content) && isValid;
    isValid = validateField("category", form.category) && isValid;

    // Check for image
    if (!files.image) {
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

    if (!files.image) {
      toast.error("Please upload an image");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Creating blog post...");

    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("content", form.content);
      formData.append("category", form.category);
      formData.append("image", files.image);

      await axios.post("http://localhost:3500/api/blogs", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          ...authHeaders,
        },
      });

      // Reset form
      setForm({ title: "", content: "", category: "" });
      setFiles({ image: null });

      toast.success("Blog post created successfully", { id: toastId });
    } catch (err) {
      let errorMessage = "Failed to create blog post";
      if (err.response) {
        if (err.response.data) {
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col items-center p-6"
    >
      <div className="w-full max-w-full">
        <div className="w-full mb-8 pb-6 border-b border-gray-200">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Blog Creation
          </h1>
          <p className="text-gray-600 mt-2">
            Create a new blog post with content
          </p>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-gray-200"
        >
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Create New Blog Post
            </h2>
            <p className="text-gray-600">
              Fill the form to add a new blog post
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

            {/* Category */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <FiType className="mr-2 text-gray-500" /> Category *
              </label>
              {categoriesLoading ? (
                <div className="flex items-center justify-center py-3">
                  <div className="w-5 h-5 border-2 border-gray-200 border-t-2 border-t-black rounded-full animate-spin mr-2"></div>
                  <span className="text-gray-500">Loading categories...</span>
                </div>
              ) : (
                <>
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
                </>
              )}
            </div>

            {/* Content */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <FiFileText className="mr-2 text-gray-500" /> Content *
              </label>
              <textarea
                name="content"
                value={form.content}
                onChange={handleChange}
                onBlur={() => validateField("content", form.content)}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.content ? "border-red-500" : "border-gray-300"
                } focus:border-gray-500 transition-all min-h-[200px]`}
                placeholder="Write your blog content here..."
              />
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
            {/* Blog Image Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Blog Image (JPG/PNG/SVG, max 5MB)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[60px] text-center hover:bg-gray-50 transition-colors">
                {files.image ? (
                  <div className="flex items-center justify-between">
                    <p className="text-gray-900 text-sm truncate max-w-[180px]">
                      {files.image.name}
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        setFiles((prev) => ({ ...prev, image: null }))
                      }
                      className="text-gray-400 hover:text-red-500 ml-2 transition-colors duration-200"
                    >
                      <FiX className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="block cursor-pointer">
                    <p className="text-gray-500 text-sm mb-1">
                      Click to upload blog image
                    </p>
                    <p className="text-xs text-gray-400">JPG, PNG or SVG</p>
                    <input
                      type="file"
                      name="image"
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".jpg,.jpeg,.png,.svg"
                    />
                  </label>
                )}
              </div>
            </div>

            <div className="pt-4">
              <p className="text-sm text-gray-500 mb-4">* Mandatory fields</p>
              <div className="flex space-x-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitting || categoriesLoading}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium text-white ${
                    isSubmitting || categoriesLoading
                      ? "bg-gray-600 cursor-not-allowed"
                      : "bg-gray-700 hover:bg-gray-700"
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
                      Creating...
                    </>
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

export default BlogCreate;
