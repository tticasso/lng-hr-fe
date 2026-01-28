// src/components/RequireAuth.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RequireAuth({ children, roles }) {
  const { user, token } = useAuth();
  const location = useLocation();

  // Chưa login
  if (!user || !token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Có yêu cầu role nhưng user không đủ quyền
  if (roles && roles.length > 0) {
    const userRoles = user.roles || [];
    const hasRole = userRoles.some((r) => roles.includes(r));

    if (!hasRole) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}
