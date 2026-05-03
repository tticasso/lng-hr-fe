import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Bell, Menu, Search, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import NotificationDetailModal from "../components/modals/NotificationDetailModal";
import useSocket from "../pages/notification/useSocket";
import { notificationApi } from "../apis/notificationAPI";
import logoImage from "../assets/logo.png";
import { toast } from "react-toastify";
import { useNotification } from "../context/NotificationContext";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../context/AuthContext";
import AnnouncementDetailModal from "../components/modals/AnnouncementDetailModal";
import { announcementAPI } from "../apis/announcements";

// âœ… Format thá»i gian thĂ´ng bĂ¡o: rĂµ rĂ ng + chuyĂªn nghiá»‡p
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
  const { user } = useAuth(); // Láº¥y user tá»« AuthContext thay vĂ¬ gá»i API
  const { openNotify, setOpenNotify } = useNotification();
  const { isCollapsed, openMobileSidebar } = useSidebar();

  // Láº¥y thĂ´ng tin tá»« user context thay vĂ¬ gá»i API
  const fullName = user?.fullName || "";
  const jobTitle = user?.jobTitle || "";

  // âœ… tab filter: all (thĂ´ng bĂ¡o) | unread (chÆ°a Ä‘á»c)
  const [notifyTab, setNotifyTab] = useState("all");

  // âœ… State cho modal chi tiáº¿t
  const [selectedNotification, setSelectedNotification] = useState(null);

  // âœ… State cho Announcement Detail Modal
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState(null);

  // âœ… State cho search
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const navigate = useNavigate();

  const initials = useMemo(() => {
    const s = fullName.trim();
    if (!s) return "NA";
    const parts = s.split(/\s+/);
    return (parts[0][0] + (parts.at(-1)?.[0] || "")).toUpperCase();
  }, [fullName]);

  // âœ… áº¢nh logo cho táº¥t cáº£ thĂ´ng bĂ¡o
  const NOTIFICATION_AVATAR = "https://res.cloudinary.com/dplhdyxgl/image/upload/v1772177306/logo_j0iody.jpg";

  // âœ… notifications state Ä‘á»ƒ thao tĂ¡c read/unread local
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load notifications tá»« API khi mount
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoading(true);
        const res = await notificationApi.getAll();
        console.log("NOTIFICATION API:", res);

        // Parse data tá»« API response
        const apiNotifications = res.data?.data || [];

        // Transform data tá»« API sang format cá»§a UI
        const transformedNotifications = apiNotifications.map((item) => ({
          id: item._id,
          title: item.title,
          content: item.message,
          createdAt: item.createdAt,
          unread: !item.isRead, // isRead = false â†’ unread = true
          type: item.type,
          relatedId: item.relatedId,
          relatedModel: item.relatedModel,
        }));

        setNotifications(transformedNotifications);
      } catch (error) {
        console.error("Error loading notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  // âœ… State Ä‘á»ƒ track toast Ä‘Ă£ hiá»ƒn thá»‹ (trĂ¡nh duplicate)
  const [shownToasts, setShownToasts] = useState(new Set());

  // âœ… Láº¯ng nghe socket Ä‘á»ƒ nháº­n thĂ´ng bĂ¡o real-time
  const handleSocketNotification = useCallback((data) => {
    console.log("đŸ“© [HEADER] Nháº­n thĂ´ng bĂ¡o tá»« socket:", data);

    // Táº¡o notification object tá»« data socket
    const newNotification = {
      id: data._id || data.id || Date.now(),
      title: data.title || "ThĂ´ng bĂ¡o má»›i",
      content: data.message || data.content || "",
      createdAt: data.createdAt || new Date().toISOString(),
      unread: true,
      type: data.type,
      relatedId: data.relatedId,
      relatedModel: data.relatedModel,
    };
    console.log("data.type :",data.type)
    // Kiá»ƒm tra xem notification Ä‘Ă£ tá»“n táº¡i chÆ°a (trĂ¡nh duplicate)
    setNotifications((prev) => {
      const exists = prev.some((n) => n.id === newNotification.id);
      if (exists) {
        console.log("â ï¸ Notification already exists, skipping...");
        return prev;
      }

      // Kiá»ƒm tra xem toast Ä‘Ă£ hiá»ƒn thá»‹ chÆ°a
      setShownToasts((prevShown) => {
        if (prevShown.has(newNotification.id)) {
          console.log("â ï¸ Toast already shown, skipping...");
          return prevShown;
        }

        // XĂ¡c Ä‘á»‹nh route vĂ  tab dá»±a trĂªn type
        const handleToastClick = () => {
          if (data.type === "LEAVE_CREATED") {
            navigate("/leave/my");
          } else if (data.type === "OT_CREATED") {
            navigate("/ot/my");
          }
        };

        // Hiá»ƒn thá»‹ toast notification vá»›i onClick handler
        toast.info(
          <div 
            className="flex items-start gap-3 cursor-pointer"
            onClick={handleToastClick}
          >
            <img
              src="https://res.cloudinary.com/dplhdyxgl/image/upload/v1772177306/logo_j0iody.jpg"
              alt="logo"
              className="w-10 h-10 rounded-full object-cover bg-white p-1"
            />
            <div className="flex-1">
              <p className="font-semibold text-sm">{newNotification.title}</p>
              <p className="text-xs text-gray-600 mt-1">{newNotification.content}</p>
            </div>
          </div>,
          {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            toastId: newNotification.id, // Prevent duplicate toasts
          }
        );

        // ThĂªm vĂ o set Ä‘Ă£ hiá»ƒn thá»‹
        const newSet = new Set(prevShown);
        newSet.add(newNotification.id);
        return newSet;
      });

      // ThĂªm vĂ o Ä‘áº§u danh sĂ¡ch
      return [newNotification, ...prev];
    });
  }, [navigate]);

  // Káº¿t ná»‘i socket
  useSocket(handleSocketNotification);

  const unreadCount = useMemo(
    () => notifications.filter((n) => n.unread).length,
    [notifications]
  );

  const filteredNotifications = useMemo(() => {
    if (notifyTab === "unread") return notifications.filter((n) => n.unread);
    // Tab "all" (Ä‘Ă£ Ä‘á»c) hiá»ƒn thá»‹ táº¥t cáº£ thĂ´ng bĂ¡o
    return notifications;
  }, [notifications, notifyTab]);

  const handleMarkAllRead = async () => {
    try {
      // Call API Ä‘á»ƒ mark all as read
      await notificationApi.markAllAsRead();

      // Update local state
      setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    } catch (error) {
      console.error("Error marking all as read:", error);
      // Váº«n update local state náº¿u API fail
      setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    }
  };

  const handleClickNotification = async (notification) => {
    const { relatedModel, relatedId } = notification;

    // âœ… ÄĂ¡nh dáº¥u Ä‘Ă£ Ä‘á»c náº¿u lĂ  thĂ´ng bĂ¡o chÆ°a Ä‘á»c
    if (notification.unread) {
      try {
        await notificationApi.markAsRead(notification.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, unread: false } : n))
        );
      } catch (error) {
        console.error("Error marking as read:", error);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, unread: false } : n))
        );
      }
    }

    // âœ… Xá»­ lĂ½ Ä‘iá»u hÆ°á»›ng theo relatedModel
    if (relatedModel === "Overtime") {
      setOpenNotify(false);
      const role = localStorage.getItem("role");
      const otPath = ["ADMIN", "HR", "MANAGER", "LEADER"].includes(role)
        ? "/ot/approvals"
        : "/ot/my";
      navigate(otPath);
    }
    else if (relatedModel === "Payroll") {
      // Äiá»u hÆ°á»›ng Ä‘áº¿n trang Myleave vá»›i tab LEAVE
      setOpenNotify(false);
      navigate("/payroll");
    } else if (relatedModel === "Leave") {
      setOpenNotify(false);
      const role = localStorage.getItem("role");
      const leavePath = ["ADMIN", "HR", "MANAGER", "LEADER"].includes(role)
        ? "/leave/approvals"
        : "/leave/my";
      navigate(leavePath);
    } else if (relatedModel === "Announcement") {
      // // Hiá»ƒn thá»‹ modal chi tiáº¿t thĂ´ng bĂ¡o
      // setSelectedAnnouncementId(relatedId);
      // setIsAnnouncementModalOpen(true);
      // Fallback: má»Ÿ modal chi tiáº¿t thĂ´ng bĂ¡o cÅ©
      setSelectedNotification(notification);
    } else {
      // Fallback: má»Ÿ modal chi tiáº¿t thĂ´ng bĂ¡o cÅ©
      setSelectedNotification(notification);
    }
  };

  const handleCloseModal = () => {
    setSelectedNotification(null);
  };

  // âœ… Danh sĂ¡ch táº¥t cáº£ pages cĂ³ thá»ƒ tĂ¬m kiáº¿m (láº¥y tá»« Sidebar)
  const allPages = useMemo(() => {
    const role = localStorage.getItem("role");
    const isAdmin = role === "ADMIN";
    const isHR = role === "HR";
    const isManager = role === "MANAGER";
    const isLeader = role === "LEADER";
    const isEmployee = role === "EMPLOYEE";

    const pages = [
      { path: "/", label: "Tá»•ng quan", keywords: ["tong quan", "dashboard", "home"] },
      { path: "/timesheet", label: "Lá»‹ch lĂ m viá»‡c", keywords: ["lich lam viec", "timesheet", "cham cong"] },
      { path: "/payroll", label: "Báº£ng lÆ°Æ¡ng", keywords: ["bang luong", "payroll", "luong"] },
    ];

    // Employee pages
    if (isEmployee) {
      pages.push({ path: "/leave/my", label: "ÄÆ¡n nghá»‰ cá»§a tĂ´i", keywords: ["yeu cau", "nghi phep", "leave", "request"] });
      pages.push({ path: "/ot/my", label: "ÄÆ¡n OT cá»§a tĂ´i", keywords: ["ot", "overtime", "tang ca"] });
    }

    // Admin, HR, Manager pages
    if (isAdmin || isHR || isManager || isLeader) {
      pages.push({ path: "/leave/approvals", label: "PhĂª duyá»‡t Ä‘Æ¡n nghá»‰", keywords: ["quan ly yeu cau", "duyet don", "leave management"] });
      pages.push({ path: "/leave/my", label: "ÄÆ¡n nghá»‰ cá»§a tĂ´i", keywords: ["don nghi cua toi", "leave request"] });
      pages.push({ path: "/ot/my", label: "ÄÆ¡n OT cá»§a tĂ´i", keywords: ["ot", "overtime", "tang ca"] });
      pages.push({ path: "/ot/approvals", label: "PhĂª duyá»‡t Ä‘Æ¡n OT", keywords: ["duyet ot", "overtime approvals", "duyet tang ca"] });
    }

    // Admin vĂ  HR pages
    if (isAdmin || isHR) {
      pages.push(
        { path: "/hr/employees", label: "NhĂ¢n viĂªn", keywords: ["nhan vien", "employee", "staff"] },
        { path: "/hr/attendance-admin", label: "Quáº£n lĂ½ cháº¥m cĂ´ng", keywords: ["quan ly cham cong", "attendance", "checkin"] },
        { path: "/hr/announcements", label: "ThĂ´ng bĂ¡o", keywords: ["thong bao", "announcement", "notice"] },
        { path: "/hr/recruitment", label: "Tuyá»ƒn dá»¥ng", keywords: ["tuyen dung", "recruitment", "hiring"] },
        { path: "/hr/boarding", label: "On/Off Boarding", keywords: ["onboarding", "offboarding", "nhan vien moi"] },
        { path: "/hr/reports", label: "BĂ¡o cĂ¡o", keywords: ["bao cao", "report", "thong ke"] },
        { path: "/hr/payroll-engine", label: "CĂ´ng cá»¥ tĂ­nh lÆ°Æ¡ng", keywords: ["cong cu tinh luong", "payroll engine", "tinh luong"] }
      );
    }

    // Admin only pages
    if (isAdmin) {
      pages.push(
        { path: "/admin/user-management", label: "Quáº£n lĂ½ ngÆ°á»i dĂ¹ng", keywords: ["quan ly nguoi dung", "user management", "account"] },
        { path: "/admin/system-admin", label: "CĂ i Ä‘áº·t há»‡ thá»‘ng", keywords: ["cai dat he thong", "system admin", "settings"] }
      );
    }

    return pages;
  }, []);

  // âœ… Lá»c káº¿t quáº£ tĂ¬m kiáº¿m
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase().trim();

    return allPages.filter((page) => {
      const labelMatch = page.label.toLowerCase().includes(query);
      const keywordMatch = page.keywords.some((keyword) => keyword.includes(query));
      return labelMatch || keywordMatch;
    }).slice(0, 5); // Giá»›i háº¡n 5 káº¿t quáº£
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
    // Delay Ä‘á»ƒ click vĂ o káº¿t quáº£ cĂ³ thá»i gian xá»­ lĂ½
    setTimeout(() => setShowSearchResults(false), 200);
  };

  return (
    <>
      {/* HEADER */}
      <header className={`h-16 bg-white shadow-sm flex items-center justify-between gap-3 px-3 sm:px-4 lg:px-6 fixed top-0 right-0 left-0 z-30 transition-[left] duration-300 ease-in-out ${isCollapsed ? 'lg:left-20' : 'lg:left-60'}`}>
        <button
          type="button"
          onClick={openMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 shrink-0"
          aria-label="Mo menu"
        >
          <Menu size={22} />
        </button>

        {/* Search */}
        <div className="relative hidden sm:flex items-center bg-gray-100 rounded-lg px-3 py-2 flex-1 max-w-md lg:w-96">
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
        <div className="flex items-center gap-2 sm:gap-4 shrink-0 ml-auto">
          {/* đŸ”” Notification Button */}
          <button
            onClick={() => setOpenNotify(true)}
            className="relative p-2 hover:bg-gray-100 rounded-full"
            type="button"
            aria-label="Thông báo"
          >
            <Bell size={20} className="text-gray-600" />

            {/* âœ… badge sá»‘ lÆ°á»£ng unread */}
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[11px] font-semibold flex items-center justify-center ring-2 ring-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          <Link
            to="/profile"
            className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 hover:bg-gray-100 rounded-full min-w-0"
          >
            <div
              className="text-right hidden lg:flex flex-col justify-around gap-y-1 min-w-0"
            >
              <p className="text-sm font-semibold text-gray-800 m-0 truncate max-w-40">
                {fullName || "--"}
              </p>
              <p className="text-xs text-gray-500 m-0 truncate max-w-40">
                {jobTitle || "--"}
              </p>
            </div>

            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold shrink-0">
              {initials}
            </div>
          </Link>
        </div>
      </header>

      {/* OVERLAY */}
      {openNotify && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
          onClick={() => setOpenNotify(false)}
        />
      )}

      {/* đŸ”” NOTIFICATION PANEL */}
      <div
        className={`fixed top-0 right-0 z-50 h-full border-l border-gray-200 bg-white shadow-2xl
          transition-transform duration-300 ease-out
          ${openNotify ? "translate-x-0" : "translate-x-full"}
        `}
        style={{ width: "min(100vw, 420px)" }}
      >
        {/* Header */}
        <div className="border-b border-gray-100 bg-white/90 px-5 py-5 backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-[28px] font-semibold tracking-tight text-gray-950">Thông báo</h3>
              <p className="mt-1 text-sm text-gray-500">{unreadCount} chưa đọc</p>
            </div>
            <button
              onClick={() => setOpenNotify(false)}
              className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
              type="button"
              aria-label="Đóng"
            >
              <X size={18} />
            </button>
          </div>

          {/* Tabs + Mark all */}
          <div className="mt-5 flex items-center justify-between gap-3">
            {/* Tabs */}
            <div className="inline-flex rounded-2xl bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => {
                  setNotifyTab("all");
                }}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition
                  ${notifyTab === "all"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                  }`}
              >
                Tất cả
              </button>
              <button
                type="button"
                onClick={() => {
                  setNotifyTab("unread");
                }}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition
                  ${notifyTab === "unread"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
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
              className={`rounded-full border px-3.5 py-2 text-sm font-medium transition
                ${unreadCount === 0
                  ? "text-gray-300 border-gray-200 cursor-not-allowed"
                  : "text-blue-600 border-blue-200 hover:bg-blue-50"
                }`}
            >
              Đọc tất cả
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="h-[calc(100%-124px)] overflow-y-auto px-3 py-4">
          {loading ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
              <p className="text-sm text-gray-500">Đang tải thông báo...</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredNotifications.map((n) => {
                return (
                  <div
                    key={n.id}
                    onClick={() => handleClickNotification(n)}
                    className={`group flex gap-3 rounded-2xl border px-3 py-3 transition
                      cursor-pointer hover:border-gray-200 hover:bg-gray-50
                      ${n.unread
                        ? "border-blue-100 bg-blue-50/40"
                        : "border-gray-100 bg-white"
                      }
                    `}
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <img
                        src={NOTIFICATION_AVATAR}
                        alt="notification"
                        className="h-11 w-11 rounded-full border border-gray-200 bg-white object-cover p-1"
                      />

                      {n.unread && (
                        <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-red-500 ring-2 ring-white" />
                      )}
                    </div>

                    {/* Text */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="line-clamp-1 text-[15px] font-semibold text-gray-900">
                          {n.title}
                        </p>

                        <span className="shrink-0 pt-0.5 text-[11px] text-gray-400">
                          {formatNotifyTime(n.createdAt)}
                        </span>
                      </div>

                      <p className="mt-1 line-clamp-3 text-[13px] leading-5 text-gray-600">
                        {n.content}
                      </p>

                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-[12px] font-medium text-blue-600 group-hover:text-blue-700">
                          Nhấn để xem chi tiết
                        </span>

                        {n.unread && (
                          <span className="text-[12px] font-semibold text-red-500">
                            • Mới
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredNotifications.length === 0 && (
                <div className="py-14 text-center text-sm text-gray-500">
                  {notifyTab === "unread"
                    ? "Không có thông báo chưa đọc."
                    : "Chưa có thông báo nào."}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal chi tiáº¿t thĂ´ng bĂ¡o */}
      {selectedNotification && (
        <NotificationDetailModal
          notification={selectedNotification}
          onClose={handleCloseModal}
        />
      )}

      {/* Announcement Detail Modal */}
      <AnnouncementDetailModal
        isOpen={isAnnouncementModalOpen}
        onClose={() => {
          setIsAnnouncementModalOpen(false);
          setSelectedAnnouncementId(null);
        }}
        announcementId={selectedAnnouncementId}
      />
    </>
  );
};

export default Header;

