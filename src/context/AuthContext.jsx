import { createContext, useContext, useEffect, useState } from "react";
import { setAuthToken } from "../apis/apiClient";
import { employeeApi } from "../apis/employeeApi";

const AuthContext = createContext(null);
const STORAGE_KEY = "auth";

// --- HÀM CHUẨN HÓA DỮ LIỆU (QUAN TRỌNG) ---
// Chuyển mọi dạng "true", "True", true về Boolean true. Còn lại là false.
const normalizeUser = (userData) => {
  if (!userData) return null;
  return {
    ...userData,
    isProfileUpdated:
      String(userData.isProfileUpdated).toLowerCase() === "true",
  };
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Load từ LocalStorage khi F5
  useEffect(() => {
    const initAuth = async () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          const savedToken = parsed.token || parsed.accessToken;

          if (savedToken) {
            setAuthToken(savedToken);
            setToken(savedToken);
            // Chuẩn hóa user từ cache ngay lập tức
            setUser(normalizeUser(parsed.user));

            // Gọi API refresh ngầm
            try {
              const res = await employeeApi.getMe();
              // Lấy đúng data từ cấu trúc JSON của bạn
              const rawData = res.data?.data?.employee || res.data?.employee;
              if (rawData) {
                const cleanUser = normalizeUser(rawData);
                setUser(cleanUser);
                localStorage.setItem(
                  STORAGE_KEY,
                  JSON.stringify({ ...parsed, user: cleanUser }),
                );
              }
            } catch (err) {
              console.warn("Background refresh failed", err);
            }
          }
        }
      } catch (e) {
        localStorage.removeItem(STORAGE_KEY);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  // 2. Login
  const loginUser = (authData) => {
    const cleanUser = normalizeUser(authData.user); // Chuẩn hóa đầu vào
    setUser(cleanUser);
    setToken(authData.accessToken);
    setAuthToken(authData.accessToken);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        user: cleanUser,
        token: authData.accessToken,
      }),
    );
  };

  // 3. Refresh Profile (Gọi sau khi update form thành công)
  const refreshProfile = async () => {
    const res = await employeeApi.getMe();
    const rawData = res.data?.data?.employee || res.data?.employee;

    if (rawData) {
      const cleanUser = normalizeUser(rawData);
      setUser(cleanUser);

      const currentAuth = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ...currentAuth, user: cleanUser }),
      );

      return cleanUser;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEY);
    setAuthToken(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, loginUser, logout, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
