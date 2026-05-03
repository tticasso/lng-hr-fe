import apiClient from "./apiClient";

export const systemSettingApi = {
  getAll: (params) => {
    return apiClient.get("/system-settings", { params });
  },

  updateBulk: (payload) => {
    return apiClient.patch("/system-settings", payload);
  },

  getByCategory: (category) => {
    return apiClient.get(`/system-settings/category/${category}`);
  },

  updateByKey: (key, payload) => {
    return apiClient.patch(`/system-settings/${key}`, payload);
  },
};
