import apiClient from "./apiClient";

export const shitfAPI = {
    get: () => {
        return apiClient.get("/shifts");
    },
}