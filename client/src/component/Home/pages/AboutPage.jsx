import React, { useEffect } from "react";
import About from "../components/About";
import TeamSection from "../components/TeamSection"; // You would create this component

const AboutPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <>
      <About />
      <TeamSection />
    </>
  );
};

export default AboutPage;
