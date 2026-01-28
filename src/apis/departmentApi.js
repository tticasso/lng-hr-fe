import apiClient from "./apiClient";

export async function getDepartments(params = {}) {
  const res = await apiClient.get("/api/departments", { params });
  return res.data;
}

export async function getDepartmentById(id) {
  const res = await apiClient.get(`/api/departments/${id}`);
  return res.data;
}

export async function createDepartment(payload) {
  const res = await apiClient.post("/api/departments", payload);
  return res.data;
}

export async function updateDepartment(id, payload) {
  const res = await apiClient.put(`/api/departments/${id}`, payload);
  return res.data;
}

export async function deactivateDepartment(id) {
  const res = await apiClient.delete(`/api/departments/${id}`);
  return res.data;
}
