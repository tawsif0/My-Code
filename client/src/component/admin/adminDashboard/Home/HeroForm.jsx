import React, { useState } from "react";
import { FiImage, FiTrash2 } from "react-icons/fi";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const HeroForm = () => {
  const [heroItems, setHeroItems] = useState([
    { description: "", image: null },
  ]);
  const [errors, setErrors] = useState({ description: "", image: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileSizeError, setFileSizeError] = useState(false);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

  const handleDescriptionChange = (index, e) => {
    const newHeroItems = [...heroItems];
    newHeroItems[index].description = e.target.value;
    setHeroItems(newHeroItems);

    // Clear error when typing
    setErrors((prev) => ({ ...prev, description: "" }));
  };

  const handleFileChange = (index, e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setFileSizeError(true);
      return;
    }

    setFileSizeError(false);
    const newHeroItems = [...heroItems];
    newHeroItems[index].image = file;
    setHeroItems(newHeroItems);

    // Clear error when a valid file is uploaded
    setErrors((prev) => ({ ...prev, image: "" }));
  };

  const removeHeroItem = (index) => {
    const newHeroItems = heroItems.filter((_, i) => i !== index);
    setHeroItems(newHeroItems);
    setFileSizeError(false);
  };

  const resetForm = () => {
    setHeroItems([{ description: "", image: null }]);
    setErrors({ description: "", image: "" });
    setFileSizeError(false);
  };

  // Custom validation for the hero form
  const validateForm = () => {
    const newErrors = { description: "", image: "" };

    heroItems.forEach((item, index) => {
      if (!item.description.trim()) {
        newErrors.description = `Description for Hero Item ${
          index + 1
        } is required`;
      }

      if (!item.image) {
        newErrors.image = `Image for Hero Item ${index + 1} is required`;
      }
    });

    setErrors(newErrors);
    return newErrors.description === "" && newErrors.image === "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      const formData = new FormData();

      const item = heroItems[0];
      formData.append("description", item.description);
      formData.append("image", item.image);

      try {
        const response = await fetch("http://localhost:3500/api/hero/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to save hero section");
        }

        toast.success("Hero Section saved successfully!");
        resetForm();
      } catch (error) {
        toast.error("Error saving hero section: " + error.message);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen flex flex-col items-center p-6"
    >
      <div className="w-full mb-8 pb-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 text-left">
          Hero Section Builder
        </h1>
        <p className="text-gray-600 mt-2">
          Create stunning hero sections with images and captivating descriptions
        </p>
      </div>

      <div className="w-full">
        <form onSubmit={handleSubmit} className="mx-auto">
          <div className="space-y-8">
            {heroItems.map((item, index) => (
              <motion.div
                key={index}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
              >
                <div className="p-6 sm:p-8">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Hero Slide
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Add content for this hero section
                      </p>
                    </div>
                    {index !== 0 && (
                      <button
                        type="button"
                        onClick={() => removeHeroItem(index)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1 -mr-2"
                        aria-label="Remove slide"
                      >
                        <FiTrash2 className="h-5 w-5" />
                      </button>
                    )}
                  </div>

                  <div className="mt-6 space-y-6">
                    {/* Description Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description *
                      </label>
                      <textarea
                        name={`description-${index}`}
                        value={item.description}
                        onChange={(e) => handleDescriptionChange(index, e)}
                        placeholder="Enter a compelling description for your hero section..."
                        className={`w-full px-4 py-3 rounded-lg border ${
                          errors.description
                            ? "border-red-500"
                            : "border-gray-300"
                        } focus:border-gray-500 transition-all shadow-sm`}
                        rows="4"
                      />
                      {errors.description && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.description}
                        </p>
                      )}
                    </div>

                    {/* Image Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hero Image *
                      </label>
                      <div className="mt-1">
                        {item.image ? (
                          <div
                            className={`flex items-center justify-between p-4 rounded-lg border ${
                              fileSizeError
                                ? "border-red-500 bg-red-50"
                                : "border-gray-200 bg-gray-50"
                            }`}
                          >
                            <div className="flex items-center space-x-4">
                              <div className="flex-shrink-0">
                                <FiImage
                                  className={`h-8 w-8 ${
                                    fileSizeError
                                      ? "text-red-400"
                                      : "text-gray-400"
                                  }`}
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p
                                  className={`text-sm font-medium truncate ${
                                    fileSizeError
                                      ? "text-red-800"
                                      : "text-gray-900"
                                  }`}
                                >
                                  {item.image.name}
                                </p>
                                <p
                                  className={`text-xs ${
                                    fileSizeError
                                      ? "text-red-600"
                                      : "text-gray-500"
                                  }`}
                                >
                                  {(item.image.size / 1024 / 1024).toFixed(2)}{" "}
                                  MB
                                  {fileSizeError && (
                                    <span className="block text-red-600 mt-1">
                                      File exceeds 5MB limit
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                handleFileChange(index, {
                                  target: { files: [] },
                                });
                                setFileSizeError(false);
                              }}
                              className="ml-4 p-1 text-gray-400 hover:text-red-500 transition-colors"
                              aria-label="Remove image"
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <label
                            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                              fileSizeError
                                ? "border-red-500 bg-red-50 hover:bg-red-100"
                                : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                            }`}
                          >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <FiImage
                                className={`h-8 w-8 mb-2 ${
                                  fileSizeError
                                    ? "text-red-400"
                                    : "text-gray-400"
                                }`}
                              />
                              <p
                                className={`text-sm ${
                                  fileSizeError
                                    ? "text-red-600"
                                    : "text-gray-500"
                                }`}
                              >
                                <span
                                  className={`font-semibold hover:text-gray-500 ${
                                    fileSizeError
                                      ? "text-red-700 hover:text-red-600"
                                      : "text-gray-600"
                                  }`}
                                >
                                  Click to upload
                                </span>{" "}
                                or drag and drop
                              </p>
                              <p
                                className={`text-xs mt-1 ${
                                  fileSizeError
                                    ? "text-red-500"
                                    : "text-gray-400"
                                }`}
                              >
                                PNG, JPG up to 5MB
                              </p>
                              {fileSizeError && (
                                <p className="text-xs text-red-600 mt-1">
                                  Please select a smaller file
                                </p>
                              )}
                            </div>
                            <input
                              type="file"
                              name="image"
                              onChange={(e) => handleFileChange(index, e)}
                              className="hidden"
                              accept=".jpg,.jpeg,.png"
                            />
                          </label>
                        )}
                      </div>
                      {errors.image && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.image}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting || fileSizeError}
              className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Saving..." : "Save Hero Section"}
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default HeroForm;
