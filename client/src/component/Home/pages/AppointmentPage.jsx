import React, { useEffect } from "react";
import AppointmentForm from "../components/AppointmentForm";

const AppointmentPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <>
      <AppointmentForm />
    </>
  );
};

export default AppointmentPage;
