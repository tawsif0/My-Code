import React, { useEffect } from "react";
import Events from "../components/Events";

const EventsPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <>
      <Events />
    </>
  );
};

export default EventsPage;
