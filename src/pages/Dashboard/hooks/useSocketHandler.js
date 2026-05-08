import { useCallback } from "react";
import useSocket from "../../notification/useSocket";

/**
 * Custom hook để xử lý Socket connections
 */
export const useSocketHandler = () => {
  const handleSocketData = useCallback((_data) => {
    // Socket data received - handle if needed
    // Có thể thêm logic xử lý socket data ở đây
    // Ví dụ: update notifications, refresh data, etc.
  }, []);

  useSocket(handleSocketData);

  return { handleSocketData };
};

