/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FiCreditCard,
  FiLock,
  FiCheckCircle,
  FiShield,
  FiImage,
} from "react-icons/fi";
import toast from "react-hot-toast";
import axios from "axios";
import Cards from "react-credit-cards";
import "react-credit-cards/es/styles-compiled.css";

const Checkout = ({ cart, onSuccess }) => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvc: "",
    name: "",
    focused: "",
  });
  const [billingDetails, setBillingDetails] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    city: "",
    country: "BN",
    zipCode: "",
  });

  // Calculate total
  // Calculate total - Update this part
  const validCartItems = cart.filter(
    (item) =>
      item?.id &&
      item?.title &&
      typeof item.price === "number" &&
      !isNaN(item.price)
  );

  const total = validCartItems.reduce((sum, item) => sum + item.price, 0);
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const paymentData = {
        paymentMethod,
        cardDetails:
          paymentMethod === "card"
            ? {
                number: cardDetails.number.replace(/\s/g, ""),
                expiry: cardDetails.expiry,
                cvc: cardDetails.cvc,
                name: cardDetails.name,
              }
            : null,
        billingDetails,
        amount: total,
        items: validCartItems.map((item) => ({
          id: item.id,
          title: item.title,
          price: item.price,
        })),
      };

      const response = await axios.post(
        `${base_url}/api/student/cart/checkout`,
        paymentData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("studentToken")}`,
          },
        }
      );

      if (response.data?.success && response.data?.order) {
        toast.success("Payment successful! Courses enrolled.");
        if (onSuccess) {
          onSuccess(response.data);
        }
      } else {
        throw new Error(
          response.data?.message ||
            "Payment succeeded but no order data received"
        );
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Payment failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Format card number
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(" ");
    }
    return value;
  };

  // Format expiry date
  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 3) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return value;
  };

  // Get card type based on number
  const getCardType = (number) => {
    const num = number.replace(/\D/g, "");
    if (/^4/.test(num)) return "visa";
    if (/^5[1-5]/.test(num)) return "mastercard";
    if (/^3[47]/.test(num)) return "amex";
    if (/^6(?:011|5)/.test(num)) return "discover";
    if (/^(?:2131|1800|35)/.test(num)) return "jcb";
    if (/^3(?:0[0-5]|[68])/.test(num)) return "diners";
    return "unknown";
  };

  // Get card icon based on type
  const getCardIcon = (type) => {
    switch (type) {
      case "visa":
        return "https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg";
      case "mastercard":
        return "https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg";
      case "amex":
        return "https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo.svg";
      case "discover":
        return "https://upload.wikimedia.org/wikipedia/commons/5/57/Discover_Card_logo.svg";
      case "jcb":
        return "https://upload.wikimedia.org/wikipedia/commons/4/40/JCB_logo.svg";
      case "diners":
        return "https://upload.wikimedia.org/wikipedia/commons/2/24/Diners_Club_International_logo.svg";
      default:
        return null;
    }
  };

  const cardType = getCardType(cardDetails.number);
  const cardIcon = getCardIcon(cardType);

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit}>
            {/* Payment Method Section */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <FiCreditCard className="mr-2 text-gray-600" />
                Payment Method
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`p-4 rounded-xl border-2 ${
                    paymentMethod === "card"
                      ? "border-gray-500 bg-gray-50"
                      : "border-gray-200 hover:border-gray-300"
                  } transition-all flex items-center justify-center`}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-5 h-5 rounded-full border-2 ${
                        paymentMethod === "card"
                          ? "border-gray-500 bg-gray-500"
                          : "border-gray-300"
                      } flex items-center justify-center mr-3`}
                    >
                      {paymentMethod === "card" && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    <span className="font-medium">Credit Card</span>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="button"
                  onClick={() => setPaymentMethod("paypal")}
                  className={`p-4 rounded-xl border-2 ${
                    paymentMethod === "paypal"
                      ? "border-gray-500 bg-gray-50"
                      : "border-gray-200 hover:border-gray-300"
                  } transition-all flex items-center justify-center`}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-5 h-5 rounded-full border-2 ${
                        paymentMethod === "paypal"
                          ? "border-gray-500 bg-gray-500"
                          : "border-gray-300"
                      } flex items-center justify-center mr-3`}
                    >
                      {paymentMethod === "paypal" && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg"
                      alt="PayPal"
                      className="h-6"
                    />
                  </div>
                </motion.button>
              </div>

              {paymentMethod === "card" && (
                <>
                  <div className="mb-6">
                    <Cards
                      number={cardDetails.number}
                      name={cardDetails.name}
                      expiry={cardDetails.expiry}
                      cvc={cardDetails.cvc}
                      focused={cardDetails.focused}
                    />
                  </div>

                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Card Number *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="1234 5678 9012 3456"
                          value={formatCardNumber(cardDetails.number)}
                          onChange={(e) =>
                            setCardDetails({
                              ...cardDetails,
                              number: e.target.value,
                            })
                          }
                          onFocus={() =>
                            setCardDetails({
                              ...cardDetails,
                              focused: "number",
                            })
                          }
                          maxLength={19}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 hover:border-gray-400 transition-all"
                          required
                        />
                        {cardIcon && (
                          <div className="absolute right-3 top-3">
                            <img
                              src={cardIcon}
                              alt={cardType}
                              className="h-6"
                            />
                          </div>
                        )}
                      </div>
                      {cardDetails.number && (
                        <p className="text-xs text-gray-500 mt-1">
                          {cardType.charAt(0).toUpperCase() + cardType.slice(1)}{" "}
                          {cardType !== "unknown" ? "card" : ""}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Expiry Date *
                        </label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={formatExpiry(cardDetails.expiry)}
                          onChange={(e) =>
                            setCardDetails({
                              ...cardDetails,
                              expiry: e.target.value,
                            })
                          }
                          onFocus={() =>
                            setCardDetails({
                              ...cardDetails,
                              focused: "expiry",
                            })
                          }
                          maxLength={5}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 hover:border-gray-400 transition-all"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CVC *
                        </label>
                        <input
                          type="text"
                          placeholder="123"
                          value={cardDetails.cvc}
                          onChange={(e) =>
                            setCardDetails({
                              ...cardDetails,
                              cvc: e.target.value
                                .replace(/\D/g, "")
                                .slice(0, 4),
                            })
                          }
                          onFocus={() =>
                            setCardDetails({ ...cardDetails, focused: "cvc" })
                          }
                          maxLength={4}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 hover:border-gray-400 transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name on Card *
                      </label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={cardDetails.name}
                        onChange={(e) =>
                          setCardDetails({
                            ...cardDetails,
                            name: e.target.value,
                          })
                        }
                        onFocus={() =>
                          setCardDetails({ ...cardDetails, focused: "name" })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 hover:border-gray-400 transition-all"
                        required
                      />
                    </div>
                  </motion.div>
                </>
              )}
            </motion.div>

            {/* Billing Information Section */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <FiCheckCircle className="mr-2 text-gray-600" />
                Billing Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={billingDetails.firstName}
                    onChange={(e) =>
                      setBillingDetails({
                        ...billingDetails,
                        firstName: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 hover:border-gray-400 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={billingDetails.lastName}
                    onChange={(e) =>
                      setBillingDetails({
                        ...billingDetails,
                        lastName: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 hover:border-gray-400 transition-all"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={billingDetails.email}
                    onChange={(e) =>
                      setBillingDetails({
                        ...billingDetails,
                        email: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 hover:border-gray-400 transition-all"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <input
                    type="text"
                    value={billingDetails.address}
                    onChange={(e) =>
                      setBillingDetails({
                        ...billingDetails,
                        address: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 hover:border-gray-400 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={billingDetails.city}
                    onChange={(e) =>
                      setBillingDetails({
                        ...billingDetails,
                        city: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 hover:border-gray-400 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country *
                  </label>
                  <select
                    value={billingDetails.country}
                    onChange={(e) =>
                      setBillingDetails({
                        ...billingDetails,
                        country: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-gray-500 hover:border-gray-400 transition-all appearance-none bg-white bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZXZyb24tZG93biI+PHBhdGggZD0ibTYgOSA2IDYgNi02Ii8+PC9zdmc+')] bg-no-repeat bg-[center_right_1rem]"
                    required
                  >
                    <option value="US">United States</option>
                    <option value="UK">United Kingdom</option>
                    <option value="CA">Canada</option>
                    <option value="AU">Australia</option>
                    <option value="BN">Bangladesh</option>
                    <option value="IN">India</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    value={billingDetails.zipCode}
                    onChange={(e) =>
                      setBillingDetails({
                        ...billingDetails,
                        zipCode: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 hover:border-gray-400 transition-all"
                    required
                  />
                </div>
              </div>
            </motion.div>

            {/* Security Info */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center text-sm text-gray-500 mb-6 p-4 bg-gray-50 rounded-lg"
            >
              <FiLock className="text-gray-600 mr-3 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-800">Secure Payment</p>
                <p>Your transaction is protected with 256-bit encryption</p>
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className={`w-full py-4 px-6 rounded-xl font-bold text-white ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 shadow-lg"
              } transition-all flex items-center justify-center`}
            >
              {loading ? (
                "Processing Payment..."
              ) : (
                <>
                  <FiLock className="mr-2" />
                  Pay Securely ৳{total.toFixed(2)}
                </>
              )}
            </motion.button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Order Summary
            </h2>
            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {validCartItems.map((course) => (
                  <div
                    key={course.id}
                    className="flex justify-between items-start"
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-6">
                        {course.thumbnail ? (
                          <img
                            src={`${base_url}/courses/${course.thumbnail.path}`}
                            alt={course.title}
                            className="w-12 h-9 object-cover rounded mr-3"
                          />
                        ) : (
                          <div className="w-12 h-9 bg-gray-200 rounded mr-3 flex items-center justify-center">
                            <FiImage className="text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 line-clamp-1">
                          {course.title}
                        </h4>
                      </div>
                    </div>
                    <span className="text-sm font-medium">
                      ৳ {course.price.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-3 border-t border-gray-200 pt-4">
              <div className="flex justify-between text-lg font-bold pt-2">
                <span>Total</span>
                <span>৳ {total.toFixed(2)}</span>
              </div>
            </div>
            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <div className="flex items-start">
                <FiShield className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-green-800">
                    30-Day Money-Back Guarantee
                  </h4>
                  <p className="text-xs text-green-600 mt-1">
                    If you're not satisfied, we'll refund your payment.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
