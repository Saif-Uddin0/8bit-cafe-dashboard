import axios from "axios";
import { useEffect } from "react";
import Cookies from "js-cookie";

const axiosSecure = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

const useAxiosSecure = () => {
  useEffect(() => {
    const interceptor = axiosSecure.interceptors.request.use((config) => {
      const token = Cookies.get("accessToken");

      // ngrok warning bypass header
      config.headers["ngrok-skip-browser-warning"] = "true";

      // auth token
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    });

    return () => {
      axiosSecure.interceptors.request.eject(interceptor);
    };
  }, []);

  return axiosSecure;
};

export default useAxiosSecure;