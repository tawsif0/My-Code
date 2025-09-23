import React, { useState, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import axios from "axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const News = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [showAllNews, setShowAllNews] = useState(false);
  const [newsItems, setNewsItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  // Fetch news items and categories from backend
  useEffect(() => {
    const fetchNewsData = async () => {
      try {
        setLoading(true);

        const newsResponse = await axios.get("http://localhost:3500/api/news");
        // Ensure newsItems is always an array
        const newsData = Array.isArray(newsResponse.data.news)
          ? newsResponse.data.news
          : [];

        const categoriesResponse = await axios.get(
          "http://localhost:3500/api/news-categories"
        );
        const categoriesData = Array.isArray(categoriesResponse.data)
          ? categoriesResponse.data
          : [];

        setNewsItems(newsData);
        setCategories([{ _id: "all", name: "All News" }, ...categoriesData]);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching news data:", err);
        toast.error(
          err.response?.data?.message ||
            err.message ||
            "Failed to load news items"
        );
        setLoading(false);
      }
    };

    fetchNewsData();
  }, []);

  const filteredNews = Array.isArray(newsItems)
    ? activeTab === "all"
      ? newsItems
      : newsItems.filter((item) => item.category?._id === activeTab)
    : [];

  const displayedNews = Array.isArray(filteredNews)
    ? showAllNews
      ? filteredNews
      : filteredNews.slice(0, 6)
    : [];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        when: "beforeChildren",
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
  };

  const headerVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        delay: 0.2,
      },
    },
  };

  // Format date function
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <section className="py-36">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-[#004080] text-xl">Loading news items...</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} className="py-36 ">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={containerVariants}
          className="text-center mb-16"
        >
          <motion.span
            variants={itemVariants}
            className="cursor-pointer mb-8 px-3 py-1.5 bg-[#004080] text-white font-semibold rounded-full shadow-lg inline-flex items-center justify-center transform hover:scale-105 transition-transform duration-300 group"
          >
            News & Updates
          </motion.span>
          <motion.h2
            variants={headerVariants}
            className="text-4xl md:text-5xl font-bold mb-6 !text-gray-900"
          >
            Latest <span className="text-[#004080]">News & Updates</span>
          </motion.h2>
          <motion.p
            variants={headerVariants}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Stay informed with the most recent policy changes, partnerships, and
            important alerts for your study abroad journey.
          </motion.p>
        </motion.div>
        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap justify-center gap-3 mb-16 px-4"
        >
          {categories.map((category) => (
            <motion.button
              key={category._id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-5 py-2.5 rounded-full text-sm sm:text-base font-medium transition-all duration-300 ${
                activeTab === category._id
                  ? "bg-[#004080] text-white shadow-lg"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              onClick={() => {
                setActiveTab(category._id);
                setShowAllNews(false);
              }}
            >
              {category.name}
            </motion.button>
          ))}
        </motion.div>
        {/* News Grid */}
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={containerVariants}
          className={`${
            displayedNews.length === 1
              ? "flex justify-center"
              : displayedNews.length === 2
              ? "flex flex-col lg:flex-row lg:justify-between w-full lg:px-20 lg:gap-7 gap-6"
              : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          }`}
        >
          {Array.isArray(displayedNews) &&
            displayedNews.length > 0 &&
            displayedNews.map((item, index) => (
              <motion.div
                key={item._id}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className={`group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 w-full sm:max-w-[350px] lg:max-w-[400px]
          ${displayedNews.length === 2 && index === 0 ? "lg:ml-auto" : ""}
          ${displayedNews.length === 2 && index === 1 ? "lg:mr-auto" : ""}`}
              >
                {/* News Image */}
                <div className="h-48 relative overflow-hidden">
                  <img
                    src={`http://localhost:3500/news/${item.image}`}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>

                  {/* Category Badge */}
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/90 text-xs font-semibold text-[#004080]">
                    {item.category?.name || "Uncategorized"}
                  </div>
                </div>

                {/* News Content */}
                <div className="p-6 flex flex-col h-[calc(100%-12rem)]">
                  <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-[#004080] transition-colors duration-300">
                    {item.title}
                  </h3>

                  <div
                    className="mb-6 flex-grow text-sm prose prose-lg max-w-none text-gray-700 leading-relaxed
    prose-headings:text-gray-900 prose-headings:font-bold
    prose-p:mb-4 prose-img:rounded-xl prose-img:shadow-md
    prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-4
    prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-4
    prose-li:mb-2
    prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-800 prose-a:inline-flex prose-a:items-center prose-a:gap-1
    prose-strong:font-semibold prose-strong:text-gray-900
    prose-blockquote:border-l-blue-600 prose-blockquote:bg-gray-100 prose-blockquote:px-6 prose-blockquote:py-4 prose-blockquote:rounded-r-lg
                  line-clamp-2"
                    dangerouslySetInnerHTML={{ __html: item.description }}
                  />

                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <span className="text-xs text-gray-500">
                      {formatDate(item.createdAt)}
                    </span>
                    <Link
                      to={`/news/${item._id}`}
                      onClick={() => window.scrollTo(0, 0)}
                      className="text-sm font-medium text-[#004080] hover:text-[#003366] flex items-center gap-1 transition-colors duration-300"
                    >
                      Read Full News
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
        </motion.div>
        {/* Empty State */}
        {filteredNews.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.6 }}
            className="text-center py-12"
          >
            <div className="mb-6">
              <svg
                className="w-24 h-24 mx-auto text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-极客时间 2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-500 mb-2">
              No news found in this category.
            </h3>
            <p className="text-gray-400">
              Check back later for new updates or try another category.
            </p>
          </motion.div>
        )}
        {/* Show More/Less Button */}
        {filteredNews.length > 6 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.8 }}
            className="text-center mt-12"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAllNews(!showAllNews)}
              className="px-8 py-3 bg-[#004080] hover:bg-[#003366] text-white font-medium rounded-full shadow-md hover:shadow-lg transition-all duration-300"
            >
              {showAllNews ? "Show Less News" : "Show More News"}
            </motion.button>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default News;
