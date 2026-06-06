import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { hasPermission } from "../../utils/authPermissions";

const OTIndex = () => {
  const { user } = useAuth();

  if (hasPermission(user, "APPROVE_OT")) {
    return <Navigate to="/ot/approvals" replace />;
  }

  return <Navigate to="/ot/my" replace />;
};

export default OTIndex;
