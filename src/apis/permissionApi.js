import apiClient from "./apiClient";

export const permissionApi = {
  getAll: () => apiClient.get("/permissions"),
  create: (data) => apiClient.post("/permissions", data),
  update: (id, data) => apiClient.put(`/permissions/${id}`, data),
  delete: (id) => apiClient.delete(`/permissions/${id}`),
};
