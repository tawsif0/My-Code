// components/admin/AssignConsultantModal.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

const AssignConsultantModal = ({ visaRequest, onClose, onSuccess }) => {
  const [consultants, setConsultants] = useState([]);
  const [selectedConsultant, setSelectedConsultant] = useState(
    visaRequest?.assignedConsultant?._id || ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  useEffect(() => {
    // In case visaRequest changes while modal is open
    setSelectedConsultant(visaRequest?.assignedConsultant?._id || "");
  }, [visaRequest]);

  useEffect(() => {
    const fetchConsultants = async () => {
      try {
        const response = await axios.get(`${base_url}/api/admin/consultants`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });

        let list = response.data.consultants || [];

        // Ensure the currently assigned consultant is present in the list
        const assigned = visaRequest?.assignedConsultant;
        if (assigned?._id && !list.some((c) => c._id === assigned._id)) {
          list = [
            {
              _id: assigned._id,
              username: assigned.username || "Assigned Consultant",
              email: assigned.email || ""
            },
            ...list
          ];
        }

        setConsultants(list);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to fetch consultants"
        );
      }
    };

    fetchConsultants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAssign = async () => {
    if (!selectedConsultant) {
      toast.error("Please select a consultant");
      return;
    }

    // If no change, just close with a notice (optional)
    if (visaRequest?.assignedConsultant?._id === selectedConsultant) {
      toast.success("Consultant unchanged.");
      onClose?.();
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.put(
        `${base_url}/api/admin/visa/assign/${visaRequest._id}`,
        { consultantId: selectedConsultant },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        }
      );

      onSuccess(response.data.updatedRequest);
      toast.success(
        visaRequest?.assignedConsultant?._id
          ? "Consultant updated!"
          : "Consultant assigned successfully!"
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to assign consultant"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasAssigned = Boolean(visaRequest?.assignedConsultant?._id);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          {hasAssigned ? "Update Consultant" : "Assign Consultant"}
        </h3>

        {hasAssigned && (
          <div className="mb-3 text-sm text-gray-600">
            Currently assigned:&nbsp;
            <span className="font-medium text-gray-800">
              {visaRequest.assignedConsultant.username}
            </span>
            {visaRequest.assignedConsultant.email
              ? ` (${visaRequest.assignedConsultant.email})`
              : ""}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Consultant
          </label>
          <select
            value={selectedConsultant}
            onChange={(e) => setSelectedConsultant(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-gray-500"
          >
            {/* Show placeholder only when there is no current assignment */}
            {!hasAssigned && <option value="">Select a consultant</option>}
            {consultants.map((consultant) => (
              <option key={consultant._id} value={consultant._id}>
                {consultant.username}{" "}
                {consultant.email ? `(${consultant.email})` : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAssign}
            disabled={isSubmitting || !selectedConsultant}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
          >
            {isSubmitting
              ? hasAssigned
                ? "Updating..."
                : "Assigning..."
              : hasAssigned
              ? "Update Consultant"
              : "Assign Consultant"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignConsultantModal;
