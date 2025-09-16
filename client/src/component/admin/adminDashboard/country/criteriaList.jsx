import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

function CriteriaList() {
  const [criterias, setCriterias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");

  const token = localStorage.getItem("token");
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const fetchCriterias = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:3500/api/criterias",
        { headers: authHeaders }
      );
      setCriterias(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching criterias:", err);
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to load criterias"
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCriterias();

    // Listen for custom event when criteria is created/updated
    const handleCriteriaUpdate = () => {
      console.log("Criteria updated event received");
      fetchCriterias();
    };

    window.addEventListener('criteriaUpdated', handleCriteriaUpdate);

    // Cleanup event listener
    return () => {
      window.removeEventListener('criteriaUpdated', handleCriteriaUpdate);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id) => {
    const toastId = toast.loading("Deleting criteria...");
    try {
      await axios.delete(`http://localhost:3500/api/criterias/${id}`, {
        headers: authHeaders,
      });
      toast.success("Criteria deleted", { id: toastId });
      fetchCriterias();
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || "Failed to delete",
        { id: toastId }
      );
    }
  };

  const startEditing = (criteria) => {
    setEditingId(criteria._id);
    setEditName(criteria.name);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditName("");
    toast("Edit cancelled");
  };

  const handleUpdate = async (id) => {
    if (!editName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    const toastId = toast.loading("Updating criteria...");
    try {
      await axios.put(
        `http://localhost:3500/api/criterias/${id}`,
        { name: editName },
        {
          headers: {
            "Content-Type": "application/json",
            ...authHeaders,
          },
        }
      );
      toast.success("Criteria updated", { id: toastId });
      setEditingId(null);
      setEditName("");
      fetchCriterias();
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || "Failed to update",
        { id: toastId }
      );
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchCriterias();
    toast.success("Criterias refreshed!");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-2 border-gray-200 border-t-2 border-t-black rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading criterias...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="min-h-screen flex flex-col items-center p-6"
    >
      <div className="w-full mb-8 pb-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Criteria List & Modifications
            </h1>
            <p className="text-gray-600 mt-2">
              Modify the criterias for evaluating courses
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gray-700 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </button>
        </div>
      </div>
      <div className="w-full max-w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-gray-200"
        >
          <div className="py-1 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                  Criteria Manager
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Manage your evaluation criterias
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {criterias.length} criterias
                </span>
              </div>
            </div>
          </div>

          {criterias.length === 0 ? (
            <div className="py-12 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                No criterias
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new criteria.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {criterias.map((criteria) => (
                <div
                  key={criteria._id}
                  className="py-4 hover:bg-gray-50 transition-colors duration-150"
                >
                  {editingId === criteria._id ? (
                    <div className="flex items-center space-x-3">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-gray-900 placeholder-gray-400"
                        placeholder="Criteria name"
                        autoFocus
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleUpdate(criteria._id)}
                          className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 text-gray-700 transition-colors duration-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gray-100">
                          <span className="text-sm font-medium text-gray-600">
                            {criteria.name.charAt(0).toUpperCase()}
                          </span>
                        </span>
                        <span className="text-base font-medium text-gray-900">
                          {criteria.name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => startEditing(criteria)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(criteria._id)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-lg shadow-sm text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

export default CriteriaList;