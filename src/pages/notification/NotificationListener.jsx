import { useCallback } from "react";
import { notification } from "antd";
import useSocket from "./useSocket";

function NotificationListener() {
    // Dùng useCallback để tránh re-create function mỗi render
    const handleNotification = useCallback((data) => {
        notification.open({
            message: data.title || "Thông báo mới",
            description: data.message,
            placement: "topRight",
            duration: 4.5,
        });
    }, []);

    useSocket(handleNotification);

    return null; // không render gì, chỉ lắng nghe socket
}

export default NotificationListener;