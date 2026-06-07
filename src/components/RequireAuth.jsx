import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";
import { getRoleName, hasAnyPermission, isSuperAdmin } from "../utils/authPermissions";
import { ROUTES } from "../config/routes";

const RequireAuth = ({ children, roles: allowedRoles, permissions: allowedPermissions }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (user.isProfileUpdated === false && location.pathname !== ROUTES.PROFILE) {
    return <Navigate to={ROUTES.PROFILE} replace />;
  }

  const userRoleName = getRoleName(user);
  const superAdmin = isSuperAdmin(user);
  const hasAllowedRole = superAdmin || !allowedRoles || allowedRoles.includes(userRoleName);
  const hasAllowedPermission = !allowedPermissions || hasAnyPermission(user, allowedPermissions);

  if (!hasAllowedRole && !hasAllowedPermission) {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  }

  return children;
};

export default RequireAuth;
