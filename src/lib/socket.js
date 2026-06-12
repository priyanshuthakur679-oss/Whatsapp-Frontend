import { io } from "socket.io-client";

// Determine socket server URL (use Vite env var `VITE_API_URL` if provided)
const SOCKET_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "") : "http://localhost:5000";

// Single socket instance
const socket = io(SOCKET_URL, {
  path: "/socket.io",
  transports: ["websocket", "polling"],
  withCredentials: true,
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 20000,
  forceNew: true,
});

// Connect socket with authUser ID
export const connectSocket = (userId, setOnlineUsers) => {
  if (!userId) return;

  socket.auth = { userId };

  socket.off("connect_error");
  socket.on("connect_error", (err) => {
    console.error("Socket connect_error:", err.message);
    if (err.message.includes("websocket")) {
      socket.io.opts.transports = ["polling", "websocket"];
      socket.connect();
    }
  });

  // ✅ Listen for online users updates
  socket.off("getOnlineUsers");
  socket.on("getOnlineUsers", (userIds) => {
    setOnlineUsers(userIds);
  });

  socket.connect();
};

export default socket;
