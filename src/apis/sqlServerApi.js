import apiClient from "./apiClient";

export const sqlServerApi = {
  getHealth() {
    return apiClient.get("/sql-server/health");
  },

  getAttendanceSyncStatus() {
    return apiClient.get("/sql-server/attendance/sync/status");
  },

  syncAttendance(payload) {
    return apiClient.post("/sql-server/attendance/sync", payload);
  },
};
