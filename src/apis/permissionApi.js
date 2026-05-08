import apiClient from "./apiClient";
import { cachedRequest, invalidateCache } from "../shared/apiCache";

export const permissionApi = {
  getAll: () => apiClient.get("/permissions?limit=100"),
  getAllCached: () => cachedRequest("permissions:all", () => permissionApi.getAll()),
  create: (data) => {
    invalidateCache("permissions:");
    return apiClient.post("/permissions", data);
  },
  update: (id, data) => {
    invalidateCache("permissions:");
    return apiClient.put(`/permissions/${id}`, data);
  },
  delete: (id) => {
    invalidateCache("permissions:");
    return apiClient.delete(`/permissions/${id}`);
  },
};
