import apiClient from "./apiClient";

export const notificationApi = {
  getAll: () => {
    return apiClient.get("/notifications");
  },

  getUnreadCount: () => {
    return apiClient.get("/notifications/unread-count");
  },

  markAsRead: (notificationId) => {
    return apiClient.patch(`/notifications/${notificationId}/read`);
  },

  markAllAsRead: () => {
    return apiClient.patch("/notifications/read-all");
  },
};
