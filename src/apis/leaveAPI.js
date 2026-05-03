import apiClient from "./apiClient";

export const leaveAPI = {
  getAll: (params) => {
    return apiClient.get("/leaves", { params });
  },

  getbyADMIN: (page, limit) => {
    return apiClient.get("/leaves", { params: { page, limit } });
  },

  getMy: (params) => {
    return apiClient.get("/leaves/my-leaves", { params });
  },

  getbyUSER: (page, limit) => {
    return apiClient.get("/leaves/my-leaves", { params: { page, limit } });
  },

  getbyID: (id) => {
    return apiClient.get(`/leaves/${id}`);
  },

  summary: (params) => {
    return apiClient.get("/leaves/summary", { params });
  },

  preview: (data) => {
    return apiClient.post("/leaves/preview", data);
  },

  post: async (data) => {
    try {
      const res = await apiClient.post("/leaves", data);
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  APPROVED: (id, payload) => {
    return apiClient.put(`/leaves/${id}/approval`, payload);
  },

  approvalStatus: (id) => {
    return apiClient.get(`/leaves/${id}/approval-status`);
  },

  refund: (id, payload) => {
    return apiClient.patch(`/leaves/${id}/refund`, payload);
  },

  submitAttachments: (id, payload) => {
    return apiClient.post(`/leaves/${id}/attachments`, payload);
  },

  getAttachments: (id) => {
    return apiClient.get(`/leaves/${id}/attachments`);
  },

  downloadAttachment: (id, filename) => {
    return apiClient.get(`/leaves/${id}/attachments/${filename}`, {
      responseType: "blob",
    });
  },

  CANCELLED: (id) => {
    return apiClient.patch(`/leaves/cancel/${id}`, { status: "CANCELLED" });
  },

  updatePending: (id, payload) => {
    return apiClient.patch(`/leaves/${id}`, payload);
  },

  delete: (id) => {
    return apiClient.delete(`/leaves/${id}`);
  },
};
