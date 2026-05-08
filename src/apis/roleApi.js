import apiClient from "./apiClient";
import { cachedRequest, invalidateCache } from "../shared/apiCache";

export const roleApi = {
  getAll: () => apiClient.get("/roles"),
  getAllCached: () => cachedRequest("roles:all", () => roleApi.getAll()),
  getById: (id) => apiClient.get(`/roles/${id}`),
  create: (data) => {
    invalidateCache("roles:");
    return apiClient.post("/roles", data);
  },
  update: (id, data) => {
    invalidateCache("roles:");
    return apiClient.put(`/roles/${id}`, data);
  },
  delete: (id) => {
    invalidateCache("roles:");
    return apiClient.delete(`/roles/${id}`);
  },

  // Payload: { permissionIds: ["id1", "id2"] }
  addPermissions: (id, permissionIds) => {
    invalidateCache("roles:");
    return apiClient.patch(`/roles/${id}/add-permissions`, { permissionIds });
  },

  removePermissions: (id, permissionIds) => {
    invalidateCache("roles:");
    return apiClient.patch(`/roles/${id}/remove-permissions`, {
      permissionIds,
    });
  },
};
