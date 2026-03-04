import React, { useEffect, useMemo, useState } from "react";
import { Bell, Search, X } from "lucide-react";
import { Link } from "react-router-dom";
import { employeeApi } from "../apis/employeeApi";

// ✅ Format thời gian thông báo: rõ ràng + chuyên nghiệp
const formatNotifyTime = (dateInput) => {
  if (!dateInput) return "--";

  const date = new Date(dateInput);
  const now = new Date();

  if (Number.isNaN(date.getTime())) return "--";

  const diffMs = now - date;
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return "Vừa xong";
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;

  if (diffDays === 1) {
    return `Hôm qua lúc ${date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }

  return `${date.toLocaleDateString("vi-VN")} • ${date.toLocaleTimeString(
    "vi-VN",
    { hour: "2-digit", minute: "2-digit" }
  )}`;
};

const Header = () => {
  const [jobTitle, setJobTitle] = useState("");
  const [fullName, setFullName] = useState("");
  const [openNotify, setOpenNotify] = useState(false);

  // ✅ tab filter: all | unread
  const [notifyTab, setNotifyTab] = useState("all");

  // ✅ State để lưu ID thông báo đang được expand (hiển thị nội dung)
  const [expandedNotifyId, setExpandedNotifyId] = useState(null);

  useEffect(() => {
    const callAPI = async () => {
      try {
        const res = await employeeApi.getMe();
        const emp = res?.data?.data?.employee;
        setFullName(emp?.fullName || "");
        setJobTitle(emp?.jobTitle || "");
      } catch (error) {
        console.error(error);
      }
    };
    callAPI();
  }, []);

  const initials = useMemo(() => {
    const s = fullName.trim();
    if (!s) return "NA";
    const parts = s.split(/\s+/);
    return (parts[0][0] + (parts.at(-1)?.[0] || "")).toUpperCase();
  }, [fullName]);

  // ✅ Ảnh fix cứng cho tất cả thông báo
  const FIXED_NOTIFY_AVATAR =
    "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=120&q=80";

  // ✅ notifications state để thao tác read/unread local
  // NOTE: dùng createdAt (ISO) để format ngày giờ rõ ràng
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Đơn nghỉ phép được duyệt",
      content: "Yêu cầu nghỉ phép của bạn đã được quản lý xác nhận.",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 giờ trước
      unread: true,
    },
    {
      id: 2,
      title: "Cập nhật chính sách nhân sự",
      content: "HR vừa cập nhật lịch nghỉ lễ và quy định chấm công.",
      createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(), // hôm qua
      unread: true,
    },
    {
      id: 3,
      title: "Thông báo nội bộ",
      content: "Bạn có một tin nhắn mới từ quản lý trực tiếp.",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 ngày trước
      unread: false,
    },
  ]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => n.unread).length,
    [notifications]
  );

  const filteredNotifications = useMemo(() => {
    if (notifyTab === "unread") return notifications.filter((n) => n.unread);
    // Tab "all" (đã đọc) hiển thị tất cả thông báo
    return notifications;
  }, [notifications, notifyTab]);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleClickNotification = (id) => {
    // ✅ Nếu đang ở tab "chưa đọc": click để expand và đánh dấu đã đọc
    if (notifyTab === "unread") {
      setExpandedNotifyId(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
      );
    } else {
      // ✅ Nếu đang ở tab "đã đọc": toggle expand/collapse
      setExpandedNotifyId((prev) => (prev === id ? null : id));
    }
  };

  return (
    <>
      {/* HEADER */}
      <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 fixed top-0 right-0 left-64 z-30">
        {/* Search */}
        <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2 w-96">
          <Search size={18} className="text-gray-400 mr-2" />
          <input
            placeholder="Tìm kiếm nhân viên, phòng ban..."
            className="bg-transparent outline-none text-sm w-full text-gray-700"
          />
        </div>

        {/* User Info */}
        <div className="flex items-center gap-4">
          {/* 🔔 Notification Button */}
          <button
            onClick={() => setOpenNotify(true)}
            className="relative p-2 hover:bg-gray-100 rounded-full"
            type="button"
            aria-label="Thông báo"
          >
            <Bell size={20} className="text-gray-600" />

            {/* ✅ badge số lượng unread */}
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[11px] font-semibold flex items-center justify-center ring-2 ring-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          <Link
            to="/profile"
            className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-full"
          >
            <div
              className="text-right hidden md:flex flex-col justify-around gap-y-1"
            >
              <p className="text-sm font-semibold text-gray-800 m-0">
                {fullName || "--"}
              </p>
              <p className="text-xs text-gray-500 m-0">
                {jobTitle || "--"}
              </p>
            </div>

            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
              {initials}
            </div>
          </Link>
        </div>
      </header>

      {/* OVERLAY */}
      {openNotify && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={() => setOpenNotify(false)}
        />
      )}

      {/* 🔔 NOTIFICATION PANEL */}
      <div
        className={`fixed top-0 right-0 h-full bg-white z-50 shadow-2xl
          transition-transform duration-300
          ${openNotify ? "translate-x-0" : "translate-x-full"}
        `}
        style={{ width: "30vw", minWidth: 360, maxWidth: 520 }}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b bg-white/80 backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Thông báo</h3>
              <p className="text-xs text-gray-500">{unreadCount} chưa đọc</p>
            </div>
            <button
              onClick={() => setOpenNotify(false)}
              className="p-2 hover:bg-gray-100 rounded-full"
              type="button"
              aria-label="Đóng"
            >
              <X size={18} />
            </button>
          </div>

          {/* Tabs + Mark all */}
          <div className="mt-3 flex items-center justify-between gap-3">
            {/* Tabs */}
            <div className="inline-flex p-1 bg-gray-100 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setNotifyTab("unread");
                  setExpandedNotifyId(null); // Reset expand khi đổi tab
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition
                  ${notifyTab === "unread"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                  }`}
              >
                Chưa đọc
              </button>
              <button
                type="button"
                onClick={() => {
                  setNotifyTab("all");
                  setExpandedNotifyId(null); // Reset expand khi đổi tab
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition
                  ${notifyTab === "all"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                  }`}
              >
                Đã đọc
              </button>
            </div>

            {/* Mark all as read */}
            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition
                ${unreadCount === 0
                  ? "text-gray-300 border-gray-200 cursor-not-allowed"
                  : "text-blue-600 border-blue-200 hover:bg-blue-50"
                }`}
            >
              Đánh dấu tất cả là đã đọc
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto h-[calc(100%-104px)]">
          <div className="space-y-2">
            {filteredNotifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleClickNotification(n.id)}
                className={`group flex gap-3 p-3 rounded-xl border transition
                  hover:bg-gray-50 hover:border-gray-200 cursor-pointer
                  ${n.unread
                    ? "bg-red-50/30 border-red-100"
                    : "bg-white border-gray-100"
                  }
                `}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <img
                    src={FIXED_NOTIFY_AVATAR}
                    alt="notify"
                    className="h-11 w-11 rounded-full object-cover ring-1 ring-gray-200"
                  />

                  {/* ✅ Icon đỏ riêng cho thông báo chưa đọc */}
                  {n.unread && (
                    <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-red-500 ring-2 ring-white" />
                  )}
                </div>

                {/* Text */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                      {n.title}
                    </p>

                    {/* ✅ thời gian format rõ ràng */}
                    <span className="text-[11px] text-gray-500 shrink-0">
                      {formatNotifyTime(n.createdAt)}
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {n.content}
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[11px] text-gray-400 group-hover:text-gray-500">
                      Nhấn để xem 123
                    </span>

                    {/* ✅ Badge “Mới” màu đỏ cho unread */}
                    {n.unread && (
                      <span className="text-[11px] font-semibold text-red-600">
                        • Mới
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {filteredNotifications.length === 0 && (
              <div className="text-center text-sm text-gray-500 py-10">
                {notifyTab === "unread"
                  ? "Không có thông báo chưa đọc."
                  : "Chưa có thông báo đã đọc."}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
