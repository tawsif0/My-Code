import React, { useRef, useEffect, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, useAnimation, useInView } from "framer-motion";

const About = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.15 });
  const controls = useAnimation();
  const [startCount, setStartCount] = useState(false);
  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { amount: 0.1, once: true });
  useEffect(() => {
    if (statsInView) setStartCount(true);
  }, [statsInView]);
  // Continent points with coordinates
  const continentPoints = [
    { x: 350, y: 150, color: "#FF6B6B", name: "NA" }, // North America
    { x: 420, y: 220, color: "#4ECDC4", name: "EU" }, // Europe
    { x: 480, y: 300, color: "#FFBE0B", name: "AS" }, // Asia
    { x: 300, y: 380, color: "#FF9F1C", name: "AU" }, // Australia
    { x: 200, y: 280, color: "#A663CC", name: "AF" }, // Africa
    { x: 150, y: 150, color: "#6BD425", name: "SA" }, // South America
  ];

  // Create a smooth path through all continent points
  const createGlobePath = () => {
    const points = continentPoints.map((p) => ({ x: p.x - 300, y: p.y - 250 }));
    // Close the loop by adding the first point at the end
    points.push(points[0]);

    let path = `M ${points[0].x},${points[0].y}`;

    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      // Create smooth curves between points
      const control1 = {
        x: prev.x + (curr.x - prev.x) * 0.3,
        y: prev.y + (curr.y - prev.y) * 0.3,
      };
      const control2 = {
        x: prev.x + (curr.x - prev.x) * 0.6,
        y: prev.y + (curr.y - prev.y) * 0.6,
      };
      path += ` C ${control1.x},${control1.y} ${control2.x},${control2.y} ${curr.x},${curr.y}`;
    }

    return path;
  };

  const globePath = createGlobePath();

  // Calculate plane rotation angles for each segment
  const calculateAngles = () => {
    const points = continentPoints.map((p) => ({ x: p.x - 300, y: p.y - 250 }));
    points.push(points[0]); // Close the loop

    const angles = [];
    for (let i = 0; i < points.length - 1; i++) {
      const dx = points[i + 1].x - points[i].x;
      const dy = points[i + 1].y - points[i].y;
      angles.push(Math.atan2(dy, dx) * (180 / Math.PI));
    }
    return angles;
  };

  const planeAngles = calculateAngles();

  // Animation sequence for the plane to visit each continent
  const planeAnimation = {
    x: continentPoints
      .map((p) => p.x - 300)
      .concat([continentPoints[0].x - 300]),
    y: continentPoints
      .map((p) => p.y - 250)
      .concat([continentPoints[0].y - 250]),
    rotate: planeAngles.concat([planeAngles[0]]),
  };
  useEffect(() => {
    if (isInView) {
      controls.start("visible");
      setStartCount(true);
    } else {
      controls.start("hidden");
    }
  }, [isInView, controls]);

  const Counter = ({ end, suffix = "" }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      if (!startCount) return;

      let current = 0;
      const increment = end / 30; // Controls animation speed

      const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.ceil(current));
        }
      }, 50);

      return () => clearInterval(timer);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [startCount, end]);

    return (
      <span>
        {count}
        {suffix}
      </span>
    );
  };

  // Animation variants (with hidden states so controls can toggle)
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 0.77, 0.47, 0.97],
      },
    },
  };

  const slideInLeft = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 0.77, 0.47, 0.97],
      },
    },
  };

  const slideInRight = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 0.77, 0.47, 0.97],
      },
    },
  };

  const timelineItem = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.15,
        duration: 0.6,
        ease: "easeOut",
      },
    }),
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
    <section ref={sectionRef} className="py-36 overflow-hidden">
      <div className="container mx-auto px-6 lg:px-8 max-w-7xl">
        {/* Section Header */}
        <motion.div
          initial="hidden"
          animate={controls}
          variants={containerVariants}
          className="text-center mb-10"
        >
          <motion.span
            variants={itemVariants}
            className="mb-8 px-3 py-1.5 bg-[#004080] text-white font-semibold rounded-full shadow-lg inline-flex items-center justify-center transform hover:scale-105 transition-transform duration-300 group"
          >
            Who We Are
          </motion.span>
          <motion.h2
            variants={itemVariants}
            className="text-4xl md:text-5xl lg:text-6xl font-bold !text-black mb-6"
          >
            About{" "}
            <span className="text-[#004080]">
              Northern Lights Study and Immigration Consultancy
            </span>
          </motion.h2>
          <motion.div
            variants={luxeBarVariants}
            className="relative mx-auto mt-6 h-1 w-28 sm:w-32 rounded-full overflow-hidden"
          >
            {/* Base deep gradient track */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#001b35] via-[#004080] to-[#00a6ff] opacity-70" />

            {/* Soft outer glow */}
            <div className="pointer-events-none absolute -inset-2 rounded-full bg-[#00a6ff] blur-md opacity-20" />

            {/* Specular center highlight (subtle) */}
            <div className="absolute inset-y-[35%] left-0 right-0 h-px bg-white/60 opacity-40" />

            {/* Aurora sweep: deep -> white -> deep, left to right */}
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

            {/* Tiny sparkle flecks gliding across (tasteful) */}
            {[0, 1, 2, 3].map((i) => (
              <motion.span
                key={i}
                className="absolute h-[3px] w-[3px] rounded-full bg-white/90"
                style={{ top: `${15 + i * 20}%`, left: "-4%" }}
                initial={{ x: 0, opacity: 0 }}
                animate={{ x: "110%", opacity: [0, 1, 0] }}
                transition={{
                  duration: 2 + i * 0.3,
                  repeat: Infinity,
                  repeatDelay: 0.6,
                  ease: "easeOut",
                  delay: i * 0.2,
                }}
              />
            ))}
          </motion.div>
        </motion.div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Text Content */}
          <motion.div
            initial="hidden"
            animate={controls}
            variants={containerVariants}
            className="space-y-12"
          >
            {/* Timeline Section */}
            <motion.div variants={slideInLeft} className="space-y-8">
              <h3 className="text-2xl font-bold text-gray-900 border-l-4 border-[#004080] pl-4">
                Our Journey
              </h3>

              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-5 top-0 h-full w-0.5 bg-gradient-to-b from-[#004080] to-[#004080]/20"></div>

                <div className="space-y-8 pl-12">
                  {[
                    {
                      title: "Founding Story",
                      description:
                        "Guided by a vision to make global education more accessible, Northern Lights started its journey as a modest consultancy in Dhaka.",
                      icon: (
                        <div className="absolute left-0 flex items-center justify-center w-10 h-10 rounded-full bg-[#a0cbe8] text-[#004080] shadow-lg">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      ),
                    },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      custom={i}
                      variants={timelineItem}
                      className="relative pl-14"
                    >
                      {item.icon}
                      <div className="flex items-baseline">
                        <h4 className="font-semibold text-gray-900">
                          {item.title}
                        </h4>
                      </div>
                      <p className="text-gray-600 mt-2">{item.description}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Mission & Vision */}
            <motion.div variants={slideInLeft} className="relative">
              <div className="cursor-pointer bg-white p-8 rounded-2xl shadow-2xl border border-gray-100 hover:shadow-3xl transition-all duration-500 group hover:border-[#004080]/30">
                {/* Header with icon */}
                <div className="flex items-start mb-8 space-x-4">
                  <div className="bg-[#a0cbe8] p-3 rounded-xl flex-shrink-0 group-hover:bg-[#004080] transition-colors duration-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-[#004080] group-hover:text-white transition-colors duration-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                      Mission & Vision
                    </h3>
                    <div className="w-12 h-1 bg-[#004080] mt-2 rounded-full"></div>
                  </div>
                </div>

                {/* Mission & Vision Items */}
                <div className="space-y-8">
                  {/* Mission Item */}
                  <motion.div
                    whileHover={{ x: 5 }}
                    className="flex items-start group"
                  >
                    <div className="bg-[#a0cbe8] p-2 rounded-full mr-4 mt-1 flex-shrink-0 group-hover:bg-[#004080] transition-colors duration-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-[#004080] group-hover:text-white transition-colors duration-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg tracking-tight">
                        <span className="bg-gradient-to-r from-[#004080] to-[#004080] bg-[length:0%_2px] bg-left-bottom bg-no-repeat group-hover:bg-[length:100%_2px] transition-all duration-500">
                          Mission
                        </span>
                      </h4>
                      <p className="text-gray-600 mt-3 leading-relaxed pl-1">
                        To illuminate pathways for global education through
                        ethical, personalized guidance.
                      </p>
                    </div>
                  </motion.div>

                  {/* Vision Item */}
                  <motion.div
                    whileHover={{ x: 5 }}
                    className="flex items-start group"
                  >
                    <div className="bg-[#a0cbe8] p-2 rounded-full mr-4 mt-1 flex-shrink-0 group-hover:bg-[#004080] transition-colors duration-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-[#004080] group-hover:text-white transition-colors duration-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg tracking-tight">
                        <span className="bg-gradient-to-r from-[#004080] to-[#004080] bg-[length:0%_2px] bg-left-bottom bg-no-repeat group-hover:bg-[length:100%_2px] transition-all duration-500">
                          Vision
                        </span>
                      </h4>
                      <p className="text-gray-600 mt-3 leading-relaxed pl-1">
                        To become a trusted consultancy for higher study
                        aspirants of Bangladesh.
                      </p>
                    </div>
                  </motion.div>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-[#004080]/20 rounded-tr-2xl"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-[#004080]/20 rounded-bl-2xl"></div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column - World Map & Stats */}
          <motion.div
            initial="hidden"
            animate={controls}
            variants={slideInRight}
            className="relative"
          >
            {/* Animated World Map with Plane */}
            <motion.div
              variants={itemVariants}
              className="relative w-full flex justify-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
            >
              <div className="relative z-10 w-full h-[300px] sm:h-[400px] lg:h-[500px]">
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 600 500"
                  preserveAspectRatio="xMidYMid meet"
                  xmlns="http://www.w3.org/2000/svg"
                  className="drop-shadow-xl"
                >
                  {/* Globe Base */}
                  <circle cx="300" cy="250" r="200" fill="#0a2e52" />

                  {/* Latitude Lines */}
                  <path
                    d="M100 250a200 200 0 0 1 400 0"
                    fill="none"
                    stroke="#7fdbff"
                    strokeWidth="1.2"
                    strokeDasharray="4,4"
                    opacity="0.8"
                  />
                  <path
                    d="M140 160a200 200 0 0 1 320 180"
                    fill="none"
                    stroke="#7fdbff"
                    strokeWidth="1.2"
                    strokeDasharray="4,4"
                    opacity="0.8"
                  />
                  <path
                    d="M140 340a200 200 0 0 1 320 -180"
                    fill="none"
                    stroke="#7fdbff"
                    strokeWidth="1.2"
                    strokeDasharray="4,4"
                    opacity="0.8"
                  />

                  {/* Longitude Lines */}
                  {[...Array(8)].map((_, i) => {
                    const angle = i * 45 * (Math.PI / 180);
                    const x1 = 300 + 200 * Math.cos(angle);
                    const y1 = 250 + 200 * Math.sin(angle);
                    const x2 = 300 - 200 * Math.cos(angle);
                    const y2 = 250 - 200 * Math.sin(angle);
                    return (
                      <line
                        key={i}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="#7fdbff"
                        strokeWidth="1.2"
                        strokeDasharray="4,4"
                        opacity="0.8"
                      />
                    );
                  })}

                  {/* Continent points with coordinates */}
                  {[
                    { x: 350, y: 150, color: "#FF6B6B", name: "NA" }, // North America
                    { x: 420, y: 220, color: "#4ECDC4", name: "EU" }, // Europe
                    { x: 480, y: 300, color: "#FFBE0B", name: "AS" }, // Asia
                    { x: 300, y: 380, color: "#FF9F1C", name: "AU" }, // Australia
                    { x: 200, y: 280, color: "#A663CC", name: "AF" }, // Africa
                    { x: 150, y: 150, color: "#6BD425", name: "SA" }, // South America
                  ].map((pin, i) => (
                    <g key={i}>
                      <circle
                        cx={pin.x}
                        cy={pin.y}
                        r="8"
                        fill={pin.color}
                        stroke="white"
                        strokeWidth="2"
                      >
                        <animate
                          attributeName="r"
                          values="8;12;8"
                          dur={`${2 + i}s`}
                          repeatCount="indefinite"
                        />
                      </circle>
                      <text
                        x={pin.x}
                        y={pin.y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="white"
                        fontSize="8"
                        fontWeight="bold"
                      >
                        {pin.name}
                      </text>
                      <circle
                        cx={pin.x}
                        cy={pin.y}
                        r="16"
                        fill={pin.color}
                        opacity="0.15"
                      >
                        <animate
                          attributeName="r"
                          values="16;24;16"
                          dur={`${3 + i}s`}
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="opacity"
                          values="0.15;0;0.15"
                          dur={`${3 + i}s`}
                          repeatCount="indefinite"
                        />
                      </circle>
                    </g>
                  ))}

                  {/* Animated Plane Path */}
                  <g transform="translate(300 250)">
                    {/* The plane that follows the path */}
                    <motion.g
                      initial={{
                        x: planeAnimation.x[0],
                        y: planeAnimation.y[0],
                        rotate: planeAnimation.rotate[0],
                      }}
                      animate={planeAnimation}
                      transition={{
                        duration: 20,
                        repeat: Infinity,
                        repeatType: "loop",
                        ease: "linear",
                      }}
                    >
                      <path
                        d="M0,-10 L20,0 L0,10 L5,0 Z"
                        fill="#FFD700"
                        transform={`rotate(${planeAnimation.rotate[0]})`}
                      />
                    </motion.g>

                    {/* The path that will be drawn behind the plane */}
                    <motion.path
                      d={globePath}
                      fill="none"
                      stroke="#FFD700"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray="0 1"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{
                        duration: 20,
                        repeat: Infinity,
                        repeatType: "loop",
                        ease: "linear",
                      }}
                    />
                  </g>
                </svg>
              </div>

              <div className="absolute -z-10 w-3/4 h-3/4 bg-gradient-to-r from-[#0074e4] to-[#00a1ff] rounded-full opacity-10 -right-1/4 -bottom-1/4 blur-3xl"></div>
            </motion.div>

            {/* Stats Grid - keep this part the same as before */}
            <motion.div
              ref={statsRef}
              className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12"
              initial="hidden"
              animate={controls}
              variants={containerVariants}
            >
              {[
                {
                  number: 600,
                  label: "Students Helped",
                  icon: (
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  ),
                  suffix: "+",
                },
                {
                  number: 20,
                  label: "Countries",
                  icon: (
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  ),
                  suffix: "+",
                },
                {
                  number: 100,
                  label: "Visa Success",
                  icon: (
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  ),
                  suffix: "%",
                },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl shadow-xl text-center border border-gray-100 hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 hover:border-[#004080]/40 group relative overflow-hidden"
                  whileHover={{ scale: 1.03 }}
                >
                  {/* Animated background effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#004080]/5 to-[#004080]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  {/* Icon with animation */}
                  <motion.div
                    className="bg-[#a0cbe8] p-3 rounded-full inline-flex mb-4 group-hover:bg-[#004080] transition-colors duration-500"
                    whileHover={{ rotate: 15 }}
                  >
                    <motion.div
                      className="text-[#004080] group-hover:text-white transition-colors duration-500"
                      whileHover={{ scale: 1.1 }}
                    >
                      {stat.icon}
                    </motion.div>
                  </motion.div>

                  {/* Animated counter */}
                  <div className="relative h-12 overflow-hidden">
                    <motion.p
                      className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#004080] to-[#0066cc] mb-2"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
                    >
                      <Counter end={stat.number} suffix={stat.suffix} />
                    </motion.p>
                  </div>

                  <motion.p
                    className="text-sm font-semibold text-gray-600 uppercase tracking-wider mt-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.5, duration: 0.8 }}
                  >
                    {stat.label}
                  </motion.p>

                  {/* Decorative element */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#004080] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
