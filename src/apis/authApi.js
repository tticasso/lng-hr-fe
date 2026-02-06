import apiClient from "./apiClient";

export const authApi = {
  // Đăng nhập
  login: (credentials) => {
    return apiClient.post("/auth/login", credentials);
  },

  // Đăng xuất
  logout: () => {
    return apiClient.post("/auth/logout");
  },

  // Refresh token (nếu cần sau này)
  refreshToken: (token) => {
    return apiClient.post("/auth/refresh", { refreshToken: token });
  },
};
