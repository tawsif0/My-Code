// components/visa/VisaStatus.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  FiUpload,
  FiDownload,
  FiChevronDown,
  FiChevronUp
} from "react-icons/fi";
import DocumentUploadModal from "./DocumentUploadModal";

const VisaStatus = ({ setActiveView }) => {
  const [visaRequests, setVisaRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [currentDocument, setCurrentDocument] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  useEffect(() => {
    const fetchVisaStatus = async () => {
      try {
        const response = await axios.get(
          `${base_url}/api/student/visa/status`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("studentToken")}`
            }
          }
        );

        setVisaRequests(response.data.visaRequests);
        if (response.data.visaRequests.length > 0) {
          setSelectedRequest(response.data.visaRequests[0]);
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to fetch visa status"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchVisaStatus();
  }, [base_url]);

  const handleDocumentUpload = (docName) => {
    setCurrentDocument(docName);
    setShowUploadModal(true);
  };

  const handleUploadSuccess = (document) => {
    setSelectedRequest((prev) => ({
      ...prev,
      documents: prev.documents.map((doc) =>
        doc.name === document.name ? document : doc
      )
    }));

    // Update the request in the visaRequests array
    setVisaRequests((prev) =>
      prev.map((req) =>
        req._id === selectedRequest._id
          ? {
              ...req,
              documents: req.documents.map((doc) =>
                doc.name === document.name ? document : doc
              )
            }
          : req
      )
    );

    setShowUploadModal(false);
  };

  const downloadFile = async (filePath) => {
    try {
      const filename = filePath.split("/").pop();
      const response = await axios.get(
        `${base_url}/api/student/visa/download/${filename}`,
        {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("studentToken")}`
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-500"></div>
      </div>
    );
  }

  if (visaRequests.length === 0) {
    return (
      <div className="max-w-full mx-auto p-6 bg-white rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          No Visa Request Found
        </h2>
        <p className="text-gray-600 mb-6">
          You haven't submitted a visa processing request yet.
        </p>
        <button
          onClick={() => setActiveView("visaRequest")}
          className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Request Visa Processing
        </button>
      </div>
    );
  }

  const progressPercentage =
    selectedRequest.processingSteps.length > 0
      ? (selectedRequest.currentStep / selectedRequest.processingSteps.length) *
        100
      : 0;

  return (
    <div className="w-full mx-auto p-6 bg-white rounded-xl shadow-md">
      {/* Request Selector Dropdown */}
      <div className="mb-6 relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex justify-between items-center w-full px-4 py-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <span className="font-medium">
            {selectedRequest.destinationCountry} - {selectedRequest.visaType}{" "}
            Visa
            <span className="ml-2 text-sm text-gray-600">
              ({new Date(selectedRequest.createdAt).toLocaleDateString()})
            </span>
          </span>
          {dropdownOpen ? <FiChevronUp /> : <FiChevronDown />}
        </button>

        {dropdownOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {visaRequests.map((request) => (
              <div
                key={request._id}
                onClick={() => {
                  setSelectedRequest(request);
                  setDropdownOpen(false);
                }}
                className={`px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors ${
                  request._id === selectedRequest._id ? "bg-gray-200" : ""
                }`}
              >
                <div className="flex justify-between">
                  <span className="font-medium">
                    {request.destinationCountry} - {request.visaType} Visa
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span
                    className={`font-medium ${
                      request.status === "approved"
                        ? "text-green-600"
                        : request.status === "rejected"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {request.status.charAt(0).toUpperCase() +
                      request.status.slice(1)}
                  </span>
                  <span className="text-gray-500">
                    Step {request.currentStep + 1} of{" "}
                    {request.processingSteps.length}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Visa Application Status
        </h2>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            selectedRequest.status === "approved"
              ? "bg-green-100 text-green-800"
              : selectedRequest.status === "rejected"
              ? "bg-red-100 text-red-800"
              : selectedRequest.status === "completed"
              ? "bg-purple-100 text-purple-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {selectedRequest.status.toUpperCase()}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            {selectedRequest.destinationCountry} - {selectedRequest.visaType}{" "}
            Visa
          </span>
          <span className="text-sm font-medium text-gray-700">
            {Math.round(progressPercentage)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-gray-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Consultant and Current Step */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-800 mb-3">
            Assigned Consultant
          </h3>
          {selectedRequest.assignedConsultant ? (
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold mr-3">
                {selectedRequest.assignedConsultant.username
                  .charAt(0)
                  .toUpperCase()}
              </div>
              <div>
                <p className="font-medium">
                  {selectedRequest.assignedConsultant.username}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedRequest.assignedConsultant.email}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Not assigned yet</p>
          )}
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-800 mb-3">Current Step</h3>
          {selectedRequest.processingSteps.length > 0 &&
          selectedRequest.currentStep <
            selectedRequest.processingSteps.length ? (
            <div>
              <p className="font-medium">
                {
                  selectedRequest.processingSteps[selectedRequest.currentStep]
                    .name
                }
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Status:{" "}
                <span className="capitalize">
                  {
                    selectedRequest.processingSteps[selectedRequest.currentStep]
                      .status
                  }
                </span>
              </p>
            </div>
          ) : (
            <p className="text-gray-500">No active step</p>
          )}
        </div>
      </div>

      {/* Required Documents */}
      <div className="mb-8">
        <h3 className="font-medium text-gray-800 mb-4">Required Documents</h3>
        <div className="space-y-3">
          {selectedRequest.documents.map((doc, index) => (
            <div
              key={index}
              className="flex justify-between items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div>
                <p className="font-medium">{doc.name}</p>
                <p className="text-sm text-gray-600">
                  Status:{" "}
                  <span
                    className={`font-medium ${
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
              <div className="flex space-x-2">
                {doc.url && (
                  <button
                    onClick={() => downloadFile(doc.url)}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                    title="Download"
                  >
                    <FiDownload />
                  </button>
                )}

                {(doc.status === "pending" || doc.status === "rejected") && (
                  <button
                    onClick={() => handleDocumentUpload(doc.name)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                    title={doc.status === "rejected" ? "Reupload" : "Upload"}
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
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Processing Steps */}
      <div>
        <h3 className="font-medium text-gray-800 mb-4">Processing Steps</h3>
        <div className="space-y-4">
          {selectedRequest.processingSteps.map((step, index) => (
            <div
              key={index}
              className={`p-4 border rounded-lg transition-colors ${
                index < selectedRequest.currentStep
                  ? "border-green-200 bg-green-50"
                  : index === selectedRequest.currentStep
                  ? "border-gray-200 bg-gray-50"
                  : "border-gray-200"
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium flex items-center">
                    {index + 1}. {step.name}
                    {index < selectedRequest.currentStep && (
                      <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                        Completed
                      </span>
                    )}
                    {index === selectedRequest.currentStep && (
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
                <span className="text-sm text-gray-500">
                  {step.completedAt
                    ? new Date(step.completedAt).toLocaleDateString()
                    : "-"}
                </span>
              </div>
              {step.requiredDocuments && step.requiredDocuments.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-medium text-gray-500 mb-1">
                    Required Documents:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {step.requiredDocuments.map((doc, docIndex) => (
                      <span
                        key={docIndex}
                        className="px-2 py-0.5 bg-gray-100 text-gray-800 text-xs rounded"
                      >
                        {doc}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Document Upload Modal */}
      {showUploadModal && (
        <DocumentUploadModal
          documentName={currentDocument}
          visaRequestId={selectedRequest._id}
          onClose={() => setShowUploadModal(false)}
          onSuccess={handleUploadSuccess}
        />
      )}
    </div>
  );
};

export default VisaStatus;
