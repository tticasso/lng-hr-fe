import apiClient from "./apiClient";

export async function getEmployees(params = {}) {
  const res = await apiClient.get("/api/employees", { params });
  return res.data;
}

export async function getEmployeeById(id) {
  const res = await apiClient.get(`/api/employees/${id}`);
  return res.data;
}

export async function createEmployee(payload) {
  const res = await apiClient.post("/api/employees", payload);
  return res.data;
}

export async function updateEmployee(id, payload) {
  const res = await apiClient.put(`/api/employees/${id}`, payload);
  return res.data;
}
