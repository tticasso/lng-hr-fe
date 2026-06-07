import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { hasAnyPermission } from "../../utils/authPermissions";
import { ACCESS } from "../../config/accessControl";

const OTIndex = () => {
  const { user } = useAuth();

  if (hasAnyPermission(user, ACCESS.OT_APPROVALS)) {
    return <Navigate to="/ot/approvals" replace />;
  }

  return <Navigate to="/ot/my" replace />;
};

export default OTIndex;
