import apiClient from "./apiClient";

export const auditLogApi = {
  getAll: (params) => {
    return apiClient.get("/audit-logs", { params });
  },

  getById: (id) => {
    return apiClient.get(`/audit-logs/${id}`);
  },
};
