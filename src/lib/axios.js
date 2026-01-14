import axios from "axios";
import { useAuthStore } from "../store/useAuthStore.js";

export const axiosInstance = axios.create({
  baseURL: "https://whatsapp-backend-1-8yec.onrender.com/api",
  withCredentials: true,
});

// Add Authorization header if token exists
axiosInstance.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
