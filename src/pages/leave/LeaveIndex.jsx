import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { hasAnyPermission } from "../../utils/authPermissions";
import { ACCESS } from "../../config/accessControl";

const LeaveIndex = () => {
  const { user } = useAuth();

  if (hasAnyPermission(user, ACCESS.LEAVE_APPROVALS)) {
    return <Navigate to="/leave/approvals" replace />;
  }

  return <Navigate to="/leave/my" replace />;
};

export default LeaveIndex;
