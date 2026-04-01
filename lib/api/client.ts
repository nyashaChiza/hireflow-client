import axios from "axios";

const apiClient = axios.create({
  baseURL: "/api/backend",
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Request interceptor ──────────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      // Read token — try explicit key first, then Zustand persisted state
      let token = localStorage.getItem("hireflow_token");
      if (!token) {
        try {
          const raw = localStorage.getItem("auth-store");
          if (raw) token = JSON.parse(raw)?.state?.token ?? null;
        } catch { /* ignore */ }
      }
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor ─────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("hireflow_token");
        localStorage.removeItem("auth-store");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
