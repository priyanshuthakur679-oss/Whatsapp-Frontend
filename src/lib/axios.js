import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "https://whatsapp-backend-1-8yec.onrender.com/api",
  withCredentials: true,
});
