import { useCallback, useEffect, useMemo, useState } from "react";
import { Bell, CheckCheck, Loader2, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { notificationApi } from "../../apis/notificationAPI";
import { useAuth } from "../../context/AuthContext";
import { ACCESS } from "../../config/accessControl";
import { ROUTES } from "../../config/routes";
import { hasAnyPermission } from "../../utils/authPermissions";
import logoImage from "../../assets/logo-sm.webp";
import useSocket from "./useSocket";

const normalizeNotificationPayload = (response) => {
  const payload = response?.data?.data ?? response?.data ?? [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.notifications)) return payload.notifications;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

const toNotificationItem = (item) => ({
  id: item._id || item.id,
  title: item.title || "Thông báo mới",
  content: item.message || item.content || "",
  createdAt: item.createdAt || item.receivedAt || new Date().toISOString(),
  unread: item.isRead === undefined ? item.unread !== false : !item.isRead,
  type: item.type,
  relatedId: item.relatedId,
  relatedModel: item.relatedModel,
});

const formatNotifyTime = (dateInput) => {
  if (!dateInput) return "--";

  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return "--";

  const diffMinutes = Math.floor((Date.now() - date.getTime()) / 60000);
  if (diffMinutes < 1) return "Vừa xong";
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;

  return `${date.toLocaleDateString("vi-VN")} ${date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};

const NotificationViewer = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const canApproveLeave = useMemo(
    () => hasAnyPermission(user, ACCESS.LEAVE_APPROVALS),
    [user],
  );
  const canApproveOT = useMemo(
    () => hasAnyPermission(user, ACCESS.OT_APPROVALS),
    [user],
  );

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await notificationApi.getAll();
      setNotifications(normalizeNotificationPayload(response).map(toNotificationItem));
    } catch (error) {
      console.error("loadNotifications error:", error);
      toast.error(error.normalizedMessage || "Không thể tải danh sách thông báo");
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleSocketNotification = useCallback((data) => {
    const nextNotification = toNotificationItem({
      ...data,
      id: data.id || data._id || `socket-${Date.now()}`,
      isRead: false,
      receivedAt: new Date().toISOString(),
    });

    setNotifications((prev) => {
      if (prev.some((item) => item.id === nextNotification.id)) return prev;
      return [nextNotification, ...prev];
    });
  }, []);

  useSocket(handleSocketNotification);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => notification.unread).length,
    [notifications],
  );

  const visibleNotifications = useMemo(() => {
    if (filter === "unread") {
      return notifications.filter((notification) => notification.unread);
    }
    return notifications;
  }, [filter, notifications]);

  const getTargetPath = (notification) => {
    if (notification.relatedModel === "Leave") {
      return canApproveLeave ? ROUTES.LEAVE_APPROVALS : ROUTES.LEAVE;
    }
    if (notification.relatedModel === "Overtime") {
      return canApproveOT ? ROUTES.OVERTIME_APPROVALS : ROUTES.OVERTIME;
    }
    if (notification.relatedModel === "Payroll") return ROUTES.MY_PAYSLIP;
    if (notification.relatedModel === "Announcement") return ROUTES.ANNOUNCEMENTS;
    return "";
  };

  const markAsRead = async (notificationId) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === notificationId ? { ...item, unread: false } : item)),
    );

    try {
      await notificationApi.markAsRead(notificationId);
    } catch (error) {
      console.error("markAsRead error:", error);
    }
  };

  const handleClickNotification = async (notification) => {
    if (notification.unread && notification.id) {
      await markAsRead(notification.id);
    }

    const targetPath = getTargetPath(notification);
    if (targetPath) navigate(targetPath);
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;

    setNotifications((prev) => prev.map((item) => ({ ...item, unread: false })));

    try {
      await notificationApi.markAllAsRead();
    } catch (error) {
      console.error("markAllRead error:", error);
      toast.error(error.normalizedMessage || "Không thể đánh dấu tất cả đã đọc");
      loadNotifications();
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-1 pb-8">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-semibold text-slate-900">
            <Bell className="text-blue-600" size={26} />
            Thông báo
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {unreadCount} thông báo chưa đọc
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                filter === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
              }`}
            >
              Tất cả
            </button>
            <button
              type="button"
              onClick={() => setFilter("unread")}
              className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                filter === "unread" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
              }`}
            >
              Chưa đọc
            </button>
          </div>

          <button
            type="button"
            onClick={loadNotifications}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"
            aria-label="Tải lại thông báo"
            title="Tải lại"
          >
            <RefreshCw size={17} />
          </button>
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-blue-200 text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300"
            aria-label="Đánh dấu tất cả đã đọc"
            title="Đánh dấu tất cả đã đọc"
          >
            <CheckCheck size={18} />
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {loading ? (
          <div className="flex min-h-64 items-center justify-center gap-3 text-sm font-medium text-slate-500">
            <Loader2 className="animate-spin text-blue-600" size={20} />
            Đang tải thông báo...
          </div>
        ) : visibleNotifications.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {visibleNotifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                onClick={() => handleClickNotification(notification)}
                className={`flex w-full items-start gap-3 px-4 py-4 text-left transition hover:bg-slate-50 ${
                  notification.unread ? "bg-blue-50/40" : "bg-white"
                }`}
              >
                <span className="relative mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white">
                  <img
                    src={logoImage}
                    alt="notification"
                    className="h-8 w-8 object-contain"
                  />
                  {notification.unread && (
                    <span className="absolute right-0 top-0 h-3 w-3 rounded-full bg-red-500 ring-2 ring-white" />
                  )}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex items-start justify-between gap-3">
                    <span className="line-clamp-1 text-sm font-semibold text-slate-900">
                      {notification.title}
                    </span>
                    <span className="shrink-0 text-xs text-slate-400">
                      {formatNotifyTime(notification.createdAt)}
                    </span>
                  </span>
                  <span className="mt-1 block line-clamp-2 text-sm leading-6 text-slate-600">
                    {notification.content}
                  </span>
                  {notification.type && (
                    <span className="mt-2 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                      {notification.type}
                    </span>
                  )}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex min-h-64 flex-col items-center justify-center px-4 text-center text-sm text-slate-500">
            <Bell className="mb-3 text-slate-300" size={42} />
            {filter === "unread" ? "Không có thông báo chưa đọc." : "Chưa có thông báo nào."}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationViewer;
