import apiClient from "./apiClient";

export const dashboardAPI = {
  getHROverview: (params) => {
    return apiClient.get("/dashboard/hr-overview", { params });
  },

  getHRRequestsSummary: (params) => {
    return apiClient.get("/dashboard/hr-requests-summary", { params });
  },

  getHRAttendanceTrend: (params) => {
    return apiClient.get("/dashboard/hr-attendance-trend", { params });
  },

  getUpcomingEvents: (params) => {
    return apiClient.get("/dashboard/upcoming-events", { params });
  },

  getLateAttendances: (params) => {
    return apiClient.get("/dashboard/late-attendances", { params });
  },

  getAbsentAttendances: (params) => {
    return apiClient.get("/dashboard/absent-attendances", { params });
  },

  getMissingCheckOuts: (params) => {
    return apiClient.get("/dashboard/missing-checkouts", { params });
  },
};
