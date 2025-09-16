/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  FiDownload,
  FiUpload,
  FiCheck,
  FiX,
  FiEdit,
  FiChevronDown,
  FiChevronUp,
  FiMail,
  FiGlobe,
  FiClock,
  FiUser
} from "react-icons/fi";
import UpdateStepModal from "./UpdateStepModal";
import DocumentUploadModal from "./DocumentUploadModal";
import RejectionModal from "./RejectionModal";

const VisaManagement = ({ requestData, onUpdate }) => {
  const [request, setRequest] = useState(requestData);

  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedStep, setSelectedStep] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [currentDocument, setCurrentDocument] = useState(null);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [currentRejectionData, setCurrentRejectionData] = useState({
    documentName: null
  });
  const [expanded, setExpanded] = useState({
    documents: true,
    steps: true
  });
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  useEffect(() => {
    setRequest(requestData);
  }, [requestData]);

  const handleUpdateStep = (step) => {
    setSelectedStep(step);
    setShowUpdateModal(true);
  };

  const handleDocumentUpload = (docName) => {
    setCurrentDocument(docName);
    setShowUploadModal(true);
  };

  const handleUploadSuccess = (updatedDoc) => {
    setRequest((prev) => {
      if (!prev) return prev;
      const next = {
        ...prev,
        documents: prev.documents.map((d) =>
          d.name === updatedDoc.name ? updatedDoc : d
        )
      };
      // notify parent if needed
      if (onUpdate) onUpdate(next);
      return next;
    });
    setShowUploadModal(false);
  };

  const handleUpdateSuccess = (updatedRequest) => {
    setRequest(updatedRequest);
    if (onUpdate) onUpdate(updatedRequest);
    setShowUpdateModal(false);
  };

  const handleApproveDocument = async (documentName) => {
    try {
      const response = await axios.put(
        `${base_url}/api/admin/visa/approve-document/${request._id}`,
        { documentName },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      setRequest(response.data.updatedRequest);
      if (onUpdate) onUpdate(response.data.updatedRequest);
      toast.success("Document approved successfully!");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to approve document"
      );
    }
  };

  const handleRejectDocument = async (documentName, feedback) => {
    try {
      const response = await axios.put(
        `${base_url}/api/admin/visa/reject-document/${request._id}`,
        { documentName, feedback },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      setRequest(response.data.updatedRequest);
      if (onUpdate) onUpdate(response.data.updatedRequest);
      toast.success("Document rejected with feedback!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject document");
    }
  };

  const downloadFile = async (filePath) => {
    try {
      const filename = filePath.split("/").pop();
      const response = await axios.get(
        `${base_url}/api/admin/visa/download/${filename}`,
        {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
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

  const handleRejectClick = (documentName) => {
    setCurrentRejectionData({ documentName });
    setShowRejectionModal(true);
  };

  const handleRejectConfirm = async (feedback) => {
    try {
      await handleRejectDocument(currentRejectionData.documentName, feedback);
      setShowRejectionModal(false);
    } catch (error) {
      toast.error("Failed to reject document");
    }
  };

  const toggleSection = (section) => {
    setExpanded((prev) => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (!request) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-500"></div>
      </div>
    );
  }
  const isWorkflowCompleted =
    request.status === "completed" ||
    request.currentStep >= (request.processingSteps?.length || 0);
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div className="flex items-center mb-4 md:mb-0">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold">
            {request.student?.full_name?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <div className="ml-4">
            <h2 className="text-xl font-bold text-gray-800">
              {request.student?.full_name || "Unknown Student"}
            </h2>
            <div className="flex items-center text-sm text-gray-500">
              <FiMail className="mr-1" />
              {request.student?.email || "No email"}
              {request.assignedConsultant && (
                <span className="ml-4 flex items-center">
                  <FiUser className="mr-1" />
                  {request.assignedConsultant.username}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
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
                : request.status === "rejected"
                ? "bg-red-100 text-red-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {request.status}
          </span>
          <div className="flex items-center">
            <FiClock className="text-gray-400 mr-1" />
            <span className="text-xs text-gray-500">
              {new Date(request.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Documents Section */}
      <div className="mb-8">
        <div
          className="flex items-center justify-between cursor-pointer mb-2"
          onClick={() => toggleSection("documents")}
        >
          <h3 className="text-lg font-medium text-gray-800">
            Required Documents
          </h3>
          <button className="text-gray-500 hover:text-gray-700">
            {expanded.documents ? <FiChevronUp /> : <FiChevronDown />}
          </button>
        </div>

        {expanded.documents && (
          <div className="space-y-3">
            {request.documents.map((doc, index) => (
              <div
                key={index}
                className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{doc.name}</p>
                    <p className="text-sm text-gray-600 mt-1">
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
                      {doc.uploadedAt && (
                        <span className="ml-3 text-gray-500">
                          <FiClock className="inline mr-1" />
                          {new Date(doc.uploadedAt).toLocaleDateString()}
                        </span>
                      )}
                    </p>
                    {doc.feedback && (
                      <p className="text-sm text-gray-600 mt-1">
                        Feedback: {doc.feedback}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    {doc.url && (
                      <button
                        onClick={() => downloadFile(doc.url)}
                        className="p-1 text-indigo-600 hover:bg-indigo-50 rounded-full"
                        title="Download"
                      >
                        <FiDownload size={18} />
                      </button>
                    )}

                    {!isWorkflowCompleted ? (
                      <>
                        {(doc.status === "pending" ||
                          doc.status === "rejected") && (
                          <button
                            onClick={() => handleDocumentUpload(doc.name)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded-full"
                            title={
                              doc.status === "rejected" ? "Reupload" : "Upload"
                            }
                          >
                            <FiUpload size={18} />
                          </button>
                        )}

                        {doc.status !== "approved" && (
                          <button
                            onClick={() => handleApproveDocument(doc.name)}
                            className="p-1 text-green-600 hover:bg-green-50 rounded-full"
                            title="Approve"
                          >
                            <FiCheck size={18} />
                          </button>
                        )}

                        {doc.status !== "rejected" && (
                          <button
                            onClick={() => handleRejectClick(doc.name)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded-full"
                            title="Reject"
                          >
                            <FiX size={18} />
                          </button>
                        )}
                      </>
                    ) : (
                      <span className="text-xs text-gray-400 italic"></span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Processing Steps Section */}
      <div>
        <div
          className="flex items-center justify-between cursor-pointer mb-2"
          onClick={() => toggleSection("steps")}
        >
          <h3 className="text-lg font-medium text-gray-800">
            Processing Steps
            <span className="ml-2 text-sm font-normal text-gray-500">
              (Current:{" "}
              {request.processingSteps[request.currentStep]?.name ||
                "Completed"}
              )
            </span>
          </h3>
          <button className="text-gray-500 hover:text-gray-700">
            {expanded.steps ? <FiChevronUp /> : <FiChevronDown />}
          </button>
        </div>

        {expanded.steps && (
          <div className="space-y-3">
            {request.processingSteps.map((step, index) => (
              <div
                key={index}
                className={`p-4 border rounded-lg ${
                  index < request.currentStep
                    ? "border-green-200 bg-green-50"
                    : index === request.currentStep
                    ? "border-blue-200 bg-blue-50"
                    : "border-gray-200"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">
                      {index + 1}. {step.name}
                      {index < request.currentStep && (
                        <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                          Completed
                        </span>
                      )}
                      {index === request.currentStep && (
                        <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                          Current
                        </span>
                      )}
                      {step.completedAt && (
                        <span className="ml-2 text-xs text-gray-500">
                          <FiClock className="inline mr-1" />
                          {new Date(step.completedAt).toLocaleDateString()}
                        </span>
                      )}
                    </p>
                    {step.notes && (
                      <p className="text-sm text-gray-600 mt-1">
                        Notes: {step.notes}
                      </p>
                    )}
                    {step.requiredDocuments?.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        Required documents: {step.requiredDocuments.join(", ")}
                      </p>
                    )}
                  </div>
                  {index === request.currentStep && (
                    <button
                      onClick={() => handleUpdateStep(step)}
                      className="p-1 text-gray-600 hover:bg-gray-100 rounded-full"
                      title="Update Step"
                    >
                      <FiEdit size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showUpdateModal && (
        <UpdateStepModal
          step={selectedStep}
          visaRequestId={request._id}
          onClose={() => setShowUpdateModal(false)}
          onSuccess={handleUpdateSuccess}
        />
      )}
      {showUploadModal && (
        <DocumentUploadModal
          documentName={currentDocument}
          visaRequestId={request._id}
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
