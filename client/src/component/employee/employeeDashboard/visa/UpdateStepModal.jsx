// components/consultant/UpdateStepModal.jsx
import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

const UpdateStepModal = ({ step, onClose, onSuccess }) => {
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState(step.notes || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("empToken");
      const response = await axios.put(
        `${base_url}/api/employee/visa/update-step/${step.requestId}`,
        {
          stepName: step.name,
          status,
          notes
        },
        {
          headers: {
            "x-auth-token": token
          }
        }
      );

      onSuccess(response.data.updatedRequest);
      toast.success("Step updated successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update step");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Update Step: {step.name}
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg  focus:border-gray-500"
            >
              <option value="" disabled>
                Select Status
              </option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg  focus:border-gray-500"
            />
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
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
            >
              {isSubmitting ? "Updating..." : "Update Step"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateStepModal;
