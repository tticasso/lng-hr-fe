import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

const RequireAuth = ({ children, roles: allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  // 1. Chưa đăng nhập -> Về Login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. LOGIC MỚI: Kiểm tra Profile Updated
  // Nếu chưa cập nhật profile VÀ đang không ở trang /profile -> Đá về /profile
  if (user.isProfileUpdated === false && location.pathname !== "/profile") {
    return <Navigate to="/profile" replace />;
  }

  // 3. Check quyền (Role)
  // Lưu ý: User object từ getMe trả về role dạng object { _id, name: "ADMIN" }
  // Cần mapping lại logic check role cho đúng
  const userRoleName = user.account?.role?.name || "USER";

  if (allowedRoles && !allowedRoles.includes(userRoleName)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default RequireAuth;
