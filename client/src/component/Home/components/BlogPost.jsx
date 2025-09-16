import React, { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";

const BlogPost = () => {
  const { id } = useParams();
  const post = blogPosts.find((post) => post.id === parseInt(id));
  const sectionRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (!post) return;

    // Animation effect when post loads
    if (sectionRef.current) {
      sectionRef.current.style.opacity = 0;
      sectionRef.current.style.transform = "translateY(20px)";
      sectionRef.current.style.transition = "all 0.6s ease-out";

      setTimeout(() => {
        if (sectionRef.current) {
          sectionRef.current.style.opacity = 1;
          sectionRef.current.style.transform = "translateY(0)";
        }
      }, 100);
    }
  }, [post]);

  if (!post) {
    return (
      <section className="section-padding bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen flex items-center">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-block p-8 bg-white rounded-2xl shadow-xl transform rotate-1">
            <h2 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-pink-600">
              Post Not Found
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              The requested blog post could not be found.
            </p>
            <button
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-full font-medium hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              onClick={() => window.history.back()}
            >
              Go Back
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen py-16">
      <div className="container mx-auto px-4">
        <div
          ref={sectionRef}
          className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden transition-all duration-500"
        >
          {/* Featured Image */}
          <div className="h-80 w-full relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-90"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center px-6">
                <span className="inline-block px-4 py-1 bg-white text-primary rounded-full font-medium mb-4 text-sm uppercase tracking-wider">
                  {post.category.replace("-", " ")}
                </span>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                  {post.title}
                </h1>
                <div className="flex items-center justify-center text-white/90">
                  <span className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    {post.date}
                  </span>
                  <span className="mx-3">•</span>
                  <span className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {post.readTime}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 md:p-12">
            <div
              ref={contentRef}
              className="prose prose-lg max-w-none 
                prose-headings:text-gray-800 
                prose-p:text-gray-600 
                prose-a:text-blue-600 hover:prose-a:text-blue-700
                prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:px-6 prose-blockquote:py-2 prose-blockquote:text-gray-700
                prose-ul:list-disc prose-ol:list-decimal
                prose-img:rounded-xl prose-img:shadow-md prose-img:mx-auto
                prose-hr:border-t-2 prose-hr:border-gray-200
                prose-pre:bg-gray-800 prose-pre:text-gray-100 prose-pre:rounded-xl prose-pre:p-4
                prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-gray-800
                prose-strong:text-gray-800 prose-strong:font-semibold"
              dangerouslySetInnerHTML={{ __html: post.content }}
            ></div>

            {/* Author & Tags */}
            <div className="mt-16 pt-8 border-t border-gray-200">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl mr-4">
                    {post.author.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">{post.author}</h4>
                    <p className="text-gray-500 text-sm">Author</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {post.tags?.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm hover:bg-gray-200 transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogPost;

// Sample blogPosts data structure
const blogPosts = [
  {
    id: 1,
    title: "The Future of Web Development in 2023",
    category: "technology",
    date: "May 15, 2023",
    readTime: "8 min read",
    author: "Jane Doe",
    tags: ["webdev", "javascript", "trends"],
    content: `
      <h2>Introduction to Modern Web Development</h2>
      <p>The web development landscape is changing rapidly. With new frameworks, tools, and methodologies emerging every year, staying current is both challenging and exciting.</p>
      
      <blockquote>
        The only constant in web development is change. Embrace it and you'll thrive.
      </blockquote>
      
      <h3>Key Trends to Watch</h3>
      <ul>
        <li>Serverless architectures</li>
        <li>WebAssembly performance gains</li>
        <li>Progressive Web Apps becoming mainstream</li>
        <li>AI-powered development tools</li>
      </ul>
      
      <p>These innovations are reshaping how we build for the web, offering both opportunities and challenges for developers.</p>
      
      <h3>Conclusion</h3>
      <p>By staying adaptable and continuously learning, developers can ride the wave of change rather than being overwhelmed by it.</p>
    `,
  },
  // ... more posts
];
