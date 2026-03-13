import { useEffect, lazy, Suspense } from "react";
import "antd/dist/reset.css";
import { useNavigate } from "react-router-dom";
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
    <div className="space-y-6">
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
      {/* --- HÀNG TRÊN: WELCOME & STATS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 1. Welcome Card (Chiếm 6/12 cột) */}
        <WelcomeCard user={user} onNavigate={() => navigate("/profile")} />

        {/* 2. My Summary (Chiếm 3/12 cột) */}
        <SummaryStats stats={summaryStats} />

        {/* 3. Next Important Date (Chiếm 3/12 cột) */}
        <UpcomingEvents />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CỘT TRÁI (8/12) - Announcements & Requests */}
        <div className="lg:col-span-8 space-y-6">
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
        <div className="lg:col-span-4 space-y-6">
          <QuickActions
            onLeaveClick={openLeaveModal}
            onOTClick={openOTModal}
            onPayrollClick={() => navigate("/payroll")}
            onSupportClick={openHRSupportModal}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
