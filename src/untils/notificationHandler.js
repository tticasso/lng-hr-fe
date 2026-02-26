import { toast } from "react-toastify";

/**
 * 📩 Xử lý notification từ WebSocket theo type
 * 
 * @param {Object} data - Data từ socket
 * @param {Function} onNotification - Callback để xử lý thêm (optional)
 * 
 * @example
 * import { handleSocketNotification } from "./untils/notificationHandler";
 * 
 * useSocket((data) => {
 *   handleSocketNotification(data, (processedData) => {
 *     // Xử lý thêm nếu cần
 *     console.log(processedData);
 *   });
 * });
 */
export const handleSocketNotification = (data, onNotification) => {
    console.log("📩 Socket notification:", data);

    // Validate data
    if (!data || typeof data !== "object") {
        console.warn("⚠️ Invalid socket data:", data);
        return;
    }

    const { type, title, message, id, relatedId } = data;

    // Xử lý theo type
    switch (type) {
        // ===== LEAVE (Nghỉ phép) =====
        case "LEAVE_APPROVED":
            toast.success(`✅ ${title || "Đơn nghỉ phép được duyệt"}`, {
                autoClose: 5000,
            });
            break;

        case "LEAVE_REJECTED":
            toast.error(`❌ ${title || "Đơn nghỉ phép bị từ chối"}`, {
                autoClose: 5000,
            });
            break;

        case "LEAVE_PENDING":
            toast.info(`⏳ ${title || "Đơn nghỉ phép đang chờ duyệt"}`, {
                autoClose: 4000,
            });
            break;

        // ===== OT (Overtime) =====
        case "OT_APPROVED":
            toast.success(`⏰ ${title || "Đơn OT được duyệt"}`, {
                autoClose: 5000,
            });
            break;

        case "OT_REJECTED":
            toast.error(`❌ ${title || "Đơn OT bị từ chối"}`, {
                autoClose: 5000,
            });
            break;

        case "OT_PENDING":
            toast.info(`⏳ ${title || "Đơn OT đang chờ duyệt"}`, {
                autoClose: 4000,
            });
            break;

        // ===== ATTENDANCE (Chấm công) =====
        case "ATTENDANCE_REMINDER":
            toast.warning(`⏰ ${title || "Nhắc nhở chấm công"}`, {
                autoClose: 6000,
            });
            break;

        case "ATTENDANCE_LATE":
            toast.warning(`⚠️ ${title || "Bạn đã đi muộn"}`, {
                autoClose: 5000,
            });
            break;

        // ===== PAYROLL (Lương) =====
        case "PAYROLL_READY":
            toast.success(`💰 ${title || "Phiếu lương đã sẵn sàng"}`, {
                autoClose: 6000,
            });
            break;

        case "PAYROLL_PAID":
            toast.success(`✅ ${title || "Lương đã được chuyển"}`, {
                autoClose: 5000,
            });
            break;

        // ===== SYSTEM (Hệ thống) =====
        case "SYSTEM_ANNOUNCEMENT":
            toast.info(`📢 ${title || "Thông báo hệ thống"}`, {
                autoClose: 5000,
            });
            break;

        case "SYSTEM_MAINTENANCE":
            toast.warning(`🔧 ${title || "Bảo trì hệ thống"}`, {
                autoClose: 7000,
            });
            break;

        case "URGENT":
            toast.error(`🚨 ${title || "KHẨN CẤP"}`, {
                autoClose: 10000,
            });
            // Có thể hiển thị modal cho thông báo khẩn cấp
            break;

        // ===== DEFAULT =====
        default:
            toast.info(message || title || "Bạn có thông báo mới", {
                autoClose: 4000,
            });
    }

    // Callback để xử lý thêm (VD: cập nhật state, refresh data)
    if (typeof onNotification === "function") {
        onNotification({
            ...data,
            processedAt: new Date().toISOString(),
        });
    }
};

/**
 * 🔔 Tạo notification object chuẩn từ socket data
 * 
 * @param {Object} data - Raw data từ socket
 * @returns {Object} Notification object chuẩn
 */
export const createNotificationObject = (data) => {
    return {
        id: data.id || `notif_${Date.now()}`,
        title: data.title || "Thông báo mới",
        content: data.message || data.content || "",
        type: data.type || "INFO",
        createdAt: data.createdAt || new Date().toISOString(),
        unread: true,
        relatedId: data.relatedId || null,
        userId: data.userId || null,
        metadata: data.metadata || {},
    };
};

/**
 * 🎨 Lấy icon và màu theo notification type
 * 
 * @param {string} type - Notification type
 * @returns {Object} { icon, color, bgColor }
 */
export const getNotificationStyle = (type) => {
    const styles = {
        LEAVE_APPROVED: {
            icon: "✅",
            color: "text-green-600",
            bgColor: "bg-green-50",
            borderColor: "border-green-200",
        },
        LEAVE_REJECTED: {
            icon: "❌",
            color: "text-red-600",
            bgColor: "bg-red-50",
            borderColor: "border-red-200",
        },
        LEAVE_PENDING: {
            icon: "⏳",
            color: "text-orange-600",
            bgColor: "bg-orange-50",
            borderColor: "border-orange-200",
        },
        OT_APPROVED: {
            icon: "⏰",
            color: "text-blue-600",
            bgColor: "bg-blue-50",
            borderColor: "border-blue-200",
        },
        OT_REJECTED: {
            icon: "❌",
            color: "text-red-600",
            bgColor: "bg-red-50",
            borderColor: "border-red-200",
        },
        PAYROLL_READY: {
            icon: "💰",
            color: "text-green-600",
            bgColor: "bg-green-50",
            borderColor: "border-green-200",
        },
        URGENT: {
            icon: "🚨",
            color: "text-red-600",
            bgColor: "bg-red-100",
            borderColor: "border-red-300",
        },
        DEFAULT: {
            icon: "📩",
            color: "text-gray-600",
            bgColor: "bg-gray-50",
            borderColor: "border-gray-200",
        },
    };

    return styles[type] || styles.DEFAULT;
};

/**
 * 🔊 Play notification sound (optional)
 */
export const playNotificationSound = () => {
    try {
        const audio = new Audio("/notification-sound.mp3");
        audio.volume = 0.5;
        audio.play().catch((err) => {
            console.warn("Cannot play notification sound:", err);
        });
    } catch (error) {
        console.warn("Notification sound error:", error);
    }
};
