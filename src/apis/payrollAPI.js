import apiClient from "./apiClient";

export const payrollAPI = {
  getall: (month, year, params = {}) => {
    return apiClient.get("/payrolls", {
      params: { month, year, limit: 50, ...params },
    });
  },

  getbyme: (params) => {
    return apiClient.get("/payrolls/my-income", { params });
  },

  syncdata: (payload) => {
    return apiClient.post("/payrolls/sync", payload);
  },

  calcalculate: (payload) => {
    return apiClient.post("/payrolls/calculate", payload);
  },

  calculateBatch: (payload) => {
    return apiClient.post("/payrolls/calculate-batch", payload);
  },

  finalize: (payload) => {
    return apiClient.patch("/payrolls/finalize", payload);
  },

  markpaid: (payload) => {
    return apiClient.patch("/payrolls/mark-paid", payload);
  },

  sendEmail: (id) => {
    return apiClient.post(`/payrolls/${id}/send-email`);
  },
};
