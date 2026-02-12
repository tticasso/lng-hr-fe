import apiClient from "./apiClient";

export const payrollAPI = {
   
    getbyme: () => {
        return apiClient.get("/payrolls/my-income");
    },
   
};