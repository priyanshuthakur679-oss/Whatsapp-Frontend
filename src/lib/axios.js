import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "https://whatsapp-backend.onrender.com",
  withCredentials: true,
});
