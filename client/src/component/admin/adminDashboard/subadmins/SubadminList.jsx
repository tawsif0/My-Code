/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { FiTrash2, FiSearch, FiRefreshCw } from "react-icons/fi";

const SubadminList = () => {
  const [subadmins, setSubadmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [editStatusId, setEditStatusId] = useState(null);
  const [editedStatus, setEditedStatus] = useState("");

  const fetchSubadmins = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:3500/api/auth/subadmins", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubadmins(res.data.subadmins || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubadmins();
  }, []);

  const deleteSubadmin = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:3500/api/auth/subadmin/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Subadmin deleted successfully");
      fetchSubadmins();
    } catch (error) {
      toast.error("Delete failed");
    } finally {
      setConfirmDelete(null);
    }
  };
  const handleStatusUpdate = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:3500/api/auth/subadmin/${id}/status`,
        { status: editedStatus || "active" }, // Ensure a default value
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Status updated");

      fetchSubadmins();
      setEditStatusId(null);
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const filteredSubadmins = subadmins.filter(
    (admin) =>
      admin.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between sticky top-0 left-0 py-4 px-[10px] bg-white items-center mb-8  border-b border-gray-200">
        <h2 className="text-2xl font-bold text-black">Sub-Admin Creation</h2>
        <div className="flex space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchSubadmins}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm"
          >
            <FiRefreshCw className={`mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </motion.button>
        </div>
      </div>

      <div className="p-[20px]">
        <div className="mb-6 relative ">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search subadmins..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
          />
        </div>

        <div className="bg-white rounded-[10px]  shadow-sm overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-sm  font-[700] text-gray-500 uppercase tracking-wider"
                  >
                    Username
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-sm  font-[700] text-gray-500 uppercase tracking-wider"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-sm  font-[700] text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-sm  font-[700] text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        <FiRefreshCw className="animate-spin h-5 w-5 text-gray-500" />
                      </div>
                    </td>
                  </tr>
                ) : filteredSubadmins.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      {searchTerm
                        ? "No matching subadmins found"
                        : "No subadmins available"}
                    </td>
                  </tr>
                ) : (
                  filteredSubadmins.map((admin) => (
                    <tr key={admin._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-black text-white flex items-center justify-center font-bold">
                            {admin.username.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-black">
                              {admin.username}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-black">{admin.email}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {editStatusId === admin._id ? (
                          <div className="flex items-center space-x-2">
                            <select
                              value={editedStatus}
                              onChange={(e) => setEditedStatus(e.target.value)}
                              className="border border-gray-300 rounded px-2 py-1 text-sm"
                            >
                              <option value="active">Active</option>
                              <option value="suspended">Suspended</option>
                            </select>

                            <button
                              onClick={() => handleStatusUpdate(admin._id)}
                              className="text-green-600 hover:underline text-sm"
                            >
                              Update
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span
                              className={`p-1 px-3 text-xs rounded-full capitalize ${
                                admin.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : admin.status === "inactive"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {admin.status}
                            </span>
                            <button
                              onClick={() => {
                                setEditStatusId(admin._id);
                                setEditedStatus("active"); // Default to active
                              }}
                              className="text-gray-500 hover:text-black"
                            >
                              ✎
                            </button>
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap  text-right text-sm font-medium">
                        <div className="flex justify-end">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setConfirmDelete(admin._id)}
                            className="text-red-500 cursor-pointer hover:text-red-700"
                          >
                            <FiTrash2 className="h-5 w-5" />
                          </motion.button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full border border-gray-200">
            <h3 className="text-lg font-medium text-black mb-4">
              Confirm Delete
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this subadmin? This action cannot
              be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 border border-gray-300 cursor-pointer rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => deleteSubadmin(confirmDelete)}
                className="px-4 py-2 bg-red-600 text-white cursor-pointer rounded-lg hover:bg-red-700"
              >
                Delete
              </motion.button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubadminList;
