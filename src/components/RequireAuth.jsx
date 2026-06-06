import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";
import { getPermissionNames, getRoleName } from "../utils/authPermissions";

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
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.isProfileUpdated === false && location.pathname !== "/profile") {
    return <Navigate to="/profile" replace />;
  }

  const userRoleName = getRoleName(user);
  const userPermissionNames = getPermissionNames(user);

  const hasAllowedRole = !allowedRoles || allowedRoles.includes(userRoleName);
  const hasAllowedPermission =
    !allowedPermissions ||
    allowedPermissions.some((permission) => userPermissionNames.includes(permission));

  if (!hasAllowedRole && !hasAllowedPermission) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default RequireAuth;
