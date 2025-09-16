/* eslint-disable no-unused-vars */
import React, { useRef, useEffect, useState } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "@studio-freight/lenis";
import { fadeIn, staggerContainer, textVariant } from "../utils/motion";
gsap.registerPlugin(ScrollTrigger);

const Services = () => {
  const sectionRef = useRef(null);
  const heroRef = useRef(null);
  const freeServicesRef = useRef(null);
  const isInView = useInView(sectionRef, {
    once: false,
    amount: 0.07,
    margin: "0px 0px -20% 0px",
  });

  const controls = useAnimation();

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: "vertical",
      gestureDirection: "vertical",
      smooth: true,
      smoothTouch: false,
      touchMultiplier: 2,
    });

    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    lenis.on("scroll", () => {
      ScrollTrigger.update();
    });

    return () => {
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    } else {
      controls.start("hidden");
    }
  }, [isInView, controls]);

  // Animation variants
  // Animation variants (hide slow, appear fast)
  const containerVariants = {
    hidden: {
      opacity: 0,
      transition: {
        // hide children first, slowly
        staggerChildren: 0.08,
        staggerDirection: -1,
        duration: 0.8,
      },
    },
    visible: {
      opacity: 1,
      transition: {
        // appear fast
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 30,
      transition: { duration: 1.0, ease: "easeInOut" }, // slow fade out
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: [0.16, 0.77, 0.47, 0.97] }, // fast in
    },
  };

  const luxeBarVariants = {
    hidden: { opacity: 0, scaleX: 0.75, filter: "blur(2px)" },
    visible: {
      opacity: 1,
      scaleX: 1,
      filter: "blur(0px)",
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <section ref={sectionRef} className="pt-36 overflow-hidden relative ">
      <div className="container mx-auto px-6 lg:px-8 max-w-7xl relative z-10">
        {/* Hero Section */}
        <motion.div
          ref={heroRef}
          initial="hidden"
          animate={controls}
          variants={containerVariants}
          className="text-center mb-5"
        >
          <motion.span
            variants={itemVariants}
            className="mb-8 px-3 py-1.5 bg-[#004080] text-white font-semibold rounded-full shadow-lg inline-flex items-center justify-center transform hover:scale-105 transition-transform duration-300 group"
          >
            Our Services
          </motion.span>
          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#004080] mb-6"
          >
            <span className="text-black">
              Trusted Visa and Immigration Consultancy{" "}
            </span>{" "}
            At Your Service
          </motion.h1>
          <motion.div
            variants={luxeBarVariants}
            className="relative mx-auto mt-6 h-1 w-28 sm:w-32 rounded-full overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#001b35] via-[#004080] to-[#00a6ff] opacity-70" />
            <div className="pointer-events-none absolute -inset-2 rounded-full bg-[#00a6ff] blur-md opacity-20" />
            <div className="absolute inset-y-[35%] left-0 right-0 h-px bg-white/60 opacity-40" />
            <motion.div
              className="absolute inset-y-0 -left-1/3 w-1/2"
              style={{
                background:
                  "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.9) 50%, rgba(255,255,255,0) 100%)",
              }}
              initial={{ x: "-120%" }}
              animate={{ x: ["-120%", "160%"] }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: [0.2, 0.8, 0.2, 1],
              }}
            />
          </motion.div>
        </motion.div>

        {/* Intro Statement */}
        <motion.div
          initial="hidden"
          animate={controls}
          variants={fadeIn}
          className="mb-20"
        >
          <p className="text-lg md:text-xl text-gray-700 text-center">
            Northern Lights Study and Immigration Consultancy empowers aspiring
            students with accurate country-specific information and end-to-end
            admission, scholarship, and visa services through mentor with 17+
            years experience.
          </p>
        </motion.div>

        {/* Free Services Highlights */}
        <motion.div
          ref={freeServicesRef}
          initial="hidden"
          animate={controls}
          variants={containerVariants}
          className="mb-32 py-12 px-4 sm:px-6 lg:px-8"
        >
          <motion.h2
            variants={itemVariants}
            className="text-4xl font-bold text-center !text-black mb-12"
          >
            Our <span className="text-[#004080]">Free</span> Services
          </motion.h2>

          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
          >
            {[
              {
                title: "Expert Counseling",
                description: "Free session for university/country selection",
                icon: "💬",
                bg: "from-blue-400/20 to-blue-600/20",
              },
              {
                title: "Profile Assessment",
                description: "Academic evaluation + university recommendations",
                icon: "📊",
                bg: "from-purple-400/20 to-purple-600/20",
              },
              {
                title: "Visa Process Walkthrough",
                description: "Step-by-step guidance",
                icon: "🛂",
                bg: "from-teal-400/20 to-teal-600/20",
              },
            ].map((service, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.03 }}
                className="cursor-pointer group bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-gray-200 relative overflow-hidden transition-all duration-300 hover:border-transparent"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${service.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl`}
                />
                <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] rounded-2xl group-hover:bg-white/20 transition-all duration-300" />
                <div className="relative z-10">
                  <div className="text-4xl mb-6 group-hover:text-white transition-colors duration-300">
                    {service.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-white transition-colors duration-300">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 group-hover:text-black/90 transition-colors duration-300">
                    {service.description}
                  </p>
                  <div className="absolute top-0 right-0 w-16 h-16 bg-blue-400/10 rounded-full filter blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Comprehensive Services */}
        <motion.div
          initial="hidden"
          animate={controls}
          variants={containerVariants}
          className="mb-32"
        >
          <motion.h2
            variants={itemVariants}
            className="text-4xl font-bold text-center !text-black mb-12"
          >
            Our <span className="text-[#004080]">Comprehensive</span> Services
          </motion.h2>

          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20"
          >
            {[
              {
                title: "Study Abroad Consultancy",
                icon: (
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                ),
                features: [
                  "Documents Arrangement",
                  "University Application",
                  "Free IELTS/SAT Courses",
                  "Motivation Letter and CV Writing Assistance",
                  "Interview Preparation",
                ],
                color: "from-indigo-500 to-blue-600",
              },
              {
                title: "Visa Assistance",
                icon: (
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                ),
                features: [
                  "Document Legalization",
                  "VFS Appointment",
                  "Sponsorship Guidelines",
                  "Embassy Interview Preparation",
                ],
                color: "from-purple-500 to-indigo-600",
              },
              {
                title: "After-Visa Services ",
                icon: (
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                ),
                features: [
                  "Air Ticket Support",
                  "Money Exchange Support",
                  "Accommodation Support ",
                  "Job Guidance",
                ],
                color: "from-blue-500 to-cyan-600",
              },
            ].map((service, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-white p-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 relative overflow-hidden group w-full cursor-pointer"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-2xl -z-0`}
                ></div>
                <div
                  className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-20 transition-opacity duration-500 -z-0`}
                ></div>

                <div className="relative z-10">
                  <div
                    className={`w-14 h-14 rounded-xl mb-6 flex items-center justify-center bg-gradient-to-br ${service.color} shadow-md`}
                  >
                    {service.icon}
                  </div>

                  <h3 className="text-2xl font-bold mb-4 text-gray-900">
                    {service.title}
                  </h3>
                  <p className="mb-6 text-gray-600">{service.description}</p>

                  <ul className="space-y-2">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <svg
                          className="w-5 h-5 text-gray-600 mr-2 mt-0.5 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="3"
                            stroke="currentColor"
                            strokeWidth={2}
                            fill="none"
                          />
                        </svg>

                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* <motion.div
          initial="hidden"
          animate={controls}
          variants={containerVariants}
          className="mb-20"
        >
          <motion.h2
            variants={itemVariants}
            className="text-4xl font-bold text-center !text-black mb-12"
          >
            Our <span className="text-[#004080]"> Exclusive </span>Services
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "AI Chatbot Support",
                description:
                  "24/7 instant answers on visa policies & university deadlines",
                icon: "🤖",
              },
              {
                title: "Mobile App Features",
                description:
                  "Eligibility checker, live tracker, and direct mentor messaging",
                icon: "📱",
              },
              {
                title: "Scholarship Targeting",
                description:
                  "Specialized support for Erasmus Mundus, Fulbright, DAAD",
                icon: "💰",
              },
              {
                title: "Dependent Visa Help",
                description:
                  "Process spouse/child visas alongside student applications",
                icon: "👨‍👩‍👧",
              },
            ].map((service, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="bg-white backdrop-blur-sm p-8 rounded-lg border border-white/20 relative overflow-hidden group-hover"
              >
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -translate-x-full group-hover:translate-x-full"></div>
                </div>

                <div className="text-4xl mb-4 text-[#004080]">
                  {service.icon}
                </div>
                <h4 className="font-bold text-[#004080] mb-2">
                  {service.title}
                </h4>
                <p className="text-gray-600 text-sm">{service.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div> */}
      </div>
    </section>
  );
};

export default Services;
