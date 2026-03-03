import apiClient from "./apiClient";

export const holidayAPI = {
    get: () => {
        return apiClient.get("/holidays");
    },
    create: (data) => {
        return apiClient.post("/holidays", data);
    },
    update: (id, data) => {
        return apiClient.put(`/holidays/${id}`, data);
    },
    delete: (id) => {
        return apiClient.delete(`/holidays/${id}`);
    },

    getbyid: (id) => {
        return apiClient.get(`/holidays/${id}`);
    },
}