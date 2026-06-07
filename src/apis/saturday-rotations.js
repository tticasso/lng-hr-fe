import apiClient from "./apiClient";

const normalizeSaturdayRotationResponse = (response) => {
  const payload = response?.data?.data;

  if (Array.isArray(payload)) {
    response.data.data = {
      rotations: payload,
      scope: null,
    };
  } else if (payload && !Array.isArray(payload.rotations) && Array.isArray(payload.data)) {
    response.data.data = {
      ...payload,
      rotations: payload.data,
    };
  }

  return response;
};

export const saturdayRotations = {
  post: (data) => {
    return apiClient.post("/saturday-rotations", data).then(normalizeSaturdayRotationResponse);
  },

  get: (teamid, month, year, params = {}) => {
    return apiClient.get("/saturday-rotations", {
      params: { teamId: teamid, month, year, ...params },
    }).then(normalizeSaturdayRotationResponse);
  },

  patch: (rotationId, data) => {
    return apiClient.patch(`/saturday-rotations/${rotationId}`, data).then(normalizeSaturdayRotationResponse);
  },

  deleteById: (rotationId) => {
    return apiClient.delete(`/saturday-rotations/${rotationId}`).then(normalizeSaturdayRotationResponse);
  },

  deleteAll: (teamid) => {
    return apiClient.delete(`/saturday-rotations/team/${teamid}`).then(normalizeSaturdayRotationResponse);
  },

  deleteByMonth: (teamid, month, year) => {
    return apiClient.delete(`/saturday-rotations/team/${teamid}`, {
      params: { month, year },
    }).then(normalizeSaturdayRotationResponse);
  },
};
