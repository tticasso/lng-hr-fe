import apiClient from "./apiClient";

export const roleApi = {
  getAll: () => apiClient.get("/roles"),
  getById: (id) => apiClient.get(`/roles/${id}`),
  create: (data) => apiClient.post("/roles", data),
  update: (id, data) => apiClient.put(`/roles/${id}`, data),
  delete: (id) => apiClient.delete(`/roles/${id}`),

  // Payload: { permissionIds: ["id1", "id2"] }
  addPermissions: (id, permissionIds) => {
    return apiClient.patch(`/roles/${id}/add-permissions`, { permissionIds });
  },

  removePermissions: (id, permissionIds) => {
    return apiClient.patch(`/roles/${id}/remove-permissions`, {
      permissionIds,
    });
  },
};
