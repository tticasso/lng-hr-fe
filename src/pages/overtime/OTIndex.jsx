import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { hasAnyPermission } from "../../utils/authPermissions";
import { ACCESS } from "../../config/accessControl";
import { ROUTES } from "../../config/routes";

const OTIndex = () => {
  const { user } = useAuth();

  if (hasAnyPermission(user, ACCESS.OT_APPROVALS)) {
    return <Navigate to={ROUTES.OVERTIME_APPROVALS} replace />;
  }

  return <Navigate to={ROUTES.OVERTIME} replace />;
};

export default OTIndex;
