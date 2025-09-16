import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { FiMap, FiType, FiFileText, FiX, FiPlus, FiTrash2 } from "react-icons/fi";

function CountryCreate() {
  const [criteriaOptions, setCriteriaOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    description: "",
    criteria: ""
  });
  const [criteriaFields, setCriteriaFields] = useState([
    { criteria: "", description: "" }
  ]);
  const [files, setFiles] = useState({
    flag: null
  });
  const [errors, setErrors] = useState({
    name: "",
    criteria: ""
  });
  const [fieldErrors, setFieldErrors] = useState([{ criteria: "", description: "" }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const token = localStorage.getItem("token");
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    const fetchCriterias = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(
          "http://localhost:3500/api/criterias",
          { headers: authHeaders }
        );
        setCriteriaOptions(data);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    const toastId = toast.loading("Creating country...");
    
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
      
      // Reset form
      setForm({
        name: "",
        description: "",
        criteria: ""
      });
      setCriteriaFields([{ criteria: "", description: "" }]);
      setFieldErrors([{ criteria: "", description: "" }]);
      setFiles({
        flag: null
      });
      
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
          <p className="mt-4 text-gray-600">Loading criterias...</p>
        </div>
      </div>
    );
  }

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
            <p className="text-gray-600">
              Fill the form to add a new country
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
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[60px] text-center hover:bg-gray-50 transition-colors">
                {files.flag ? (
                  <div className="flex items-center justify-between">
                    <p className="text-gray-900 text-sm truncate max-w-[180px]">
                      {files.flag.name}
                    </p>
                    <button
                      type="button"
                      onClick={() => setFiles((prev) => ({ ...prev, flag: null }))}
                      className="text-gray-400 hover:text-red-500 ml-2 transition-colors duration-200"
                    >
                      <FiX className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="block cursor-pointer">
                    <p className="text-gray-500 text-sm mb-1">
                      Click to upload flag image
                    </p>
                    <p className="text-xs text-gray-400">JPG, PNG or SVG</p>
                    <input
                      type="file"
                      name="flag"
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
                  disabled={isSubmitting}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium text-white ${
                    isSubmitting
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