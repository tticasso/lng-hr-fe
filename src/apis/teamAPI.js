import apiClient from "./apiClient";


export const teamAPI = {

    get: () => {
        return apiClient.get("/teams");
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
}