import { Navigate } from "react-router-dom";

const LeaveIndex = () => {
  const role = localStorage.getItem("role");
  if (["ADMIN", "HR", "MANAGER", "LEADER"].includes(role)) {
    return <Navigate to="/leave/approvals" replace />;
  }

  return <Navigate to="/leave/my" replace />;
};

export default LeaveIndex;
