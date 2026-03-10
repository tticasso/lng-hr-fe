import apiClient from "./apiClient";


export const leavebalanceAPI = {

    get: () => {
        return apiClient.get(`/leave-balances`);
    },


    put: (id,payload) => {
        return apiClient.put(`/leave-balances/${id}`,payload);
    },
}