import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
// import Login from "./pages/auth/Login";
// import RequireAuth from "./components/RequireAuth";
// import Register from "./pages/auth/Register";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* <Route path="/login" element={<Login />} /> */}

          {/* Route gốc dùng MainLayout */}
          <Route
            path="/"
            element={
              // <RequireAuth>
              <MainLayout />
              // </RequireAuth>
            }
          >
            {/* Các trang con sẽ hiện vào vị trí của <Outlet /> */}

            <Route index element={<Dashboard />} />

            <Route path="profile" element={<MyProfile />} />
            <Route path="timesheet" element={<MyTimesheet />} />
            <Route path="payroll" element={<MyPayslip />} />
            <Route path="requests" element={<MyRequests />} />

            <Route
              path="admin"
              element={
                // <RequireAuth roles={["ADMIN"]}>
                <Outlet />
                // </RequireAuth>
              }
            >
              {/* <Route path="register" element={<Register />} /> */}

              <Route path="system-admin" element={<SystemAdmin />} />
              <Route path="user-management" element={<UserManagement />} />
            </Route>
            <Route
              path="hr"
              element={
                // <RequireAuth roles={["ADMIN", "HR"]}>
                <Outlet />
                // </RequireAuth>
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
    </>
  );
}

export default App;
