import axios from "axios";

// Create the axios instance with the backend base URL
const axiosSecure = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

axiosSecure.interceptors.request.use((config) => {
  // Read from localStorage — exact raw JWT, no encoding issues
  const token = localStorage.getItem("accessToken");

  // Always include this header so ngrok doesn't block the request
  config.headers["ngrok-skip-browser-warning"] = "true";

  // Attach the token if the user is logged in
  if (token) {
    config.headers.Authorization = token;
  }
  console.log(config);

  return config;
});

// Response interceptor — logs the backend error body so we can debug 500s
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
    return Promise.reject(error);
  }
);

// Simple hook — just returns the shared instance
const useAxiosSecure = () => axiosSecure;

export default useAxiosSecure;