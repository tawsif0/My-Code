/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import {
  FiTrash2,
  FiEdit,
  FiSearch,
  FiRefreshCw,
  FiUser,
  FiMail,
  FiPhone,
  FiAward,
} from "react-icons/fi";

const TeacherList = () => {
  // State for teachers data\
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Mock API fetch function
  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${base_url}/api/admin/teachers`);
      setTeachers(res.data.data || []);
      setLoading(false); // Stop loading on success
    } catch (error) {
      toast.error("Failed to fetch teachers");
      setLoading(false); // Stop loading on failure
    }
  };

  // Mock delete function
  const deleteTeacher = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:3500/api/admin/teachers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTeachers((prev) => prev.filter((teacher) => teacher.id !== id));

      toast.success("Teacher deleted successfully");

      // Close the modal after success
      setConfirmDelete(null);
    } catch (error) {
      toast.error("Delete failed");
      setConfirmDelete(null);
    }
  };

  useEffect(() => {
    fetchTeachers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter teachers based on search term
  const filteredTeachers = teachers.filter(
    (teacher) =>
      teacher.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Status colors
  const statusColors = {
    Approved: "bg-green-100 text-green-800",
    Pending: "bg-yellow-100 text-yellow-800",
    Rejected: "bg-red-100 text-red-800",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen  text-black p-6"
    >
      {/* Header Section */}
      <div className="w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b border-gray-200 ">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Teacher Management
            </h1>
            <p className="text-gray-600 mt-2">
              View and manage all registered teachers
            </p>
          </div>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchTeachers}
              className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
            >
              <FiRefreshCw
                className={`mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </motion.button>
          </div>
        </div>

        {/* Search bar */}
        <div className="mb-8 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search teachers by name, email or specialization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-gray-500 text-gray-900 placeholder-gray-400 shadow-sm"
          />
        </div>

        {/* Teachers table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          {loading ? (
            <div className="p-8 flex justify-center">
              <FiRefreshCw className="animate-spin h-8 w-8 text-gray-500" />
            </div>
          ) : filteredTeachers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {searchTerm
                ? "No matching teachers found"
                : "No teachers available"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Teacher
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Contact
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Specialization
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Rate
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTeachers.map((teacher) => (
                    <motion.tr
                      key={teacher.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-16 w-16 rounded-full bg-gray-600 text-white flex items-center justify-center font-bold shadow-xl transition-all duration-300 hover:scale-110">
                            {teacher?.profile_photo ? (
                              <img
                                src={`${base_url}/uploads/teachers/${teacher?.profile_photo}`}
                                alt="Profile"
                                className="w-full h-full object-cover rounded-full border-4 border-white"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center rounded-full bg-gray-200 text-3xl">
                                <FiUser className="text-white" />
                              </div>
                            )}
                          </div>

                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {teacher.full_name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {teacher.qualifications.split(",")[0]}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {teacher.email}
                        </div>
                        <div className="text-xs text-gray-500">
                          {teacher.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FiAward className="text-gray-700 mr-2" />
                          <span className="text-sm text-gray-900">
                            {teacher.specialization}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-medium">
                          ${teacher.hourly_rate}/hr
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            statusColors[teacher.status] ||
                            "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {teacher.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-3">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setConfirmDelete(teacher.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <FiTrash2 className="h-5 w-5" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] bg-opacity-50 flex items-center justify-center z-[10000]">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full border border-gray-200"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Confirm Delete
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this teacher? This action cannot
              be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 border border-gray-300 cursor-pointer rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => deleteTeacher(confirmDelete)}
                className="px-4 py-2 bg-red-600 text-white cursor-pointer rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default TeacherList;
