import apiClient from "./apiClient";

export const announcementAPI = {
  get: (params) => {
    return apiClient.get("/announcements", { params });
  },

  getById: (id) => {
    return apiClient.get(`/announcements/${id}`);
  },

  markAsRead: (id) => {
    return apiClient.patch(`/announcements/${id}/read`);
  },

  post: (payload) => {
    return apiClient.post("/announcements", payload);
  },

  update: (id, payload) => {
    return apiClient.patch(`/announcements/${id}`, payload);
  },

  delete: (id) => {
    return apiClient.delete(`/announcements/${id}`);
  },
};
