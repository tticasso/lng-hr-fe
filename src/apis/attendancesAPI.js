import apiClient from "./apiClient";

const multipartHeaders = {
  headers: {
    "Content-Type": "multipart/form-data",
  },
};

export const attendancesAPI = {
  getAll: (params) => {
    return apiClient.get("/attendances", { params });
  },

  getall: (month, year) => {
    return apiClient.get("/attendances/report", {
      params: { month, year, limit: 100 },
    });
  },

  getbyid: (month, year, id) => {
    return apiClient.get(`/attendances/employee/${id}`, {
      params: { month, year },
    });
  },

  getdatamoth: (month, year) => {
    return apiClient.get("/attendances/my-timesheet", {
      params: { month, year },
    });
  },

  getme: (month, year) => {
    return apiClient.get("/attendances/my-attendance", {
      params: { month, year },
    });
  },

  importExcel: (formData) => {
    return apiClient.post("/attendances/import-excel", formData, multipartHeaders);
  },

  syncExcel: (formData) => {
    return apiClient.post("/attendances/sync-excel", formData, multipartHeaders);
  },

  import: (formData) => {
    return attendancesAPI.syncExcel(formData);
  },

  detectAbsences: (payload) => {
    return apiClient.post("/attendances/detect-absences", payload);
  },

  updateAtendances: (id, payload) => {
    return apiClient.patch(`/attendances/${id}`, payload);
  },

  delete: (id) => {
    return apiClient.delete(`/attendances/${id}`);
  },
};
