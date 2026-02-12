import apiClient from "./apiClient";

export const attendancesAPI = {
   
    getall: (month,year) => {
        return apiClient.get(`/attendances/report?month=${month}&year=${year}`);
    },
     getbyid: (month,year,id) => {
        return apiClient.get(`/attendances/employee/${id}?month=${month}&year=${year}`);
    },
   
};