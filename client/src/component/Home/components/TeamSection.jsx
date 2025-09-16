import React, { useRef, useState, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, useAnimation, useInView } from "framer-motion";

// Import team member images from assets
import afrinAlamJui from "../../../assets/team-members/afrin-alam-jui.jpg";
import mahfuzulAlam from "../../../assets/team-members/mahfuzul-alam.jpg";
import zannatulFerdous from "../../../assets/team-members/zannatul-ferdous.jpg";
import tahmidAhmed from "../../../assets/team-members/tahmid-ahmed.jpg";
import saniMia from "../../../assets/team-members/sani-mia.jpg";
import alAminAdnan from "../../../assets/team-members/al-amin-adnan.jpg";
import mashfiHanna from "../../../assets/team-members/mashfi-hanna.jpg";

const TeamSection = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.15 });
  const controls = useAnimation();
  const [startCount, setStartCount] = useState(false);
  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { amount: 0.1, once: true });

  useEffect(() => {
    if (statsInView) setStartCount(true);
  }, [statsInView]);

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
      const increment = end / 30;

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

  const teamMembers = [
    {
      id: 1,
      name: "Afrin Alam Jui",
      role: "Chairperson",
      bio: "Leading the vision and direction of our organization",
      image: afrinAlamJui,
      color: "#FF5E7D",
    },
    {
      id: 2,
      name: "M. Mahfuzul Alam",
      role: "CEO & Managing Director",
      bio: "Overseeing operations and strategic development",
      image: mahfuzulAlam,
      color: "#47B5FF",
    },
    {
      id: 3,
      name: "Zannatul Ferdous",
      role: "Study & Language Co-Ordinator",
      bio: "Specializing in applications, entrance exams, IELTS, and SAT",
      image: zannatulFerdous,
      color: "#6C4AB6",
    },
    {
      id: 4,
      name: "Tahmid Ahmed",
      role: "Chief Marketing Officer & Language Co-Ordinator",
      bio: "Expert in IELTS, SAT preparation and marketing strategies",
      image: tahmidAhmed,
      color: "#4CAF50",
    },
    {
      id: 5,
      name: "Sani Mia",
      role: "Graphics Designer & Visa Process Co-Ordinator",
      bio: "Creative design solutions and visa processing expertise",
      image: saniMia,
      color: "#FF9800",
    },
    {
      id: 6,
      name: "Al Amin Adnan Habib",
      role: "Office Assistant",
      bio: "Ensuring smooth office operations and support",
      image: alAminAdnan,
      color: "#9C27B0",
    },
    {
      id: 7,
      name: "Mashfi Hanna",
      role: "Assistant Counsellor",
      bio: "Providing guidance and support to students",
      image: mashfiHanna,
      color: "#2196F3",
    },
  ];

  const stats = [
    { value: 600, label: "Students Guided", suffix: "+" },
    { value: 100, label: "Visa Success Rate", suffix: "%" },
    { value: 20, label: "Country Partnerships", suffix: "+" },
  ];

  const values = [
    {
      title: "Integrity",
      description: "No false promises",
      icon: "✨",
      color: "#FF5E7D",
    },
    {
      title: "Transparency",
      description: "Real-time updates",
      icon: "🚀",
      color: "#47B5FF",
    },
    {
      title: "Impact",
      description: "100% student satisfaction",
      icon: "💎",
      color: "#6C4AB6",
    },
  ];

  // Animation variants
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
    <section ref={sectionRef} className="py-24  overflow-hidden">
      <div className="container mx-auto px-6 lg:px-8 max-w-7xl">
        {/* Section Header */}
        <motion.div
          initial="hidden"
          animate={controls}
          variants={containerVariants}
          className="text-center mb-20"
        >
          <motion.span
            variants={itemVariants}
            className="mb-8 px-3 py-1.5 bg-[#004080] text-white font-semibold rounded-full shadow-lg inline-flex items-center justify-center transform hover:scale-105 transition-transform duration-300 group"
          >
            Our Team
          </motion.span>
          <motion.h2
            variants={itemVariants}
            className="text-4xl md:text-5xl lg:text-6xl font-bold !text-black mb-6"
          >
            Meet Our <span className="text-[#004080]">Expert Team</span>
          </motion.h2>
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

        {/* Team Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={controls}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-32"
        >
          {teamMembers.map((member) => (
            <motion.div
              key={member.id}
              variants={itemVariants}
              whileHover={{ scale: 1.03 }}
              className="relative group overflow-hidden rounded-2xl bg-white shadow-xl border border-gray-100"
            >
              <div className="relative h-80 overflow-hidden">
                <motion.img
                  src={member.image}
                  alt={member.name}
                  className="absolute inset-0 w-full h-full object-cover"
                  initial={{ scale: 1 }}
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.7 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
              <div className="p-8">
                <div className="flex items-center mb-4">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: member.color }}
                  ></div>
                  <span className="text-sm font-medium text-gray-500">
                    {member.role}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {member.name}
                </h3>
                <p className="text-gray-600 mb-6">{member.bio}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats & Values Section */}
        <div className="flex flex-col lg:flex-row gap-12 mb-32">
          {/* Stats */}
          <motion.div
            initial="hidden"
            animate={controls}
            variants={slideInLeft}
            className="lg:w-2/5"
          >
            <div className="bg-gray-50 p-10 rounded-2xl shadow-sm border border-gray-100 h-full">
              <h3 className="text-2xl font-bold text-gray-900 mb-8">
                Our Achievements
              </h3>
              <div className="space-y-8">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    custom={index}
                    variants={timelineItem}
                    className="flex items-center"
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center mr-6"
                      style={{
                        backgroundColor: teamMembers[index].color + "20",
                      }}
                    >
                      <span
                        className="text-xl"
                        style={{ color: teamMembers[index].color }}
                      >
                        {values[index].icon}
                      </span>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-gray-900 mb-1">
                        <Counter end={stat.value} suffix={stat.suffix} />
                      </div>
                      <div className="text-gray-500">{stat.label}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Values */}
          <motion.div animate={controls} className="lg:w-3/5">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">
              Our Core Values
            </h3>
            <motion.div
              animate={controls}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.03 }}
                  className="cursor-pointer bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all"
                >
                  <div
                    className="w-14 h-14 rounded-xl mb-6 flex items-center justify-center"
                    style={{ backgroundColor: value.color + "20" }}
                  >
                    <span className="text-2xl">{value.icon}</span>
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">
                    {value.title}
                  </h4>
                  <p className="text-gray-600">{value.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
