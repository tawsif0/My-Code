import React, { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

// Dummy blog images (replace with actual imports if needed)
const blogImages = [
  "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
  "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
  "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
  "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
  "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
  "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
];

const Blog = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [showAllPosts, setShowAllPosts] = useState(false);
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  const blogPosts = [
    {
      id: 1,
      title: "5 Steps to Secure a Canadian Student Visa",
      excerpt:
        "A comprehensive guide to navigating the Canadian student visa process with tips to avoid common mistakes.",
      category: "visa-guides",
      date: "June 10, 2025",
      readTime: "8 min read",
      image: blogImages[0]
    },
    {
      id: 2,
      title: "IELTS vs TOEFL: Which Suits Your Profile?",
      excerpt:
        "Compare both English proficiency tests to determine which one aligns better with your strengths and goals.",
      category: "exam-strategies",
      date: "May 28, 2025",
      readTime: "6 min read",
      image: blogImages[1]
    },
    {
      id: 3,
      title: "2025 Scholarship Deadlines for Top EU Universities",
      excerpt:
        "Don't miss these important deadlines for fully-funded scholarships across Europe's best institutions.",
      category: "scholarships",
      date: "May 15, 2025",
      readTime: "5 min read",
      image: blogImages[2]
    },
    {
      id: 4,
      title: "Why Germany is the New Hotspot for International Students",
      excerpt:
        "Exploring the benefits of studying in Germany including tuition-free education and post-study work options.",
      category: "country-spotlights",
      date: "April 30, 2025",
      readTime: "7 min read",
      image: blogImages[3]
    },
    {
      id: 5,
      title: "GRE Quantitative: Advanced Problem Solving Techniques",
      excerpt:
        "Master these strategies to tackle the most challenging GRE math problems with confidence.",
      category: "exam-strategies",
      date: "April 22, 2025",
      readTime: "9 min read",
      image: blogImages[4]
    },
    {
      id: 6,
      title: "Australia Student Visa: Complete Document Checklist",
      excerpt:
        "Everything you need to prepare for a successful Australian student visa application.",
      category: "visa-guides",
      date: "April 15, 2025",
      readTime: "6 min read",
      image: blogImages[5]
    },
    {
      id: 7,
      title: "Fully Funded Scholarships in Scandinavia",
      excerpt:
        "Discover Nordic countries' generous scholarship programs for international students.",
      category: "scholarships",
      date: "March 28, 2025",
      readTime: "5 min read",
      image: blogImages[6]
    },
    {
      id: 8,
      title: "Student Life in Japan: What to Expect",
      excerpt:
        "Cultural insights and practical tips for international students planning to study in Japan.",
      category: "country-spotlights",
      date: "March 15, 2025",
      readTime: "8 min read",
      image: blogImages[7]
    },
    {
      id: 9,
      title: "TOEFL Speaking: How to Score 26+",
      excerpt:
        "Proven techniques to improve your TOEFL speaking score with practice exercises.",
      category: "exam-strategies",
      date: "February 28, 2025",
      readTime: "7 min read",
      image: blogImages[8]
    }
  ];

  const categories = [
    { id: "all", name: "All Articles" },
    { id: "visa-guides", name: "Visa Guides" },
    { id: "country-spotlights", name: "Country Spotlights" },
    { id: "exam-strategies", name: "Exam Strategies" },
    { id: "scholarships", name: "Scholarships" }
  ];

  const filteredPosts =
    activeTab === "all"
      ? blogPosts
      : blogPosts.filter((post) => post.category === activeTab);

  const displayedPosts = showAllPosts
    ? filteredPosts
    : filteredPosts.slice(0, 3);

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
            Blogs & News
          </motion.span>
          <motion.h2
            variants={headerVariants}
            className="text-4xl md:text-5xl font-bold mb-6 !text-gray-900"
          >
            Study Abroad <span className="text-[#004080]">Resources</span>
          </motion.h2>
          <motion.p
            variants={headerVariants}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Expert advice, guides, and latest updates to help you navigate your
            international education journey.
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
                setShowAllPosts(false);
              }}
            >
              {category.name}
            </motion.button>
          ))}
        </motion.div>

        {/* Blog Posts Grid */}
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {displayedPosts.map((post) => (
            <motion.div
              key={post.id}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
            >
              {/* Post Image */}
              <div className="h-48 relative overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              </div>

              {/* Post Content */}
              <div className="p-6 flex flex-col h-[calc(100%-12rem)]">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#004080]/10 text-[#004080]">
                    {categories.find((c) => c.id === post.category)?.name}
                  </span>
                  <span className="text-xs text-gray-500">{post.date}</span>
                </div>

                <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-[#004080] transition-colors duration-300">
                  {post.title}
                </h3>

                <p className="mb-4 text-gray-600 flex-grow">{post.excerpt}</p>

                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <span className="text-xs text-gray-500">{post.readTime}</span>
                  <button className="text-sm font-medium text-[#004080] hover:text-[#003366] flex items-center gap-1 transition-colors duration-300">
                    Read More
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

        {/* Empty State */}
        {filteredPosts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.6 }}
            className="text-center py-12"
          >
            <p className="text-gray-500 text-lg">
              No articles found in this category.
            </p>
          </motion.div>
        )}

        {/* Show More/Less Button */}
        {filteredPosts.length > 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.8 }}
            className="text-center mt-12"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAllPosts(!showAllPosts)}
              className="px-8 py-3 bg-[#004080] hover:bg-[#003366] text-white font-medium rounded-full shadow-md hover:shadow-lg transition-all duration-300"
            >
              {showAllPosts ? "Show Less Articles" : "Show More Articles"}
            </motion.button>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default Blog;
