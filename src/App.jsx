import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AUTH_UNAUTHORIZED_EVENT } from "./apis/apiClient";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import MyProfile from "./pages/profile/MyProfile";
import MyTimesheet from "./pages/timeSheet/MyTimeSheet";
import MyPayslip from "./pages/payroll/MyPayslip";
import NotFound from "./pages/NotFound";
import EmployeeList from "./pages/admin/EmployeeList";
import MyRequests from "./pages/requests/MyRequests";
import EmployeeDetail from "./pages/admin/EmployeeDetail";
import Recruitment from "./pages/recruitment/Recruitment";
import OnboardingOffboarding from "./pages/admin/OnboardingOffboarding";
import TrainingPerformance from "./pages/admin/TrainingPerformance";
import AttendanceAdmin from "./pages/admin/AttendanceAdmin";
import PayrollEngine from "./pages/payroll/PayrollEngine";
import SystemAdmin from "./pages/admin/SystemAdmin";
import UserManagement from "./pages/admin/UserManagement";
import Announcements from "./pages/announce/Announcements";
import Login from "./pages/auth/Login";
import RequireAuth from "./components/RequireAuth";
import Register from "./pages/auth/Register";
import PublicRoute from "./components/PublicRoute";
import LeaveIndex from "./pages/leave/LeaveIndex";
import MyLeaveRequests from "./pages/leave/MyLeaveRequests";
import LeaveApprovals from "./pages/leave/LeaveApprovals";
import OTIndex from "./pages/overtime/OTIndex";
import MyOTRequests from "./pages/overtime/MyOTRequests";
import OTApprovals from "./pages/overtime/OTApprovals";
import AllPayRoll from "./pages/payroll/AllPayRoll";
import NotificationViewer from "./pages/notification/NotificationViewer";
import { NotificationProvider } from "./context/NotificationContext";
import { SidebarProvider } from "./context/SidebarContext";
import Holiday from "./pages/holiday/Holiday";
import Department from "./pages/department/Department";
import TeamPages from "./pages/teamPages/TeamPages";
import LeaveBalance from "./pages/leavebalance/LeaveBalance";

function AuthUnauthorizedRedirect() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleUnauthorized = () => {
      if (location.pathname !== "/login") {
        navigate("/login", {
          replace: true,
          state: { from: location, reason: "SESSION_EXPIRED" },
        });
      }
    };

    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => {
      window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
    };
  }, [location, navigate]);

  return null;
}

function App() {
  return (
    <>
      <SidebarProvider>
        <NotificationProvider>
          <BrowserRouter>
          <AuthUnauthorizedRedirect />
          <Routes>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } />

            {/* Route gốc dùng MainLayout */}
            <Route
              path="/"
              element={
                <RequireAuth>
                  <MainLayout />
                </RequireAuth>
              }
            >
              {/* Các trang con sẽ hiện vào vị trí của <Outlet /> */}

              <Route index element={<Dashboard />} />

              <Route path="allpayroll" element={<AllPayRoll />} />

              <Route path="profile" element={<MyProfile />} />
              <Route path="timesheet" element={<MyTimesheet />} />
              <Route path="payroll" element={<MyPayslip />} />
              <Route path="department" element={<Department />} />
              <Route path="requests" element={<MyRequests />} />
              <Route path="leave" element={<LeaveIndex />} />
              <Route path="leave/my" element={<MyLeaveRequests />} />
              <Route
                path="leave/approvals"
                element={
                  <RequireAuth roles={["ADMIN", "HR", "MANAGER", "LEADER"]}>
                    <LeaveApprovals />
                  </RequireAuth>
                }
              />
              <Route path="leave/ot" element={<Navigate to="/ot" replace />} />
              <Route path="ot" element={<OTIndex />} />
              <Route path="ot/my" element={<MyOTRequests />} />
              <Route
                path="ot/approvals"
                element={
                  <RequireAuth roles={["ADMIN", "HR", "MANAGER", "LEADER"]}>
                    <OTApprovals />
                  </RequireAuth>
                }
              />
              <Route path="holiday" element={<Holiday />} />
              {/* Route xem data WebSocket */}
              <Route path="notifications/viewer" element={<NotificationViewer />} />

              <Route
                path="admin"
                element={
                  <RequireAuth roles={["ADMIN"]}>
                    <Outlet />
                  </RequireAuth>
                }
              >
                <Route path="register" element={<Register />} />

                <Route path="system-admin" element={<SystemAdmin />} />
                <Route path="user-management" element={<UserManagement />} />
              </Route>
              <Route
                path="hr"
                element={
                  <RequireAuth roles={["ADMIN", "HR"]}>
                    <Outlet />
                  </RequireAuth>
                }
              >
                <Route path="payroll-engine" element={<PayrollEngine />} />
                <Route path="recruitment" element={<Recruitment />} />
                <Route path="boarding" element={<OnboardingOffboarding />} />
                <Route path="training" element={<TrainingPerformance />} />
                <Route path="attendance-admin" element={<AttendanceAdmin />} />
                <Route path="employees" element={<EmployeeList />} />
                <Route path="employees/:id" element={<EmployeeDetail />} />
                <Route path="announcements" element={<Announcements />} />
                <Route path="leavebalance" element={<LeaveBalance />} />
              </Route>
              
              {/* Route riêng cho Team Management - ADMIN, HR, MANAGER có thể truy cập */}
              <Route 
                path="hr/teampages" 
                element={
                  <RequireAuth roles={["ADMIN", "HR", "MANAGER","LEADER","EMPLOYEE"]}>
                    <TeamPages />
                  </RequireAuth>
                } 
              />
              
              <Route
                path="hr"
                element={
                  <RequireAuth roles={["ADMIN", "HR"]}>
                    <Outlet />
                  </RequireAuth>
                }
              >
                <Route path="payroll-engine" element={<PayrollEngine />} />
                <Route path="recruitment" element={<Recruitment />} />
                <Route path="boarding" element={<OnboardingOffboarding />} />
                <Route path="training" element={<TrainingPerformance />} />
                <Route path="attendance-admin" element={<AttendanceAdmin />} />
                <Route path="employees" element={<EmployeeList />} />
                <Route path="employees/:id" element={<EmployeeDetail />} />
                <Route path="announcements" element={<Announcements />} />
                <Route path="leavebalance" element={<LeaveBalance />} />
              </Route>
              {/* <Route
              path="/register"
              element={
                // <RequireAuth roles={["ADMIN"]}>
                <Register />
                // </RequireAuth>
              }
            /> */}
              {/* <Route path="pdf" element={<DownloadPDF />} /> */}

              <Route path="*" element={<NotFound />} />
            </Route>

            {/* Route Login sẽ nằm ngoài Layout này (làm sau) */}
            {/* <Route path="/login" element={<Login />} /> */}
          </Routes>
        </BrowserRouter>
        <ToastContainer position="top-right" autoClose={3000} />
      </NotificationProvider>
      </SidebarProvider>
    </>
  );
}

export default App;
