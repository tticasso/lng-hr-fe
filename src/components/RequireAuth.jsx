import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

const RequireAuth = ({ children, roles: allowedRoles }) => {
  const { user, loading } = useAuth();
  console.log("RequireAuth/ user: ", user);
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

  const userRoleName = user.accountId?.role?.name || "USER";

  if (allowedRoles && !allowedRoles.includes(userRoleName)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default RequireAuth;
