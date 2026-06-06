import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { hasPermission } from "../../utils/authPermissions";

const LeaveIndex = () => {
  const { user } = useAuth();

  if (hasPermission(user, "APPROVE_LEAVE")) {
    return <Navigate to="/leave/approvals" replace />;
  }

  return <Navigate to="/leave/my" replace />;
};

export default LeaveIndex;
