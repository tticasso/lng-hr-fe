import apiClient from "./apiClient";

const multipartHeaders = {
  headers: {
    "Content-Type": "multipart/form-data",
  },
};

export const isNetworkRestrictedError = (error) => {
  return (
    error?.response?.status === 403 &&
    error?.response?.data?.code === "NETWORK_RESTRICTED"
  );
};

export const attendancesAPI = {
  checkIn: () => {
    return apiClient.post("/attendances/check-in");
  },

  checkOut: () => {
    return apiClient.post("/attendances/check-out");
  },

  getAll: (params) => {
    return apiClient.get("/attendances", { params });
  },

  getall: (month, year, params = {}) => {
    return apiClient.get("/attendances/report", {
      params: { month, year, ...params },
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

  bulkWrite: (payload) => {
    return apiClient.post("/attendances/bulk-write", payload);
  },

  updateAtendances: (id, payload) => {
    return apiClient.patch(`/attendances/${id}`, payload);
  },

  delete: (id) => {
    return apiClient.delete(`/attendances/${id}`);
  },
};
