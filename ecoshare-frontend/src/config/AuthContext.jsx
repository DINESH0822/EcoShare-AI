import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const local = localStorage.getItem("userInfo");
    return local ? JSON.parse(local) : null;
  });

  const login = (userData) => {
    localStorage.setItem("userInfo", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("userInfo");
    setUser(null);
    window.location.href = "/login";
  };

  const getAuthHeaders = () => {
    return user?.token ? { headers: { Authorization: `Bearer ${user.token}` } } : {};
  };

  const API_BASE = window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://ecoshare-ai.onrender.com";

  return (
    <AuthContext.Provider value={{ user, login, logout, getAuthHeaders, API_BASE }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
