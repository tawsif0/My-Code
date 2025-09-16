import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import VisaManagementDetail from "./VisaManagementDetail";

const VisaManagement = ({ requestId, onBack }) => {
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${base_url}/api/admin/visa/request/${requestId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          }
        );
        setRequest(response.data.request);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to load request details"
        );
        console.error("Error fetching visa request:", error);
        if (onBack) onBack(); // Go back if there's an error
      } finally {
        setLoading(false);
      }
    };

    if (requestId) {
      fetchRequest();
    } else {
      if (onBack) onBack(); // Go back if no requestId is provided
    }
  }, [requestId, onBack, base_url]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-500"></div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-red-500 mb-4">No request data available</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
        >
          Back to Visa Requests
        </button>
      </div>
    );
  }

  return <VisaManagementDetail requestData={request} onUpdate={() => {}} />;
};

export default VisaManagement;
