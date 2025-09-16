import React, { useEffect } from "react";
import Blog from "../components/Blog";
import News from "../components/News";

const BlogPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <>
      <Blog />
      <News />
    </>
  );
};

export default BlogPage;
