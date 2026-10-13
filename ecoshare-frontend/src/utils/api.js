import axios from "axios";

// Resolve the API base URL consistently across the app.
// Priority:
//   1. VITE_API_BASE_URL (set per-environment, e.g. on Vercel) — explicit override.
//   2. Local development -> http://localhost:5000 (Vite dev server).
//   3. Production without an override -> the deployed Render backend.
// This must match the backend URL used by AuthContext/firebase.js, otherwise
// production API calls hit the Vercel origin, which only serves the SPA HTML
// (via the vercel.json rewrite) and every request fails.
const PRODUCTION_API_BASE_URL = "https://ecoshare-ai.onrender.com";

const resolveApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) return import.meta.env.VITE_API_BASE_URL;
  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    return "http://localhost:5000";
  }
  return PRODUCTION_API_BASE_URL;
};

const API_BASE_URL = resolveApiBaseUrl();

export const api = axios.create({
  baseURL: API_BASE_URL,
  // Render's free tier sleeps when idle and can take 30-60s to cold-start.
  // A 15s timeout aborted legitimate requests during a cold boot, surfacing as
  // "Failed to create donation". Give the backend enough headroom to wake up.
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to automatically attach JWT token
// AuthContext stores user data under "userInfo" key
api.interceptors.request.use(
  (config) => {
    try {
      // AuthContext uses "userInfo" as the storage key
      const storedUser = localStorage.getItem("userInfo");
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

// Cold-start resilience: Render's free tier sleeps when idle, so the first
// request after inactivity may fail with a network error (no response) before
// the server finishes waking up. Automatically retry such transient failures
// a couple of times instead of surfacing "Failed to create donation".
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    const isNetworkOrTimeout =
      !error.response ||
      error.code === "ECONNABORTED" ||
      error.code === "ETIMEDOUT" ||
      error.message === "Network Error" ||
      error.message === "timeout of 0ms exceeded";

    const retries = (config && config.__retryCount) || 0;
    if (config && isNetworkOrTimeout && retries < 2) {
      config.__retryCount = retries + 1;
      // Small backoff to give the sleeping backend time to boot.
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return api(config);
    }
    return Promise.reject(error);
  }
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
        // Clear session using the correct storage key matching AuthContext
        localStorage.removeItem("userInfo");
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
