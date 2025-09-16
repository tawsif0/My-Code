/* eslint-disable no-unused-vars */
import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { fadeIn, staggerContainer, textVariant } from "../utils/motion";
import { useNavigate } from "react-router-dom";
const VisaProcess = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 });
  const navigate = useNavigate();

  const handleBookConsultation = () => {
    navigate("/appointment");
  };
  const serviceIcons = {
    consultation: "👩‍💻", // AI consultation
    university: "🏛️", // University building
    documents: "📚", // Stack of books
    sop: "✒️", // Fountain pen
    offer: "📜", // Scroll
    payment: "💸", // Money with wings
    finance: "🏦", // Bank
    visa: "🛂", // Passport control
    legalization: "🖇️", // Linked papers
    interview: "🎙️", // Studio microphone
    relocation: "🧳", // Luggage
  };

  const generalSteps = [
    {
      title: "Initial Consultation & Profile Assessment",
      description:
        "Our expert counselor assesses your profile and suggests ideal universities/countries based on your qualifications and preferences",
      icon: serviceIcons.consultation,
      side: "left",
    },
    {
      title: "University/College Shortlisting & Application",
      description:
        "We shortlist perfect-fit universities and handle the entire application submission process",
      icon: serviceIcons.university,
      side: "right",
    },
    {
      title: "Documents Arrangement",
      description:
        "We organize academic certificates, transcripts, test scores and craft EU-standard CVs",
      icon: serviceIcons.documents,
      side: "left",
    },
    {
      title: "Motivation Letter & SOP Crafting",
      description:
        "Our writers create compelling narratives using proven templates and storytelling techniques",
      icon: serviceIcons.sop,
      side: "right",
    },
    {
      title: "Offer Letter & Acceptance",
      description:
        "We help you track application status and guide through acceptance procedures",
      icon: serviceIcons.offer,
      side: "left",
    },
    {
      title: "Tuition Fee Payment",
      description:
        "We provide secure guidance for international tuition payments",
      icon: serviceIcons.payment,
      side: "right",
    },
    {
      title: "Financial Documentation",
      description:
        "Expert guidance on forex rates, student bank accounts, and proof of funds",
      icon: serviceIcons.finance,
      side: "left",
    },
    {
      title: "Visa Application & VFS Appointment",
      description: "We handle slot bookings and visa application procedures",
      icon: serviceIcons.visa,
      side: "right",
    },
    {
      title: "Document Legalization",
      description:
        "End-to-end attestation through Education Board → Foreign Ministry → Embassy",
      icon: serviceIcons.legalization,
      side: "left",
    },
    {
      title: "Embassy Interview Preparation",
      description:
        "Country-specific mock interviews with actual question banks",
      icon: serviceIcons.interview,
      side: "right",
    },
    {
      title: "Visa Outcome & Relocation",
      description:
        "Complete pre-departure support including flights, accommodation, and job leads",
      icon: serviceIcons.relocation,
      side: "left",
    },
  ];

  return (
    <motion.section
      ref={sectionRef}
      initial="hidden"
      whileInView="show"
      viewport={{ once: false, amount: 0.1 }}
      variants={staggerContainer()}
      className="py-16 relative overflow-hidden"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div variants={textVariant()} className="text-center mb-16">
          <motion.h2 className="text-4xl md:text-5xl font-bold mb-4 text-[#004080]">
            Our Step-by-Step Process
          </motion.h2>
          <motion.p
            className="text-lg text-gray-600 max-w-3xl mx-auto"
            variants={fadeIn("up", "tween", 0.2, 0.4)}
          >
            Follow our proven process for a smooth study abroad journey
          </motion.p>
        </motion.div>

        <div className="relative max-w-5xl mx-auto">
          {/* Timeline line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-[#004080] to-[#a0cbe8] transform -translate-x-1/2"></div>

          {/* Timeline dots */}

          {generalSteps.map((step, index) => (
            <div
              key={index}
              className="absolute left-1/2 w-8 h-8 rounded-full bg-white border-4 border-[#004080] shadow-md transform -translate-x-1/2 -translate-y-4 items-center justify-center hidden md:flex" // Hide dots on mobile, show on md and larger
              style={{ top: `${(index / (generalSteps.length - 1)) * 100}%` }}
            >
              <span className="text-[#004080] font-bold text-sm">
                {index + 1}
              </span>
            </div>
          ))}
          {/* Process steps */}
          <div className="space-y-8">
            {generalSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative ${
                  index % 2 === 0
                    ? "pr-8 md:pr-0 md:pl-8"
                    : "pl-8 md:pl-0 md:pr-8"
                }`}
                style={{
                  marginTop: index === 0 ? 0 : "0",
                  minHeight: "180px", // Minimum height for mobile
                }}
              >
                <div
                  className={`flex flex-col h-full ${
                    step.side === "left" ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  <div
                    className={`md:w-1/2 ${
                      step.side === "left" ? "md:pr-8" : "md:pl-8"
                    } h-full`}
                  >
                    <div className="bg-white p-6 rounded-xl shadow-md border border-[#a0cbe8] relative h-full flex flex-col">
                      {/* Mobile number indicator */}
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 md:hidden">
                        <div className="w-8 h-8 rounded-full bg-white border-4 border-[#004080] shadow-md flex items-center justify-center">
                          <span className="text-[#004080] font-bold text-sm">
                            {index + 1}
                          </span>
                        </div>
                      </div>

                      {/* Card content */}
                      <div className="flex items-start flex-grow">
                        <div className="w-12 h-12 rounded-lg bg-[#004080] flex items-center justify-center text-[#ffd700] text-2xl mr-4 flex-shrink-0">
                          {step.icon}
                        </div>
                        <div className="flex flex-col justify-center">
                          <h3 className="text-xl font-bold text-[#004080] leading-tight mb-2">
                            {step.title}
                          </h3>
                          <p className="text-gray-600 text-sm md:text-base">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:block md:w-1/2"></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div className="text-center mt-16">
          <motion.button
            whileHover={{
              scale: 1.05,
              boxShadow: "0 10px 25px rgba(0, 64, 128, 0.3)",
            }}
            onClick={handleBookConsultation}
            whileTap={{ scale: 0.95 }}
            className="bg-[#004080] hover:bg-[#003366] text-white font-semibold py-4 px-10 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-lg relative overflow-hidden group"
          >
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-[#ffd700]/20 via-[#ffd700]/40 to-[#ffd700]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -translate-x-full group-hover:translate-x-full"></div>
            </div>
            Begin Your Journey
          </motion.button>
          <p className="mt-4 text-gray-500 text-sm">
            Get started with our expert guidance today
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default VisaProcess;
