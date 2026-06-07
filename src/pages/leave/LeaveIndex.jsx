import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { hasAnyPermission } from "../../utils/authPermissions";
import { ACCESS } from "../../config/accessControl";
import { ROUTES } from "../../config/routes";

const LeaveIndex = () => {
  const { user } = useAuth();

  if (hasAnyPermission(user, ACCESS.LEAVE_APPROVALS)) {
    return <Navigate to={ROUTES.LEAVE_APPROVALS} replace />;
  }

  return <Navigate to={ROUTES.LEAVE} replace />;
};

export default LeaveIndex;
