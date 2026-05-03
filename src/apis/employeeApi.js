import apiClient from "./apiClient";

export const employeeApi = {
  getMe: () => {
    return apiClient.get("/employees/me");
  },

  getAll: (params = { limit: 100 }) => {
    return apiClient.get("/employees", { params });
  },

  getById: (id) => {
    return apiClient.get(`/employees/${id}`);
  },

  downloadTemplate: () => {
    return apiClient.get("/employees/template", { responseType: "blob" });
  },

  updateMe: (data) => {
    return apiClient.patch("/employees/update-me", data);
  },

  updateEmployee: (id, data) => {
    return apiClient.patch(`/employees/update-employee/${id}`, data);
  },

  updateStatus: (id, data) => {
    return apiClient.patch(`/employees/status/${id}`, data);
  },

  restore: (id, data) => {
    return apiClient.patch(`/employees/restore/${id}`, data);
  },

  create: (data) => {
    return apiClient.post("/employees", data);
  },

  delete: (id) => {
    return apiClient.delete(`/employees/${id}`);
  },

  import_profile: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post("/employees/import-profile", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};
