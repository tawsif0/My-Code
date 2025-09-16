import React, { useState, useEffect } from "react";
import { FiImage, FiTrash2, FiEdit, FiPlus } from "react-icons/fi";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const HeroModify = () => {
  const [heroSections, setHeroSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const fetchHeroSections = async () => {
      try {
        const response = await fetch("http://localhost:3500/api/hero");
        if (!response.ok) {
          throw new Error("Failed to fetch hero sections");
        }
        const data = await response.json();
        setHeroSections(data);
      } catch (error) {
        toast.error("Error loading hero sections: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHeroSections();
  }, []);

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      const response = await fetch(`http://localhost:3500/api/hero/${id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error("Failed to delete hero section");
      }

      setHeroSections(heroSections.filter((section) => section._id !== id));
      toast.success("Hero section deleted successfully!");
    } catch (error) {
      toast.error("Error deleting hero section: " + error.message);
    } finally {
      setDeletingId(null);
    }
  };

  // Function to get the correct image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";

    // Remove 'public/' if it exists in the path
    const cleanedPath = imagePath.replace(/^public[\\/]/, "");

    // Replace backslashes with forward slashes for URLs
    const normalizedPath = cleanedPath.replace(/\\/g, "/");

    return `http://localhost:3500/${normalizedPath}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen flex flex-col items-center p-6"
    >
      <div className="w-full mb-8 pb-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 text-left">
          Manage Hero Sections
        </h1>
        <p className="text-gray-600 mt-2">
          View, edit, or delete existing hero sections
        </p>
      </div>

      <div className="w-full space-y-8">
        {heroSections.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-8 text-center"
          >
            <p className="text-gray-600">No hero sections found</p>
          </motion.div>
        ) : (
          heroSections.map((section, index) => (
            <motion.div
              key={section._id}
              layout
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
            >
              <div className="p-6 sm:p-8">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {index + 1}. Hero Section
                    </h3>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleDelete(section._id)}
                      disabled={deletingId === section._id}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      aria-label="Delete"
                    >
                      {deletingId === section._id ? (
                        <div className="h-5 w-5 border-t-2 border-b-2 border-red-500 rounded-full animate-spin"></div>
                      ) : (
                        <FiTrash2 className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="mt-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <div className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50">
                      {section.description}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hero Image
                    </label>
                    <div className="mt-1">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <img
                              src={getImageUrl(section.image)}
                              alt="Hero"
                              className="h-16 w-16 object-cover rounded"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src =
                                  "https://via.placeholder.com/100?text=Image+Not+Found";
                              }}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {section.image?.split(/[\\/]/).pop()}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(section.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default HeroModify;
