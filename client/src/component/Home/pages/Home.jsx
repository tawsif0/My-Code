import React from "react";
import Hero from "../components/Hero";
import Services from "../components/Services";
import WhyChooseUs from "../components/WhyChooseUs";
import CTA from "../components/CTA";
import Partners from "../components/partners";

const Home = () => {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Page Content */}
      <Hero />
      <div className="relative z-10">
        <WhyChooseUs />
        <Services />
        <Partners />
        <CTA />
      </div>

      {/* Scroll Buttons Component */}
    </div>
  );
};

export default Home;
