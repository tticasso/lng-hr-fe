import React, { useEffect, useMemo, useState } from "react";
import { Bell, Search, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { employeeApi } from "../apis/employeeApi";
import NotificationDetailModal from "../components/modals/NotificationDetailModal";

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

  // ✅ tab filter: all (thông báo) | unread (chưa đọc)
  const [notifyTab, setNotifyTab] = useState("all");

  // ✅ State cho modal chi tiết
  const [selectedNotification, setSelectedNotification] = useState(null);

  // ✅ State cho search
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const navigate = useNavigate();

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
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Đơn nghỉ phép được duyệt",
      content: "Yêu cầu nghỉ phép của bạn đã được quản lý xác nhận.",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      unread: true,
    },
    {
      id: 2,
      title: "Cập nhật chính sách nhân sự",
      content: "HR vừa cập nhật lịch nghỉ lễ và quy định chấm công.",
      createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
      unread: true,
    },
    {
      id: 3,
      title: "Thông báo nội bộ",
      content: "Bạn có một tin nhắn mới từ quản lý trực tiếp.",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
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

  const handleClickNotification = (notification) => {
    // ✅ Mở modal chi tiết
    setSelectedNotification(notification);
    
    // ✅ Đánh dấu đã đọc nếu là thông báo chưa đọc
    if (notification.unread) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, unread: false } : n))
      );
    }
  };

  const handleCloseModal = () => {
    setSelectedNotification(null);
  };

  // ✅ Danh sách tất cả pages có thể tìm kiếm (lấy từ Sidebar)
  const allPages = useMemo(() => {
    const role = localStorage.getItem("role");
    const isAdmin = role === "ADMIN";
    const isHR = role === "HR";
    const isManager = role === "MANAGER";
    const isEmployee = role === "EMPLOYEE";

    const pages = [
      { path: "/", label: "Tổng quan", keywords: ["tong quan", "dashboard", "home"] },
      { path: "/timesheet", label: "Lịch làm việc", keywords: ["lich lam viec", "timesheet", "cham cong"] },
      { path: "/payroll", label: "Bảng lương", keywords: ["bang luong", "payroll", "luong"] },
    ];

    // Employee pages
    if (isEmployee) {
      pages.push({ path: "/leave", label: "Yêu cầu của tôi", keywords: ["yeu cau", "nghi phep", "leave", "request"] });
    }

    // Admin, HR, Manager pages
    if (isAdmin || isHR || isManager) {
      pages.push({ path: "/leave", label: "Quản lý yêu cầu", keywords: ["quan ly yeu cau", "duyet don", "leave management"] });
    }

    // Admin và HR pages
    if (isAdmin || isHR) {
      pages.push(
        { path: "/hr/employees", label: "Nhân viên", keywords: ["nhan vien", "employee", "staff"] },
        { path: "/hr/attendance-admin", label: "Quản lý chấm công", keywords: ["quan ly cham cong", "attendance", "checkin"] },
        { path: "/hr/announcements", label: "Thông báo", keywords: ["thong bao", "announcement", "notice"] },
        { path: "/hr/recruitment", label: "Tuyển dụng", keywords: ["tuyen dung", "recruitment", "hiring"] },
        { path: "/hr/boarding", label: "On/Off Boarding", keywords: ["onboarding", "offboarding", "nhan vien moi"] },
        { path: "/hr/reports", label: "Báo cáo", keywords: ["bao cao", "report", "thong ke"] },
        { path: "/hr/payroll-engine", label: "Công cụ tính lương", keywords: ["cong cu tinh luong", "payroll engine", "tinh luong"] }
      );
    }

    // Admin only pages
    if (isAdmin) {
      pages.push(
        { path: "/admin/user-management", label: "Quản lý người dùng", keywords: ["quan ly nguoi dung", "user management", "account"] },
        { path: "/admin/system-admin", label: "Cài đặt hệ thống", keywords: ["cai dat he thong", "system admin", "settings"] }
      );
    }

    return pages;
  }, []);

  // ✅ Lọc kết quả tìm kiếm
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase().trim();
    
    return allPages.filter((page) => {
      const labelMatch = page.label.toLowerCase().includes(query);
      const keywordMatch = page.keywords.some((keyword) => keyword.includes(query));
      return labelMatch || keywordMatch;
    }).slice(0, 5); // Giới hạn 5 kết quả
  }, [searchQuery, allPages]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setShowSearchResults(true);
  };

  const handleSearchResultClick = (path) => {
    navigate(path);
    setSearchQuery("");
    setShowSearchResults(false);
  };

  const handleSearchBlur = () => {
    // Delay để click vào kết quả có thời gian xử lý
    setTimeout(() => setShowSearchResults(false), 200);
  };

  return (
    <>
      {/* HEADER */}
      <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 fixed top-0 right-0 left-64 z-30">
        {/* Search */}
        <div className="relative flex items-center bg-gray-100 rounded-lg px-3 py-2 w-96">
          <Search size={18} className="text-gray-400 mr-2" />
          <input
            placeholder="Tìm kiếm trang..."
            className="bg-transparent outline-none text-sm w-full text-gray-700"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => searchQuery && setShowSearchResults(true)}
            onBlur={handleSearchBlur}
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setShowSearchResults(false);
              }}
              className="p-1 hover:bg-gray-200 rounded-full"
            >
              <X size={14} className="text-gray-500" />
            </button>
          )}

          {/* Search Results Dropdown */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
              {searchResults.map((result) => (
                <button
                  key={result.path}
                  onClick={() => handleSearchResultClick(result.path)}
                  className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b last:border-b-0 border-gray-100"
                >
                  <p className="text-sm font-medium text-gray-900">{result.label}</p>
                  {/* <p className="text-xs text-gray-500 mt-0.5">{result.path}</p> */}
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {showSearchResults && searchQuery && searchResults.length === 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
              <p className="text-sm text-gray-500 text-center">Không tìm thấy kết quả</p>
            </div>
          )}
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
                  setNotifyTab("all");
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition
                  ${notifyTab === "all"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                  }`}
              >
                Thông báo
              </button>
              <button
                type="button"
                onClick={() => {
                  setNotifyTab("unread");
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition
                  ${notifyTab === "unread"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                  }`}
              >
                Chưa đọc
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
            {filteredNotifications.map((n) => {
              return (
                <div
                  key={n.id}
                  onClick={() => handleClickNotification(n)}
                  className={`group flex gap-3 p-3 rounded-xl border transition
                    hover:bg-gray-50 hover:border-gray-200 cursor-pointer
                    ${n.unread
                      ? "bg-blue-50/30 border-blue-100"
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

                    {/* ✅ Chấm đỏ cho thông báo chưa đọc */}
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

                    {/* ✅ Preview nội dung */}
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {n.content}
                    </p>

                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[11px] text-blue-600 group-hover:text-blue-700 font-medium">
                        Nhấn để xem chi tiết
                      </span>

                      {/* ✅ Badge "Mới" màu đỏ cho unread */}
                      {n.unread && (
                        <span className="text-[11px] font-semibold text-red-600">
                          • Mới
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredNotifications.length === 0 && (
              <div className="text-center text-sm text-gray-500 py-10">
                {notifyTab === "unread"
                  ? "Không có thông báo chưa đọc."
                  : "Chưa có thông báo nào."}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal chi tiết thông báo */}
      {selectedNotification && (
        <NotificationDetailModal
          notification={selectedNotification}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};

export default Header;
