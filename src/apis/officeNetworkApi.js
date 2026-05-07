import apiClient from "./apiClient";

export const officeNetworkApi = {
  getAll: () => {
    return apiClient.get("/office-networks");
  },

  create: (payload) => {
    return apiClient.post("/office-networks", payload);
  },

  update: (id, payload) => {
    return apiClient.patch(`/office-networks/${id}`, payload);
  },

  disable: (id) => {
    return apiClient.delete(`/office-networks/${id}`);
  },
};
