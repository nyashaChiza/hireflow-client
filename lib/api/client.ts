import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ─────────────────────────────────────────
// Base Axios instance
// All API calls go through this — it automatically
// attaches the JWT token from localStorage to every request.
// ─────────────────────────────────────────

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─────────────────────────────────────────
// Request interceptor
// Runs before every request — attaches Bearer token if present.
// ─────────────────────────────────────────

apiClient.interceptors.request.use(
  (config) => {
    // Only runs in browser (not during SSR)
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("hireflow_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─────────────────────────────────────────
// Response interceptor
// Runs after every response — handles 401s globally.
// If token is expired, clear auth state and redirect to login.
// ─────────────────────────────────────────

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("hireflow_token");
        localStorage.removeItem("hireflow_user");
        window.location.href = "/login";
      }
    }
    // Forward the error so individual calls can handle it too
    return Promise.reject(error);
  }
);

export default apiClient;