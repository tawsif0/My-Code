import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import {
  FiType,
  FiFileText,
  FiX,
  FiImage,
  FiUpload,
  FiLink,
  FiTrash2
} from "react-icons/fi";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

function NewsCreate() {
  const [form, setForm] = useState({
    title: "",
    category: ""
  });
  const [errors, setErrors] = useState({
    title: "",
    description: "",
    category: "",
    image: "" // <-- add this for the news image
  });

  const [descriptionHtml, setDescriptionHtml] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [files, setFiles] = useState({
    image: null
  });

  const token = localStorage.getItem("token");
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  // Fetch categories from the backend
  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3500/api/news-categories",
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

    window.addEventListener("newsCategoryUpdated", handleCategoryUpdate);

    // Cleanup event listener
    return () => {
      window.removeEventListener("newsCategoryUpdated", handleCategoryUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      "image/webp"
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

    // Set file
    setFiles((prev) => ({ ...prev, [name]: file }));

    // Clear image error
    setErrors((prev) => ({ ...prev, image: "" }));

    // Create preview
    const reader = new FileReader();
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    let isValid = true;

    // validate title
    isValid = validateField("title", form.title) && isValid;

    // validate description (ReactQuill)
    if (!descriptionHtml || descriptionHtml === "<p><br></p>") {
      setErrors((prev) => ({
        ...prev,
        description: "News description is required"
      }));
      isValid = false;
    } else {
      setErrors((prev) => ({ ...prev, description: "" }));
    }

    // validate category
    isValid = validateField("category", form.category) && isValid;

    // validate image
    if (!files.image) {
      setErrors((prev) => ({ ...prev, image: "News image is required" }));
      isValid = false;
    } else {
      setErrors((prev) => ({ ...prev, image: "" }));
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
    const toastId = toast.loading("Creating news post...");

    try {
      // Prepare form data for image upload
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", descriptionHtml);
      formData.append("category", form.category);

      // Add image file if exists
      if (files.image) {
        formData.append("image", files.image);
      }

      await axios.post("http://localhost:3500/api/news", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          ...authHeaders
        }
      });

      // Reset form
      setForm({
        title: "",
        category: ""
      });
      setDescriptionHtml("");
      setFiles({
        image: null
      });

      toast.success("News post created successfully", { id: toastId });
    } catch (err) {
      let errorMessage = "Failed to create news post";
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
            News Creation
          </h1>
          <p className="text-gray-600 mt-2">
            Create a new news post with content
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
              Create New News Post
            </h2>
            <p className="text-gray-600">
              Fill the form to add a new news post
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

            {/* description */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <FiFileText className="mr-2 text-gray-500" /> Description *
              </label>

              <div
                className={`bg-white min-h-[200px] rounded-lg border ${
                  errors.description ? "border-red-500" : "border-gray-300"
                }`}
              >
                <ReactQuill
                  value={descriptionHtml}
                  onChange={(val) => {
                    setDescriptionHtml(val);
                    if (val && val !== "<p><br></p>") {
                      setErrors((prev) => ({ ...prev, description: "" }));
                    }
                  }}
                  placeholder="Write your news description here..."
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
                  onBlur={() => {
                    if (!descriptionHtml || descriptionHtml === "<p><br></p>") {
                      setErrors((prev) => ({
                        ...prev,
                        description: "News description is required"
                      }));
                    }
                  }}
                />
              </div>

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
                News Image{" "}
                <span className="text-gray-500">
                  (JPG/PNG/GIF/WebP, max 5MB)
                </span>
              </label>

              {/* Upload Box */}
              <label
                htmlFor="newsImage"
                className={`border-2 border-dashed rounded-lg p-4 min-h-[140px] flex flex-col items-center justify-center text-center transition-colors relative cursor-pointer 
      ${
        errors.image
          ? "border-red-500 bg-red-50/30"
          : "border-gray-300 hover:bg-gray-50"
      }`}
              >
                {files.image ? (
                  <div className="w-full flex flex-col items-center">
                    {/* Image Preview */}
                    <img
                      src={URL.createObjectURL(files.image)}
                      alt="Preview"
                      className="w-full max-w-[280px] h-40 object-cover rounded-lg shadow-md border mb-3"
                    />

                    {/* File Info */}
                    <div className="flex items-center justify-between w-full max-w-[280px]">
                      <p className="text-gray-900 text-sm truncate">
                        {files.image.name}
                      </p>
                      <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                        {(files.image.size / 1024).toFixed(1)} KB
                      </span>
                    </div>

                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation(); // prevent opening file picker
                        setFiles((prev) => ({ ...prev, image: null }));
                      }}
                      className="absolute top-2 right-2 bg-white border rounded-full p-1 text-gray-500 hover:text-red-500 hover:bg-red-50 transition"
                    >
                      <FiX className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <FiUpload className="h-6 w-6 text-gray-400 mb-2" />
                    <p className="text-gray-500 text-sm">
                      Click or drag & drop
                    </p>
                    <p className="text-xs text-gray-400">JPG, PNG (max 5MB)</p>
                  </div>
                )}

                {/* Hidden File Input */}
                <input
                  id="newsImage"
                  type="file"
                  name="image"
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".jpg,.jpeg,.png,.gif,.webp"
                />
              </label>
              {errors.image && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-500 mt-1"
                >
                  {errors.image}
                </motion.p>
              )}

              {/* Helper Text */}
              <div className="text-xs text-gray-500 mt-2 space-y-1 bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Image Details
                </h4>
                <p>
                  • Recommended size:{" "}
                  <span className="font-medium">800×450px (16:9 ratio)</span>
                </p>
                <p>
                  • Maximum file size: <span className="font-medium">5MB</span>
                </p>
                <p>
                  • Supported formats:{" "}
                  <span className="font-medium">JPG, PNG, GIF, WebP</span>
                </p>
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

export default NewsCreate;
