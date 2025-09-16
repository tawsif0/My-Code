/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  FiSearch,
  FiFilter,
  FiUser,
  FiMail,
  FiGlobe,
  FiClock,
  FiCheck,
  FiX,
  FiEdit,
  FiDownload,
  FiUpload,
  FiChevronDown,
  FiChevronUp,
  FiPlus,
  FiMinus
} from "react-icons/fi";
import UpdateStepModal from "./UpdateStepModal";
import DocumentUploadModal from "./DocumentUploadModal";
import RejectionModal from "./RejectionModal";

const VisaManagement = () => {
  const [assignedRequests, setAssignedRequests] = useState([]);
  const [groupedRequests, setGroupedRequests] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedStep, setSelectedStep] = useState(null);
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [currentDocument, setCurrentDocument] = useState(null);
  const [visaRequest, setVisaRequest] = useState(null);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [currentRejectionData, setCurrentRejectionData] = useState({
    requestId: null,
    documentName: null
  });
  const [expandedRequests, setExpandedRequests] = useState({});
  const [expandedStudents, setExpandedStudents] = useState({});
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'grouped'

  useEffect(() => {
    const fetchAssignedRequests = async () => {
      try {
        const token = localStorage.getItem("empToken");
        const response = await axios.get(
          `${base_url}/api/employee/visa/assigned`,
          {
            headers: {
              "x-auth-token": token
            }
          }
        );
        setAssignedRequests(response.data.requests);
        setGroupedRequests(response.data.groupedRequests || {});

        // Initialize expanded state for each request
        const initialExpandedState = {};
        response.data.requests.forEach((request) => {
          initialExpandedState[request._id] = false;
        });
        setExpandedRequests(initialExpandedState);

        // Initialize expanded state for each student
        const initialStudentExpandedState = {};
        Object.keys(response.data.groupedRequests || {}).forEach(
          (studentId) => {
            initialStudentExpandedState[studentId] = false;
          }
        );
        setExpandedStudents(initialStudentExpandedState);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to fetch assigned requests"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedRequests();
  }, [base_url]);

  const toggleRequestExpansion = (requestId) => {
    setExpandedRequests((prev) => ({
      ...prev,
      [requestId]: !prev[requestId]
    }));
  };

  const toggleStudentExpansion = (studentId) => {
    setExpandedStudents((prev) => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  const handleUpdateStep = (step, requestId) => {
    setSelectedStep({ ...step, requestId });
    setShowUpdateModal(true);
  };

  const handleDocumentUpload = (docName, requestId) => {
    setCurrentDocument(docName);
    setShowUploadModal(true);
    const currentRequest = assignedRequests.find(
      (req) => req._id === requestId
    );
    setVisaRequest(currentRequest);
  };

  const handleUploadSuccess = (document) => {
    setAssignedRequests((prev) =>
      prev.map((req) => {
        if (req._id === visaRequest._id) {
          return {
            ...req,
            documents: req.documents.map((doc) =>
              doc.name === document.name ? document : doc
            )
          };
        }
        return req;
      })
    );
    setShowUploadModal(false);
  };

  const handleUpdateSuccess = (updatedRequest) => {
    setAssignedRequests((prev) =>
      prev.map((req) => (req._id === updatedRequest._id ? updatedRequest : req))
    );
    setShowUpdateModal(false);
  };

  const handleApproveDocument = async (requestId, documentName) => {
    try {
      const token = localStorage.getItem("empToken");
      const response = await axios.put(
        `${base_url}/api/employee/visa/approve-document/${requestId}`,
        { documentName },
        {
          headers: {
            "x-auth-token": token
          }
        }
      );

      setAssignedRequests((prev) =>
        prev.map((req) =>
          req._id === requestId ? response.data.updatedRequest : req
        )
      );
      toast.success("Document approved successfully!");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to approve document"
      );
    }
  };

  const handleRejectDocument = async (requestId, documentName, feedback) => {
    try {
      const token = localStorage.getItem("empToken");
      const response = await axios.put(
        `${base_url}/api/employee/visa/reject-document/${requestId}`,
        { documentName, feedback },
        {
          headers: {
            "x-auth-token": token
          }
        }
      );

      setAssignedRequests((prev) =>
        prev.map((req) =>
          req._id === requestId ? response.data.updatedRequest : req
        )
      );
      toast.success("Document rejected with feedback!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject document");
    }
  };

  const filteredRequests = assignedRequests.filter((request) => {
    const studentName = request.student?.full_name?.toLowerCase() || "";
    const studentEmail = request.student?.email?.toLowerCase() || "";
    const destination = request.destinationCountry?.toLowerCase() || "";

    const searchTermLower = searchTerm.toLowerCase();

    const matchesSearch =
      studentName.includes(searchTermLower) ||
      studentEmail.includes(searchTermLower) ||
      destination.includes(searchTermLower);

    const matchesStatus =
      filterStatus === "all" || request.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const filteredGroupedRequests = Object.keys(groupedRequests).reduce(
    (acc, studentId) => {
      const studentGroup = groupedRequests[studentId];
      const filteredRequests = studentGroup.requests.filter((request) => {
        const matchesStatus =
          filterStatus === "all" || request.status === filterStatus;
        return matchesStatus;
      });

      if (filteredRequests.length > 0) {
        acc[studentId] = {
          ...studentGroup,
          requests: filteredRequests
        };
      }
      return acc;
    },
    {}
  );

  const downloadFile = async (filePath) => {
    try {
      const filename = filePath.split("/").pop();
      const token = localStorage.getItem("empToken");
      const response = await axios.get(
        `${base_url}/api/employee/visa/download/${filename}`,
        {
          responseType: "blob",
          headers: {
            "x-auth-token": token
          }
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Failed to download document");
      console.error("Download error:", error);
    }
  };

  const handleRejectClick = (requestId, documentName) => {
    setCurrentRejectionData({ requestId, documentName });
    setShowRejectionModal(true);
  };

  const handleRejectConfirm = async (feedback) => {
    try {
      await handleRejectDocument(
        currentRejectionData.requestId,
        currentRejectionData.documentName,
        feedback
      );
      setShowRejectionModal(false);
    } catch (error) {
      toast.error("Failed to reject document");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-500"></div>
      </div>
    );
  }

  const renderRequestItem = (request) => {
    const isWorkflowCompleted =
      request.status === "completed" ||
      request.currentStep >= (request.processingSteps?.length || 0);
    return (
      <div
        key={request._id}
        className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-200 mb-4"
      >
        <div
          className="bg-gray-50 px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between cursor-pointer hover:bg-gray-100"
          onClick={() => toggleRequestExpansion(request._id)}
        >
          <div className="flex items-center mb-4 md:mb-0">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold">
              {request.student?.full_name?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div className="ml-4">
              <div className="text-lg font-medium text-gray-900">
                {request.student?.full_name || "Unknown Student"}
              </div>
              <div className="text-sm text-gray-500 flex items-center">
                <FiMail className="mr-1" />{" "}
                {request.student?.email || "No email"}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center">
              <FiGlobe className="text-gray-400 mr-2" />
              <span className="text-sm text-gray-900">
                {request.destinationCountry}
              </span>
            </div>
            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
              {request.visaType} Visa
            </span>
            <span
              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                request.status === "approved"
                  ? "bg-green-100 text-green-800"
                  : request.status === "completed"
                  ? "bg-purple-100 text-purple-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {request.status}
            </span>
            <button className="text-gray-500 hover:text-gray-700">
              {expandedRequests[request._id] ? (
                <FiChevronUp size={20} />
              ) : (
                <FiChevronDown size={20} />
              )}
            </button>
          </div>
        </div>

        {expandedRequests[request._id] && (
          <div className="p-6 border-t border-gray-200">
            <h3 className="font-medium text-gray-800 mb-4">
              Current Step:{" "}
              {request.processingSteps[request.currentStep]?.name ||
                "Completed"}
            </h3>

            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Required Documents
              </h4>
              <div className="space-y-2">
                {request.documents.map((doc, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-2 border border-gray-200 rounded-md"
                  >
                    <div>
                      <p className="font-medium">{doc.name}</p>
                      <p className="text-sm text-gray-600">
                        Status:{" "}
                        <span
                          className={`${
                            doc.status === "approved"
                              ? "text-green-600"
                              : doc.status === "rejected"
                              ? "text-red-600"
                              : "text-yellow-600"
                          }`}
                        >
                          {doc.status}
                        </span>
                      </p>
                      {doc.status === "rejected" && doc.feedback && (
                        <p className="text-sm text-gray-600 mt-1">
                          Feedback: {doc.feedback}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {doc.url && (
                        <button
                          onClick={() => downloadFile(doc.url)}
                          className="text-indigo-600 hover:bg-indigo-50 rounded-full"
                          title="Download"
                        >
                          <FiDownload />
                        </button>
                      )}

                      {!isWorkflowCompleted ? (
                        <>
                          {(doc.status === "pending" ||
                            doc.status === "rejected") && (
                            <button
                              onClick={() =>
                                handleDocumentUpload(doc.name, request._id)
                              }
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                              title={
                                doc.status === "rejected"
                                  ? "Reupload"
                                  : "Upload"
                              }
                            >
                              <FiUpload />
                            </button>
                          )}

                          {doc.status === "approved" && (
                            <button
                              disabled
                              className="p-2 text-gray-400 rounded-full cursor-not-allowed"
                              title="Document already approved"
                            >
                              <FiUpload />
                            </button>
                          )}

                          {doc.status !== "approved" && (
                            <button
                              onClick={() =>
                                handleApproveDocument(request._id, doc.name)
                              }
                              className="p-1 text-green-600 hover:bg-green-50 rounded-full"
                              title="Approve"
                            >
                              <FiCheck />
                            </button>
                          )}

                          {doc.status !== "rejected" && (
                            <button
                              onClick={() =>
                                handleRejectClick(request._id, doc.name)
                              }
                              className="p-1 text-red-600 hover:bg-red-50 rounded-full"
                              title="Reject"
                            >
                              <FiX />
                            </button>
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-gray-400 italic"></span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Processing Steps
              </h4>
              <div className="space-y-2">
                {request.processingSteps.map((step, index) => (
                  <div
                    key={index}
                    className={`p-3 border rounded-md flex justify-between items-center ${
                      index < request.currentStep
                        ? "border-green-200 bg-green-50"
                        : index === request.currentStep
                        ? "border-gray-200 bg-gray-50"
                        : "border-gray-200"
                    }`}
                  >
                    <div>
                      <p className="font-medium">
                        {index + 1}. {step.name}
                        {index < request.currentStep && (
                          <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                            Completed
                          </span>
                        )}
                        {index === request.currentStep && (
                          <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-800 text-xs rounded-full">
                            Current
                          </span>
                        )}
                      </p>
                      {step.notes && (
                        <p className="text-sm text-gray-600 mt-1">
                          Notes: {step.notes}
                        </p>
                      )}
                    </div>

                    {index === request.currentStep && (
                      <button
                        onClick={() => handleUpdateStep(step, request._id)}
                        className="p-1 text-gray-600 hover:bg-gray-50 rounded-full"
                        title="Update Step"
                      >
                        <FiEdit />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div className="w-full pb-6 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900">
            Assigned Visa Requests
          </h1>
          <p className="text-gray-600 mt-2">
            View and manage all your visa requests
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiFilter className="text-gray-400" />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg  focus:border-gray-500 appearance-none"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4 shadow-md ">
        {viewMode === "list" ? (
          filteredRequests.length > 0 ? (
            filteredRequests.map((request) => renderRequestItem(request))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No assigned visa requests found</p>
            </div>
          )
        ) : Object.keys(filteredGroupedRequests).length > 0 ? (
          Object.entries(filteredGroupedRequests).map(([studentId, group]) => (
            <div key={studentId} className="mb-6">
              <div
                className="flex items-center justify-between p-4 bg-gray-100 rounded-lg cursor-pointer mb-2"
                onClick={() => toggleStudentExpansion(studentId)}
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
                    {group.student.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {group.student.full_name}
                    </h3>
                    <p className="text-sm text-gray-600 flex items-center">
                      <FiMail className="mr-1" /> {group.student.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-600 mr-2">
                    {group.requests.length} request
                    {group.requests.length !== 1 ? "s" : ""}
                  </span>
                  <button className="text-gray-500 hover:text-gray-700">
                    {expandedStudents[studentId] ? (
                      <FiMinus size={20} />
                    ) : (
                      <FiPlus size={20} />
                    )}
                  </button>
                </div>
              </div>

              {expandedStudents[studentId] && (
                <div className="pl-4 border-l-2 border-gray-200 ml-5">
                  {group.requests.map((request) => renderRequestItem(request))}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No assigned visa requests found</p>
          </div>
        )}
      </div>

      {showUpdateModal && (
        <UpdateStepModal
          step={selectedStep}
          onClose={() => setShowUpdateModal(false)}
          onSuccess={handleUpdateSuccess}
        />
      )}
      {showUploadModal && visaRequest && (
        <DocumentUploadModal
          documentName={currentDocument}
          visaRequestId={visaRequest._id}
          onClose={() => setShowUploadModal(false)}
          onSuccess={handleUploadSuccess}
        />
      )}
      {showRejectionModal && (
        <RejectionModal
          onClose={() => setShowRejectionModal(false)}
          onConfirm={handleRejectConfirm}
          documentName={currentRejectionData.documentName}
        />
      )}
    </div>
  );
};

export default VisaManagement;
