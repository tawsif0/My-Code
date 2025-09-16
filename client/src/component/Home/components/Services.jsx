import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "@studio-freight/lenis";
import { useNavigate } from "react-router-dom";
gsap.registerPlugin(ScrollTrigger);

const Services = () => {
  const navigate = useNavigate();
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);
  const [isVisible, setIsVisible] = useState(false);
  const handleExploreServices = () => {
    navigate("/services");
  };
  // Lenis initialization (unchanged)
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

    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top center",
      end: "bottom center",
      toggleClass: { className: "visible", targets: sectionRef.current },
      onEnter: () => {
        setIsVisible(true);
      },
      onLeaveBack: () => {
        setIsVisible(false);
      },
    });

    cardsRef.current.forEach((card, index) => {
      gsap.from(card, {
        opacity: 0,
        y: 50,
        scrollTrigger: {
          trigger: card,
          start: "top 80%",
          end: "bottom 60%",
          once: false,
          toggleActions: "play none none none",
          delay: index * 0.2,
          markers: false,
          onEnter: () => {
            gsap.to(card, { opacity: 1, y: 0, duration: 0.8 });
          },
          onLeaveBack: () => {
            gsap.to(card, { opacity: 0, y: 50, duration: 0.8 });
          },
        },
      });
    });

    lenis.on("scroll", () => {
      ScrollTrigger.update();
    });

    return () => {
      lenis.destroy();
      trigger.kill();
      cardsRef.current = [];
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="pt-24 overflow-hidden relative bg-transparent"
    >
      <div className="container mx-auto px-6 lg:px-8 max-w-7xl relative z-10">
        {/* Section Header - Enhanced */}
        <div
          className={`text-center mb-20 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <span className="text-sm font-semibold tracking-wider text-white uppercase mb-4 inline-block bg-[#004080] px-4 py-1.5 rounded-full">
            Our Services
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 mt-7">
            <span className="text-black">Comprehensive Services</span> for Your
            Success
          </h2>
          <div className="w-24 h-1 bg-[#004080] mx-auto rounded-full"></div>
        </div>

        {/* Content Grid - Enhanced */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {[
            {
              title: "Study Abroad Consultancy",
              description:
                "Comprehensive support for university selection, application assistance, statement of purpose guidance, and more.",
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
              countries: [
                "Finland",
                "Estonia",
                "Hungary",
                "Sweden",
                "Norway",
                "USA",
                "UK",
                "Australia",
              ],
              color: "from-indigo-500 to-blue-600",
            },
            {
              title: "Visa Assistance",
              description: "Expert guidance for student visa",
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
              types: ["Student Visa"],
              color: "from-purple-500 to-indigo-600",
            },
            {
              title: "Exam Preparation",
              description:
                "Specialized courses for IELTS, TOEFL, SAT, PTE, and Duolingo English Test.",
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
              exams: ["IELTS", "SAT", "PTE", "Duolingo"],
              color: "from-blue-500 to-cyan-600",
            },
          ].map((service, index) => (
            <div
              ref={(el) => (cardsRef.current[index] = el)}
              key={index}
              className="cursor-pointer group relative bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100"
            >
              {/* Animated gradient border */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-2xl -z-0`}
              ></div>

              {/* Floating gradient circle */}
              <div
                className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-20 transition-opacity duration-500 -z-0`}
              ></div>

              <div className="relative z-10">
                {/* Icon with gradient background */}
                <div
                  className={`w-14 h-14 rounded-xl mb-6 flex items-center justify-center bg-gradient-to-br ${service.color} shadow-md`}
                >
                  {service.icon}
                </div>

                <h3 className="text-2xl font-bold mb-4 text-gray-900 group-hover:text-gray-800 transition-colors duration-300">
                  {service.title}
                </h3>
                <p className="mb-6 text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                  {service.description}
                </p>

                {/* Tags section */}
                {(service.countries || service.types || service.exams) && (
                  <div className="mt-6 pt-6 border-t transition-colors duration-300">
                    <h4 className="font-semibold mb-3 text-white flex items-center">
                      <span
                        className={`w-3 h-3 rounded-full bg-gradient-to-br ${service.color} mr-2`}
                      ></span>
                      {service.countries && "Popular Destinations"}
                      {service.types && "Visa Types"}
                      {service.exams && "Exams Covered"}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {(
                        service.countries ||
                        service.types ||
                        service.exams
                      )?.map((item, i) => (
                        <span
                          key={i}
                          className={` bg-blue-100 text-[#004080] px-4 py-2 rounded-full text-xs font-medium backdrop-blur-sm `}
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-10">
          <button
            className="cursor-pointer relative inline-flex items-center px-8 py-4 overflow-hidden text-white bg-gradient-to-r from-[#004080] to-[#244e77] rounded-full group"
            onClick={handleExploreServices}
          >
            <span className="absolute right-0 transition-all duration-1000 translate-x-full group-hover:-translate-x-4">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                ></path>
              </svg>
            </span>
            <span className="text-sm font-medium transition-all duration-300 group-hover:mr-4">
              Explore All Services
            </span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Services;
