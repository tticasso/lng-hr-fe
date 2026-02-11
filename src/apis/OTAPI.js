import apiClient from "./apiClient";

export const OTApi = {

    get: () => {
        return apiClient.get("/overtimes/my-ot");
    },
    getALL: () => {
        return apiClient.get("/overtimes");
    },
    post: (payload) => {
        return apiClient.post(`/overtimes`, payload);
    },

    put: (id) => {
        return apiClient.patch(`/overtimes/approve/${id}`, { status: "APPROVED" }
        );
    },
}