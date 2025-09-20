// Countries.jsx
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { fadeIn, staggerContainer, textVariant } from "../utils/motion";
import React, { useState, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import "./Countries.css";
import axios from "axios";
import { toast } from "react-toastify";

gsap.registerPlugin(ScrollTrigger);

const Countries = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [activeDetail, setActiveDetail] = useState(null);
  const heroRef = useRef(null);
  const scrollIndicatorRef = useRef(null);
  const contentRef = useRef(null);

  const fetchCountries = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("http://localhost:3500/api/countries");
      setCountries(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching countries:", err);
      toast.error(
        err.response?.data?.message || err.message || "Failed to load countries"
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    if (!heroRef.current || !scrollIndicatorRef.current) return;

    const ctx = gsap.context(() => {
      // Hero section animation
      gsap.fromTo(
        heroRef.current,
        { minHeight: "100vh" },
        {
          minHeight: window.innerWidth < 768 ? "70vh" : "60vh",
          ease: "none",
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: () => (window.innerWidth < 768 ? "+=300" : "+=400"),
            scrub: 0.6,
            invalidateOnRefresh: true,
            markers: false // Set to true for debugging
          }
        }
      );

      // Scroll indicator fade out
      gsap.fromTo(
        scrollIndicatorRef.current,
        { opacity: 1 },
        {
          opacity: 0,
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top+=40",
            end: "+=200",
            scrub: 0.6
          }
        }
      );
    });

    return () => ctx.revert();
  }, [loading]);

  const toggleCountrySelection = (countryId) => {
    if (selectedCountries.includes(countryId)) {
      setSelectedCountries(selectedCountries.filter((id) => id !== countryId));
    } else {
      if (selectedCountries.length < 3) {
        setSelectedCountries([...selectedCountries, countryId]);
      } else {
        toast.info("You can compare up to 3 countries at a time");
      }
    }
  };

  const selectedCountryData = () => {
    return countries.filter((country) =>
      selectedCountries.includes(country._id)
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[#004080] text-xl">Loading countries...</div>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={staggerContainer()}
      className="min-h-screen bg-transparent"
    >
      {/* Hero Section */}
      <section
        className="min-h-screen relative py-20 md:py-32 overflow-hidden career-hero"
        ref={heroRef}
      >
        <div className="container mx-auto px-6 relative z-10 h-full flex flex-col justify-center pb-28 md:pb-36">
          <motion.div
            ref={contentRef}
            variants={textVariant()}
            initial="hidden"
            animate="show"
            className="text-center max-w-4xl mx-auto"
          >
            <motion.span className="cursor-pointer mb-8 px-3 py-1.5 bg-[#004080] text-white font-semibold rounded-full shadow-lg inline-flex items-center justify-center transform hover:scale-105 transition-transform duration-300 group">
              Countries
            </motion.span>
            <motion.h1 className="text-4xl md:text-6xl font-bold mb-6 !text-black">
              Explore <span className="text-[#004080]">Study</span> Destinations
              Worldwide
            </motion.h1>
            <motion.p className="text-xl md:text-2xl text-[#004080] mb-8">
              Compare tuition fees, scholarships, visa rules, and job
              opportunities across the globe
            </motion.p>
          </motion.div>
        </div>
        <div
          className="scroll-indicator"
          ref={scrollIndicatorRef}
          aria-hidden="true"
        >
          <div className="mouse"></div>
          <span className="scroll-indicator__label">Scroll to explore</span>
        </div>
      </section>

      {/* Country Grid Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <motion.div variants={textVariant()} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold !text-black mb-4">
              Our <span className="text-[#004080]">Partner</span> Countries
            </h2>
            <p className="text-lg text-[#004080] max-w-2xl mx-auto">
              Visa Success Rate 100%
            </p>
          </motion.div>

          {/* Empty State */}
          {countries.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-[#a0cbe8]"
            >
              <div className="mb-6">
                <svg
                  className="w-24 h-24 mx-auto text-[#a0cbe8]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-[#004080] mb-4">
                No Countries Available
              </h3>
              <p className="text-lg text-[#004080] mb-6 max-w-md mx-auto">
                Currently there are no study destinations available. Please
                check back later for updates.
              </p>
              <button
                onClick={fetchCountries}
                className="px-6 py-3 bg-[#004080] text-white rounded-lg font-medium hover:bg-[#003366] transition-colors duration-300"
              >
                Refresh
              </button>
            </motion.div>
          )}

          {countries.length > 0 && (
            <>
              {/* Comparison Mode Toggle */}
              <motion.div
                variants={fadeIn("up", "tween", 0.2, 0.5)}
                className="flex justify-center mb-8"
              >
                <div className="bg-white/30 p-1 rounded-full shadow-md border border-[#a0cbe8] backdrop-blur-sm">
                  <button
                    onClick={() => setComparisonMode(false)}
                    className={`px-6 py-2 rounded-full font-medium transition-all ${
                      !comparisonMode
                        ? "bg-[#004080] text-white"
                        : "text-[#004080] hover:bg-[#a0cbe8]/30"
                    }`}
                  >
                    Browse Countries
                  </button>
                  <button
                    onClick={() => {
                      if (selectedCountries.length > 0) {
                        setComparisonMode(true);
                      }
                    }}
                    className={`px-6 py-2 rounded-full font-medium transition-all ${
                      comparisonMode
                        ? "bg-[#004080] text-white"
                        : selectedCountries.length > 0
                        ? "text-[#004080] hover:bg-[#a0cbe8]/30"
                        : "text-gray-400 cursor-not-allowed"
                    }`}
                    disabled={selectedCountries.length === 0}
                  >
                    Compare ({selectedCountries.length}/3)
                  </button>
                </div>
              </motion.div>

              {comparisonMode ? (
                <ComparisonView countries={selectedCountryData()} />
              ) : (
                <motion.div
                  variants={staggerContainer()}
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
                >
                  {countries.map((country, index) => (
                    <motion.div
                      key={country._id}
                      variants={fadeIn("up", "tween", index * 0.1, 0.5)}
                      whileHover={{
                        y: -10,
                        boxShadow: "0 15px 30px rgba(0, 64, 128, 0.2)"
                      }}
                      className={`bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border-2 transition-all duration-300 ${
                        selectedCountries.includes(country._id)
                          ? "border-[#ffd700]"
                          : "border-transparent"
                      } hover:shadow-xl flex flex-col`}
                    >
                      <div className="flex flex-col justify-between h-full p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center">
                            <span className="mr-3 flex items-center justify-center w-8 h-5 relative">
                              {country.flag ? (
                                <img
                                  src={`http://localhost:3500/api/countries/flag/${country.flag}`}
                                  alt={`${country.name} flag`}
                                  className="w-8 h-5 object-cover shadow-md border border-gray-200 hover:scale-110 transition-transform duration-300"
                                />
                              ) : (
                                <div className="w-8 h-5 flex items-center justify-center bg-gray-100 text-gray-400 shadow-md border border-gray-200">
                                  🏳️
                                </div>
                              )}
                            </span>

                            <h3 className="text-xl font-bold text-[#004080]">
                              {country.name}
                            </h3>
                          </div>
                          <button
                            onClick={() => toggleCountrySelection(country._id)}
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              selectedCountries.includes(country._id)
                                ? "bg-[#ff0000] text-[#ffffff] hover:bg-[#ff0005]/80"
                                : "bg-[#ffd700] text-[#004080] hover:bg-[#ffd705]/80"
                            }`}
                          >
                            {selectedCountries.includes(country._id)
                              ? "Remove"
                              : "Compare"}
                          </button>
                        </div>
                        <ul className="space-y-2">
                          {country.highlights &&
                            country.highlights.map((highlight, i) => (
                              <li key={i} className="flex items-start">
                                <svg
                                  className="h-5 w-5 text-[#ffd700] mr-2 mt-0.5 flex-shrink-0"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                                <span className="text-[#004080]">
                                  {highlight}
                                </span>
                              </li>
                            ))}
                        </ul>
                        <button
                          onClick={() =>
                            setActiveDetail(
                              activeDetail === country._id ? null : country._id
                            )
                          }
                          className="mt-6 w-full bg-[#004080]/10 hover:bg-[#004080]/20 text-[#004080] font-medium py-2 px-4 rounded-lg transition-colors duration-300"
                        >
                          {activeDetail === country._id
                            ? "Hide Details"
                            : "View Details"}
                        </button>

                        {activeDetail === country._id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="mt-4 overflow-hidden"
                          >
                            <div className="pt-4 border-t border-[#a0cbe8]">
                              <h4 className="font-semibold text-[#004080] mb-2">
                                Visa Success Rate
                              </h4>
                              <p className="text-[#004080]">100%</p>

                              {country.description &&
                                country.description.length > 0 && (
                                  <>
                                    <h4 className="font-semibold text-[#004080] mb-2 mt-4">
                                      Description
                                    </h4>
                                    <ul className="list-disc pl-5 text-[#004080]">
                                      {country.description.map((desc, idx) => (
                                        <li key={idx}>{desc}</li>
                                      ))}
                                    </ul>
                                  </>
                                )}
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </>
          )}
        </div>
      </section>
    </motion.div>
  );
};

const ComparisonView = ({ countries }) => {
  if (countries.length < 2) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12 bg-[#a0cbe8]/20 rounded-xl border-2 border-dashed border-[#a0cbe8] backdrop-blur-sm"
      >
        <div className="text-[#004080] mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-[#004080] mb-2">
          Select 2-3 countries to compare
        </h3>
        <p className="text-[#004080]">
          Click the "Compare" button on country cards to add them to comparison
        </p>
      </motion.div>
    );
  }

  // Get all unique criteria across all countries
  const allCriteria = [];
  countries.forEach((country) => {
    if (country.criteria && Array.isArray(country.criteria)) {
      country.criteria.forEach((criterionObj) => {
        if (
          criterionObj.criteria &&
          !allCriteria.find((c) => c._id === criterionObj.criteria._id)
        ) {
          allCriteria.push({
            _id: criterionObj.criteria._id,
            name: criterionObj.criteria.name
          });
        }
      });
    }
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-[#a0cbe8]"
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#a0cbe8]">
              <th className="py-4 px-6 text-left font-semibold text-[#004080] bg-[#a0cbe8]/30">
                Criteria
              </th>
              {countries.map((country) => (
                <th
                  key={country._id}
                  className="py-4 px-6 text-center font-semibold text-[#004080] bg-[#a0cbe8]/30"
                >
                  <div className="flex flex-col items-center">
                    {country.flag ? (
                      <img
                        src={`http://localhost:3500/api/countries/flag/${country.flag}`}
                        alt={`${country.name} flag`}
                        className="w-8 h-6 object-contain mb-2"
                      />
                    ) : (
                      <span className="flex items-center justify-center w-8 h-8 mb-2">
                        🏳️
                      </span>
                    )}
                    <span>{country.name}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Criteria Rows */}
            {allCriteria.map((criteria, index) => (
              <tr
                key={criteria._id}
                className={
                  index % 2 === 0
                    ? "border-b border-[#a0cbe8]/30 bg-[#a0cbe8]/10"
                    : "border-b border-[#a0cbe8]/30"
                }
              >
                <td className="py-4 px-6 font-medium text-[#004080]">
                  {criteria.name}
                </td>
                {countries.map((country) => {
                  const countryCriterion = country.criteria?.find(
                    (c) => c.criteria && c.criteria._id === criteria._id
                  );
                  return (
                    <td
                      key={country._id}
                      className="py-4 px-6 text-center text-[#004080]"
                    >
                      {countryCriterion ? (
                        <div className="text-center">
                          {countryCriterion.description || "N/A"}
                        </div>
                      ) : (
                        "N/A"
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default Countries;
