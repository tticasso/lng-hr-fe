import apiClient from "./apiClient";

export const OTApi = {

    get: () => {
        return apiClient.get("/overtimes");
    },
    getALL: () => {
        return apiClient.get("/overtimes");
    },
    // post: (payload) => {
    //     return apiClient.post(`/overtimes`, payload);
    // },

    post: async (payload) => {
        try {
            const res = await apiClient.post(`/overtimes`, payload);
            return res.data; // chỉ trả data
        } catch (error) {
            // ném lại nguyên bản axios error (giữ response)
            throw error;
        }
    },

    put: (id,approvedHours) => {
        return apiClient.patch(`/overtimes/approve/${id}`, { status: "APPROVED",approvedHours }
        );
    },
}