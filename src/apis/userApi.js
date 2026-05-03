import apiClient from "./apiClient";

export const createUserApi = (userData) => {
  const roleName = userData.roleName || userData.role || userData.roles?.[0];

  return apiClient.post("/accounts", {
    username: userData.username || userData.email,
    password: userData.password,
    roleName: roleName === "USER" ? "EMPLOYEE" : roleName,
  });
};
