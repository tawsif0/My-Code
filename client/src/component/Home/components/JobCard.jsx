/* eslint-disable no-unused-vars */
import React from "react";
import { motion } from "framer-motion";
import { FiExternalLink, FiCalendar, FiMapPin, FiClock } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const JobCard = ({ job }) => {
  const navigate = useNavigate();

  const handleApply = () => {
    window.scrollTo(0, 0);
    if (job.applyLink && !job.hasCustomForm) {
      window.open(job.applyLink, "_blank");
    } else {
      // Navigate to job details page for custom form applications
      navigate(`/career/${job._id}`);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <motion.div
      className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-[#004080]/20"
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-[#004080] transition-colors">
              {job.title}
            </h3>

            {/* Meta Information */}
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <FiCalendar className="mr-2 text-[#004080]" />
                <span>Posted {formatDate(job.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Apply Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleApply}
            className="bg-gradient-to-r from-[#004080] to-[#0056b3] hover:from-[#0056b3] hover:to-[#004080] text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2 min-w-[120px] justify-center"
          >
            <span>Apply Now</span>
            {job.applyLink && !job.hasCustomForm && (
              <FiExternalLink className="ml-1" />
            )}
          </motion.button>
        </div>

        {/* Description */}
        <div className="prose max-w-none mb-6">
          <div
            className="text-gray-700 leading-relaxed line-clamp-3"
            dangerouslySetInnerHTML={{ __html: job.description }}
          />
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            {job.hasCustomForm ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Custom Application Form
              </span>
            ) : job.applyLink ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                External Link
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Gradient Border Effect */}
      <div className="h-1 bg-gradient-to-r from-[#004080] to-[#ffd700] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </motion.div>
  );
};

export default JobCard;
