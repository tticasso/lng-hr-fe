import apiClient from "./apiClient";

export const payrollAPI = {

    getall: (month, year) => {
        return apiClient.get(`/payrolls?month=${month}&year=${year}`);
    },

    getbyme: () => {
        return apiClient.get("/payrolls/my-income");
    },

    syncdata: (payload) => {
        return apiClient.post("/payrolls/sync", payload);
    },

    calcalculate: (payload) => {
        return apiClient.post("/payrolls/calculate", payload);
    },

    finalize: (payload) => {
        return apiClient.patch("/payrolls/finalize", payload);
    },

    markpaid: (payload) => {
        return apiClient.patch("/payrolls/mark-paid", payload);
    },
};