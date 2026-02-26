import apiClient from "./apiClient";

export const notificationApi = {
    // Lấy tất cả notifications
    getAll: () => {
        return apiClient.get("/notifications");
    },

    // Đánh dấu 1 notification là đã đọc
    // Endpoint: PATCH /notifications/:id/read
    markAsRead: (notificationId) => {
        return apiClient.patch(`/notifications/${notificationId}/read`);
    },

    // Đánh dấu tất cả là đã đọc
    // Endpoint: PATCH /notifications/read-all
    markAllAsRead: () => {
        return apiClient.patch("/notifications/read-all");
    },
};