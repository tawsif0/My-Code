import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "@studio-freight/lenis";

gsap.registerPlugin(ScrollTrigger);

const Scholarship = () => {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);
  const [isVisible, setIsVisible] = useState(false);

  // Lenis initialization
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
      <div className="container mx-auto px-6 lg:px-8 max-w-4xl relative z-10">
        {/* Section Header */}
        <div
          className={`text-center mb-16 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <span className="text-sm font-semibold tracking-wider text-white uppercase mb-4 inline-block bg-gradient-to-r from-[#004080] to-[#0066cc] px-4 py-1.5 rounded-full">
            Scholarship Opportunities
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 mt-7">
            <span className="text-black">Exclusive Scholarships</span> for
            Bright Futures
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Discover our prestigious scholarship programs designed to help
            talented students achieve their academic dreams without financial
            constraints.
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-[#004080] to-[#0066cc] mx-auto rounded-full"></div>
        </div>

        {/* Scholarship Cards - Centered */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-20">
          {[
            {
              title: "Northern Scholarship",
              description:
                "A prestigious scholarship program offering full tuition coverage for exceptional students pursuing degrees in technology and engineering fields across Nordic countries.",
              coverage: "Full Tuition Coverage",
              benefits: [
                "Monthly Stipend",
                "Travel Allowance",
                "Research Grant",
                "Mentorship Program",
              ],
              deadline: "March 15, 2024",
              color: "from-blue-700 to-cyan-600",
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
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              ),
            },
            {
              title: "INTI Scholarship",
              description:
                "Comprehensive financial support for high-achieving students enrolling in business, finance, and entrepreneurship programs at INTI International Universities.",
              coverage: "Up to 100% Tuition",
              benefits: [
                "Housing Support",
                "Internship Opportunities",
                "Networking Events",
                "Career Placement",
              ],
              deadline: "April 30, 2024",
              color: "from-purple-700 to-indigo-600",
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
                    d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                  />
                </svg>
              ),
            },
          ].map((scholarship, index) => (
            <div
              ref={(el) => (cardsRef.current[index] = el)}
              key={index}
              className="cursor-pointer group relative bg-white p-10 rounded-3xl shadow-2xl hover:shadow-2xl transition-all duration-500 overflow-hidden border-0 w-full flex flex-col"
            >
              {/* Animated gradient background */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${scholarship.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-3xl -z-0`}
              ></div>

              {/* Animated border gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${scholarship.color} opacity-0 group-hover:opacity-20 rounded-3xl -z-10 transition-all duration-700 group-hover:scale-105`}
              ></div>

              <div className="relative z-10">
                <div className="flex flex-col md:flex-row items-start gap-6">
                  {/* Icon with gradient background */}
                  <div
                    className={`w-16 h-16 rounded-xl mb-6 flex items-center justify-center bg-gradient-to-br ${scholarship.color} shadow-lg flex-shrink-0`}
                  >
                    {scholarship.icon}
                  </div>

                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-3 text-gray-900 group-hover:text-gray-800 transition-colors duration-300">
                      {scholarship.title}
                    </h3>
                    <p className="mb-6 text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                      {scholarship.description}
                    </p>

                    {/* Benefits section */}
                    <div className="mb-6">
                      <h4 className="font-semibold mb-3 text-gray-800 flex items-center">
                        <span
                          className={`w-3 h-3 rounded-full bg-gradient-to-br ${scholarship.color} mr-2`}
                        ></span>
                        Key Benefits
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {scholarship.benefits.map((benefit, i) => (
                          <div
                            key={i}
                            className="flex items-center text-gray-600"
                          >
                            <svg
                              className="w-4 h-4 text-green-500 mr-2"
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
                            {benefit}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Apply Now Button */}
              <div className="mt-auto text-right">
                <button className="px-6 py-2 rounded-full text-white bg-gradient-to-r from-[#004080] to-[#0066cc] hover:from-[#0066cc] hover:to-[#004080] transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                  See More
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Scholarship;
