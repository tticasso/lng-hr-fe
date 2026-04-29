import apiClient from "./apiClient";

export const OTApi = {

    get: (page, limit) => {
        return apiClient.get(`/overtimes?page=${page}&limit=${limit}`);
    },
    getALL: (page, limit) => {
        return apiClient.get(`/overtimes?page=${page}&limit=${limit}`);
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

    put: (id,payload) => {
        return apiClient.patch(`/overtimes/approve/${id}`,payload
        );
    },

    cancel: (id) => {
        return apiClient.patch(`/overtimes/cancel/${id}`);
    },
}