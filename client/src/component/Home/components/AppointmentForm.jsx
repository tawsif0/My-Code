/* eslint-disable react-hooks/exhaustive-deps */
import React, { useRef, useEffect, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "react-hot-toast";
const AppointmentForm = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    countries: [],
    countryOther: "",
    studyLevel: "",
    studyLevelOther: "",
    intake: "",
    intakeOther: "",
    sponsor: "",
    sponsorOther: "",
    message: "",
    status: "pending",
    assignedTo: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);
  const countryDropRef = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => {
      if (sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, []);

  const countryOptions = [
    "Finland",
    "Estonia",
    "Denmark",
    "Sweden",
    "Norway",
    "Hungary",
    "USA",
    "UK",
    "Australia",
    "Italy",
    "Spain",
    "Portugal",
    "Greece",
    "Poland",
    "Lithuania",
    "Latvia",
    "Cyprus",
    "Malta",
    "Czech Republic",
    "Romania",
    "China",
    "Malaysia",
    "Thailand",
    "Other",
  ];

  useEffect(() => {
    const onClickOutside = (e) => {
      if (
        countryDropRef.current &&
        !countryDropRef.current.contains(e.target)
      ) {
        setCountryOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const toggleCountry = (value) => {
    setFormData((prev) => {
      const exists = prev.countries.includes(value);
      const next = exists
        ? prev.countries.filter((v) => v !== value)
        : [...prev.countries, value];
      return { ...prev, countries: next };
    });
  };
  const studyLevels = [
    "Undergraduate",
    "Postgraduate",
    "Diploma",
    "Language Course",
    "PhD",
    "Other",
  ];
  const intakes = [
    "September 2025",
    "January 2026",
    "May 2026",
    "September 2026",
    "Other",
  ];
  const sponsors = ["Self-Funded", "Guardian", "Scholarship", "Other"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");

    try {
      // Prepare final data
      const submissionData = {
        ...formData,
        countries:
          formData.countries.includes("Other") && formData.countryOther
            ? [
                ...formData.countries.filter((c) => c !== "Other"),
                formData.countryOther.trim(),
              ]
            : formData.countries, // remove "Other" if not selected
        studyLevel:
          formData.studyLevel === "Other"
            ? formData.studyLevelOther
            : formData.studyLevel,
        intake:
          formData.intake === "Other" ? formData.intakeOther : formData.intake,
        sponsor:
          formData.sponsor === "Other"
            ? formData.sponsorOther
            : formData.sponsor,
      };

      // Remove the "Other" fields from submissionData
      delete submissionData.countryOther;
      delete submissionData.studyLevelOther;
      delete submissionData.intakeOther;
      delete submissionData.sponsorOther;

      // Ensure that countries is not empty before submission
      if (!submissionData.countries || submissionData.countries.length === 0) {
        setSubmitError("Please select at least one country.");
        setIsSubmitting(false);
        return;
      }

      const response = await axios.post(
        "http://localhost:3500/api/admin/consultancy",
        submissionData
      );

      if (response.data.success) {
        setSubmitSuccess(true);
        toast.success("Consultation request submitted successfully!");
        // Reset form
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          countries: [], // reset countries to empty array
          countryOther: "",
          studyLevel: "",
          studyLevelOther: "",
          intake: "",
          intakeOther: "",
          sponsor: "",
          sponsorOther: "",
          message: "",
          status: "pending",
          assignedTo: null,
        });
      }
    } catch (error) {
      toast.error("Submission error:", error);
      setSubmitError(
        error.response?.data?.message ||
          "Failed to submit form. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      ref={sectionRef}
      className={`py-34 transition-opacity duration-1000 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header Section */}
        <div
          className={`text-center mb-16 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <motion.span className="cursor-pointer mb-8 px-3 py-1.5 bg-[#004080] text-white font-semibold rounded-full shadow-lg inline-flex items-center justify-center transform hover:scale-105 transition-transform duration-300 group">
            Get Expert Advice
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-bold !text-gray-900 mb-4">
            Book a <span className="text-[#004080]">Free Consultation</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Schedule a session with our experts to discuss your study abroad
            plans.
          </p>
        </div>

        {/* Form & Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Form Section */}
          <div
            className={`${
              submitSuccess
                ? "bg-white flex justify-center items-center h-full p-8 rounded-2xl shadow-xl border border-gray-100 transition-all duration-700 delay-100"
                : "opacity-100 translate-y-0 bg-white p-8 rounded-2xl shadow-xl border border-gray-100 transition-all duration-700 delay-100"
            }`}
          >
            {/* Success Message */}
            {submitSuccess ? (
              <div className="text-center py-10 flex flex-col justify-center items-center space-y-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 text-green-500 mx-auto mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Thank You!
                </h3>
                <p className="text-gray-600 mb-6">
                  Your consultation request has been submitted successfully.
                </p>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Full Name */}
                <div className="space-y-2">
                  <label
                    htmlFor="fullName"
                    className="text-sm font-medium text-gray-700"
                  >
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#004080] focus:border-gray-500 transition-all duration-300"
                    placeholder="John Doe"
                    required
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700"
                  >
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#004080] focus:border-gray-500 transition-all duration-300"
                    placeholder="john@example.com"
                    required
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label
                    htmlFor="phone"
                    className="text-sm font-medium text-gray-700"
                  >
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#004080] focus:border-gray-500 transition-all duration-300"
                    placeholder="+880 1234 567890"
                    required
                  />
                </div>

                {/* Countries (multi-select with checkboxes) */}
                <div className="relative space-y-2" ref={countryDropRef}>
                  <label className="text-sm font-medium text-gray-700">
                    Preferred Countries <span className="text-red-500">*</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setCountryOpen((s) => !s)}
                    className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#004080] transition-all bg-white flex items-center justify-between"
                  >
                    <span className="truncate">
                      {formData.countries.length === 0
                        ? "Select countries"
                        : formData.countries.join(", ")}
                    </span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-5 w-5 transition-transform ${
                        countryOpen ? "rotate-180" : ""
                      }`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  {countryOpen && (
                    <div
                      className="absolute z-50 w-full mt-1 max-h-64 overflow-y-auto border border-gray-200 rounded-xl shadow-lg bg-white scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
                      onWheel={(e) => e.stopPropagation()}
                    >
                      <div className="p-3">
                        {countryOptions.map((c) => (
                          <label
                            key={c}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                              checked={formData.countries.includes(c)}
                              onChange={() => toggleCountry(c)}
                            />
                            <span className="text-gray-800 text-sm">{c}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* "Other" text field when selected */}
                  {formData.countries.includes("Other") && (
                    <input
                      type="text"
                      name="countryOther"
                      value={formData.countryOther}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          countryOther: e.target.value,
                        }))
                      }
                      className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#004080] transition-all duration-300 mt-2"
                      placeholder="Please specify country"
                      required
                    />
                  )}
                </div>

                {/* Study Level */}
                <div className="space-y-2">
                  <label
                    htmlFor="studyLevel"
                    className="text-sm font-medium text-gray-700"
                  >
                    Study Level <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="studyLevel"
                    name="studyLevel"
                    value={formData.studyLevel}
                    onChange={handleChange}
                    className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#004080]  transition-all duration-300 appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiAjdjQgdjYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cG9seWxpbmUgcG9pbnRzPSI2IDkgMTIgMTUgMTggOSI+PC9wb2x5bGluZT48L3N2Zz4=')] bg-no-repeat bg-[center_right_1rem] bg-[length:1.5rem]"
                    required
                  >
                    <option value="">Select Study Level</option>
                    {studyLevels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                  {formData.studyLevel === "Other" && (
                    <input
                      type="text"
                      name="studyLevelOther"
                      value={formData.studyLevelOther}
                      onChange={handleChange}
                      className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#004080]  transition-all duration-300 mt-2"
                      placeholder="Please specify study level"
                      required
                    />
                  )}
                </div>

                {/* Intake */}
                <div className="space-y-2">
                  <label
                    htmlFor="intake"
                    className="text-sm font-medium text-gray-700"
                  >
                    Intended Intake <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="intake"
                    name="intake"
                    value={formData.intake}
                    onChange={handleChange}
                    className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#004080] transition-all duration-300 appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiAjdjQgdjYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cG9seWxpbmUgcG9pbnRzPSI2IDkgMTIgMTUgMTggOSI+PC9wb2x5bGluZT48L3N2Zz4=')] bg-no-repeat bg-[center_right_1rem] bg-[length:1.5rem]"
                    required
                  >
                    <option value="">Select Intake</option>
                    {intakes.map((intake) => (
                      <option key={intake} value={intake}>
                        {intake}
                      </option>
                    ))}
                  </select>
                  {formData.intake === "Other" && (
                    <input
                      type="text"
                      name="intakeOther"
                      value={formData.intakeOther}
                      onChange={handleChange}
                      className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#004080]  transition-all duration-300 mt-2"
                      placeholder="Please specify intake"
                      required
                    />
                  )}
                </div>

                {/* Sponsor */}
                <div className="space-y-2">
                  <label
                    htmlFor="sponsor"
                    className="text-sm font-medium text-gray-700"
                  >
                    Sponsor <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="sponsor"
                    name="sponsor"
                    value={formData.sponsor}
                    onChange={handleChange}
                    className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#004080] transition-all duration-300 appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiAjdjQgdjYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cG9seWxpbmUgcG9pbnRzPSI2IDkgMTIgMTUgMTggOSI+PC9wb2x5bGluZT48L3N2Zz4=')] bg-no-repeat bg-[center_right_1rem] bg-[length:1.5rem]"
                    required
                  >
                    <option value="">Select Sponsor</option>
                    {sponsors.map((sponsor) => (
                      <option key={sponsor} value={sponsor}>
                        {sponsor}
                      </option>
                    ))}
                  </select>
                  {formData.sponsor === "Other" && (
                    <input
                      type="text"
                      name="sponsorOther"
                      value={formData.sponsorOther}
                      onChange={handleChange}
                      className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#004080] transition-all duration-300 mt-2"
                      placeholder="Please specify sponsor"
                      required
                    />
                  )}
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <label
                    htmlFor="message"
                    className="text-sm font-medium text-gray-700"
                  >
                    Additional Message (Optional)
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="3"
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#004080] focus:border-gray-500 transition-all duration-300"
                    placeholder="Tell us more about your requirements..."
                  ></textarea>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#ffd700] text-black py-4 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:opacity-90 transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting
                    ? "Submitting..."
                    : "Book Your Free Consultation"}
                </button>

                {submitError && (
                  <div className="text-red-500 text-center mt-4">
                    {submitError}
                  </div>
                )}
              </form>
            )}
          </div>

          {/* Info Section (same as before) */}
          <div
            className={`space-y-8 transition-all duration-700 delay-200 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            {/* Why Book Card */}
            <div className="bg-gradient-to-br from-[#a0cbe8] to-[#a0cbe8]-dark text-black p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500">
              <h3 className="text-2xl font-bold mb-6 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 mr-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Why Book a Consultation?
              </h3>
              <ul className="space-y-5">
                {[
                  "Personalized advice tailored to your academic profile and goals",
                  "University shortlisting with best-fit recommendations",
                  "Visa process guidance for your destination",
                  "Scholarship and funding opportunity insights",
                  "Application strategy and document review",
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mt-1 mr-3 flex-shrink-0"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Consultation Details Card */}
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500">
              <h3 className="text-2xl font-bold mb-6 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 mr-3 text-[#004080]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Consultation Details
              </h3>
              <div className="space-y-5">
                {[
                  ["Duration", "30 minutes (extendable if needed)"],
                  ["Available Days", "Saturday to Thursday (Friday closed)"],
                  ["Preparation", "Have academic documents and passport ready"],
                ].map(([title, desc], index) => (
                  <div key={index} className="flex">
                    <div className="bg-[#004080]/10 p-2 rounded-lg mr-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-[#004080]"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{title}</h4>
                      <p className="text-gray-600">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppointmentForm;
