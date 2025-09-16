import React, { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get token and user info from localStorage
  const getAuthData = () => ({
    token: localStorage.getItem("token"),
    userInfo: JSON.parse(localStorage.getItem("admin") || "null"),
  });

  // Memoized fetch function
  const fetchUserProfile = useCallback(async () => {
    const { token, userInfo } = getAuthData();

    if (!token || !userInfo?._id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        `${base_url}/api/admin/profile/${userInfo._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUserData(response.data.profile);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  }, [base_url]);

  // Initial fetch on mount
  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  // Listen for storage changes (for login/logout from other tabs)
  useEffect(() => {
    const handleStorageChange = () => {
      const { token, userInfo } = getAuthData();
      if (!token || !userInfo) {
        clearUserData();
      } else {
        fetchUserProfile();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [fetchUserProfile]);

  const clearUserData = () => {
    setUserData(null);
    setError(null);
    setLoading(false);
  };

  // Expose refresh function
  const refreshUserData = () => {
    fetchUserProfile();
  };

  return (
    <AdminContext.Provider
      value={{
        userData,
        loading,
        error,
        fetchUserProfile: refreshUserData, // Renamed for clarity
        clearUserData,
        role: userData?.role || localStorage.getItem("role"),
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export default AdminContext;
