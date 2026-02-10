import apiClient from "./apiClient";

export const leaveAPI = {
    // Post dữ liệu xin nghỉ
    post: (data) => {
        return apiClient.post("/leaves", data);
    },
    getbyADMIN: () => {
        return apiClient.get("/leaves");
    },
    getbyUSER: () => {
        return apiClient.get("/leaves/my-leaves", { status: "APPROVED" });
    },
    APPROVED: (id) => {
        return apiClient.patch(`/leaves/approve/${id}`, { status: "APPROVED" });
    },

    CANCELLED: (id) => {
        return apiClient.patch(`/leaves/cancel/${id}`, { status: "CANCELLED" });
    },
    //   // Đăng xuất
    //   logout: () => {
    //     return apiClient.post("/auth/logout");
    //   },

    //   // Refresh token (nếu cần sau này)
    //   refreshToken: (token) => {
    //     return apiClient.post("/auth/refresh", { refreshToken: token });
    //   },
};
