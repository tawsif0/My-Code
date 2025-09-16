import React, { useState, useEffect } from "react";
import axios from "axios";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import {
  FiX,
  FiUser,
  FiMail,
  FiPhone,
  FiCalendar,
  FiBook,
  FiDollarSign,
  FiEdit,
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
  FiAlertTriangle,
} from "react-icons/fi";
import { toast } from "react-hot-toast";
const ConsultationManagement = () => {
  const [consultations, setConsultations] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState("");

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [currentConsultation, setCurrentConsultation] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  // Fetch consultations
  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:3500/api/admin/consultancy",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setConsultations(response.data.data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to fetch consultations"
        );
      } finally {
        setLoading(false);
      }
    };

    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:3500/api/admin/employees",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setEmployees(
          response.data.data.filter((emp) => emp.role === "consultant")
        );
      } catch (err) {
        console.error("Error fetching employees:", err);
      }
    };

    fetchConsultations();
    fetchEmployees();
  }, []);

  const handleAssignConsultation = async () => {
    if (!selectedEmployee || !selectedConsultation) return;

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:3500/api/admin/consultancy/${selectedConsultation}/assign`,
        { employeeId: selectedEmployee },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update local state
      setConsultations((prev) =>
        prev.map((cons) =>
          cons._id === selectedConsultation
            ? {
                ...cons,
                assignedTo: employees.find((e) => e._id === selectedEmployee),
                status: "assigned",
              }
            : cons
        )
      );
      toast.success("Assigned Consultant Successfully");
      setAssignModalOpen(false);
      setSelectedConsultation(null);
      setSelectedEmployee("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to assign consultation");
    }
  };
  const handleStatusUpdate = async (consultationId, newStatus) => {
    try {
      setIsUpdatingStatus(true);
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:3500/api/admin/consultancy/${consultationId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update local state
      setConsultations((prev) =>
        prev.map((cons) =>
          cons._id === consultationId ? response.data.data : cons
        )
      );
      toast.success(`Consultation marked as ${newStatus}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "assigned":
        return "bg-gray-800 text-gray-100";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  const handleViewConsultation = (consultation) => {
    setCurrentConsultation(consultation);
    setViewModalOpen(true);
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-16 h-16 border-4 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="p-6 max-w-full bg-white rounded-xl shadow-md">
          <div className="text-red-500 text-center">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition duration-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br p-4 md:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="w-full mb-8 pb-6 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900">
            Consultation Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage and assign client consultations to your team
          </p>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {["pending", "assigned", "completed", "cancelled"].map((status) => (
          <motion.div
            key={status}
            whileHover={{ scale: 1.03 }}
            className="bg-white rounded-xl shadow-sm p-4 border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                  {status}
                </p>
                <p className="text-2xl font-semibold text-gray-800">
                  {consultations.filter((c) => c.status === status).length}
                </p>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  status
                )}`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Consultations Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Country
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Study Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {consultations.map((consultation) => (
                <tr
                  key={consultation._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-500 flex items-center justify-center text-white font-semibold">
                        {consultation.fullName.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {consultation.fullName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(
                            consultation.createdAt
                          ).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {consultation.email}
                    </div>
                    <div className="text-sm text-gray-500">
                      {consultation.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {consultation.countries && consultation.countries.length > 0
                      ? consultation.countries.join(", ")
                      : "Not specified"}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {consultation.studyLevel}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                        consultation.status
                      )}`}
                    >
                      {consultation.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {consultation.assignedTo ? (
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-semibold">
                          {consultation.assignedTo.username.charAt(0)}
                        </div>
                        <div className="ml-2">
                          <div className="text-sm font-medium text-gray-900">
                            {consultation.assignedTo.username}
                          </div>
                          <div className="text-xs text-gray-500">
                            {consultation.assignedTo.email}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">
                        Not assigned
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleViewConsultation(consultation)}
                      className="bg-black text-white font-bold py-2 px-4 rounded-full transform transition-all duration-300 hover:scale-105 hover:bg-white hover:text-black hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 active:scale-95"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
      {viewModalOpen && currentConsultation && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-200"
          >
            {/* Modal Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                    Consultation Details
                  </h3>
                  <div className="flex items-center mt-2 space-x-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        currentConsultation.status
                      )}`}
                    >
                      {currentConsultation.status.charAt(0).toUpperCase() +
                        currentConsultation.status.slice(1)}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">
                      {new Date(
                        currentConsultation.createdAt
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setViewModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-900"
                  aria-label="Close modal"
                >
                  <FiX size={24} className="stroke-2" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Client Card */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="p-5 md:p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-gray-100 p-2 rounded-lg mr-3">
                      <FiUser className="text-gray-700 h-5 w-5" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      Client Information
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Full Name
                      </p>
                      <p className="text-gray-900 font-medium text-lg">
                        {currentConsultation.fullName}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </p>
                      <a
                        href={`mailto:${currentConsultation.email}`}
                        className="text-gray-900 font-medium text-lg hover:underline flex items-center"
                      >
                        <FiMail className="mr-2 text-gray-600" />
                        {currentConsultation.email}
                      </a>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone
                      </p>
                      <a
                        href={`tel:${currentConsultation.phone}`}
                        className="text-gray-900 font-medium text-lg hover:underline flex items-center"
                      >
                        <FiPhone className="mr-2 text-gray-600" />
                        {currentConsultation.phone || "Not provided"}
                      </a>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Submission Date
                      </p>
                      <p className="text-gray-900 font-medium text-lg flex items-center">
                        <FiCalendar className="mr-2 text-gray-600" />
                        {new Date(
                          currentConsultation.createdAt
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Study Details Card */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="p-5 md:p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-gray-100 p-2 rounded-lg mr-3">
                      <FiBook className="text-gray-700 h-5 w-5" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      Study Preferences
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {currentConsultation.countries &&
                        currentConsultation.countries.length === 1
                          ? "Target Country"
                          : "Target Countries"}
                      </p>
                      <p className="text-gray-900 font-medium text-lg">
                        {currentConsultation.countries &&
                        currentConsultation.countries.length > 0
                          ? currentConsultation.countries.join(", ")
                          : "Not specified"}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Study Level
                      </p>
                      <p className="text-gray-900 font-medium text-lg">
                        {currentConsultation.studyLevel}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Preferred Intake
                      </p>
                      <p className="text-gray-900 font-medium text-lg">
                        {currentConsultation.intake}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Funding Source
                      </p>
                      <p className="text-gray-900 font-medium text-lg">
                        <FiDollarSign className="inline mr-2 text-gray-600" />
                        {currentConsultation.sponsor}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Consultant Assignment Card */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="p-5 md:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="bg-gray-100 p-2 rounded-lg mr-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-gray-700"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        Consultant Assignment
                      </h4>
                    </div>
                    {currentConsultation.assignedTo && (
                      <button
                        onClick={() => {
                          setViewModalOpen(false);
                          setSelectedConsultation(currentConsultation._id);
                          setAssignModalOpen(true);
                        }}
                        className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
                      >
                        <FiEdit className="mr-1" />
                        Reassign
                      </button>
                    )}
                  </div>
                  {currentConsultation.assignedTo ? (
                    <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                      <div className="h-12 w-12 rounded-full bg-gray-800 flex items-center justify-center text-white font-bold text-lg">
                        {currentConsultation.assignedTo.username
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <h5 className="text-lg font-semibold text-gray-900">
                          {currentConsultation.assignedTo.username}
                        </h5>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                          <p className="text-gray-600 flex items-center">
                            <FiMail className="mr-1.5 flex-shrink-0" />
                            {currentConsultation.assignedTo.email}
                          </p>
                          {currentConsultation.assignedTo.phoneNumber && (
                            <p className="text-gray-600 flex items-center">
                              <FiPhone className="mr-1.5 flex-shrink-0" />
                              {currentConsultation.assignedTo.phoneNumber}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                          />
                        </svg>
                      </div>
                      <p className="text-gray-700 font-medium">
                        No consultant assigned yet
                      </p>
                      <p className="text-gray-500 text-sm mt-1">
                        Assign a consultant to handle this case
                      </p>
                      <button
                        onClick={() => {
                          setViewModalOpen(false);
                          setSelectedConsultation(currentConsultation._id);
                          setAssignModalOpen(true);
                        }}
                        className="mt-3 px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        Assign Consultant
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Consultation Actions */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="p-5 md:p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Consultation Actions
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {currentConsultation.status === "pending" ||
                    currentConsultation.status === "assigned" ? (
                      <>
                        <button
                          onClick={() => {
                            setSelectedConsultation(currentConsultation._id);
                            setCancelModalOpen(true);
                          }}
                          disabled={isUpdatingStatus}
                          className={`px-4 py-2.5 bg-white border border-gray-300 hover:border-gray-400 text-gray-800 rounded-lg text-sm font-medium flex items-center transition-colors shadow-sm hover:shadow-md ${
                            isUpdatingStatus
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          <FiXCircle className="mr-2 text-red-600" />
                          Cancel Consultation
                        </button>

                        <button
                          onClick={() =>
                            handleStatusUpdate(
                              currentConsultation._id,
                              "completed"
                            )
                          }
                          disabled={isUpdatingStatus}
                          className={`px-4 py-2.5 bg-white border border-gray-300 hover:border-gray-400 text-gray-800 rounded-lg text-sm font-medium flex items-center transition-colors shadow-sm hover:shadow-md ${
                            isUpdatingStatus
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          <FiCheckCircle className="mr-2 text-green-600" />
                          Mark as Completed
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() =>
                          handleStatusUpdate(
                            currentConsultation._id,
                            "assigned"
                          )
                        }
                        disabled={isUpdatingStatus}
                        className={`px-4 py-2.5 bg-white border border-gray-300 hover:border-gray-400 text-gray-800 rounded-lg text-sm font-medium flex items-center transition-colors shadow-sm hover:shadow-md ${
                          isUpdatingStatus
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <FiRefreshCw className="mr-2 text-blue-600" />
                        Reopen Consultation
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Show cancellation reason if cancelled */}
              {currentConsultation.status === "cancelled" &&
                currentConsultation.cancellationReason && (
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="p-5 md:p-6">
                      <div className="flex items-center mb-4">
                        <div className="bg-red-100 p-2 rounded-lg mr-3">
                          <FiAlertTriangle className="text-red-600 h-5 w-5" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900">
                          Cancellation Reason
                        </h4>
                      </div>
                      <div className="p-4 bg-red-50 rounded-lg border border-red-200 text-red-800">
                        {currentConsultation.cancellationReason}
                      </div>
                    </div>
                  </div>
                )}

              {/* Additional Notes */}
              {currentConsultation.message && (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="p-5 md:p-6">
                    <div className="flex items-center mb-4">
                      <div className="bg-gray-100 p-2 rounded-lg mr-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-gray-700"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        Additional Notes
                      </h4>
                    </div>
                    <div className="prose prose-sm max-w-none p-4 bg-gray-50 rounded-lg border border-gray-200">
                      {currentConsultation.message}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
      {/* Cancel Confirmation Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Cancel Consultation
              </h3>
              <button
                onClick={() => setCancelModalOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <FiX className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-gray-600">
                Please provide a reason for cancelling this consultation:
              </p>

              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                rows={4}
                placeholder="Enter cancellation reason..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  onClick={() => setCancelModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-800 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    try {
                      setIsUpdatingStatus(true);
                      const token = localStorage.getItem("token");

                      const response = await axios.put(
                        `http://localhost:3500/api/admin/consultancy/${selectedConsultation}/cancel`,
                        { cancellationReason: cancelReason }, // <- data body
                        {
                          headers: {
                            Authorization: `Bearer ${token}`,
                          },
                        }
                      );

                      if (response.data.success) {
                        setCurrentConsultation(response.data.data);
                        setCancelModalOpen(false);
                        setCancelReason("");
                        toast.success("Consultation cancelled successfully");
                      }
                    } catch (error) {
                      toast.error(
                        error.response?.data?.message ||
                          "Failed to cancel consultation"
                      );
                    } finally {
                      setIsUpdatingStatus(false);
                    }
                  }}
                  disabled={!cancelReason || isUpdatingStatus}
                  className={`px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors ${
                    !cancelReason || isUpdatingStatus
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {isUpdatingStatus ? "Processing..." : "Confirm Cancellation"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      {/* Assign Modal */}
      {assignModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-md"
          >
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Assign Consultation
              </h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Consultant
                </label>
                <select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
                >
                  <option value="">Select a consultant</option>
                  {employees.map((employee) => (
                    <option key={employee._id} value={employee._id}>
                      {employee.username} ({employee.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setAssignModalOpen(false);
                    setSelectedConsultation(null);
                    setSelectedEmployee("");
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignConsultation}
                  disabled={!selectedEmployee}
                  className={`px-4 py-2 rounded-md text-sm font-medium text-white ${
                    selectedEmployee
                      ? "bg-gray-600 hover:bg-gray-700"
                      : "bg-gray-300 cursor-not-allowed"
                  }`}
                >
                  Assign
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ConsultationManagement;
