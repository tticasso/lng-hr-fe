import apiClient from "./apiClient";

export const dashboardAPI = {
  getUpcomingEvents: (params) => {
    return apiClient.get("/dashboard/upcoming-events", { params });
  },
};
