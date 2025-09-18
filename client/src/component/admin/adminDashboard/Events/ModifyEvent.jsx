/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiTrash2,
  FiEdit,
  FiCheckCircle,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiImage,
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import axios from "axios";
// Draft.js imports
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
const ModifyEvent = () => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingEvent, setEditingEvent] = useState(null); // store the event being edited
  const [showEditForm, setShowEditForm] = useState(false);
  const [description, setDescription] = useState("");
  const eventsPerPage = 8;
  const [previewImage, setPreviewImage] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditingEvent((prev) => ({ ...prev, imageFile: file }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };
  const handleEditClick = (event) => {
    setEditingEvent(event);
    setShowEditForm(event._id);
    setDescription(event.description || "");
  };

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${base_url}/api/events`);
        setEvents(response.data.data);
      } catch (err) {
        toast.error("Failed to load events");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [base_url]);

  // Filter events
  const filteredEvents = events.filter((event) =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const indexOfLast = currentPage * eventsPerPage;
  const indexOfFirst = indexOfLast - eventsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);

  // Actions
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${base_url}/api/events/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setEvents(events.filter((event) => event._id !== id));
      toast.success("Event deleted successfully");
    } catch (error) {
      toast.error("Failed to delete event");
    }
  };

  const handleLaunch = async (id) => {
    try {
      await axios.put(
        `${base_url}/api/events/${id}/launch`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setEvents(
        events.map((event) =>
          event._id === id ? { ...event, eventStatus: "launched" } : event
        )
      );
      toast.success("Event launched successfully");
    } catch (error) {
      toast.error("Failed to launch event");
    }
  };
  const handleEnd = async (id) => {
    try {
      const response = await axios.put(`${base_url}/api/events/${id}/end`);
      setEvents(
        events.map((event) =>
          event._id === id ? { ...event, eventStatus: "ended" } : event
        )
      );
      toast.success("Event ended successfully");
    } catch (error) {
      toast.error("Failed to end event");
    }
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();

      for (const key of [
        "title",
        "startDate",
        "endDate",
        "startTime",
        "endTime",
        "location",
      ]) {
        formData.append(key, editingEvent[key]);
      }

      // Convert Draft.js content to HTML before saving
      formData.append("description", description);

      if (editingEvent.imageFile) {
        formData.append("image", editingEvent.imageFile);
      }

      const response = await axios.put(
        `${base_url}/api/events/${editingEvent._id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setEvents(
        events.map((ev) =>
          ev._id === editingEvent._id ? response.data.data : ev
        )
      );

      toast.success("Event updated successfully");
      setShowEditForm(false);
    } catch (error) {
      toast.error("Failed to update event");
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-white p-6 flex justify-center items-center"
      >
        <div className="text-gray-500">Loading events...</div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-white p-6 flex justify-center items-center"
      >
        <div className="text-red-500">{error}</div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-white p-6"
    >
      <div className="w-full">
        {/* Header */}
        <div className="w-full mb-8 pb-6 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900">Event Management</h1>
          <p className="text-gray-600 mt-2">
            View and manage all created events
          </p>
        </div>

        {/* Search & Stats */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search events..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:border-gray-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="bg-gray-100 px-4 py-2 rounded-lg">
            <span className="font-medium text-gray-900">
              {filteredEvents.length}
            </span>
            <span className="text-gray-600 ml-1">events found</span>
          </div>
        </div>

        {/* Event Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    End Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {currentEvents.length > 0 ? (
                  currentEvents.map((event) => (
                    <React.Fragment key={event._id}>
                      <motion.tr
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        {/* Event Image + Title */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-16 w-16 rounded-full bg-gray-600 text-white flex items-center justify-center font-bold shadow-md transition-all duration-300 hover:scale-110">
                              <img
                                src={`${base_url}/events/${event.image}`}
                                alt={event.title}
                                className="w-full h-full object-cover rounded-full border-4 border-white"
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {event.title}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {event.startDate} {event.startTime}
                        </td>

                        {/* End Date & Time */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {event.eventStatus === "created"
                            ? "Not started"
                            : `${event.endDate} ${event.endTime}`}
                        </td>
                        {/* Status */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              event.eventStatus === "launched"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {event.eventStatus}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                          {event.eventStatus === "pending" && (
                            <button
                              onClick={() => handleLaunch(event._id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              <FiCheckCircle className="inline mr-1" /> Launch
                            </button>
                          )}

                          {event.eventStatus === "launched" && (
                            <button
                              onClick={() => handleEnd(event._id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <FiTrash2 className="inline mr-1" /> End
                            </button>
                          )}

                          {event.eventStatus === "ended" && (
                            <span className="text-gray-400">Event Ended</span>
                          )}

                          <button
                            onClick={() => handleEditClick(event)} // ✅ Use your handler
                            className="text-gray-600 hover:text-gray-900 ml-2"
                          >
                            <FiEdit className="inline mr-1" /> Edit
                          </button>

                          <button
                            onClick={() => handleDelete(event._id)}
                            className="text-red-600 hover:text-red-900 ml-2"
                          >
                            <FiTrash2 className="inline mr-1" /> Delete
                          </button>
                        </td>
                      </motion.tr>

                      {/* Edit Form - Placed directly below the event row */}

                      {showEditForm === event._id && (
                        <tr>
                          <td colSpan="5" className="p-0">
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3 }}
                              className="bg-white p-6 border-t border-gray-200"
                            >
                              <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b border-gray-200 flex items-center">
                                <FiEdit className="mr-2 text-gray-600" />
                                Edit Event: {event.title}
                              </h2>
                              <form
                                onSubmit={handleUpdateEvent}
                                className="space-y-6"
                              >
                                {/* Title */}
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Event Title *
                                  </label>
                                  <input
                                    type="text"
                                    value={editingEvent.title}
                                    onChange={(e) =>
                                      setEditingEvent({
                                        ...editingEvent,
                                        title: e.target.value,
                                      })
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:border-gray-500 focus:border-gray-500 transition-all"
                                    placeholder="Enter event title"
                                    required
                                  />
                                </div>

                                {/* Dates and Times */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Start Date *
                                    </label>
                                    <input
                                      type="date"
                                      value={editingEvent.startDate}
                                      onChange={(e) =>
                                        setEditingEvent({
                                          ...editingEvent,
                                          startDate: e.target.value,
                                        })
                                      }
                                      className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:border-gray-500 focus:border-gray-500 transition-all"
                                      required
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      End Date *
                                    </label>
                                    <input
                                      type="date"
                                      value={editingEvent.endDate}
                                      onChange={(e) =>
                                        setEditingEvent({
                                          ...editingEvent,
                                          endDate: e.target.value,
                                        })
                                      }
                                      className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:border-gray-500 focus:border-gray-500 transition-all"
                                      required
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Start Time *
                                    </label>
                                    <input
                                      type="time"
                                      value={editingEvent.startTime}
                                      onChange={(e) =>
                                        setEditingEvent({
                                          ...editingEvent,
                                          startTime: e.target.value,
                                        })
                                      }
                                      className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:border-gray-500 focus:border-gray-500 transition-all"
                                      required
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      End Time *
                                    </label>
                                    <input
                                      type="time"
                                      value={editingEvent.endTime}
                                      onChange={(e) =>
                                        setEditingEvent({
                                          ...editingEvent,
                                          endTime: e.target.value,
                                        })
                                      }
                                      className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:border-gray-500 focus:border-gray-500 transition-all"
                                      required
                                    />
                                  </div>
                                </div>

                                {/* Location */}
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Location *
                                  </label>
                                  <input
                                    type="text"
                                    value={editingEvent.location}
                                    onChange={(e) =>
                                      setEditingEvent({
                                        ...editingEvent,
                                        location: e.target.value,
                                      })
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:border-gray-500 focus:border-gray-500 transition-all"
                                    placeholder="Enter event location"
                                    required
                                  />
                                </div>

                                {/* Description */}
                                {/* Description */}
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description *
                                  </label>
                                  <div className="border border-gray-300 rounded-lg bg-white">
                                    <ReactQuill
                                      theme="snow"
                                      value={description}
                                      onChange={setDescription}
                                      modules={{
                                        toolbar: [
                                          [{ header: [1, 2, 3, false] }],
                                          [
                                            "bold",
                                            "italic",
                                            "underline",
                                            "strike",
                                            "blockquote",
                                          ],
                                          [
                                            { list: "ordered" },
                                            { list: "bullet" },
                                          ],
                                          ["link", "image"],
                                          ["clean"],
                                        ],
                                      }}
                                      formats={[
                                        "header",
                                        "bold",
                                        "italic",
                                        "underline",
                                        "strike",
                                        "blockquote",
                                        "list",
                                        "bullet",
                                        "link",
                                        "image",
                                      ]}
                                    />
                                  </div>
                                </div>

                                {/* Image Upload Section */}
                                <div className="border-t border-gray-200 pt-6">
                                  <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                                    <FiImage className="mr-2 text-gray-600" />
                                    Event Image
                                  </h3>

                                  <div className="flex flex-col md:flex-row items-start gap-6">
                                    {/* Image Preview Box */}
                                    <div className="relative flex-shrink-0">
                                      {previewImage || editingEvent?.image ? (
                                        <div className="relative group">
                                          <div className="w-full md:w-56 h-40 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 bg-gray-50 shadow-sm">
                                            <img
                                              src={
                                                previewImage ||
                                                `${base_url}/events/${editingEvent?.image}`
                                              }
                                              alt="Event preview"
                                              className="w-full h-full object-cover"
                                              onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src =
                                                  "/placeholder-image.jpg";
                                              }}
                                            />
                                          </div>

                                          {/* Edit Button */}
                                          <motion.label
                                            initial={{
                                              opacity: 0,
                                              scale: 0.8,
                                              y: 10,
                                            }}
                                            animate={{
                                              opacity: 1,
                                              scale: 1,
                                              y: 0,
                                            }}
                                            whileHover={{
                                              scale: 1.1,
                                              rotate: -5,
                                            }}
                                            whileTap={{ scale: 0.95 }}
                                            transition={{
                                              type: "spring",
                                              stiffness: 300,
                                              damping: 20,
                                            }}
                                            className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow-md border border-gray-300 cursor-pointer hover:bg-gray-50 transition-colors"
                                            title="Change image"
                                          >
                                            <FiEdit className="text-gray-700 text-lg" />
                                            <input
                                              type="file"
                                              accept="image/*"
                                              onChange={handleImageUpload}
                                              className="hidden"
                                            />
                                          </motion.label>

                                          {/* Remove Button */}
                                          <motion.button
                                            onClick={() => {
                                              setEditingEvent((prev) => ({
                                                ...prev,
                                                imageFile: null,
                                                image: null,
                                              }));
                                              setPreviewImage(null);
                                            }}
                                            initial={{
                                              opacity: 0,
                                              scale: 0.8,
                                              y: -10,
                                            }}
                                            animate={{
                                              opacity: 1,
                                              scale: 1,
                                              y: 0,
                                            }}
                                            whileHover={{
                                              scale: 1.1,
                                              rotate: 10,
                                            }}
                                            whileTap={{ scale: 0.9 }}
                                            transition={{
                                              type: "spring",
                                              stiffness: 300,
                                              damping: 20,
                                            }}
                                            className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md border border-gray-200 hover:bg-red-50 text-red-500"
                                            type="button"
                                            title="Remove image"
                                          >
                                            <FiTrash2 className="text-lg" />
                                          </motion.button>
                                        </div>
                                      ) : (
                                        <label className="cursor-pointer flex flex-col items-center justify-center w-56 h-40 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors p-4 text-center">
                                          <FiImage className="text-3xl text-gray-400 mb-2" />
                                          <span className="text-sm font-medium text-gray-600">
                                            Upload Event Image
                                          </span>
                                          <span className="text-xs text-gray-500 mt-1">
                                            JPG, PNG, or WebP
                                          </span>
                                          <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                          />
                                        </label>
                                      )}
                                    </div>

                                    {/* File Info */}
                                    <div className="flex-1">
                                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                                        Image Details
                                      </h4>
                                      <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                                        {editingEvent?.imageFile ? (
                                          <>
                                            <div className="font-medium mb-1">
                                              New upload:
                                            </div>
                                            <div className="flex items-center justify-between mb-2">
                                              <span className="truncate max-w-xs">
                                                {editingEvent.imageFile.name}
                                              </span>
                                              <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                                                {(
                                                  editingEvent.imageFile.size /
                                                  1024
                                                ).toFixed(1)}{" "}
                                                KB
                                              </span>
                                            </div>
                                          </>
                                        ) : editingEvent?.image ? (
                                          <>
                                            <div className="font-medium mb-1">
                                              Current image:
                                            </div>
                                            <div className="truncate max-w-xs mb-2">
                                              {editingEvent.image}
                                            </div>
                                          </>
                                        ) : (
                                          <div>No event image selected</div>
                                        )}

                                        <div className="text-xs text-gray-500 mt-3">
                                          <p>
                                            • Recommended size: 800×450px (16:9
                                            ratio)
                                          </p>
                                          <p>• Maximum file size: 5MB</p>
                                          <p>• Formats: JPG, PNG</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Form Actions */}
                                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                                  <button
                                    type="button"
                                    onClick={() => setShowEditForm(false)}
                                    className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="submit"
                                    className="px-5 py-2.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all shadow-md font-medium flex items-center"
                                  >
                                    <FiCheckCircle className="mr-2" />
                                    Update Event
                                  </button>
                                </div>
                              </form>
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="3"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No events found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredEvents.length > eventsPerPage && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">{indexOfFirst + 1}</span> to{" "}
                  <span className="font-medium">
                    {Math.min(indexOfLast, filteredEvents.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium">{filteredEvents.length}</span>{" "}
                  events
                </p>
                <nav className="inline-flex -space-x-px">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm text-gray-500 hover:bg-gray-50"
                  >
                    <FiChevronLeft className="h-5 w-5" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 border text-sm font-medium ${
                          currentPage === page
                            ? "bg-gray-50 border-gray-500 text-gray-600"
                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm text-gray-500 hover:bg-gray-50"
                  >
                    <FiChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ModifyEvent;
