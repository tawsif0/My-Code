import React, { useRef, useEffect, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, useAnimation, useInView } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";
import axios from "axios";

const ContactForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    phone: false,
    message: false,
  });

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

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

  // Validation functions
  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "name":
        if (!value.trim()) {
          error = "Name is required";
        } else if (value.trim().length < 2) {
          error = "Name must be at least 2 characters";
        }
        break;
      case "email":
        if (!value.trim()) {
          error = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = "Please enter a valid email address";
        }
        break;
      case "phone":
        if (!value.trim()) {
          error = "Phone number is required";
        }
        break;
      case "message":
        if (!value.trim()) {
          error = "Message is required";
        } else if (value.trim().length < 10) {
          error = "Message must be at least 10 characters";
        }
        break;
      default:
        break;
    }

    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Validate field and clear error if user starts typing
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    // Validate field on blur
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const validateForm = () => {
    const newErrors = {};
    const newTouched = {};
    let isValid = true;

    // Validate all fields
    Object.keys(form).forEach((key) => {
      newTouched[key] = true;
      newErrors[key] = validateField(key, form[key]);
      if (newErrors[key]) {
        isValid = false;
      }
    });

    setTouched(newTouched);
    setErrors(newErrors);

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsLoading(true);
    try {
      await axios.post("http://localhost:3500/api/contact-users", form);
      toast.success("Message sent successfully!");
      setForm({ name: "", email: "", phone: "", message: "" });
      setTouched({ name: false, email: false, phone: false, message: false });
      setErrors({ name: "", email: "", phone: "", message: "" });
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Failed to send message";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
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
            <form className="space-y-4" onSubmit={handleSubmit}>
              <motion.div variants={formItemVariants}>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium mb-1 text-black"
                >
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className={`w-full px-4 py-2.5 rounded-xl shadow-sm border ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  } focus:border-[#004080] focus:ring-2 focus:ring-[#004080] placeholder-gray-500 transition-colors`}
                  placeholder="John Doe"
                  value={form.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                />
                {errors.name && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-xs mt-1"
                  >
                    {errors.name}
                  </motion.p>
                )}
              </motion.div>

              <motion.div variants={formItemVariants}>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-1 text-black"
                >
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className={`w-full px-4 py-2.5 rounded-xl shadow-sm border ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  } focus:border-[#004080] focus:ring-2 focus:ring-[#004080] placeholder-gray-500 transition-colors`}
                  placeholder="john@example.com"
                  value={form.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                />
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-xs mt-1"
                  >
                    {errors.email}
                  </motion.p>
                )}
              </motion.div>

              <motion.div variants={formItemVariants}>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium mb-1 text-black"
                >
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className={`w-full px-4 py-2.5 rounded-xl shadow-sm border ${
                    errors.phone ? "border-red-500" : "border-gray-300"
                  } focus:border-[#004080] focus:ring-2 focus:ring-[#004080] placeholder-gray-500 transition-colors`}
                  placeholder="+880 123 456 7890"
                  value={form.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                />
                {errors.phone && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-xs mt-1"
                  >
                    {errors.phone}
                  </motion.p>
                )}
              </motion.div>

              <motion.div variants={formItemVariants}>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium mb-1 text-black"
                >
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows="4"
                  className={`w-full px-4 py-2.5 rounded-xl shadow-sm border ${
                    errors.message ? "border-red-500" : "border-gray-300"
                  } focus:border-[#004080] placeholder-gray-500 transition-colors`}
                  placeholder="Your message here..."
                  value={form.message}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                ></textarea>
                {errors.message && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-xs mt-1"
                  >
                    {errors.message}
                  </motion.p>
                )}
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
