import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (error.response.data.message === "Session Expired") {
        sessionStorage.removeItem("cravingUser");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
