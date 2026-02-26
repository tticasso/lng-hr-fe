// src/hooks/useSocket.js
import { useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";

// Tạo socket instance duy nhất cho toàn app
let socketInstance = null;

// Helper function để lấy token từ localStorage
const getAuthToken = () => {
  try {
    const authData = localStorage.getItem("auth");
    if (authData) {
      const parsed = JSON.parse(authData);
      return parsed.token || parsed.accessToken || "";
    }
  } catch (error) {
    console.warn("⚠️ Cannot parse auth data:", error);
  }
  return "";
};

const getSocketInstance = () => {
  if (!socketInstance) {
    // Lấy base URL và namespace từ env
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";
    const token = getAuthToken();
    
    console.log("🔌 Connecting to WebSocket:", SOCKET_URL);
    console.log("🔑 Token:", token ? "✅ Found" : "❌ Not found");
    
    socketInstance = io(SOCKET_URL, {
      // Cấu hình kết nối
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      
      // Authentication - Gửi token trong handshake
      auth: {
        token: token,
      },
      
      // Nếu backend có CORS
      withCredentials: false,
    });

    socketInstance.on("connect", () => {
      console.log("✅ Connected to WebSocket:", socketInstance.id);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("❌ Disconnected from WebSocket:", reason);
    });

    socketInstance.on("connect_error", (error) => {
      console.error("🔴 WebSocket connection error:", error.message);
      console.error("🔴 Error details:", error);
      
      // Nếu lỗi authentication, có thể do token hết hạn
      if (error.message.includes("token") || error.message.includes("auth")) {
        console.error("🔴 Authentication failed. Token may be invalid or expired.");
      }
    });

    socketInstance.on("error", (error) => {
      console.error("🔴 Socket error:", error);
    });
  }
  return socketInstance;
};

export default function useSocket(onNotification) {
  const callbackRef = useRef(onNotification);

  // Update callback ref khi thay đổi, tránh re-subscribe
  useEffect(() => {
    callbackRef.current = onNotification;
  }, [onNotification]);

  useEffect(() => {
    const socket = getSocketInstance();

    // Handler wrapper để dùng ref thay vì dependency
    const handleNotification = (data) => {
      callbackRef.current?.(data);
    };

    socket.on("new_notification", handleNotification);

    return () => {
      socket.off("new_notification", handleNotification);
    };
  }, []); // Empty deps - chỉ subscribe 1 lần

  return getSocketInstance();
}

// Export function để disconnect khi cần (ví dụ: logout)
export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};

// Export function để reconnect với token mới (sau khi login)
export const reconnectSocket = () => {
  if (socketInstance) {
    const token = getAuthToken();
    console.log("🔄 Reconnecting with new token...");
    
    // Update auth token
    socketInstance.auth = { token };
    
    // Reconnect
    socketInstance.disconnect();
    socketInstance.connect();
  }
};