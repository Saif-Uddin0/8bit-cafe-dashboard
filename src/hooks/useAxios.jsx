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
    }

    return Promise.reject(error);
  }
);

// Simple hook — just returns the shared instance
const useAxiosSecure = () => axiosSecure;

export default useAxiosSecure;