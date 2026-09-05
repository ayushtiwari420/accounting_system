import React, { createContext, useContext, useState, useEffect } from "react";
import * as authService from "../services/authService.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem("accessToken") || localStorage.getItem("token") || null);
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem("refreshToken") || null);
  const [loading, setLoading] = useState(false);

  const loginUser = async (email, password) => {
    setLoading(true);
    try {
      const response = await authService.login({ email, password });
      const { accessToken, token: legacyToken, refreshToken: refToken, user: userProfile } = response.data;
      const activeToken = accessToken || legacyToken;

      localStorage.setItem("token", activeToken);
      localStorage.setItem("accessToken", activeToken);
      if (refToken) {
        localStorage.setItem("refreshToken", refToken);
        setRefreshToken(refToken);
      }
      localStorage.setItem("user", JSON.stringify(userProfile));

      setToken(activeToken);
      setUser(userProfile);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setToken(null);
    setRefreshToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        refreshToken,
        isAuthenticated: !!token,
        loading,
        login: loginUser,
        logout: logoutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
