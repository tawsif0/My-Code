import React, { useEffect } from "react";
import VisaProcess from "../components/VisaProcess";
import ServicePage from "../components/ServicePage";

const ServicesPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <>
      <ServicePage />
      <VisaProcess />
    </>
  );
};

export default ServicesPage;
