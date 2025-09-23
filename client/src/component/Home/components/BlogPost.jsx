import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

const BlogPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchBlogPost = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:3500/api/blogs/${id}`
        );
        const blogPost = response.data;
        setPost(blogPost);

        // Process content to add link icons
        if (blogPost.content) {
          const processedContent = blogPost.content.replace(
            /<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1[^>]*>(.*?)<\/a>/gi,
            (match, quote, href, text) => {
              // Remove any existing link icons to prevent duplicates
              const cleanText = text
                .replace(/<svg[^>]*>.*?<\/svg>/gi, "")
                .trim();
              return `
        <a href="${href}" target="_blank" rel="noopener noreferrer">
          ${cleanText}
        </a>
      `;
            }
          );
          blogPost.processedContent = processedContent;
        }

        // Fetch related posts from the same category
        try {
          const relatedResponse = await axios.get(
            `http://localhost:3500/api/blogs?category=${blogPost.category._id}`
          );
          // Filter out the current post and limit to 3
          const filteredRelated = relatedResponse.data
            .filter((p) => p._id !== id)
            .slice(0, 3);
          setRelatedPosts(filteredRelated);
        } catch (relatedError) {
          console.error("Error fetching related posts:", relatedError);
          setRelatedPosts([]);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching blog post:", err);
        toast.error(
          err.response?.data?.message ||
            err.message ||
            "Failed to load blog post"
        );
        setLoading(false);
      }
    };

    fetchBlogPost();
  }, [id]);
  useEffect(() => {
    if (!loading) {
      // Small delay to ensure DOM is fully rendered
      const timer = setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }, 150);

      return () => clearTimeout(timer);
    }
  }, [loading, id]);

  // Also add this to handle direct navigation
  useEffect(() => {
    // Quick scroll to top on initial mount
    window.scrollTo(0, 0);
  }, []);
  // Format date function
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden">
        {/* background gradient animation */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-200 animate-pulse"></div>

        {/* loader container */}
        <div className="relative z-10 flex flex-col items-center text-center">
          {/* spinning rings */}
          <div className="relative">
            <div className="w-20 h-20 border-4 border-gray-300 border-t-gray-500 rounded-full animate-spin mb-6"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-gray-700 rounded-full animate-spin [animation-delay:150ms]"></div>
          </div>

          {/* text */}
          <div className="text-gray-800 text-xl font-medium tracking-wide">
            Loading incredible content...
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center p-8 bg-gray-100 rounded-3xl border border-gray-300">
          <div className="mb-8">
            <div className="mx-auto h-24 w-24 rounded-full bg-gradient-to-r from-gray-400 to-gray-600 flex items-center justify-center animate-bounce">
              <svg
                className="h-12 w-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Oops! Blog Not Found
          </h1>
          <p className="text-gray-600 mb-8">
            The blog you're looking for has vanished into the digital void.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-800 text-white rounded-full font-semibold hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Take Me Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-22 min-h-screen relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <motion.button
            whileHover={{ scale: 1.05, x: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="group flex items-center px-6 py-3 text-gray-700 hover:text-gray-900 transition-all duration-300 bg-gray-100 hover:bg-gray-200 rounded-full border border-gray-300"
          >
            <svg
              className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back
          </motion.button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col-reverse xl:flex-row gap-8">
          {/* Left Column - Content */}
          <div className="lg:pr-8">
            {/* Blog Header */}
            <motion.header
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-12"
            >
              <div className="cursor-pointer mt-4 mb-4 px-4 py-1.5 bg-gradient-to-r from-[#004080] via-[#013870] to-[#003161] text-white font-semibold rounded-full shadow-xl inline-flex items-center justify-center transform hover:scale-105 hover:shadow-2xl transition-all duration-300 group relative overflow-hidden">
                {/* Pulsing dot */}
                <span className="w-2.5 h-2.5 bg-white rounded-full mr-3 animate-ping-slow"></span>
                <span className="relative z-10">{post.category.name}</span>
                <span className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/20 to-white/10 opacity-0 group-hover:opacity-40 rounded-full transition-opacity duration-500 pointer-events-none"></span>
              </div>

              <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-6 mt-2 tracking-tight">
                {post.title}
              </h1>

              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-8 space-y-4 sm:space-y-0 text-gray-600 mb-8">
                {/* Published Date */}
                <div className="flex items-center group hover:text-gray-900 transition-colors duration-300">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gray-200 rounded-full flex items-center justify-center mr-2 sm:mr-0 group-hover:scale-110 transition-transform duration-300">
                    <svg
                      className="w-5 sm:w-6 h-5 sm:h-6 text-gray-700"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <time
                    dateTime={post.createdAt}
                    className="font-medium text-sm sm:text-base"
                  >
                    {formatDate(post.createdAt)}
                  </time>
                </div>
              </div>
            </motion.header>

            {/* Blog Content */}
            <motion.article
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-16"
            >
              <div className="bg-gray-50 rounded-3xl p-8 md:p-12 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-500">
                <div
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: post.processedContent || post.content,
                  }}
                />
              </div>
            </motion.article>

            {/* Share Section */}
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mb-16"
            >
              <div className="bg-gray-100 rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-lg">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <span className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                    <svg
                      className="w-4 h-4 text-gray-700"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                      />
                    </svg>
                  </span>
                  Share this blog
                </h3>

                {/* Use flex-wrap for mobile */}
                <div className="flex flex-wrap gap-4">
                  {[
                    {
                      name: "LinkedIn",
                      icon: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
                      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                        window.location.href
                      )}`,
                    },
                    {
                      name: "Facebook",
                      icon: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
                      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                        window.location.href
                      )}`,
                    },
                  ].map((social) => (
                    <motion.a
                      key={social.name}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative flex-1 min-w-[140px] sm:min-w-[160px] px-4 py-3 sm:px-6 sm:py-4 bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-2xl"></div>
                      <div className="relative flex items-center justify-center gap-2">
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d={social.icon} />
                        </svg>
                        <span className="text-sm sm:text-base">
                          {social.name}
                        </span>
                      </div>
                    </motion.a>
                  ))}
                </div>
              </div>
            </motion.section>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <div className="mb-10">
                  <h2 className="text-4xl font-black text-gray-900 mb-4">
                    More BLogs
                  </h2>
                  <div className="h-1 w-20 bg-gradient-to-r from-gray-600 to-gray-800 rounded-full"></div>
                </div>

                <div className="space-y-6">
                  {relatedPosts.map((relatedPost, index) => (
                    <motion.article
                      key={relatedPost._id}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, x: 10 }}
                      className="group relative overflow-hidden bg-gray-50 rounded-2xl border border-gray-200 hover:border-gray-300 transition-all duration-500 shadow-lg hover:shadow-xl"
                    >
                      <Link
                        to={`/blog/${relatedPost._id}`}
                        className="block p-6"
                      >
                        <div className="flex gap-6">
                          <div className="relative flex-shrink-0 overflow-hidden rounded-xl">
                            <img
                              src={`http://localhost:3500/blogs/${relatedPost.image}`}
                              alt={relatedPost.title}
                              className="w-32 h-32 object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-gray-200 text-gray-700 border border-gray-300 mb-3">
                              {relatedPost.category.name}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-gray-700 transition-all duration-300 line-clamp-2 mb-3">
                              {relatedPost.title}
                            </h3>
                            <div className="flex items-center text-sm text-gray-600">
                              <time>{formatDate(relatedPost.createdAt)}</time>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.article>
                  ))}
                </div>
              </motion.section>
            )}
          </div>

          {/* Right Column - Sticky Image */}
          <div className="lg:pl-8 mt-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="sticky top-32"
              style={{ transform: `translateY(${scrollY * 0.1}px)` }}
            >
              <div className="relative group w-full">
                <div className="absolute -inset-1 bg-gradient-to-r from-gray-400 to-gray-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                <div className="cursor-pointer relative bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-200 w-full aspect-video lg:h-[250px]">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent z-10"></div>
                  {!isImageLoaded && (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <svg
                        className="w-16 h-16 text-gray-400 animate-pulse"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                  <img
                    src={`http://localhost:3500/blogs/${post.image}`}
                    alt={post.title}
                    className={`w-full h-full object-cover transition-all duration-1000 group-hover:scale-105 ${
                      isImageLoaded ? "opacity-100" : "opacity-0"
                    }`}
                    onLoad={() => setIsImageLoaded(true)}
                  />
                </div>
              </div>

              {/* Enhanced Blog Info Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="mt-8 lg:relative group hidden lg:block"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-400 to-gray-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
                <div className="relative bg-gray-50 rounded-2xl p-8 border border-gray-200">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <span className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                      <svg
                        className="w-4 h-4 text-gray-700"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </span>
                    Blog Insights
                  </h3>
                  <div className="space-y-4">
                    {[
                      { label: "Category", value: post.category.name },
                      { label: "Published", value: formatDate(post.createdAt) },
                    ].map((item, index) => (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                        className="flex justify-between items-center p-4 bg-white rounded-xl border border-gray-200 hover:bg-gray-100 transition-all duration-300 group/item"
                      >
                        <span className="text-gray-700 font-medium">
                          {item.label}:
                        </span>
                        <span className="font-bold text-gray-900 group-hover/item:scale-105 transition-transform duration-300">
                          {item.value}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPost;
