/* eslint-disable no-unused-vars */
// components/visa/VisaRequestForm.jsx
import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const VisaRequestForm = ({ setActiveView }) => {
  const [formData, setFormData] = useState({
    destinationCountry: "",
    visaType: "student",
    purpose: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await axios.post(
        `${base_url}/api/student/visa/request`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("studentToken")}`,
          },
        }
      );

      toast.success("Visa processing request submitted successfully!");
      setActiveView("visaStatus");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-full mx-auto p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Visa Processing Request
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Destination Country
          </label>
          <input
            type="text"
            name="destinationCountry"
            value={formData.destinationCountry}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg  focus:border-gray-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Visa Type
          </label>
          <select
            name="visaType"
            value={formData.visaType}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-gray-500"
          >
            <option value="" disabled>
              Select an option
            </option>
            <option value="student">Student Visa</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Purpose of Travel
          </label>
          <textarea
            name="purpose"
            value={formData.purpose}
            onChange={handleChange}
            required
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-gray-500"
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => setActiveView("dashboard")}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VisaRequestForm;
