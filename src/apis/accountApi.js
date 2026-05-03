import apiClient from "./apiClient";

export const accountApi = {
  getMe: () => {
    return apiClient.get("/accounts/me");
  },

  getAll: (params) => {
    return apiClient.get("/accounts", { params });
  },

  getById: (id) => {
    return apiClient.get(`/accounts/${id}`);
  },

  create: (data) => {
    return apiClient.post("/accounts", data);
  },

  update: (id, data) => {
    return apiClient.put(`/accounts/${id}`, data);
  },

  delete: (id) => {
    return apiClient.delete(`/accounts/${id}`);
  },

  resetPassword: (accountId) => {
    return apiClient.patch("/accounts/reset-password", { accountId });
  },

  updateRole: (id, roleName) => {
    return apiClient.put(`/accounts/${id}`, { roleName });
  },
};
