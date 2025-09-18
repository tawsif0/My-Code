import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import {
  FiMap,
  FiType,
  FiFileText,
  FiX,
  FiPlus,
  FiTrash2,
  FiUploadCloud,
  FiInfo,
} from "react-icons/fi";

function CountryCreate() {
  const [criterias, setCriterias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [highlights, setHighlights] = useState([""]);
  const [highlightErrors, setHighlightErrors] = useState([""]);

  const [form, setForm] = useState({
    name: "",
    description: "",
    criteria: "",
  });
  const [criteriaFields, setCriteriaFields] = useState([
    { criteria: "", description: "" },
  ]);
  const [files, setFiles] = useState({
    flag: null,
  });
  const [errors, setErrors] = useState({
    name: "",
    criteria: "",
  });
  const [fieldErrors, setFieldErrors] = useState([
    { criteria: "", description: "" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchCriterias = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get("http://localhost:3500/api/criterias");
        setCriterias(data); // ✅ FIXED: use setCriterias instead of setCriteriaOptions
      } catch (err) {
        toast.error(
          err.response?.data?.message ||
            err.message ||
            "Failed to load criterias"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCriterias();
  }, []);

  // Validation function
  const validateField = (name, value, index = -1) => {
    let error = "";

    switch (name) {
      case "name":
        if (!value || !value.trim()) error = "Country name is required";
        break;
      case "criteria":
        if (!value) error = "Criteria selection is required";
        break;
      case "highlight":
        if (!value || !value.trim()) error = "Highlight cannot be empty";
        break;
      default:
        break;
    }

    if (index >= 0) {
      // For criteria fields
      if (name === "criteria") {
        const newFieldErrors = [...fieldErrors];
        newFieldErrors[index] = { ...newFieldErrors[index], [name]: error };
        setFieldErrors(newFieldErrors);
      } else if (name === "highlight") {
        const newHighlightErrors = [...highlightErrors];
        newHighlightErrors[index] = error;
        setHighlightErrors(newHighlightErrors);
      }
    } else {
      // For main form
      setErrors((prev) => ({ ...prev, [name]: error }));
    }

    return !error;
  };

  const addHighlight = () => {
    setHighlights([...highlights, ""]);
    setHighlightErrors([...highlightErrors, ""]);
  };

  const removeHighlight = (index) => {
    const newHighlights = [...highlights];
    newHighlights.splice(index, 1);
    setHighlights(newHighlights);

    const newErrors = [...highlightErrors];
    newErrors.splice(index, 1);
    setHighlightErrors(newErrors);
  };

  const handleHighlightChange = (value, index) => {
    const newHighlights = [...highlights];
    newHighlights[index] = value;
    setHighlights(newHighlights);
  };

  const handleChange = (e, index) => {
    const { name, value } = e.target;

    if (index >= 0) {
      // Handle criteria fields
      const newFields = [...criteriaFields];
      newFields[index] = { ...newFields[index], [name]: value };
      setCriteriaFields(newFields);

      if (fieldErrors[index] && fieldErrors[index][name]) {
        validateField(name, value, index);
      }
    } else {
      // Handle main form
      setForm((prev) => ({ ...prev, [name]: value }));
      if (errors[name]) validateField(name, value);
    }
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
      "image/svg+xml",
    ];
    if (!validTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, or SVG images are allowed");
      return;
    }

    // Validate file size (max 5MB for flags)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Flag image must be less than 5MB");
      return;
    }

    setFiles((prev) => ({ ...prev, [name]: file }));
  };

  const addCriteriaField = () => {
    setCriteriaFields([...criteriaFields, { criteria: "", description: "" }]);
    setFieldErrors([...fieldErrors, { criteria: "", description: "" }]);
  };

  const removeCriteriaField = (index) => {
    if (criteriaFields.length <= 1) {
      toast.error("At least one criteria is required");
      return;
    }

    const newFields = [...criteriaFields];
    newFields.splice(index, 1);
    setCriteriaFields(newFields);

    const newErrors = [...fieldErrors];
    newErrors.splice(index, 1);
    setFieldErrors(newErrors);
  };

  const validateForm = () => {
    let isValid = true;
    isValid = validateField("name", form.name) && isValid;

    // Validate all criteria fields
    criteriaFields.forEach((field, index) => {
      isValid = validateField("criteria", field.criteria, index) && isValid;
    });

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    let isValid = validateForm();
    highlights.forEach((h, index) => {
      isValid = validateField("highlight", h, index) && isValid;
    });

    if (!isValid) {
      toast.error("Please fix all errors before submitting");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Creating country...");

    try {
      const formData = new FormData();
      formData.append("name", form.name);

      // 🔧 Append criteria & descriptions as arrays
      criteriaFields.forEach((field) => {
        formData.append("criteria", field.criteria);
        formData.append("description", field.description);
      });

      // 🔧 Append highlights as array
      highlights.forEach((h) => {
        formData.append("highlights", h);
      });

      if (files.flag) {
        formData.append("flag", files.flag);
      }

      await axios.post("http://localhost:3500/api/countries", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Reset form
      setForm({ name: "" });
      setCriteriaFields([{ criteria: "", description: "" }]);
      setFieldErrors([{ criteria: "", description: "" }]);
      setFiles({ flag: null });
      setHighlights([]);
      setHighlightErrors([]);

      toast.success("Country created successfully", { id: toastId });
    } catch (err) {
      let errorMessage = "Failed to create country";
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col items-center p-6 bg-gray-50"
    >
      <div className="w-full">
        <div className="w-full mb-8 pb-6 border-b border-gray-200">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Country Creation
          </h1>
          <p className="text-gray-600 mt-2">
            Create a new country with criteria and description
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
              Create New Country
            </h2>
            <p className="text-gray-600">Fill the form to add a new country</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Country Name */}
            <div className="space-y-3">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <FiMap className="mr-2 text-gray-500" /> Country Name *
              </label>
              <input
                name="name"
                type="text"
                value={form.name}
                onChange={(e) => handleChange(e)}
                onBlur={() => validateField("name", form.name)}
                placeholder="Enter country name"
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }  focus:border-gray-500 hover:border-gray-500 transition-all`}
              />
              {errors.name && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-500 flex items-center mt-1"
                >
                  <FiInfo className="mr-1" /> {errors.name}
                </motion.p>
              )}
            </div>

            {/* Flag Upload */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Upload Section */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Flag Image (JPG/PNG, max 5MB)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                  <label className="block cursor-pointer">
                    {files.flag ? (
                      <div className="flex flex-col items-center justify-center">
                        <div className="relative mb-3">
                          <img
                            src={URL.createObjectURL(files.flag)}
                            alt="Flag preview"
                            className="h-24 object-contain rounded-md border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setFiles((prev) => ({ ...prev, flag: null }))
                            }
                            className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md text-gray-400 hover:text-red-500 transition-colors duration-200"
                          >
                            <FiX className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-gray-900 text-sm truncate max-w-[180px]">
                          {files.flag.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {(files.flag.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    ) : (
                      <div className="py-5">
                        <FiUploadCloud className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                        <p className="text-gray-500 text-sm mb-1">
                          Click to upload flag image
                        </p>
                        <p className="text-xs text-gray-400">
                          JPG, PNG (max 5MB)
                        </p>
                      </div>
                    )}
                    <input
                      type="file"
                      name="flag"
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".jpg,.jpeg,.png,.svg"
                    />
                  </label>
                </div>
              </div>

              {/* Details Section */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 opacity-0">
                  Flag Details
                </label>
                <div className="text-sm text-gray-600 bg-gray-50 p-5 rounded-xl h-full">
                  <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <FiInfo className="mr-2" /> Flag Requirements
                  </h4>
                  <div className="space-y-2 text-xs text-gray-500">
                    <p className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-gray-400 rounded-full mt-1 mr-2"></span>
                      Recommended dimensions: 320×200px
                    </p>
                    <p className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-gray-400 rounded-full mt-1 mr-2"></span>
                      Maximum file size: 5MB
                    </p>
                    <p className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-gray-400 rounded-full mt-1 mr-2"></span>
                      Formats: JPG, PNG, SVG
                    </p>
                    <p className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-gray-400 rounded-full mt-1 mr-2"></span>
                      For best results, use high-quality images
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Highlights Section */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Highlights *
              </label>

              <div className="space-y-3">
                {highlights.map((highlight, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    {/* Number */}
                    <span className="font-semibold w-6 text-right">
                      {index + 1}.
                    </span>

                    {/* Input */}
                    <div className="flex-1">
                      <input
                        type="text"
                        value={highlight}
                        onChange={(e) =>
                          handleHighlightChange(e.target.value, index)
                        }
                        onBlur={() =>
                          validateField("highlight", highlight, index)
                        }
                        placeholder={`Enter highlight #${index + 1}`}
                        className={`w-full px-4 py-2.5 rounded-lg border ${
                          highlightErrors[index]
                            ? "border-red-500"
                            : "border-gray-300"
                        } focus:border-gray-500 hover:border-gray-500 transition-all`}
                      />
                      {highlightErrors[index] && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-sm text-red-500 flex items-center mt-1"
                        >
                          <FiInfo className="mr-1" /> {highlightErrors[index]}
                        </motion.p>
                      )}
                    </div>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => removeHighlight(index)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-gray-100"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                ))}
              </div>

              <motion.button
                type="button"
                onClick={addHighlight}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center py-2.5 px-4 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all w-full md:w-auto"
              >
                <FiPlus className="mr-2" /> Add Highlight
              </motion.button>
            </div>

            {/* Criteria and Description Fields */}
            <div className="space-y-5">
              <h3 className="text-lg font-medium text-gray-800 border-b pb-2">
                Criteria Information
              </h3>
              {criteriaFields.map((field, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-gray-200 rounded-xl p-5 relative bg-white shadow-sm"
                >
                  {criteriaFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCriteriaField(index)}
                      className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors duration-200 p-1.5 rounded-md hover:bg-gray-100"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  )}

                  <div className="space-y-4">
                    {/* Criteria Dropdown */}
                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-medium text-gray-700">
                        <span className="mr-2 font-semibold">{index + 1}.</span>
                        Criteria *
                      </label>
                      <select
                        name="criteria"
                        value={field.criteria}
                        onChange={(e) => handleChange(e, index)}
                        onBlur={() =>
                          validateField("criteria", field.criteria, index)
                        }
                        className={`w-full px-4 py-2.5 rounded-lg border ${
                          fieldErrors[index]?.criteria
                            ? "border-red-500"
                            : "border-gray-300"
                        } focus:border-gray-500 hover:border-gray-500 transition-all`}
                      >
                        <option value="">-- Select Criteria --</option>
                        {criterias
                          .filter((criteria) => {
                            return (
                              field.criteria === criteria._id ||
                              !criteriaFields.some(
                                (f) => f.criteria === criteria._id
                              )
                            );
                          })
                          .map((c) => (
                            <option key={c._id} value={c._id}>
                              {c.name}
                            </option>
                          ))}
                      </select>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-medium text-gray-700">
                        <FiFileText className="mr-2 text-gray-500" />{" "}
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={field.description}
                        onChange={(e) => handleChange(e, index)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-gray-500 hover:border-gray-500 transition-all"
                        placeholder="Enter criteria description"
                        rows="3"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Add Criteria Button */}
              <div className="flex justify-center pt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={addCriteriaField}
                  className="flex items-center justify-center py-2.5 px-4 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all"
                >
                  <FiPlus className="mr-2" />
                  Add Another Criteria
                </motion.button>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-4 flex items-center">
                <FiInfo className="mr-1.5" /> Fields marked with * are mandatory
              </p>
              <div className="flex space-x-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 py-3.5 px-4 rounded-lg font-medium text-white ${
                    isSubmitting
                      ? "bg-gray-600 cursor-not-allowed"
                      : "bg-gray-700 hover:bg-gray-800 shadow-md"
                  } transition-all flex items-center justify-center`}
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
                    "Create Country"
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

export default CountryCreate;
