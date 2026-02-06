import apiClient from "./apiClient";
export const createUserApi = (userData) => {
  return apiClient.post("/api/user", userData);
};
