import apiClient from "./apiClient";

export const payrollAdjustmentAPI = {
  getAll: (params = {}) => {
    return apiClient.get("/payroll-adjustments", { params });
  },

  create: (payload) => {
    return apiClient.post("/payroll-adjustments", payload);
  },

  createBulk: (payload) => {
    return apiClient.post("/payroll-adjustments/bulk", payload);
  },

  update: (id, payload) => {
    return apiClient.patch(`/payroll-adjustments/${id}`, payload);
  },

  cancel: (id) => {
    return apiClient.delete(`/payroll-adjustments/${id}`);
  },
};
