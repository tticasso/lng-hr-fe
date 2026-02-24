import apiClient from "./apiClient";

export const attendancesAPI = {

    getall: (month, year) => {
        return apiClient.get(`/attendances/report?month=${month}&year=${year}`);
    },
    getbyid: (month, year, id) => {
        return apiClient.get(`/attendances/employee/${id}?month=${month}&year=${year}`);
    },
    getdatamoth: (month, year) => {
        return apiClient.get(`/attendances/my-timesheet?month=${month}&year=${year}`);
    },
    getme: (month, year) => {
        return apiClient.get(`/attendances/my-attendance?month=${month}&year=${year}`);
    },

    // Import attendance từ Excel
    import: (formData) => {
        return apiClient.post('/attendances/import-excel', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    updateAtendances: (id, payload) => {
        return apiClient.patch(`/attendances/${id}`, payload);
    },


};
