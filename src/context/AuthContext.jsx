import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { AUTH_UNAUTHORIZED_EVENT, setAuthToken } from "../apis/apiClient";
import { accountApi } from "../apis/accountApi";
import { employeeApi } from "../apis/employeeApi";
import { disconnectSocket, reconnectSocket } from "../pages/notification/useSocket";

const AuthContext = createContext(null);
const STORAGE_KEY = "auth";

const extractAccountMePayload = (response) => response?.data?.data || response?.data || null;

const normalizeUser = (userData) => {
  if (!userData) return null;

  const account =
    userData.account ||
    (userData.accountId && typeof userData.accountId === "object" ? userData.accountId : null);
  const employee = userData.employee || (userData.account ? null : userData);
  const role = account?.role || userData.role || null;
  const permissionNames =
    userData.permissionNames ||
    account?.permissionNames ||
    role?.permissions?.map((permission) => permission?.name || permission).filter(Boolean) ||
    userData.permissions ||
    [];
  const profileUpdatedValue = employee?.isProfileUpdated ?? userData.isProfileUpdated ?? true;

  return {
    ...(employee || {}),
    account,
    accountId: account || employee?.accountId || userData.accountId || null,
    employee,
    permissionNames,
    role,
    permissions: permissionNames,
    isProfileUpdated: String(profileUpdatedValue).toLowerCase() === "true",
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

          try {
            const res = await accountApi.getMe();
            const rawData = extractAccountMePayload(res);
            if (rawData) {
              const cleanUser = normalizeUser(rawData);
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

  const loginUser = (authData) => {
    const cleanUser = normalizeUser(authData.user);
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

    setTimeout(() => {
      reconnectSocket();
    }, 100);
  };

  const refreshProfile = async () => {
    const res = await employeeApi.getMe();
    const rawData = res.data?.data?.employee || res.data?.employee;

    if (rawData) {
      const cleanUser = normalizeUser({
        account: user?.account || user?.accountId,
        employee: rawData,
      });
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
