import apiClient from "./apiClient";

export const announcementAPI = {
    // Lấy danh sách thông báo
    get: () => {
        return apiClient.get("/announcements");
    },
    
    // Lấy chi tiết thông báo theo ID
    getById: (id) => {
        return apiClient.get(`/announcements/${id}`);
    },

      // gửi thông báo
    post: (payload) => {
        return apiClient.post(`/announcements/`,payload);
    },

    // Cập nhật thông báo theo ID
    update: (id, payload) => {
        return apiClient.patch(`/announcements/${id}`, payload);
    },

    // Xóa thông báo theo ID
    delete: (id) => {
        return apiClient.delete(`/announcements/${id}`);
    },
};
