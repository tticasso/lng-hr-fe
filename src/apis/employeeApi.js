import apiClient from "./apiClient";

export const employeeApi = {
  getMe: () => {
    return apiClient.get("/employees/me");
  },
  // GET /api/employees (Thay vì /user)
  getAll: (params) => {
    return apiClient.get("/employees", { params });
  },

  // GET /api/employees/:id
  getById: (id) => {
    return apiClient.get(`/employees/${id}`);
  },

  // PATCH /api/employees/update-me
  updateMe: (data) => {
    return apiClient.patch("/employees/update-me", data);
  },

  // PATCH /api/employees/update-employee/:id
  updateEmployee: (id, data) => {
    return apiClient.patch(`/employees/update-employee/${id}`, data);
  },

  // POST /api/employees
  create: (data) => {
    return apiClient.post("/employees", data);
  },
  delete: (id) => {
    return apiClient.delete(`/user/${id}`);
  },
};
