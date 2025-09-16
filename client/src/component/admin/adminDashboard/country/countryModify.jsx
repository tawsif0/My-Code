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
  FiMap, 
  FiType, 
  FiFileText, 
  FiX, 
  FiArrowLeft,
  FiPlus 
} from "react-icons/fi";

function CountryModify() {
  const [countries, setCountries] = useState([]);
  const [criteriaOptions, setCriteriaOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: "",
  });
  const [criteriaFields, setCriteriaFields] = useState([
    { criteria: "", description: "" }
  ]);
  const [files, setFiles] = useState({
    flag: null
  });
  const [currentFlag, setCurrentFlag] = useState("");
  const [errors, setErrors] = useState({
    name: "",
  });
  const [fieldErrors, setFieldErrors] = useState([{ criteria: "", description: "" }]);

  const token = localStorage.getItem("token");
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const fetchCountries = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:3500/api/countries",
        { headers: authHeaders }
      );
      setCountries(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching countries:", err);
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to load countries"
      );
      setLoading(false);
    }
  };

  const fetchCriteria = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:3500/api/criterias",
        { headers: authHeaders }
      );
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
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this country?")) {
      return;
    }

    const toastId = toast.loading("Deleting country...");
    try {
      await axios.delete(`http://localhost:3500/api/countries/${id}`, {
        headers: authHeaders,
      });
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
        `http://localhost:3500/api/countries/${id}`,
        { headers: authHeaders }
      );

      setForm({
        name: data.name,
      });

      // If country has multiple criteria/descriptions
      if (Array.isArray(data.criteria) && data.criteria.length > 0) {
        setCriteriaFields(
          data.criteria.map((c, idx) => ({
            criteria: c._id || "",
            description: data.description?.[idx] || ""
          }))
        );
        setFieldErrors(
          data.criteria.map(() => ({ criteria: "", description: "" }))
        );
      } else {
        setCriteriaFields([
          {
            criteria: data.criteria?._id || "",
            description: data.description || ""
          }
        ]);
        setFieldErrors([{ criteria: "", description: "" }]);
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

  const startCreating = () => {
    resetForm();
    setShowForm(true);
  };

  const cancelForm = () => {
    resetForm();
    setShowForm(false);
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchCountries();
    toast.success("Countries refreshed!");
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
      default:
        break;
    }

    if (index >= 0) {
      // For criteria fields array
      const newFieldErrors = [...fieldErrors];
      newFieldErrors[index] = { ...newFieldErrors[index], [name]: error };
      setFieldErrors(newFieldErrors);
    } else {
      // For main form
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
    
    return !error;
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
    const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/svg+xml"];
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

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix all errors before submitting");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading(editingId ? "Updating country..." : "Creating country...");

    try {
      // Prepare form data for image upload
      const formData = new FormData();
      formData.append("name", form.name);

      // Add criteria and descriptions as arrays
      criteriaFields.forEach((field, index) => {
        formData.append(`criteria[${index}]`, field.criteria);
        formData.append(`description[${index}]`, field.description);
      });

      // Add flag file if exists
      if (files.flag) {
        formData.append("flag", files.flag);
      }

      if (editingId) {
        // Update existing country
        await axios.put(
          `http://localhost:3500/api/countries/${editingId}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              ...authHeaders,
            },
          }
        );
        toast.success("Country updated successfully", { id: toastId });
      } else {
        // Create new country
        await axios.post(
          "http://localhost:3500/api/countries",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              ...authHeaders,
            },
          }
        );
        toast.success("Country created successfully", { id: toastId });
      }

      // Reset form and refresh data
      cancelForm();
      fetchCountries();

    } catch (err) {
      let errorMessage = editingId ? "Failed to update country" : "Failed to create country";
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
                  {editingId ? "Edit Country" : "Create New Country"}
                </h1>
                <p className="text-gray-600 mt-2">
                  {editingId ? "Edit the country details" : "Create a new country with criteria and description"}
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
                {editingId ? "Update the country information" : "Fill the form to add a new country"}
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Country Name */}
              <div className="space-y-2">
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
                  } focus:border-gray-500 transition-all`}
                />
                {errors.name && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-500"
                  >
                    {errors.name}
                  </motion.p>
                )}
              </div>

              {/* Criteria and Description Fields */}
              {criteriaFields.map((field, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 relative">
                  {criteriaFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCriteriaField(index)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors duration-200"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  )}
                  
                  <div className="space-y-4">
                    {/* Criteria Dropdown */}
                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-medium text-gray-700">
                        <FiType className="mr-2 text-gray-500" /> Criteria *
                      </label>
                      <select
                        name="criteria"
                        value={field.criteria}
                        onChange={(e) => handleChange(e, index)}
                        onBlur={() => validateField("criteria", field.criteria, index)}
                        className={`w-full px-4 py-3 rounded-lg border ${
                          fieldErrors[index]?.criteria ? "border-red-500" : "border-gray-300"
                        } focus:border-gray-500 transition-all text-gray-900`}
                      >
                        <option value="">Select a criteria</option>
                        {criteriaOptions.map((criteria) => (
                          <option key={criteria._id} value={criteria._id}>
                            {criteria.name}
                          </option>
                        ))}
                      </select>
                      {fieldErrors[index]?.criteria && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-sm text-red-500"
                        >
                          {fieldErrors[index].criteria}
                        </motion.p>
                      )}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-medium text-gray-700">
                        <FiFileText className="mr-2 text-gray-500" /> Description
                      </label>
                      <textarea
                        name="description"
                        value={field.description}
                        onChange={(e) => handleChange(e, index)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-gray-500 transition-all"
                        placeholder="Enter criteria description"
                        rows="3"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {/* Add Criteria Button */}
              <div className="flex justify-center">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={addCriteriaField}
                  className="flex items-center justify-center py-2 px-4 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all"
                >
                  <FiPlus className="mr-2" />
                  Add Another Criteria
                </motion.button>
              </div>

              {/* Flag Upload */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Flag Image (JPG/PNG/SVG, max 5MB)
                </label>
                <div className="relative flex-shrink-0">
                  {files.flag || currentFlag ? (
                    <div className="relative group">
                      <div className="w-full md:w-48 h-32 rounded-md overflow-hidden border border-gray-200 bg-gray-100">
                        <img
                          src={
                            files.flag
                              ? URL.createObjectURL(files.flag)
                              : currentFlag
                          }
                          alt="Flag preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/placeholder-image.jpg";
                          }}
                        />

                        <motion.label
                          initial={{ opacity: 0, scale: 0.8, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          whileHover={{ scale: 1.1, rotate: -5 }}
                          whileTap={{ scale: 0.95 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          className="absolute -bottom-2 -right-2 bg-white p-1 rounded-full shadow-md border border-gray-300 cursor-pointer hover:bg-gray-100 transition-colors"
                        >
                          <FiEdit2 className="text-gray-600 text-[16px]" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                            name="flag"
                          />
                        </motion.label>
                      </div>

                      <motion.button
                        onClick={() => {
                          setFiles((prev) => ({ ...prev, flag: null }));
                          if (!editingId) setCurrentFlag("");
                        }}
                        initial={{ opacity: 0, scale: 0.8, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        whileTap={{ scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="absolute -right-2 -top-2 bg-white p-1.5 rounded-full shadow-md border border-gray-200 hover:bg-red-50 text-red-500"
                        type="button"
                      >
                        <FiTrash2 className="text-[16px]" />
                      </motion.button>
                    </div>
                  ) : (
                    <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors w-56 flex justify-center items-center border border-gray-300 hover:border-gray-500">
                      <FiUpload className="inline mr-2" />
                      Upload Flag
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        name="flag"
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
                    ) : (
                      editingId ? "Update Country" : "Create Country"
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
              Country Management
            </h1>
            <p className="text-gray-600 mt-2">
              Manage countries in the system
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={startCreating}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gray-700 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <FiPlus className="w-4 h-4 mr-2" />
              Add Country
            </button>
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
                  Country List
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  View and manage your countries
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {countries.length} countries
                </span>
              </div>
            </div>
          </div>

          {countries.length === 0 ? (
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
                No countries
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new country.
              </p>
              <div className="mt-6">
                <button
                  onClick={startCreating}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FiPlus className="w-4 h-4 mr-2" />
                  Add Country
                </button>
              </div>
            </div>
          ) : (
         <div className="grid gap-6">
  {countries.map((country) => (
    <motion.div
      key={country._id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Country Flag */}
          <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden relative group cursor-pointer">
            <div className="relative w-full h-full">
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
                <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse flex items-center justify-center">
                  <FiImage className="text-gray-400 text-2xl" />
                </div>
              )}

              {/* Gradient hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              {/* Criteria Badge */}
              {Array.isArray(country.criteria)
                ? country.criteria.map((c, idx) =>
                    c?.name ? (
                      <span
                        key={c._id || idx}
                        className="absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-medium bg-gray-500 text-white"
                        style={{ top: `${2 + idx * 24}px` }}
                      >
                        {c.name}
                      </span>
                    ) : null
                  )
                : country.criteria?.name && (
                    <span className="absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-medium bg-gray-500 text-white">
                      {country.criteria.name}
                    </span>
                  )}
            </div>
          </div>

          {/* Country Details */}
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {country.name}
                </h2>
                {/* Show multiple descriptions if available */}
                {Array.isArray(country.description)
                  ? country.description.map((desc, idx) =>
                      desc ? (
                        <p key={idx} className="text-sm text-gray-600 mt-1 line-clamp-3">
                          {desc}
                        </p>
                      ) : null
                    )
                  : country.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-3">
                        {country.description}
                      </p>
                    )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => startEditing(country._id)}
                  className="text-gray-600 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100"
                  title="Edit"
                >
                  <FiEdit2 />
                </button>
                <button
                  onClick={() => handleDelete(country._id)}
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

export default CountryModify;