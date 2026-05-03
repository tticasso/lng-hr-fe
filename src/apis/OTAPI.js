import apiClient from "./apiClient";

export const OTApi = {
  get: (page, limit) => {
    return apiClient.get("/overtimes", { params: { page, limit } });
  },

  getALL: (page, limit) => {
    return apiClient.get("/overtimes", { params: { page, limit } });
  },

  getMy: (params) => {
    return apiClient.get("/overtimes/my-ots", { params });
  },

  post: async (payload) => {
    try {
      const res = await apiClient.post("/overtimes", payload);
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  update: (id, payload) => {
    return apiClient.patch(`/overtimes/${id}`, payload);
  },

  delete: (id) => {
    return apiClient.delete(`/overtimes/${id}`);
  },

  approve: (id, payload) => {
    return apiClient.patch(`/overtimes/approve/${id}`, payload);
  },

  put: (id, payload) => {
    return OTApi.approve(id, payload);
  },

  cancel: (id) => {
    return apiClient.patch(`/overtimes/cancel/${id}`);
  },
};
