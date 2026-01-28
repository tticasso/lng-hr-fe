// // src/context/AuthContext.jsx
// import { createContext, useContext, useEffect, useState } from "react";
// import { loginApi } from "../apis/authApi";
// import { setAuthToken } from "../apis/apiClient";

// const AuthContext = createContext(null);

// const STORAGE_KEY = "hr_portal_auth";

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null); // { id, email, roles: [...] }
//   const [token, setToken] = useState(null); // accessToken
//   const [loading, setLoading] = useState(true);

//   // Load từ localStorage khi mở app
//   useEffect(() => {
//     try {
//       const saved = localStorage.getItem(STORAGE_KEY);
//       if (saved) {
//         const parsed = JSON.parse(saved);
//         setUser(parsed.user || null);
//         setToken(parsed.token || null);

//         // Set token cho axios instance
//         if (parsed.token) {
//           setAuthToken(parsed.token);
//         }
//       }
//     } catch (e) {
//       console.error("Failed to parse auth from storage", e);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   const login = async (email, password) => {
//     const res = await loginApi(email, password);

//     const newAuth = {
//       user: res.data.user,
//       token: res.data.accessToken,
//     };

//     setUser(newAuth.user);
//     setToken(newAuth.token);
//     localStorage.setItem(STORAGE_KEY, JSON.stringify(newAuth));

//     // Gắn token vào axios cho các request sau
//     setAuthToken(newAuth.token);
//   };

//   const logout = () => {
//     setUser(null);
//     setToken(null);
//     localStorage.removeItem(STORAGE_KEY);
//     setAuthToken(null);
//   };

//   const value = {
//     user,
//     token,
//     loading,
//     login,
//     logout,
//   };

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// }

// // eslint-disable-next-line react-refresh/only-export-components
// export function useAuth() {
//   const ctx = useContext(AuthContext);
//   if (!ctx) {
//     throw new Error("useAuth must be used within AuthProvider");
//   }
//   return ctx;
// }
