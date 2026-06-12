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
  token: localStorage.getItem("jwt_token") || null, // Load token from localStorage on init

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res?.data?.user || null });
      if (res?.data?.user?._id) connectSocket(res.data.user._id, (users) => set({ onlineUsers: users }));
    } catch (error) {
      console.error("Error in checkAuth:", error);
      set({ authUser: null, token: null });
      localStorage.removeItem("jwt_token");
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      const userData = res?.data?.user || null;
      const token = res?.data?.token;
      set({ authUser: userData, token });
      // Store token in localStorage
      if (token) localStorage.setItem("jwt_token", token);
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
      const token = res?.data?.token;
      set({ authUser: userData, token });
      // Store token in localStorage
      if (token) localStorage.setItem("jwt_token", token);
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
      localStorage.removeItem("jwt_token");
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

  // Forgot password: send reset email
  isSendingReset: false,
  forgotPassword: async (email) => {
    set({ isSendingReset: true });
    try {
      await axiosInstance.post("/auth/forgot-password", { email });
      toast.success("If that email exists, a reset link was sent.");
    } catch (error) {
      console.error("Forgot password error:", error);
      toast.error(error.response?.data?.message || "Failed to send reset email");
    } finally {
      set({ isSendingReset: false });
    }
  },

  // Reset password using token
  isResettingPassword: false,
  resetPassword: async (token, password) => {
    set({ isResettingPassword: true });
    try {
      const res = await axiosInstance.post(`/auth/reset-password/${token}`, { password });
      const newToken = res?.data?.token;
      if (newToken) {
        set({ token: newToken });
        localStorage.setItem("jwt_token", newToken);
        // Refresh auth user
        await get().checkAuth();
      }
      toast.success("Password reset successfully");
      return true;
    } catch (error) {
      console.error("Reset password error:", error);
      toast.error(error.response?.data?.message || "Failed to reset password");
      return false;
    } finally {
      set({ isResettingPassword: false });
    }
  },
  // Change password while logged in (requires current password)
  isChangingPassword: false,
  changePassword: async (currentPassword, newPassword) => {
    set({ isChangingPassword: true });
    try {
      const res = await axiosInstance.put("/auth/change-password", { currentPassword, newPassword });
      const newToken = res?.data?.token;
      if (newToken) {
        set({ token: newToken });
        localStorage.setItem("jwt_token", newToken);
        await get().checkAuth();
      }
      toast.success("Password changed successfully");
      return true;
    } catch (error) {
      console.error("Change password error:", error);
      toast.error(error.response?.data?.message || "Failed to change password");
      return false;
    } finally {
      set({ isChangingPassword: false });
    }
  },

  disconnectSocket: () => {
    if (socket?.connected) socket.disconnect();
  },
}));
