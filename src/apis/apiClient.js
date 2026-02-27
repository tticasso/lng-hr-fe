// src/apis/apiClient.js
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://api-hr.lngmerch.co/api";
//const API_BASE_URL = "http://localhost:5000/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

export function setAuthToken(token) {
  if (token) {
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common["Authorization"];
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Chuẩn hoá message nhưng KHÔNG bọc new Error()
    const errors = error?.response?.data?.errors;
    const normalizedMessage =
      (Array.isArray(errors) && errors.length
        ? errors.map(e => e.message).join(", ")
        : null) ||
      error?.response?.data?.message ||
      error?.message ||
      "Request failed";

    // gắn thêm field để dùng nhanh ở UI
    error.normalizedMessage = normalizedMessage;

    return Promise.reject(error); // giữ nguyên AxiosError
  }
);

export default apiClient;
