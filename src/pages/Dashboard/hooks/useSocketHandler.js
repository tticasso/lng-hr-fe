import { useCallback } from "react";
import useSocket from "../../notification/useSocket";

/**
 * Custom hook để xử lý Socket connections
 */
export const useSocketHandler = () => {
  const handleSocketData = useCallback((data) => {
    // Socket data received - handle if needed
    if (process.env.NODE_ENV === "development") {
      console.log("Socket data:", data);
    }
    // Có thể thêm logic xử lý socket data ở đây
    // Ví dụ: update notifications, refresh data, etc.
  }, []);

  useSocket(handleSocketData);

  return { handleSocketData };
};
