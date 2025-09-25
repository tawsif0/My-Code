/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import {
  FiUsers,
  FiBarChart2,
  FiTrendingUp,
  FiCalendar,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiFileText,
  FiDollarSign,
  FiStar,
  FiAward,
  FiTarget,
  FiEye,
  FiEdit,
  FiRefreshCw,
  FiFilter,
} from "react-icons/fi";

const EmployeeAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [visaRequests, setVisaRequests] = useState([]);
  const [timeRange, setTimeRange] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [pagination, setPagination] = useState(null);

  const base_url =
    import.meta.env.VITE_API_KEY_Base_URL || "http://localhost:3500";

  // API call helper
  const apiCall = async (endpoint, options = {}) => {
    const response = await fetch(
      `${base_url}/api/employee/analytics/${endpoint}`,
      {
        headers: {
          "x-auth-token": localStorage.getItem("empToken"),
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  };

  // Fetch analytics data
  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await apiCall(`dashboard?period=${timeRange}`);
      setAnalyticsData(response);
    } catch (err) {
      console.error("Error fetching analytics data:", err);
      setError("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  // Fetch consultations
  const fetchConsultations = async (page = 1, status = "") => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(status && { status }),
      });

      const response = await apiCall(`my-consultations?${queryParams}`);
      setConsultations(response.data);
      setPagination(response.pagination);
    } catch (err) {
      console.error("Error fetching consultations:", err);
      setError("Failed to load consultations");
    } finally {
      setLoading(false);
    }
  };

  // Fetch visa requests
  const fetchVisaRequests = async (page = 1, status = "") => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(status && { status }),
      });

      const response = await apiCall(`my-visa-requests?${queryParams}`);
      setVisaRequests(response.data);
      setPagination(response.pagination);
    } catch (err) {
      console.error("Error fetching visa requests:", err);
      setError("Failed to load visa requests");
    } finally {
      setLoading(false);
    }
  };

  // Update status
  const updateStatus = async (type, id, status, notes = "") => {
    try {
      const endpoint =
        type === "consultation"
          ? `consultations/${id}/status`
          : `visa-requests/${id}/status`;
      await apiCall(endpoint, {
        method: "PUT",
        body: JSON.stringify({ status, notes }),
      });

      // Refresh data
      if (type === "consultation") {
        fetchConsultations(currentPage, statusFilter);
      } else {
        fetchVisaRequests(currentPage, statusFilter);
      }
    } catch (err) {
      console.error(`Error updating ${type} status:`, err);
      alert(`Failed to update ${type} status`);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  useEffect(() => {
    if (activeTab === "consultations") {
      fetchConsultations(currentPage, statusFilter);
    } else if (activeTab === "visa") {
      fetchVisaRequests(currentPage, statusFilter);
    }
  }, [activeTab, currentPage, statusFilter]);

  // Helper function to get status color
  const getStatusColor = (status) => {
    const colors = {
      pending: "yellow",
      confirmed: "blue",
      completed: "green",
      cancelled: "red",
      in_review: "orange",
      approved: "green",
      rejected: "red",
    };
    return colors[status] || "gray";
  };

  // Loading component
  const renderLoading = () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-2 border-gray-200 border-t-2 border-t-black rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );

  // Error component
  const renderError = () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-500 text-lg mb-4">{error}</p>
        <button
          onClick={() => {
            setError(null);
            fetchAnalyticsData();
          }}
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  );

  // Overview Stats Cards
  const OverviewStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
      {/* Total Consultations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0 * 0.1 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">
              Total Consultations
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {analyticsData?.consultations?.total || 0}
            </p>
            <div className="flex items-center mt-2 space-x-2">
              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                {analyticsData?.consultations?.completed || 0} completed
              </span>
            </div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <FiUsers className="text-2xl text-gray-600" />
          </div>
        </div>
      </motion.div>

      {/* Total Visa Requests */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Visa Requests</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {analyticsData?.visaRequests?.total || 0}
            </p>
            <div className="flex items-center mt-2 space-x-2">
              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                {analyticsData?.visaRequests?.completed} Completed
              </span>
            </div>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <FiFileText className="text-2xl text-green-600" />
          </div>
        </div>
      </motion.div>
    </div>
  );

  // Status Breakdown Section
  const StatusBreakdown = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Consultations Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Consultations Status
        </h3>
        <div className="space-y-3">
          {[
            {
              status: "completed",
              label: "Completed",
              count: analyticsData?.consultations?.completed || 0,
            },
            {
              status: "cancelled",
              label: "Cancelled",
              count: analyticsData?.consultations?.cancelled || 0,
            },
          ].map((item) => (
            <div
              key={item.status}
              className="flex items-center justify-between"
            >
              <div className="flex items-center">
                <div
                  className={`w-3 h-3 rounded-full bg-${getStatusColor(
                    item.status
                  )}-500 mr-3`}
                ></div>
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {item.label}
                </span>
              </div>
              <span className="text-sm font-bold text-gray-900">
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Visa Requests Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Visa Requests Status
        </h3>
        <div className="space-y-3">
          {[
            {
              status: "approved",
              label: "Approved",
              count: analyticsData?.visaRequests?.approved || 0,
            },
            {
              status: "completed",
              label: "Completed",
              count: analyticsData?.visaRequests?.completed || 0,
            },
          ].map((item) => (
            <div
              key={item.status}
              className="flex items-center justify-between"
            >
              <div className="flex items-center">
                <div
                  className={`w-3 h-3 rounded-full bg-${getStatusColor(
                    item.status
                  )}-500 mr-3`}
                ></div>
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {item.label}
                </span>
              </div>
              <span className="text-sm font-bold text-gray-900">
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );

  // Recent Activity Section
  const RecentActivity = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:border-gray-500"
        >
          <option value="all">All Time</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      <div className="space-y-4">
        {/* Recent Consultations */}
        <div>
          <h4 className="font-medium text-gray-700 mb-3 flex items-center">
            <FiUsers className="mr-2 text-gray-600" />
            Recent Consultations
          </h4>
          <div className="space-y-3">
            {analyticsData?.recentActivity?.consultations?.map(
              (consultation) => (
                <div
                  key={consultation._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center">
                    <div
                      className={`w-2 h-2 rounded-full bg-${getStatusColor(
                        consultation.status
                      )}-500 mr-3`}
                    ></div>
                    <span className="text-sm text-gray-700 capitalize">
                      {consultation.fullName || "Client"} -{" "}
                      {consultation.status}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(consultation.createdAt).toLocaleDateString()}
                  </span>
                </div>
              )
            )}
            {(!analyticsData?.recentActivity?.consultations ||
              analyticsData.recentActivity.consultations.length === 0) && (
              <p className="text-sm text-gray-500 text-center py-2">
                No recent consultations
              </p>
            )}
          </div>
        </div>

        {/* Recent Visa Requests */}
        <div>
          <h4 className="font-medium text-gray-700 mb-3 flex items-center">
            <FiFileText className="mr-2 text-green-600" />
            Recent Visa Requests
          </h4>
          <div className="space-y-3">
            {analyticsData?.recentActivity?.visaRequests.map((request) => (
              <div
                key={request._id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center">
                  <div
                    className={`w-2 h-2 rounded-full bg-${getStatusColor(
                      request.status
                    )}-500 mr-3`}
                  ></div>
                  <span className="text-sm text-gray-700 capitalize">
                    {request.student?.full_name || "Student"} -{" "}
                    {request.visaType} - {request.status}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(request.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
            {(!analyticsData?.recentActivity?.visaRequests ||
              analyticsData.recentActivity.visaRequests.length === 0) && (
              <p className="text-sm text-gray-500 text-center py-2">
                No recent visa requests
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );

  // Consultations List
  const ConsultationsList = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          My Consultations
        </h3>
        <div className="flex items-center space-x-4">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:border-gray-500"
          >
            <option value="">All Status</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button
            onClick={() => fetchConsultations(currentPage, statusFilter)}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            <FiRefreshCw />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {consultations.map((consultation) => (
          <div
            key={consultation._id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-3 h-3 rounded-full bg-${getStatusColor(
                    consultation.status
                  )}-500`}
                ></div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    {consultation.fullName || "Unknown Client"}
                  </h4>
                  <p className="text-sm text-gray-500">{consultation.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full bg-${getStatusColor(
                    consultation.status
                  )}-100 text-${getStatusColor(consultation.status)}-800`}
                >
                  {consultation.status}
                </span>
                <div className="flex space-x-1">
                  {consultation.status === "pending" && (
                    <>
                      <button
                        onClick={() =>
                          updateStatus(
                            "consultation",
                            consultation._id,
                            "confirmed"
                          )
                        }
                        className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() =>
                          updateStatus(
                            "consultation",
                            consultation._id,
                            "cancelled"
                          )
                        }
                        className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {consultation.status === "confirmed" && (
                    <button
                      onClick={() =>
                        updateStatus(
                          "consultation",
                          consultation._id,
                          "completed"
                        )
                      }
                      className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Complete
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-3 text-sm text-gray-600">
              <p>
                Created: {new Date(consultation.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex justify-between items-center mt-6">
          <p className="text-sm text-gray-600">
            Showing {(currentPage - 1) * pagination.itemsPerPage + 1} to{" "}
            {Math.min(
              currentPage * pagination.itemsPerPage,
              pagination.totalItems
            )}{" "}
            of {pagination.totalItems} results
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm bg-gray-500 text-white rounded">
              {currentPage}
            </span>
            <button
              onClick={() =>
                setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))
              }
              disabled={currentPage === pagination.totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );

  // Visa Requests List
  const VisaRequestsList = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          My Visa Requests
        </h3>
        <div className="flex items-center space-x-4">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:border-gray-500"
          >
            <option value="">All Status</option>
            <option value="approved">Approved</option>
            <option value="completed">Completed</option>
          </select>
          <button
            onClick={() => fetchVisaRequests(currentPage, statusFilter)}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            <FiRefreshCw />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {visaRequests.map((request) => (
          <div
            key={request._id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-3 h-3 rounded-full bg-${getStatusColor(
                    request.status
                  )}-500`}
                ></div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    {request.student?.full_name || "Unknown Student"}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {request.student?.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full bg-${getStatusColor(
                    request.status
                  )}-100 text-${getStatusColor(request.status)}-800`}
                >
                  {request.status}
                </span>
                <div className="flex space-x-1">
                  {request.status === "pending" && (
                    <button
                      onClick={() =>
                        updateStatus("visa", request._id, "in_review")
                      }
                      className="px-3 py-1 text-xs bg-orange-500 text-white rounded hover:bg-orange-600"
                    >
                      Review
                    </button>
                  )}
                  {request.status === "in_review" && (
                    <>
                      <button
                        onClick={() =>
                          updateStatus("visa", request._id, "approved")
                        }
                        className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() =>
                          updateStatus("visa", request._id, "rejected")
                        }
                        className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {request.status === "approved" && (
                    <button
                      onClick={() =>
                        updateStatus("visa", request._id, "completed")
                      }
                      className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                      Complete
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-3 text-sm text-gray-600">
              <p>
                Visa Type:{" "}
                <span className="font-medium">{request.visaType}</span>
              </p>
              <p>
                Destination:{" "}
                <span className="font-medium">
                  {request.destinationCountry}
                </span>
              </p>
              <p>Created: {new Date(request.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex justify-between items-center mt-6">
          <p className="text-sm text-gray-600">
            Showing {(currentPage - 1) * pagination.itemsPerPage + 1} to{" "}
            {Math.min(
              currentPage * pagination.itemsPerPage,
              pagination.totalItems
            )}{" "}
            of {pagination.totalItems} results
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm bg-gray-500 text-white rounded">
              {currentPage}
            </span>
            <button
              onClick={() =>
                setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))
              }
              disabled={currentPage === pagination.totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );

  // Main component return
  if (loading) return renderLoading();
  if (error) return renderError();
  if (!analyticsData) return renderError();

  return (
    <div className="min-h-screen">
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Employee Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Track your performance and manage your workload efficiently
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-2">
            {["overview", "consultations", "visa"].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setCurrentPage(1);
                  setStatusFilter("");
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? "bg-black text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        {activeTab === "overview" && (
          <>
            <OverviewStats />
            <StatusBreakdown />
            <RecentActivity />
          </>
        )}

        {activeTab === "consultations" && <ConsultationsList />}

        {activeTab === "visa" && <VisaRequestsList />}
      </div>
    </div>
  );
};

export default EmployeeAnalytics;
