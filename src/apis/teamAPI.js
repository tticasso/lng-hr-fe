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

    addmember: (id,payload) => {
        return apiClient.post(`/teams/${id}/members`,payload);
    },

     getrotation: (id, month, year) => {
        return apiClient.get(`/teams/${id}/rotation?month=${month}&year=${year}`);
    },

    addrotation: (id,payload) => {
        return apiClient.post(`/teams/${id}/rotation`,payload);
    },

      updaterotation: (idTEAM,idrotation,payload) => {
        return apiClient.patch(`/teams/${idTEAM}/rotation/${idrotation}`,payload);
    },
     
}