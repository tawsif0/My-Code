import React, { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const News = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [showAllNews, setShowAllNews] = useState(false);
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  // News data
  const newsItems = [
    {
      id: 1,
      title: "New UK Visa Financial Requirements (June 2025)",
      excerpt:
        "Updated maintenance funds requirement for UK student visas increases by 12% starting June 1, 2025.",
      category: "policy-updates",
      date: "May 25, 2025",
      type: "update",
      urgency: "high",
      image:
        "https://images.unsplash.com/photo-1527631746610-bca00a040d60?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
    },
    {
      id: 2,
      title: "Exclusive Tie-up with University of Toronto",
      excerpt:
        "We're proud to announce our new partnership offering application fee waivers and dedicated support.",
      category: "partnerships",
      date: "May 20, 2025",
      type: "announcement",
      image:
        "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
    },
    {
      id: 3,
      title: "Increased Visa Processing Times for Australia",
      excerpt:
        "Australian student visas now taking 8-12 weeks due to high demand. Apply early!",
      category: "alerts",
      date: "May 18, 2025",
      type: "alert",
      urgency: "critical",
      image:
        "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
    },
    {
      id: 4,
      title: "Canada Extends Post-Graduation Work Permits",
      excerpt:
        "PGWP duration increased for certain programs starting Fall 2025 intake.",
      category: "policy-updates",
      date: "May 15, 2025",
      type: "update",
      urgency: "medium",
      image:
        "https://images.unsplash.com/photo-1517935706615-2717063c2225?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
    },
    {
      id: 5,
      title: "New Scholarship Program with ETH Zurich",
      excerpt:
        "Exclusive funding opportunities for STEM students through our new collaboration.",
      category: "partnerships",
      date: "May 10, 2025",
      type: "announcement",
      image:
        "https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
    },
    {
      id: 6,
      title: "US Embassy Closures in June 2025",
      excerpt:
        "Scheduled maintenance will close select visa processing centers June 15-20, 2025.",
      category: "alerts",
      date: "May 5, 2025",
      type: "alert",
      urgency: "high",
      image:
        "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
    },
    {
      id: 7,
      title: "Germany Relaxes Work Hour Restrictions",
      excerpt:
        "International students can now work 140 hours/month during semesters starting Winter 2025.",
      category: "policy-updates",
      date: "April 28, 2025",
      type: "update",
      urgency: "medium",
      image:
        "https://images.unsplash.com/photo-1543157145-f78c636d023d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
    },
    {
      id: 8,
      title: "Partnership with National University of Singapore",
      excerpt:
        "Priority application processing now available for our students.",
      category: "partnerships",
      date: "April 25, 2025",
      type: "announcement",
      image:
        "https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
    }
  ];

  const categories = [
    { id: "all", name: "All News" },
    { id: "policy-updates", name: "Policy Updates" },
    { id: "partnerships", name: "Partnerships" },
    { id: "alerts", name: "Alerts" }
  ];

  const filteredNews =
    activeTab === "all"
      ? newsItems
      : newsItems.filter((item) => item.category === activeTab);

  const displayedNews = showAllNews ? filteredNews : filteredNews.slice(0, 3);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        when: "beforeChildren"
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }
  };

  const headerVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        delay: 0.2
      }
    }
  };

  return (
    <section ref={ref} className="py-20 md:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={containerVariants}
          className="text-center mb-16"
        >
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
              key={category.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-5 py-2.5 rounded-full text-sm sm:text-base font-medium transition-all duration-300 ${
                activeTab === category.id
                  ? "bg-[#004080] text-white shadow-lg"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              onClick={() => {
                setActiveTab(category.id);
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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {displayedNews.map((item) => (
            <motion.div
              key={item.id}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
            >
              {/* News Image */}
              <div className="h-48 relative overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>

                {/* Urgency Badge */}
                {item.urgency && (
                  <div
                    className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold ${
                      item.urgency === "critical"
                        ? "bg-red-500 text-white"
                        : item.urgency === "high"
                        ? "bg-orange-500 text-white"
                        : "bg-yellow-400 text-gray-800"
                    }`}
                  >
                    {item.urgency === "critical"
                      ? "URGENT"
                      : item.urgency === "high"
                      ? "IMPORTANT"
                      : "UPDATE"}
                  </div>
                )}

                {/* Category Badge */}
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/90 text-xs font-semibold text-[#004080]">
                  {categories.find((c) => c.id === item.category)?.name}
                </div>
              </div>

              {/* News Content */}
              <div className="p-6 flex flex-col h-[calc(100%-12rem)]">
                <span className="text-xs text-gray-500 mb-2">{item.date}</span>

                <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-[#004080] transition-colors duration-300">
                  {item.title}
                </h3>

                <p className="mb-4 text-gray-600 flex-grow">{item.excerpt}</p>

                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <button className="text-sm font-medium text-[#004080] hover:text-[#003366] flex items-center gap-1 transition-colors duration-300">
                    Read Full Story
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
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Show More/Less Button */}
        {filteredNews.length > 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6 }}
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

        {/* Empty State */}
        {filteredNews.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.8 }}
            className="text-center py-12"
          >
            <p className="text-gray-500 text-lg">
              No news found in this category.
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default News;
