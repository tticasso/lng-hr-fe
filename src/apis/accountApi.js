import apiClient from "./apiClient";

export const accountApi = {
  // GET /api/accounts - Lấy danh sách account
  getAll: (params) => {
    return apiClient.get("/accounts", { params });
  },

  // GET /api/accounts/:id - Lấy chi tiết
  getById: (id) => {
    return apiClient.get(`/accounts/${id}`);
  },

  // POST /api/accounts - Tạo account mới
  create: (data) => {
    return apiClient.post("/accounts", data);
  },

  // PUT /api/accounts/:id - Cập nhật thông tin (bao gồm status để khóa/mở khóa)
  update: (id, data) => {
    return apiClient.put(`/accounts/${id}`, data);
  },

  // DELETE /api/accounts/:id - Xóa account
  delete: (id) => {
    return apiClient.delete(`/accounts/${id}`);
  },

  // PATCH /api/accounts/reset-password - Reset mật khẩu
  // Body: { accountId: "..." }
  resetPassword: (accountId) => {
    return apiClient.patch("/accounts/reset-password", { accountId });
  },

  //update role
  updateRole: (id, roleName) => {
    return apiClient.put(`/accounts/${id}`, {roleName:roleName});
  },

  // POST /api/accounts/bulk-import - Import file Excel
  bulkImport: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post("/accounts/bulk-import", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

};
