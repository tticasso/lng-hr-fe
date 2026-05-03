import { Navigate } from "react-router-dom";

const OTIndex = () => {
  const role = localStorage.getItem("role");
  if (["ADMIN", "HR", "MANAGER", "LEADER"].includes(role)) {
    return <Navigate to="/ot/approvals" replace />;
  }

  return <Navigate to="/ot/my" replace />;
};

export default OTIndex;
