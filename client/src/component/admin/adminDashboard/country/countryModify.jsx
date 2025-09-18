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
  FiMap,
  FiType,
  FiFileText,
  FiX,
  FiArrowLeft,
  FiPlus,
  FiInfo,
  FiUploadCloud,
} from "react-icons/fi";

function CountryModify() {
  const [countries, setCountries] = useState([]);
  const [criteriaOptions, setCriteriaOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [highlights, setHighlights] = useState([""]);
  const [highlightErrors, setHighlightErrors] = useState([""]);

  // Form state
  const [form, setForm] = useState({
    name: "",
  });
  const [criteriaFields, setCriteriaFields] = useState([
    { criteria: "", description: "" },
  ]);
  const [files, setFiles] = useState({
    flag: null,
  });
  const [currentFlag, setCurrentFlag] = useState("");
  const [errors, setErrors] = useState({
    name: "",
  });
  const [fieldErrors, setFieldErrors] = useState([
    { criteria: "", description: "" },
  ]);

  const fetchCountries = async () => {
    try {
      const { data } = await axios.get("http://localhost:3500/api/countries");
      setCountries(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching countries:", err);
      toast.error(
        err.response?.data?.message || err.message || "Failed to load countries"
      );
      setLoading(false);
    }
  };

  const fetchCriteria = async () => {
    try {
      const { data } = await axios.get("http://localhost:3500/api/criterias");
      setCriteriaOptions(data);
    } catch (err) {
      console.error("Error fetching criteria:", err);
      toast.error("Failed to load criteria options");
    }
  };

  useEffect(() => {
    fetchCountries();
    fetchCriteria();
  }, []);

  const resetForm = () => {
    setForm({
      name: "",
    });
    setCriteriaFields([{ criteria: "", description: "" }]);
    setFieldErrors([{ criteria: "", description: "" }]);
    setFiles({ flag: null });
    setCurrentFlag("");
    setErrors({ name: "" });
    setEditingId(null);
    setHighlights([""]);
    setHighlightErrors([""]);
  };

  const handleDelete = async (id) => {
    const toastId = toast.loading("Deleting country...");
    try {
      await axios.delete(`http://localhost:3500/api/countries/${id}`);
      toast.success("Country deleted", { id: toastId });
      fetchCountries();
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
      const { data } = await axios.get(
        `http://localhost:3500/api/countries/${id}`
      );

      setForm({
        name: data.name,
      });

      // Fix criteria data handling
      if (data.criteria && Array.isArray(data.criteria)) {
        setCriteriaFields(
          data.criteria.map((c) => ({
            criteria: c.criteria?._id || c.criteria || "",
            description: c.description || "",
          }))
        );
        setFieldErrors(
          data.criteria.map(() => ({ criteria: "", description: "" }))
        );
      } else {
        setCriteriaFields([{ criteria: "", description: "" }]);
        setFieldErrors([{ criteria: "", description: "" }]);
      }

      // Set highlights if they exist
      if (data.highlights && Array.isArray(data.highlights)) {
        setHighlights(data.highlights);
        setHighlightErrors(data.highlights.map(() => ""));
      } else {
        setHighlights([""]);
        setHighlightErrors([""]);
      }

      if (data.flag) {
        setCurrentFlag(`http://localhost:3500/api/countries/flag/${data.flag}`);
      }

      setEditingId(id);
      setShowForm(true);
    } catch (err) {
      toast.error("Failed to load country data");
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
    fetchCountries();
  };

  // Validation function
  const validateField = (name, value, index = 0) => {
    let error = "";

    switch (name) {
      case "name":
        if (!value) error = "Country name is required";
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
      // For criteria fields array
      if (name === "criteria" || name === "description") {
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
    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      toast.error("Only JPG, PNG images are allowed");
      return;
    }

    // Validate file size (max 5MB for flags)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Flag image must be less than 5MB");
      return;
    }

    setFiles((prev) => ({ ...prev, [name]: file }));
    setCurrentFlag(URL.createObjectURL(file));
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

    // Validate all highlights
    highlights.forEach((h, index) => {
      isValid = validateField("highlight", h, index) && isValid;
    });

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix all errors before submitting");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Saving country...");

    try {
      // Prepare form data
      const formData = new FormData();
      formData.append("name", form.name);

      // Add criteria + descriptions as parallel arrays
      criteriaFields.forEach((field) => {
        formData.append("criteria", field.criteria);
        formData.append("description", field.description);
      });

      // Add highlights as array
      highlights.forEach((h) => {
        formData.append("highlights", h);
      });

      // Add flag if exists
      if (files.flag) {
        formData.append("flag", files.flag);
      }

      // If editing (PUT), else POST
      if (editingId) {
        await axios.put(
          `http://localhost:3500/api/countries/${editingId}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        await axios.post("http://localhost:3500/api/countries", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }
      toast.success("Country updated successfully", { id: toastId });
      setShowForm(false);
    } catch (err) {
      let errorMessage = "Failed to save country";
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
        className="min-h-screen flex flex-col items-center p-6 bg-gray-50"
      >
        <div className="w-full">
          <div className="w-full mb-8 pb-6 border-b border-gray-200">
            <div className="flex items-center">
              <motion.button
                whileHover={{ scale: 1.05, x: -2 }}
                onClick={cancelForm}
                className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <FiArrowLeft className="h-5 w-5" />
              </motion.button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {editingId ? "Edit Country" : "Create New Country"}
                </h1>
                <p className="text-gray-600 mt-2">
                  {editingId
                    ? "Edit the country details"
                    : "Create a new country with criteria and description"}
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
                {editingId ? "Edit Country" : "Create New Country"}
              </h2>
              <p className="text-gray-600">
                {editingId
                  ? "Update the country information"
                  : "Fill the form to add a new country"}
              </p>
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
                  } focus:border-gray-500 hover:border-gray-500 transition-all`}
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
                    Flag Image (JPG/PNG max 5MB)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                    <label className="block cursor-pointer">
                      {files.flag || currentFlag ? (
                        <div className="flex flex-col items-center justify-center">
                          <div className="relative mb-3">
                            <img
                              src={
                                files.flag
                                  ? URL.createObjectURL(files.flag)
                                  : currentFlag
                              }
                              alt="Flag preview"
                              className="h-24 object-contain rounded-md border border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setFiles((prev) => ({ ...prev, flag: null }));
                                setCurrentFlag("");
                              }}
                              className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md text-gray-400 hover:text-red-500 transition-colors duration-200"
                            >
                              <FiX className="h-4 w-4" />
                            </button>
                          </div>
                          <p className="text-gray-900 text-sm truncate max-w-[180px]">
                            {files.flag ? files.flag.name : "Current flag"}
                          </p>
                          {files.flag && (
                            <p className="text-xs text-gray-500 mt-1">
                              {(files.flag.size / 1024).toFixed(1)} KB
                            </p>
                          )}
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
                        accept=".jpg,.jpeg,.png,."
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
                        Formats: JPG, PNG,
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
                          <span className="mr-2 font-semibold">
                            {index + 1}.
                          </span>
                          Criteria *
                        </label>
                        <select
                          name="criteria"
                          value={field.criteria}
                          onChange={(e) => handleChange(e, index)}
                          onBlur={() =>
                            validateField("criteria", field.criteria, index)
                          }
                          className={`w-full px-4 py-3 rounded-lg border ${
                            fieldErrors[index]?.criteria
                              ? "border-red-500"
                              : "border-gray-300"
                          } focus:border-gray-500 hover:border-gray-500 transition-all text-gray-900`}
                        >
                          <option value="">Select a criteria</option>
                          {criteriaOptions
                            .filter((criteria) => {
                              return (
                                field.criteria === criteria._id ||
                                !criteriaFields.some(
                                  (f, i) =>
                                    i !== index && f.criteria === criteria._id
                                )
                              );
                            })
                            .map((criteria) => (
                              <option key={criteria._id} value={criteria._id}>
                                {criteria.name}
                              </option>
                            ))}
                        </select>
                        {fieldErrors[index]?.criteria && (
                          <motion.p
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-sm text-red-500 flex items-center"
                          >
                            <FiInfo className="mr-1" />{" "}
                            {fieldErrors[index].criteria}
                          </motion.p>
                        )}
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
                  <FiInfo className="mr-1.5" /> Fields marked with * are
                  mandatory
                </p>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={cancelForm}
                    className="flex-1 py-3 px-4 rounded-lg font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-all shadow-sm"
                  >
                    Cancel
                  </button>
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
                          xmlns="http://www.w3.org/2000/"
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
                      "Update Country"
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

  // Show list view
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="min-h-screen flex flex-col items-center p-6 bg-gray-50"
    >
      <div className="w-full">
        <div className="w-full mb-8 pb-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Country Management
              </h1>
              <p className="text-gray-600 mt-2">
                Manage countries in the system
              </p>
            </div>
            <div className="flex space-x-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRefresh}
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-sm font-semibold rounded-xl shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
              >
                <FiRefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </motion.button>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-gray-200"
        >
          <div className="mb-8 pb-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                  Country List
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  View and manage your countries
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-4 py-2 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200">
                  {countries.length}{" "}
                  {countries.length === 1 ? "country" : "countries"}
                </span>
              </div>
            </div>
          </div>

          {countries.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <FiMap className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No countries found
              </h3>
            </div>
          ) : (
            <div className="grid gap-6">
              {countries.map((country, index) => (
                <motion.div
                  key={country._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden bg-white"
                >
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Country Flag */}
                      <div className="relative w-full lg:w-56 h-36 rounded-xl border border-gray-200 bg-gradient-to-br from-gray-100 to-gray-50 overflow-hidden group">
                        {country.flag ? (
                          <img
                            src={`http://localhost:3500/api/countries/flag/${country.flag}`}
                            alt={`${country.name} flag`}
                            className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/placeholder-image.jpg";
                            }}
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                            <FiImage className="text-gray-400 text-3xl" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>

                      {/* Country Details */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                              {country.name}
                            </h3>

                            {/* Criteria Count Badge */}
                            <div className="flex items-center space-x-2 mb-3">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {Array.isArray(country.criteria)
                                  ? country.criteria.length
                                  : 1}{" "}
                                criteria
                              </span>
                              {country.highlights &&
                                country.highlights.length > 0 && (
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    {country.highlights.length} highlights
                                  </span>
                                )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => startEditing(country._id)}
                              className="text-gray-500 hover:text-blue-600 p-2 rounded-xl hover:bg-blue-50 transition-all duration-200"
                              title="Edit Country"
                            >
                              <FiEdit2 className="w-5 h-5" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDelete(country._id)}
                              className="text-gray-500 hover:text-red-600 p-2 rounded-xl hover:bg-red-50 transition-all duration-200"
                              title="Delete Country"
                            >
                              <FiTrash2 className="w-5 h-5" />
                            </motion.button>
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

export default CountryModify;
