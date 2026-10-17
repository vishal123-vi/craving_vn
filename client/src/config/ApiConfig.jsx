import axios from "axios";

// Automatically use local server when running on localhost, and Render server in production
const isLocalhost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1");

const baseURL = isLocalhost
  ? "http://localhost:5000"
  : (import.meta.env.VITE_SERVER_URL || import.meta.env.VITE_API_BASE_URL || "https://craving-vn.onrender.com");

const api = axios.create({
  baseURL,
  withCredentials: true,
});

// Automatically inject Authorization Bearer token if present in storage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (error.response.data?.message === "Session Expired") {
        sessionStorage.removeItem("cravingUser");
        sessionStorage.removeItem("token");
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
