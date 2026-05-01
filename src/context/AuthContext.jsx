import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { AUTH_UNAUTHORIZED_EVENT, setAuthToken } from "../apis/apiClient";
import { employeeApi } from "../apis/employeeApi";
import { disconnectSocket, reconnectSocket } from "../pages/notification/useSocket";

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

  const clearAuth = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("role");
    localStorage.removeItem("accountID");
    localStorage.removeItem("employee_ID");
    setAuthToken(null);
    disconnectSocket();
  }, []);

  // 1. Load từ LocalStorage khi F5
  useEffect(() => {
    const initAuth = async () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          const savedToken = parsed.token || parsed.accessToken;

          if (!savedToken) {
            clearAuth();
            return;
          }

          setAuthToken(savedToken);
          setToken(savedToken);

          // Xác thực token bằng profile mới nhất trước khi cho vào app
          try {
            const res = await employeeApi.getMe();
            console.log("GET ME :",res)
            // Lấy đúng data từ cấu trúc JSON của bạn
            const rawData = res.data?.data?.employee || res.data?.employee;
            if (rawData) {
              const cleanUser = normalizeUser(rawData);
              console.log("DỮ LIỆU USER : ",cleanUser)
              setUser(cleanUser);
              localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({ ...parsed, token: savedToken, user: cleanUser }),
              );
            } else {
              clearAuth();
            }
          } catch (err) {
            console.warn("Auth validation failed", err);
            clearAuth();
          }
        }
      } catch {
        clearAuth();
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, [clearAuth]);

  useEffect(() => {
    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, clearAuth);
    return () => {
      window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, clearAuth);
    };
  }, [clearAuth]);

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

    // Reconnect socket với token mới
    setTimeout(() => {
      reconnectSocket();
    }, 100);
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
    clearAuth();
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
