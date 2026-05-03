import apiClient from "./apiClient";

export const leavebalanceAPI = {
  get: (params) => {
    return apiClient.get("/leave-balances", { params });
  },

  getMine: (params) => {
    return apiClient.get("/leave-balances/my-leave-balances", { params });
  },

  getById: (id) => {
    return apiClient.get(`/leave-balances/${id}`);
  },

  create: (payload) => {
    return apiClient.post("/leave-balances", payload);
  },

  triggerManualAccrual: (payload) => {
    return apiClient.post("/leave-balances/trigger-manual-accrual", payload);
  },

  resetYear: (payload) => {
    return apiClient.post("/leave-balances/reset-year", payload);
  },

  carryOver: (payload) => {
    return apiClient.post("/leave-balances/carry-over", payload);
  },

  put: (id, payload) => {
    return apiClient.put(`/leave-balances/${id}`, payload);
  },

  patch: (id, payload) => {
    return apiClient.patch(`/leave-balances/${id}/adjust`, payload);
  },

  delete: (id) => {
    return apiClient.delete(`/leave-balances/${id}`);
  },
};
