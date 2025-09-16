// components/admin/VisaRequestsList.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  FiSearch,
  FiFilter,
  FiUser,
  FiMail,
  FiEye,
  FiGlobe,
  FiClock,
  FiRefreshCw,
} from "react-icons/fi";
import AssignConsultantModal from "./AssignConsultantModal";
import VisaManagement from "./visaManagement/VisaManagementDetail";
const VisaRequestsList = ({ onViewRequest }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  useEffect(() => {
    const fetchVisaRequests = async () => {
      try {
        const response = await axios.get(
          `${base_url}/api/admin/visa/requests`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setRequests(response.data.requests);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to fetch visa requests"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchVisaRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApprove = async (requestId) => {
    try {
      const response = await axios.put(
        `${base_url}/api/admin/visa/approve/${requestId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setRequests((prev) =>
        prev.map((req) =>
          req._id === requestId ? response.data.updatedRequest : req
        )
      );
      toast.success("Visa request approved successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to approve request");
    }
  };

  const handleReject = async (requestId) => {
    try {
      const response = await axios.put(
        `${base_url}/api/admin/visa/reject/${requestId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setRequests((prev) =>
        prev.map((req) =>
          req._id === requestId ? response.data.updatedRequest : req
        )
      );
      toast.success("Visa request rejected successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject request");
    }
  };
  const handleReopen = async (requestId) => {
    try {
      const response = await axios.put(
        `${base_url}/api/admin/visa/reopen/${requestId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setRequests((prev) =>
        prev.map((req) =>
          req._id === requestId ? response.data.updatedRequest : req
        )
      );
      toast.success("Visa request reopened successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reopen request");
    }
  };
  const handleAssignConsultant = (request) => {
    setSelectedRequest(request);
    setShowAssignModal(true);
  };

  const handleAssignmentSuccess = (updatedRequest) => {
    setRequests((prev) =>
      prev.map((req) => (req._id === updatedRequest._id ? updatedRequest : req))
    );
    setShowAssignModal(false);
  };

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.student.full_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      request.student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.destinationCountry
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || request.status === filterStatus;

    return matchesSearch && matchesStatus;
  });
  const handleViewRequest = (request) => {
    onViewRequest(request._id);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
        <div className="w-full pb-6 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900">
            Visa Processing Requests
          </h1>
          <p className="text-gray-600 mt-2">
            View and manage all visa requests
          </p>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        {/* Search box - take as much width as possible */}
        <div className="relative flex-1 max-w-lg">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-gray-500"
          />
        </div>

        {/* Status filter - align right */}
        <div className="relative w-full sm:w-48">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiFilter className="text-gray-400" />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-gray-500 appearance-none"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto shadow-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Destination
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Visa Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Consultant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRequests.length > 0 ? (
              filteredRequests.map((request) => (
                <tr key={request._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-900 flex items-center justify-center text-gray-100 font-bold">
                        {request.student.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {request.student.full_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {request.student.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FiGlobe className="text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {request.destinationCountry}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                      {request.visaType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        request.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : request.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : request.status === "completed"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {request.assignedConsultant ? (
                      <div className="flex items-center">
                        <FiUser className="text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {request.assignedConsultant.username}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">
                        Not assigned
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FiClock className="text-gray-400 mr-2" />
                      <span className="text-sm text-gray-500">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-2 py-3 whitespace-nowrap text-center">
                    <div className="flex justify-center items-center space-x-1">
                      {request.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleApprove(request._id)}
                            className="p-1.5 rounded-full bg-green-50 hover:bg-green-100 text-green-600 hover:text-green-800 transition-colors duration-200 group relative"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            <span className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                              Approve
                            </span>
                          </button>

                          <button
                            onClick={() => handleReject(request._id)}
                            className="p-1.5 rounded-full bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-800 transition-colors duration-200 group relative"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                            <span className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                              Reject
                            </span>
                          </button>
                        </>
                      )}

                      {request.status === "rejected" && (
                        <button
                          onClick={() => handleReopen(request._id)}
                          className="p-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-800 transition-colors duration-200 group relative"
                        >
                          <FiRefreshCw className="h-4 w-4" />
                          <span className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                            Reopen
                          </span>
                        </button>
                      )}

                      {(request.status === "approved" ||
                        request.status === "completed") && (
                        <>
                          {/* Show "Assign Consultant" only if no consultant is assigned */}
                          {!request.assignedConsultant && (
                            <button
                              onClick={() => handleAssignConsultant(request)}
                              className="p-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-800 transition-colors duration-200 group relative"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 4v16m8-8H4"
                                />
                              </svg>
                              <span className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                Assign Consultant
                              </span>
                            </button>
                          )}

                          {/* Show "Edit Consultant" only if a consultant is already assigned */}
                          {request.assignedConsultant && (
                            <button
                              onClick={() => handleAssignConsultant(request)}
                              className="p-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-800 transition-colors duration-200 group relative"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15.232 5.232l3.536 3.536M9 13l6.232-6.232a2 2 0 112.828 2.828L11.828 15.828H9v-2.828z"
                                />
                              </svg>
                              <span className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                Edit Consultant
                              </span>
                            </button>
                          )}
                        </>
                      )}

                      <button
                        onClick={() => handleViewRequest(request)}
                        className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors duration-200 group relative"
                      >
                        <FiEye className="h-4 w-4" />
                        <span className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                          View Details
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  No visa requests found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showAssignModal && (
        <AssignConsultantModal
          visaRequest={selectedRequest}
          onClose={() => setShowAssignModal(false)}
          onSuccess={handleAssignmentSuccess}
        />
      )}
    </div>
  );
};

export default VisaRequestsList;
