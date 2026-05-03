import apiClient from "./apiClient";

export const holidayAPI = {
  getAll: (params) => {
    return apiClient.get("/holidays", { params });
  },

  get: (startDate, endDate) => {
    return apiClient.get("/holidays/range", {
      params: { startDate, endDate },
    });
  },

  getTemplates: () => {
    return apiClient.get("/holidays/templates");
  },

  checkDate: (params) => {
    return apiClient.get("/holidays/check", { params });
  },

  getYearSummary: (year) => {
    return apiClient.get(`/holidays/summary/year/${year}`);
  },

  createAttendance: (id) => {
    return apiClient.post(`/holidays/${id}/create-attendance`);
  },

  getbyid: (id) => {
    return apiClient.get(`/holidays/${id}`);
  },

  create: (data) => {
    return apiClient.post("/holidays", data);
  },

  update: (id, data) => {
    return apiClient.put(`/holidays/${id}`, data);
  },

  delete: (id) => {
    return apiClient.delete(`/holidays/${id}`);
  },

  bulkImport: (data) => {
    return apiClient.post("/holidays/bulk-import", data);
  },
};
