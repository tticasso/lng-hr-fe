import apiClient from "./apiClient";

export const teamAPI = {
  get: (params) => {
    return apiClient.get("/teams", { params });
  },

  getbyID: (id) => {
    return apiClient.get(`/teams/${id}`);
  },

  post: (data) => {
    return apiClient.post("/teams", data);
  },

  update: (id, data) => {
    return apiClient.put(`/teams/${id}`, data);
  },

  delete: (id) => {
    return apiClient.delete(`/teams/${id}`);
  },

  addmember: (id, payload) => {
    return apiClient.post(`/teams/${id}/members`, payload);
  },

  removeMembers: (id, payload) => {
    return apiClient.delete(`/teams/${id}/members`, { data: payload });
  },
};
