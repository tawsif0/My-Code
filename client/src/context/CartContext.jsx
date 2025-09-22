/* eslint-disable no-unused-vars */
import React, { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";

// Create the context
const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const base_url =
    import.meta.env.VITE_API_KEY_Base_URL || "http://localhost:3500";

  // Load cart from server or localStorage
  const fetchCart = useCallback(async () => {
    const studentToken = localStorage.getItem("studentToken");

    // If no token, load from localStorage for non-authenticated users
    if (!studentToken) {
      try {
        const savedCart = JSON.parse(localStorage.getItem("courseCart")) || [];
        const validCart = savedCart.filter(
          (item) => item?.id && item?.title && !isNaN(item?.price)
        );
        setCart(validCart);
        if (validCart.length !== savedCart.length) {
          localStorage.setItem("courseCart", JSON.stringify(validCart));
        }
      } catch (error) {
        console.error("Error loading cart from localStorage:", error);
        localStorage.removeItem("courseCart");
        setCart([]);
      }
      return;
    }

    // If token exists, fetch from server
    try {
      const response = await axios.get(`${base_url}/api/student/cart`, {
        headers: {
          Authorization: `Bearer ${studentToken}`,
        },
      });

      if (response.data.success) {
        const formattedCart = response.data.cart.items
          .map((item) => ({
            id: item.courseId?._id,
            title: item.courseId?.title,
            thumbnail: item.courseId?.thumbnail,
            price: item.price,
            instructor: item.courseId?.instructor,
          }))
          .filter((item) => item.id && item.title); // Filter out invalid items

        setCart(formattedCart);
      }
    } catch (error) {
      try {
        const savedCart = JSON.parse(localStorage.getItem("courseCart")) || [];
        setCart(savedCart);
      } catch (localError) {
        console.error("Error loading cart from localStorage:", localError);
        setCart([]);
      }
    }
  }, [base_url]);

  // Add item to cart
  const addToCart = async (course) => {
    if (!course?.id || !course?.title) {
      console.error("Invalid course data");
      return false;
    }

    try {
      const studentToken = localStorage.getItem("studentToken");
      const studentData = JSON.parse(
        localStorage.getItem("studentData") || "null"
      );

      if (studentToken && studentData?._id) {
        // Add to server for authenticated users
        const response = await axios.post(
          `${base_url}/api/student/cart`,
          { courseId: course.id },
          {
            headers: {
              Authorization: `Bearer ${studentToken}`,
            },
          }
        );

        if (response.data.success) {
          const newCartItem = {
            id: course.id,
            title: course.title,
            thumbnail: course.thumbnail,
            price: course.price,
            instructor: course.instructor,
            addedAt: new Date().toISOString(),
          };

          setCart((prevCart) => {
            const updatedCart = [...prevCart, newCartItem];
            localStorage.setItem("courseCart", JSON.stringify(updatedCart));
            return updatedCart;
          });
          toast.success("Course added to cart");
          return true;
        }
      } else {
        // Add to localStorage for non-authenticated users
        const newCartItem = {
          id: course.id,
          title: course.title,
          thumbnail: course.thumbnail,
          price: course.price,
          instructor: course.instructor,
          addedAt: new Date().toISOString(),
        };

        setCart((prevCart) => {
          const updatedCart = [...prevCart, newCartItem];
          localStorage.setItem("courseCart", JSON.stringify(updatedCart));
          return updatedCart;
        });
        toast.success("Course added to cart");
        return true; // This return was missing
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error(error.response?.data?.message || "Failed to add to cart");
      return false;
    }
    return false; // Add default return
  };

  // Remove item from cart
  const removeFromCart = async (courseId) => {
    try {
      const studentToken = localStorage.getItem("studentToken");

      // Only try to remove from server if user is authenticated
      if (studentToken) {
        try {
          await axios.delete(`${base_url}/api/student/cart/${courseId}`, {
            headers: {
              Authorization: `Bearer ${studentToken}`,
            },
          });
        } catch (serverError) {
          console.error("Error removing from server cart:", serverError);
          // Continue with local removal even if server fails
        }
      }

      // Always remove from local state
      setCart((prevCart) => {
        const updatedCart = prevCart.filter((item) => item.id !== courseId);
        localStorage.setItem("courseCart", JSON.stringify(updatedCart));
        return updatedCart;
      });
      return true;
    } catch (error) {
      console.error("Error removing from cart:", error);
      // Even if there's an error, try to remove from local state
      try {
        setCart((prevCart) => {
          const updatedCart = prevCart.filter((item) => item.id !== courseId);
          localStorage.setItem("courseCart", JSON.stringify(updatedCart));
          return updatedCart;
        });
      } catch (localError) {
        console.error("Error updating local cart:", localError);
      }
      return true; // Still return true since we tried to remove it
    }
  };

  // Check if item is in cart
  const isInCart = (courseId) => {
    return cart.some((item) => item.id === courseId);
  };

  // Get cart count
  const getCartCount = () => {
    return cart.length;
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("courseCart");
  };

  // Initialize cart on component mount
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const value = {
    cart,
    addToCart,
    removeFromCart,
    isInCart,
    getCartCount,
    clearCart,
    refreshCart: fetchCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;
