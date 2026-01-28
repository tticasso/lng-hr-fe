import apiClient from "./apiClient";

// Login
export async function loginApi(email, password) {
  const res = await apiClient.post("/api/auth/login", {
    email,
    password,
  });
  return res.data; // data từ backend
}

// ADMIN tạo user mới
export async function createUserApi(payload) {
  const res = await apiClient.post("/api/auth/users", payload);
  return res.data;
}
