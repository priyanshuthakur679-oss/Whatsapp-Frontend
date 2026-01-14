import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import socket, { connectSocket } from "../lib/socket.js";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket, // singleton socket
  token: null, // Store token in state

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res?.data?.user || null });
      if (res?.data?.user?._id) connectSocket(res.data.user._id, (users) => set({ onlineUsers: users }));
    } catch (error) {
      console.error("Error in checkAuth:", error);
      set({ authUser: null, token: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      const userData = res?.data?.user || null;
      set({ authUser: userData, token: res?.data?.token });
      toast.success("Account created successfully");
      if (userData?._id) connectSocket(userData._id, (users) => set({ onlineUsers: users }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      const userData = res?.data?.user || null;
      set({ authUser: userData, token: res?.data?.token });
      toast.success("Logged in successfully");
      if (userData?._id) connectSocket(userData._id, (users) => set({ onlineUsers: users }));
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null, token: null, onlineUsers: [] });
      toast.success("Logged out successfully");
      if (socket?.connected) socket.disconnect();
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res?.data || null });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error in updateProfile:", error);
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  disconnectSocket: () => {
    if (socket?.connected) socket.disconnect();
  },
}));
