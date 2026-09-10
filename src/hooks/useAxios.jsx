import axios from "axios";
import { toast } from "react-hot-toast";

// Create the axios instance with the backend base URL
const axiosSecure = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

axiosSecure.interceptors.request.use((config) => {
  // Read from localStorage or sessionStorage
  const token =
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("accessToken");

  // Always include this header so ngrok doesn't block the request
  config.headers["ngrok-skip-browser-warning"] = "true";

  // Attach the token if the user is logged in
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosSecure.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(
      "[axiosSecure] Request failed:",
      error.config?.url,
      "|",
      error.response?.status,
      "|",
      JSON.stringify(error.response?.data)
    );

    const status = error.response?.status;
    if (status === 401 || status === 403) {
      const msg =
        error.response?.data?.message || "Unauthorized access";
      toast.error(msg);

      // Clear invalid session from both storages
      const AUTH_KEYS = ["accessToken", "refreshToken", "user", "role"];
      AUTH_KEYS.forEach((key) => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });

      // Expire cookies
      document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax;";
      document.cookie = "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax;";

      // Redirect to login — skip if already on the login page to avoid infinite redirect
      if (!window.location.pathname.startsWith("/auth")) {
        window.location.href = "/auth/login";
      }
    }

    return Promise.reject(error);
  }
);

// Simple hook — just returns the shared instance
const useAxiosSecure = () => axiosSecure;

export default useAxiosSecure;