import React, { useRef, useEffect, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, useAnimation, useInView } from "framer-motion";
import emailjs from "@emailjs/browser";
import { toast, Toaster } from "react-hot-toast";

const ContactForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const form = useRef();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const formRef = useRef(null);
  const infoRef = useRef(null);

  const controls = useAnimation();
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 });

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        when: "beforeChildren",
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const formItemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "backOut",
      },
    },
  };

  const sendEmail = (e) => {
    e.preventDefault();
    setIsLoading(true);

    emailjs
      .sendForm(
        "YOUR_SERVICE_ID", // Replace with your EmailJS service ID
        "YOUR_TEMPLATE_ID", // Replace with your EmailJS template ID
        form.current,
        "YOUR_PUBLIC_KEY" // Replace with your EmailJS public key
      )
      .then(
        (result) => {
          console.log(result.text);
          toast.success("Message sent successfully!");
          form.current.reset();
          setIsLoading(false);
        },
        (error) => {
          console.log(error.text);
          toast.error("Failed to send message. Please try again.");
          setIsLoading(false);
        }
      );
  };

  return (
    <motion.section
      ref={sectionRef}
      className="py-32"
      initial="hidden"
      animate={controls}
      variants={containerVariants}
    >
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.h2
          ref={headingRef}
          className="text-3xl md:text-4xl font-bold mb-8 text-center text-[#004080]"
          variants={itemVariants}
        >
          Get In Touch
        </motion.h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <motion.div
            ref={formRef}
            className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300"
            variants={containerVariants}
          >
            <motion.h3
              className="text-xl font-bold mb-4 text-black"
              variants={itemVariants}
            >
              Send Us a Message
            </motion.h3>
            <form ref={form} className="space-y-4" onSubmit={sendEmail}>
              <motion.div variants={formItemVariants}>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium mb-1 text-black"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="user_name"
                  className="w-full px-4 py-2.5 rounded-xl shadow-sm focus:ring-2 focus:ring-[#004080] placeholder-gray-500"
                  placeholder="John Doe"
                  required
                />
              </motion.div>
              <motion.div variants={formItemVariants}>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-1 text-black"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="user_email"
                  className="w-full px-4 py-2.5 rounded-xl shadow-sm focus:ring-2 focus:ring-[#004080] placeholder-gray-500"
                  placeholder="john@example.com"
                  required
                />
              </motion.div>
              <motion.div variants={formItemVariants}>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium mb-1 text-black"
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="user_phone"
                  className="w-full px-4 py-2.5 rounded-xl shadow-sm focus:ring-2 focus:ring-[#004080] placeholder-gray-500"
                  placeholder="+880 123 456 7890"
                  required
                />
              </motion.div>
              <motion.div variants={formItemVariants}>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium mb-1 text-black"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows="4"
                  className="w-full px-4 py-2.5 rounded-xl shadow-sm focus:ring-2 focus:ring-[#004080] placeholder-gray-500"
                  placeholder="Your message here..."
                  required
                ></textarea>
              </motion.div>
              <motion.button
                type="submit"
                disabled={isLoading}
                className="w-full px-5 py-3 bg-[#ffd700] hover:bg-[#ffd800] text-black font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
              >
                {isLoading ? "Sending..." : "Send Message"}
              </motion.button>
            </form>
          </motion.div>

          <motion.div
            ref={infoRef}
            className="space-y-5"
            variants={containerVariants}
          >
            <motion.div
              className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300"
              variants={itemVariants}
            >
              <h3 className="text-xl font-bold mb-4 text-black">
                Contact Information
              </h3>
              <div className="space-y-4 text-black text-sm">
                <div>
                  <strong>Address:</strong>
                  <p>
                    4th Floor, House-268, Road-03, Avenue-04,
                    <br />
                    Mirpur DOHS, Dhaka-1216
                  </p>
                </div>
                <div>
                  <strong>Phone:</strong>
                  <p>+8801732060505</p>
                </div>
                <div>
                  <strong>Email:</strong>
                  <p>northernlightsic22@gmail.com</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default ContactForm;
