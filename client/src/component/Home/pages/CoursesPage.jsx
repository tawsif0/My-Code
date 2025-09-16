import React, { useEffect } from "react";
import Courses from "../components/Courses";

const CoursesPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <>
      <Courses />
    </>
  );
};

export default CoursesPage;
