import apiClient from "./apiClient";

export const saturdayRotations = {
  post: (data) => {
    return apiClient.post("/saturday-rotations", data);
  },

  get: (teamid, month, year, params = {}) => {
    return apiClient.get("/saturday-rotations", {
      params: { teamId: teamid, month, year, ...params },
    });
  },

  patch: (rotationId, data) => {
    return apiClient.patch(`/saturday-rotations/${rotationId}`, data);
  },

  deleteById: (rotationId) => {
    return apiClient.delete(`/saturday-rotations/${rotationId}`);
  },

  deleteAll: (teamid) => {
    return apiClient.delete(`/saturday-rotations/team/${teamid}`);
  },

  deleteByMonth: (teamid, month, year) => {
    return apiClient.delete(`/saturday-rotations/team/${teamid}`, {
      params: { month, year },
    });
  },
};
