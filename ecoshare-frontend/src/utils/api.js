import axios from "axios";

// Default API Base URL: Uses VITE_API_BASE_URL if configured, otherwise falls back to window.location origin in production or http://localhost:5000 in dev
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.MODE === "production" ? "" : "http://localhost:5000");

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to automatically attach JWT token
api.interceptors.request.use(
  (config) => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user && user.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      }
    } catch (e) {
      console.warn("Could not parse auth user for API request", e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to normalize error responses and handle session expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If 401 Unauthorized occurs on protected routes (not login/register), clear session
    if (error.response && error.response.status === 401) {
      const isAuthRoute =
        error.config?.url?.includes("/api/auth/login") ||
        error.config?.url?.includes("/api/auth/register") ||
        error.config?.url?.includes("/api/users/login");
      if (!isAuthRoute) {
        localStorage.removeItem("user");
        if (window.location.pathname !== "/login" && !window.location.pathname.startsWith("/login")) {
          // Do not hard-redirect immediately if user is already browsing public pages
        }
      }
    }

    const customError = {
      status: error.response?.status || 500,
      message:
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "An unexpected network error occurred",
      data: error.response?.data,
      isNetworkError: !error.response,
    };

    return Promise.reject(customError);
  }
);

export default api;
