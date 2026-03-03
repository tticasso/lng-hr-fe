import apiClient from "./apiClient";

export const shitfAPI = {
    get: () => {
        return apiClient.get("/shifts");
    },
    getbyid: (id) => {
        return apiClient.get(`/shifts/${id}`);
    },
    create: (data) => {
        return apiClient.post("/shifts", data);
    },
    update: (id, data) => {
        return apiClient.put(`/shifts/${id}`, data);
    },
    delete: (id) => {
        return apiClient.delete(`/shifts/${id}`);
    },
}