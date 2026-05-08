import apiClient from "./apiClient";
import { cachedRequest, invalidateCache } from "../shared/apiCache";

export const departmentApi = {
  getAll: (params) => {
    return apiClient.get("/departments", { params });
  },
  getAllCached: (params) => {
    const key = `departments:${JSON.stringify(params || {})}`;
    return cachedRequest(key, () => departmentApi.getAll(params));
  },
  getById: (id) => {
    return apiClient.get(`/departments/${id}`);
  },
  create: (data) => {
    invalidateCache("departments:");
    return apiClient.post("/departments", data);
  },
  update: (id, data) => {
    invalidateCache("departments:");
    return apiClient.put(`/departments/${id}`, data);
  },
  delete: (id) => {
    invalidateCache("departments:");
    return apiClient.delete(`/departments/${id}`);
  },
};
