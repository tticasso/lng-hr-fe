import { useCallback, useEffect, lazy, Suspense, useState } from "react";
import "antd/dist/reset.css";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, X } from "lucide-react";
import { toast } from "react-toastify";
import { attendancesAPI, isNetworkRestrictedError } from "../apis/attendancesAPI";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import HRSupportModal from "../components/modals/HRSupportModal";

// Lazy load modals
const ModalOT = lazy(() => import("../components/modals/OTModal"));
const LeaveRequestModal = lazy(() => import("../components/modals/CreateLeaveModal"));
const AnnouncementDetailModal = lazy(() => import("../components/modals/AnnouncementDetailModal"));

// Import memoized components
import WelcomeCard from "./Dashboard/WelcomeCard";
import SummaryStats from "./Dashboard/SummaryStats";
import AnnouncementList from "./Dashboard/AnnouncementList";
import RequestsTable from "./Dashboard/RequestsTable";
import QuickActions from "./Dashboard/QuickActions";
import UpcomingEvents from "./Dashboard/UpcomingEvents";

// Import custom hooks
import {
  useDashboardData,
  useDashboardModals,
  useDashboardComputed,
  useSocketHandler,
} from "./Dashboard/hooks";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openNotificationPanel } = useNotification();
  const [isOnline, setIsOnline] = useState(
    typeof navigator === "undefined" ? true : navigator.onLine
  );
  const [checkingAttendance, setCheckingAttendance] = useState(false);
  const [showNetworkRestrictedAlert, setShowNetworkRestrictedAlert] = useState(false);

  // Custom hooks
  const { mySheetData, leaveRequests, otRequests, announcements, loading } = useDashboardData();
  
  const {
    isLeaveModalOpen,
    openLeaveModal,
    closeLeaveModal,
    submitLeaveRequest,
    isOTModalOpen,
    openOTModal,
    closeOTModal,
    submitOTRequest,
    isHRSupportModalOpen,
    openHRSupportModal,
    closeHRSupportModal,
    isAnnouncementModalOpen,
    selectedAnnouncementId,
    openAnnouncementModal,
    closeAnnouncementModal,
  } = useDashboardModals();

  const { summaryStats, requests, pendingCount, approvedCount } = useDashboardComputed(
    mySheetData,
    leaveRequests,
    otRequests
  );

  useSocketHandler();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleAttendanceError = useCallback((error) => {
    if (isNetworkRestrictedError(error)) {
      setShowNetworkRestrictedAlert(true);
      return;
    }

    toast.error(error.normalizedMessage || "Chấm công thất bại. Vui lòng thử lại.");
  }, []);

  const handleCheckIn = useCallback(async () => {
    if (!isOnline || checkingAttendance) return;

    try {
      setCheckingAttendance(true);
      await attendancesAPI.checkIn();
      toast.success("Check In thành công");
    } catch (error) {
      handleAttendanceError(error);
    } finally {
      setCheckingAttendance(false);
    }
  }, [checkingAttendance, handleAttendanceError, isOnline]);

  const handleCheckOut = useCallback(async () => {
    if (checkingAttendance) return;

    try {
      setCheckingAttendance(true);
      await attendancesAPI.checkOut();
      toast.success("Check Out thành công");
    } catch (error) {
      handleAttendanceError(error);
    } finally {
      setCheckingAttendance(false);
    }
  }, [checkingAttendance, handleAttendanceError]);

  // Redirect to profile if not updated
  useEffect(() => {
    if (user.isProfileUpdated === false) navigate("/profile");
  }, [user, navigate]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* --- MODALS WITH LAZY LOADING --- */}
      <Suspense fallback={null}>
        {isOTModalOpen && (
          <ModalOT
            open={isOTModalOpen}
            onClose={closeOTModal}
            onSubmit={submitOTRequest}
            initialValues={{ otType: "WEEKDAY" }}
          />
        )}

        {isLeaveModalOpen && (
          <LeaveRequestModal
            onClose={closeLeaveModal}
            onConfirm={submitLeaveRequest}
          />
        )}

        {isAnnouncementModalOpen && (
          <AnnouncementDetailModal
            isOpen={isAnnouncementModalOpen}
            onClose={closeAnnouncementModal}
            announcementId={selectedAnnouncementId}
          />
        )}
      </Suspense>

      {/* --- HR SUPPORT MODAL --- */}
      <HRSupportModal
        isOpen={isHRSupportModalOpen}
        onClose={closeHRSupportModal}
      />
      {showNetworkRestrictedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-red-100 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-red-700">Cảnh báo mạng</h2>
                  <p className="mt-1 text-sm text-gray-500">Không thể chấm công từ kết nối hiện tại.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowNetworkRestrictedAlert(false)}
                className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5">
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-base font-semibold leading-6 text-red-800">
                  Cảnh báo: Sai mạng nội bộ. Vui lòng kiểm tra lại kết nối Wi-Fi văn phòng.
                </p>
              </div>
            </div>

            <div className="flex justify-end border-t border-gray-100 bg-gray-50 p-4">
              <button
                type="button"
                onClick={() => setShowNetworkRestrictedAlert(false)}
                className="rounded-md bg-red-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}
      {/* --- HÀNG TRÊN: WELCOME & STATS --- */}
      <div className="px-1 md:hidden">
        <h1 className="text-2xl font-bold text-gray-900">
          Xin chao, {user?.fullName || "Unknown"}!
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {user?.jobLevel || "--"} | {user?.jobTitle || "--"}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-12 lg:gap-6">
        {/* 1. Welcome Card (Chiếm 6/12 cột) */}
        <div className="hidden md:contents">
          <WelcomeCard user={user} onNavigate={() => navigate("/profile")} />
        </div>

        {/* 2. My Summary (Chiếm 3/12 cột) */}
        <SummaryStats stats={summaryStats} />

        {/* 3. Next Important Date (Chiếm 3/12 cột) */}
        <div className="hidden md:contents">
          <UpcomingEvents />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6">
        {/* CỘT TRÁI (8/12) - Announcements & Requests */}
        <div className="hidden space-y-4 md:block lg:col-span-8 lg:space-y-6">
          {/* Block Announcements */}
          <AnnouncementList
            announcements={announcements}
            onAnnouncementClick={openAnnouncementModal}
            onViewAll={openNotificationPanel}
          />

          {/* Block My Requests */}
          <RequestsTable
            requests={requests}
            pendingCount={pendingCount}
            approvedCount={approvedCount}
            onNavigate={() => navigate("/leave")}
          />
        </div>

        {/* CỘT PHẢI (4/12) - Quick Actions */}
        <div className="space-y-4 lg:col-span-4 lg:space-y-6">
          <QuickActions
            onLeaveClick={openLeaveModal}
            onOTClick={openOTModal}
            onPayrollClick={() => navigate("/payroll")}
            onSupportClick={openHRSupportModal}
            onCheckInClick={handleCheckIn}
            onCheckOutClick={handleCheckOut}
            isOffline={!isOnline}
            checkingAttendance={checkingAttendance}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
