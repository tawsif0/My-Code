import React, { useEffect } from "react";
import Career from "../components/Career";

const CareerPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <>
      <Career />
    </>
  );
};

export default CareerPage;
