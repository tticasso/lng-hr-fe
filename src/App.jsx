import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AUTH_UNAUTHORIZED_EVENT } from "./apis/apiClient";
import MainLayout from "./layouts/MainLayout";
import RequireAuth from "./components/RequireAuth";
import PublicRoute from "./components/PublicRoute";
import { NotificationProvider } from "./context/NotificationContext";
import { SidebarProvider } from "./context/SidebarContext";

const AllPayRoll = lazy(() => import("./pages/payroll/AllPayRoll"));
const Announcements = lazy(() => import("./pages/announce/Announcements"));
const AttendanceAdmin = lazy(() => import("./pages/admin/AttendanceAdmin"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Department = lazy(() => import("./pages/department/Department"));
const EmployeeDetail = lazy(() => import("./pages/admin/EmployeeDetail"));
const EmployeeList = lazy(() => import("./pages/admin/EmployeeList"));
const Holiday = lazy(() => import("./pages/holiday/Holiday"));
const LeaveApprovals = lazy(() => import("./pages/leave/LeaveApprovals"));
const LeaveBalance = lazy(() => import("./pages/leavebalance/LeaveBalance"));
const LeaveIndex = lazy(() => import("./pages/leave/LeaveIndex"));
const Login = lazy(() => import("./pages/auth/Login"));
const MyLeaveRequests = lazy(() => import("./pages/leave/MyLeaveRequests"));
const MyOTRequests = lazy(() => import("./pages/overtime/MyOTRequests"));
const MyPayslip = lazy(() => import("./pages/payroll/MyPayslip"));
const MyProfile = lazy(() => import("./pages/profile/MyProfile"));
const MyRequests = lazy(() => import("./pages/requests/MyRequests"));
const MyTimesheet = lazy(() => import("./pages/timeSheet/MyTimeSheet"));
const NotFound = lazy(() => import("./pages/NotFound"));
const NotificationViewer = lazy(() => import("./pages/notification/NotificationViewer"));
const OnboardingOffboarding = lazy(() => import("./pages/admin/OnboardingOffboarding"));
const OTApprovals = lazy(() => import("./pages/overtime/OTApprovals"));
const OTIndex = lazy(() => import("./pages/overtime/OTIndex"));
const PayrollEngine = lazy(() => import("./pages/payroll/PayrollEngine"));
const Recruitment = lazy(() => import("./pages/recruitment/Recruitment"));
const Register = lazy(() => import("./pages/auth/Register"));
const SystemAdmin = lazy(() => import("./pages/admin/SystemAdmin"));
const TeamPages = lazy(() => import("./pages/teamPages/TeamPages"));
const TrainingPerformance = lazy(() => import("./pages/admin/TrainingPerformance"));
const UserManagement = lazy(() => import("./pages/admin/UserManagement"));

const PageLoader = () => (
  <div className="flex min-h-[240px] items-center justify-center text-sm font-medium text-gray-500">
    Đang tải...
  </div>
);

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
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route
                  path="/login"
                  element={
                    <PublicRoute>
                      <Login />
                    </PublicRoute>
                  }
                />

                <Route
                  path="/"
                  element={
                    <RequireAuth>
                      <MainLayout />
                    </RequireAuth>
                  }
                >
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
                  <Route path="notifications/viewer" element={<NotificationViewer />} />

                  <Route
                    path="admin"
                    element={
                      <RequireAuth
                        roles={["ADMIN"]}
                        permissions={["READ_ACCOUNTS", "MANAGE_SYSTEM", "READ_ROLES", "READ_PERMISSIONS"]}
                      >
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

                  <Route
                    path="hr/teampages"
                    element={
                      <RequireAuth roles={["ADMIN", "HR", "MANAGER", "LEADER", "EMPLOYEE"]}>
                        <TeamPages />
                      </RequireAuth>
                    }
                  />

                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </Suspense>
          </BrowserRouter>
          <ToastContainer position="top-right" autoClose={3000} />
        </NotificationProvider>
      </SidebarProvider>
    </>
  );
}

export default App;
