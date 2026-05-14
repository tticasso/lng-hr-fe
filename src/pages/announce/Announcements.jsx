import { useEditor, EditorContent } from "@tiptap/react";
import "antd/dist/reset.css";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import DOMPurify from "dompurify";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { TimePicker } from "antd";
import dayjs from "../../untils/dayjs";
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Copy,
  Clock,
  FileText,
  Image as ImageIcon,
  Paperclip,
  Bold,
  Italic,
  List,
  CheckCircle2,
  Send,
  Save,
  Users,
  BarChart2,
  MoveLeft,
  X,
} from "lucide-react";

import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import { announcementAPI } from "../../apis/announcements";
import AnnouncementDetailModal from "../../components/modals/AnnouncementDetailModal";
import { departmentApi } from "../../apis/departmentApi";
import {
  ANNOUNCEMENT_SCHEDULE_TYPE,
  ANNOUNCEMENT_CATEGORY,
  ANNOUNCEMENT_STATUS,
  buildScheduledDateTime,
  getAnnouncementStatusLabel,
  getAnnouncementTag,
  parseScheduledAt,
} from "../../shared/announcementSchedule";
import { useAuth } from "../../context/AuthContext";
import { getPermissionNames } from "../../utils/authPermissions";

const buildPageList = (current, total) => {
  if (total <= 1) return [1];

  const pages = [1];
  if (current > 3) pages.push("...");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i += 1) {
    pages.push(i);
  }

  if (current < total - 2) pages.push("...");
  if (total > 1) pages.push(total);
  return pages;
};

const mapAnnouncement = (item) => ({
  id: item._id,
  title: item.title,
  category: item.category,
  tag: getAnnouncementTag(item.category),
  author: item.authorId?.username || "Unknown",
  avatar: getAvatarInitials(item.authorId?.username || "Unknown"),
  date: formatDate(item.publishedAt || item.createdAt),
  status: item.status,
  statusLabel: getAnnouncementStatusLabel(item.status),
  scheduleDate: item.scheduledAt ? formatDateTime(item.scheduledAt) : null,
  views: item.readBy?.length || 0,
  isPinned: item.isPinned,
  priority: item.priority,
  content: item.content,
  eventDetails: item.eventDetails,
});

const getAvatarInitials = (username) => {
  if (!username) return "??";
  const words = username.split(" ");
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return username.substring(0, 2).toUpperCase();
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN");
};

const formatDateTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const Announcements = () => {
  const { user } = useAuth();
  const canWriteAnnouncements = useMemo(
    () => getPermissionNames(user).includes("WRITE_ANNOUNCEMENTS"),
    [user],
  );
  const [title, setTitle] = useState("");
  const [contentHtml, setContentHtml] = useState(""); // để preview / submit
  const imageInputRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Soạn thảo nội dung thông báo tại đây...",
      }),
      Image.configure({
        inline: false,
        allowBase64: false, // khuyến nghị: không lưu base64 trong DB
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class:
          "flex-1 w-full p-4 outline-none resize-none text-gray-700 leading-relaxed",
      },
    },
    onUpdate: ({ editor }) => {
      setContentHtml(editor.getHTML());
    },
  });

  // State quản lý màn hình: 'list' | 'create' | 'edit'
  const [currentView, setCurrentView] = useState("list");
  const [announcements, setAnnouncements] = useState([]);
  const [totalAnnouncements, setTotalAnnouncements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingAnnouncementId, setEditingAnnouncementId] = useState(null);

  // State cho search và filter
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });

  // State cho modal chi tiết
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState(null);

  // State cho form tạo/sửa thông báo
  const [departments, setDepartments] = useState([]);
  const [targetType, setTargetType] = useState("all"); // "all" hoặc "specific"
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [scheduleType, setScheduleType] = useState(
    ANNOUNCEMENT_SCHEDULE_TYPE.NOW
  ); // "now" ho?c "schedule"
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [category, setCategory] = useState(ANNOUNCEMENT_CATEGORY.NEWS);
  const [priority, setPriority] = useState("LOW"); // HIGH, NORMAL, LOW, URGENT

  // Handler mở modal chi tiết
  const handleViewDetail = (announcementId) => {
    setSelectedAnnouncementId(announcementId);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedAnnouncementId(null);
  };

  // Handler mở form edit và load dữ liệu
  const handleEdit = async (announcementId) => {
    if (!canWriteAnnouncements) {
      toast.error("Bạn không có quyền WRITE_ANNOUNCEMENTS để thay đổi thông báo");
      return;
    }
    try {
      // Lấy chi tiết thông báo từ API
      const res = await announcementAPI.getById(announcementId);
      const data = res.data.data;
      

      // Fill dữ liệu vào form
      setTitle(data.title || "");
      setCategory(data.category || ANNOUNCEMENT_CATEGORY.NEWS);
      setPriority(data.priority || "LOW");
      
      // Set content vào editor
      if (editor && data.content) {
        editor.commands.setContent(data.content);
        setContentHtml(data.content);
      }

      // Xử lý schedule
      if (data.status === ANNOUNCEMENT_STATUS.SCHEDULED && data.scheduledAt) {
        setScheduleType(ANNOUNCEMENT_SCHEDULE_TYPE.SCHEDULE);
        const isoString = data.scheduledAt;
        const { date: datePart, time: timeHHMM } = parseScheduledAt(isoString);


        setScheduledDate(datePart);
        setScheduledTime(timeHHMM);
      } else {
        setScheduleType(ANNOUNCEMENT_SCHEDULE_TYPE.NOW);
        setScheduledDate("");
        setScheduledTime("");
      }

      // Xử lý target departments
      if (data.targetDepartments && data.targetDepartments.length > 0) {
        setTargetType("specific");
        setSelectedDepartments(data.targetDepartments.map(dept => dept._id || dept));
      } else {
        setTargetType("all");
        setSelectedDepartments([]);
      }

      // Set editing ID và chuyển sang view edit
      setEditingAnnouncementId(announcementId);
      setCurrentView("edit");
    } catch (error) {
      console.error("Error loading announcement for edit:", error);
      toast.error("Không thể tải dữ liệu thông báo. Vui lòng thử lại!");
    }
  };

  // Handler xóa thông báo
  const handleDelete = async (announcementId, announcementTitle) => {
    if (!canWriteAnnouncements) {
      toast.error("Bạn không có quyền WRITE_ANNOUNCEMENTS để thay đổi thông báo");
      return;
    }
    const confirmDelete = window.confirm(
      `Bạn có chắc chắn muốn xóa thông báo "${announcementTitle}"?\n\nHành động này không thể hoàn tác.`
    );

    if (!confirmDelete) return;

    try {
      await announcementAPI.delete(announcementId);
      await reloadAnnouncements();
      toast.success("?? x?a th?ng b?o th?nh c?ng!");
    } catch (error) {
      console.error("Error deleting announcement:", error);
      toast.error("Có lỗi xảy ra khi xóa thông báo. Vui lòng thử lại!");
    }
  };

  // Handler cho việc chọn phòng ban
  const handleDepartmentChange = (e) => {
    const value = e.target.value;
    if (value && !selectedDepartments.includes(value)) {
      setSelectedDepartments([...selectedDepartments, value]);
      // Clear error khi chọn phòng ban
      if (validationErrors.departments) {
        setValidationErrors({ ...validationErrors, departments: null });
      }
    }
  };

  const handleRemoveDepartment = (deptId) => {
    setSelectedDepartments(selectedDepartments.filter(id => id !== deptId));
  };

  // Helper reset form
  const resetForm = () => {
    setTitle("");
    setContentHtml("");
    if (editor) {
      editor.commands.setContent("");
    }
    setCategory(ANNOUNCEMENT_CATEGORY.NEWS);
    setPriority("LOW");
    setScheduleType(ANNOUNCEMENT_SCHEDULE_TYPE.NOW);
    setScheduledDate("");
    setScheduledTime("");
    setTargetType("all");
    setSelectedDepartments([]);
    setValidationErrors({});
    setEditingAnnouncementId(null);
  };

  const buildAnnouncementParams = useCallback(
    () => ({
      page: pagination.page,
      limit: pagination.limit,
      ...(filterType !== "all" ? { category: filterType } : {}),
      ...(filterStatus !== "all" ? { status: filterStatus } : {}),
      ...(searchQuery.trim() ? { search: searchQuery.trim() } : {}),
    }),
    [filterStatus, filterType, pagination.limit, pagination.page, searchQuery],
  );

  // Helper reload announcements
  const reloadAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      const res = await announcementAPI.get(buildAnnouncementParams());
      const mappedData = (res.data.data || []).map(mapAnnouncement);
      setAnnouncements(mappedData);
      setTotalAnnouncements(res.data.total || 0);
      setError(null);
    } catch (error) {
      console.error("Error reloading announcements:", error);
      setError("Không thể tải dữ liệu thông báo");
      setAnnouncements([]);
      setTotalAnnouncements(0);
    } finally {
      setLoading(false);
    }
  }, [buildAnnouncementParams]);

  // Handler publish
  const handlePublish = async () => {
    if (!canWriteAnnouncements) {
      toast.error("Bạn không có quyền WRITE_ANNOUNCEMENTS để thay đổi thông báo");
      return;
    }
    const errors = {};

    // Validation
    if (!title.trim()) {
      errors.title = "Vui lòng nhập tiêu đề thông báo!";
    }

    if (!contentHtml.trim() || contentHtml === "<p></p>") {
      errors.content = "Vui lòng nhập nội dung thông báo!";
    }

    if (targetType === "specific" && selectedDepartments.length === 0) {
      errors.departments = "Vui lòng chọn ít nhất một phòng ban!";
    }

    if (scheduleType === ANNOUNCEMENT_SCHEDULE_TYPE.SCHEDULE) {
      if (!scheduledDate) {
        errors.scheduledDate = "Vui lòng chọn ngày lên lịch!";
      }
      if (!scheduledTime) {
        errors.scheduledTime = "Vui lòng chọn giờ lên lịch!";
      }
    }

    // Nếu có lỗi, hiển thị và dừng
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    // Clear errors nếu validation pass
    setValidationErrors({});

    // Tạo ISO datetime từ date và time
    let scheduledDateTime = null;
    if (scheduleType === ANNOUNCEMENT_SCHEDULE_TYPE.SCHEDULE && scheduledDate && scheduledTime) {
      // scheduledDate format: YYYY-MM-DD
      // scheduledTime format: HH:mm (24h)
      
      // ✅ Gửi datetime string KHÔNG có timezone
      // Backend sẽ hiểu đây là giờ local và lưu trực tiếp
      // User chọn 10:30 → Backend lưu 10:30 (không convert)
      scheduledDateTime = buildScheduledDateTime(scheduledDate, scheduledTime);
      
    }

    const content = contentHtml || editor?.getHTML() || "";

    // Xác định status dựa trên schedule type
    const status = scheduleType === ANNOUNCEMENT_SCHEDULE_TYPE.NOW ? ANNOUNCEMENT_STATUS.PUBLISHED : ANNOUNCEMENT_STATUS.SCHEDULED;

    // Log dữ liệu

    // Xác định sendToAll
    const sendToAll = selectedDepartments.length === 0;

    // Xác định scheduledAt
    const scheduledAt = status === ANNOUNCEMENT_STATUS.SCHEDULED ? scheduledDateTime : null;

    // Tạo payload
    const payload = {
      title: title,
      content,
      category: category,
      priority: priority,
      sendToAll: sendToAll,
      status: status,
      scheduledAt: scheduledAt
    };

    // Nếu có phòng ban cụ thể, thêm targetDepartments
    if (!sendToAll && selectedDepartments.length > 0) {
      payload.targetDepartments = selectedDepartments;
    }


    try {
      let res;
      if (editingAnnouncementId) {
        // Nếu đang edit, gọi API update
        res = await announcementAPI.update(editingAnnouncementId, payload);
        toast.success("Thông báo đã được cập nhật thành công!");
      } else {
        // Nếu tạo mới, gọi API post
        res = await announcementAPI.post(payload);
        toast.success("Thông báo đã được đăng thành công!");
      }
      
      // Reset form và quay về list view
      resetForm();
      setCurrentView("list");
      
      // Reload danh sách thông báo
      await reloadAnnouncements();
    } catch (error) {
      toast.error(editingAnnouncementId 
        ? "Có lỗi xảy ra khi cập nhật thông báo!" 
        : "Có lỗi xảy ra khi đăng thông báo!");
    }
  };

  useEffect(() => {
    const callDepartments = async () => {
      try {
        const res = await departmentApi.getAllCached();
        setDepartments(res.data.data);
      } catch {
        setDepartments([]);
      }
    };
    callDepartments();
  }, []);



  useEffect(() => {
    reloadAnnouncements();
  }, [reloadAnnouncements]);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [searchQuery, filterType, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(totalAnnouncements / pagination.limit));
  const currentPage = Math.min(pagination.page, totalPages);
  const paginatedAnnouncements = announcements;

  useEffect(() => {
    if (pagination.page > totalPages) {
      setPagination((prev) => ({ ...prev, page: totalPages }));
    }
  }, [pagination.page, totalPages]);

  // Helper render Tag Badge
  const renderTag = (categoryValue) => {
    const tagMapping = {
      [ANNOUNCEMENT_CATEGORY.NEWS]: "Tin tức",
      [ANNOUNCEMENT_CATEGORY.POLICY]: "Chính sách",
      [ANNOUNCEMENT_CATEGORY.EVENT]: "Sự kiện",
      [ANNOUNCEMENT_CATEGORY.OTHER]: "Khác",
    };
    const styles = {
      [ANNOUNCEMENT_CATEGORY.NEWS]: "bg-purple-50 text-purple-600 border-purple-100",
      [ANNOUNCEMENT_CATEGORY.POLICY]: "bg-blue-50 text-blue-600 border-blue-100",
      [ANNOUNCEMENT_CATEGORY.EVENT]: "bg-orange-50 text-orange-600 border-orange-100",
      [ANNOUNCEMENT_CATEGORY.OTHER]: "bg-gray-50 text-gray-600 border-gray-100",
    };
    return (
      <span
        className={`px-2.5 py-0.5 rounded text-[11px] font-bold border uppercase tracking-wide ${
          styles[categoryValue] || styles[ANNOUNCEMENT_CATEGORY.OTHER]
        }`}
      >
        {tagMapping[categoryValue] || tagMapping[ANNOUNCEMENT_CATEGORY.OTHER]}
      </span>
    );
  };

  const renderStatus = (status) => {
    const statusMapping = {
      [ANNOUNCEMENT_STATUS.PUBLISHED]: "Đã đăng",
      [ANNOUNCEMENT_STATUS.SCHEDULED]: "Đã lên lịch",
      [ANNOUNCEMENT_STATUS.DRAFT]: "Bản nháp",
      [ANNOUNCEMENT_STATUS.ARCHIVED]: "Đã lưu trữ",
    };
    const styles = {
      [ANNOUNCEMENT_STATUS.PUBLISHED]: "bg-green-100 text-green-700",
      [ANNOUNCEMENT_STATUS.SCHEDULED]: "bg-indigo-50 text-indigo-600",
      [ANNOUNCEMENT_STATUS.DRAFT]: "bg-gray-100 text-gray-500",
      [ANNOUNCEMENT_STATUS.ARCHIVED]: "bg-slate-100 text-slate-500 line-through",
    };
    const icons = {
      [ANNOUNCEMENT_STATUS.PUBLISHED]: <CheckCircle2 size={12} />,
      [ANNOUNCEMENT_STATUS.SCHEDULED]: <Clock size={12} />,
      [ANNOUNCEMENT_STATUS.DRAFT]: <FileText size={12} />,
      [ANNOUNCEMENT_STATUS.ARCHIVED]: <FileText size={12} />,
    };

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
          styles[status] || styles[ANNOUNCEMENT_STATUS.DRAFT]
        }`}
      >
        {icons[status]} {statusMapping[status] || status}
      </span>
    );
  };

  // --- VIEW 1: ANNOUNCEMENT LIST ---
  const renderListView = () => (
    <div className="flex flex-col gap-6 h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Quản lý thông báo
            {/* <span className="text-red-500"> (Not yet active)</span> */}
          </h1>
          <p className="text-sm text-gray-500">
            Quản lý thông báo nội bộ gửi đến toàn công ty.
          </p>
        </div>
        {canWriteAnnouncements && (
        <Button
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200"
          onClick={() => {
            resetForm();
            setCurrentView("create");
          }}
        >
          <Plus size={18} /> Tạo thông báo
        </Button>
        )}
      </div>

      {/* Toolbar & Filter */}
      <Card className="flex flex-col h-full p-0 overflow-hidden border border-gray-200 shadow-sm">
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-col lg:flex-row gap-4 justify-between">
          <div className="flex flex-1 gap-3">
            <div className="relative max-w-md w-full">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Tìm kiếm thông báo..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="pl-9 pr-4 py-2 w-full bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg p-2 min-w-[140px] focus:border-blue-500 outline-none"
            >
              <option value="all">Tất cả loại</option>
              <option value={ANNOUNCEMENT_CATEGORY.NEWS}>Tin tức</option>
              <option value={ANNOUNCEMENT_CATEGORY.POLICY}>Chính sách</option>
              <option value={ANNOUNCEMENT_CATEGORY.EVENT}>Sự kiện</option>
              <option value={ANNOUNCEMENT_CATEGORY.OTHER}>Khác</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg p-2 min-w-[140px] focus:border-blue-500 outline-none"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value={ANNOUNCEMENT_STATUS.PUBLISHED}>Đã đăng</option>
              <option value={ANNOUNCEMENT_STATUS.DRAFT}>Bản nháp</option>
              <option value={ANNOUNCEMENT_STATUS.SCHEDULED}>Đã lên lịch</option>
              <option value={ANNOUNCEMENT_STATUS.ARCHIVED}>Đã lưu trữ</option>
            </select>
          </div>
          <Button
            variant="secondary"
            className="px-3"
            onClick={() => {
              setSearchQuery("");
              setFilterType("all");
              setFilterStatus("all");
            }}
            title="Xóa tất cả bộ lọc"
          >
            <Filter size={16} />
          </Button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">Đang tải dữ liệu...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-red-500">{error}</div>
            </div>
          ) : announcements.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">
                {searchQuery || filterType !== "all" || filterStatus !== "all"
                  ? "Không tìm thấy thông báo phù hợp"
                  : "Chưa có thông báo nào"}
              </div>
            </div>
          ) : (
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-white border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="p-4 w-[40%]">Tiêu đề thông báo</th>
                  <th className="p-4">Người tạo</th>
                  <th className="p-4">Ngày đăng / Lên lịch</th>
                  <th className="p-4 text-center">Trạng thái</th>
                  <th className="p-4">Lượt xem</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {paginatedAnnouncements.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-blue-50/50 group transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <span
                          className="font-bold text-gray-800 text-base group-hover:text-blue-600 transition-colors line-clamp-1 cursor-pointer"
                          onClick={() => handleViewDetail(item.id)}
                        >
                          {item.title}
                        </span>
                        <div>{renderTag(item.category)}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">
                          {item.avatar}
                        </div>
                        <span className="text-gray-600">{item.author}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-500 font-mono text-xs">
                      {item.status === ANNOUNCEMENT_STATUS.SCHEDULED ? (
                        <span className="text-indigo-600 flex items-center gap-1">
                          <Clock size={12} /> {item.scheduleDate}
                        </span>
                      ) : (
                        item.date
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {renderStatus(item.status)}
                    </td>
                    <td className="p-4">
                      {item.status === ANNOUNCEMENT_STATUS.PUBLISHED ||
                        item.status === ANNOUNCEMENT_STATUS.ARCHIVED ? (
                        <span className="font-bold text-gray-700">
                          {item.views}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 italic">--</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2  transition-opacity">
                        <button
                          className="p-1.5 text-blue-600 hover:bg-blue-100 rounded"
                          title="Xem chi tiết"
                          onClick={() => handleViewDetail(item.id)}
                        >
                          <Eye size={16} />
                        </button>
                        {canWriteAnnouncements && (
                        <button
                          className="p-1.5 text-blue-600 hover:bg-blue-100 rounded"
                          title="Chỉnh sửa"
                          onClick={() => handleEdit(item.id)}
                        >
                          <Edit size={16} />
                        </button>
                        )}
                        {/* <button
                          className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"
                          title="Nhân bản"
                        >
                          <Copy size={16} />
                        </button> */}
                        {/* <button
                          className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"
                          title="Thống kê"
                        >
                          <BarChart2 size={16} />
                        </button> */}
                        {canWriteAnnouncements && (
                        <button
                          className="p-1.5 text-red-500 hover:bg-red-100 rounded"
                          title="Lưu trữ"
                          onClick={() => handleDelete(item.id, item.title)}
                        >
                          <Trash2 size={16} />
                        </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {!loading && !error && announcements.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-gray-200 bg-gray-50 p-4 text-sm text-gray-500 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
              <span>
                Hiển thị <strong>{(currentPage - 1) * pagination.limit + 1}</strong>-
                <strong>{Math.min(currentPage * pagination.limit, totalAnnouncements)}</strong> trong tổng số{" "}
                <strong>{totalAnnouncements}</strong> thông báo
              </span>
              <label className="flex items-center gap-2">
                <span>Mỗi trang</span>
                <select
                  value={pagination.limit}
                  onChange={(event) =>
                    setPagination({
                      page: 1,
                      limit: Number(event.target.value),
                    })
                  }
                  className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-700 outline-none"
                >
                  {[10, 20, 50].map((limit) => (
                    <option key={limit} value={limit}>
                      {limit}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="secondary"
                className="px-3 py-1.5 text-sm"
                disabled={currentPage <= 1}
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                }
              >
                Trước
              </Button>

              {buildPageList(currentPage, totalPages).map((page, idx) =>
                page === "..." ? (
                  <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setPagination((prev) => ({ ...prev, page }))}
                    className={`min-w-9 rounded-md px-3 py-1.5 text-sm font-medium transition ${
                      page === currentPage
                        ? "bg-blue-600 text-white"
                        : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}

              <Button
                variant="secondary"
                className="px-3 py-1.5 text-sm"
                disabled={currentPage >= totalPages}
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                }
              >
                Sau
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );

  // --- VIEW 2: EDITOR (CREATE/EDIT) ---
  const renderEditorView = () => (
    <div className="flex flex-col h-full gap-6 animate-in slide-in-from-right-4 duration-300">
      {/* Editor Header */}
      <div className="flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
          <Button
            variant="secondary"
            onClick={() => setCurrentView("list")}
            className="w-10 h-10 p-0 rounded-full border-gray-200"
          >
            <MoveLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {currentView === "create"
                ? "Tạo thông báo mới"
                : "Chỉnh sửa thông báo"}
            </h1>
            <p className="text-sm text-gray-500">
              Soạn thảo nội dung, đính kèm tệp và thiết lập lịch gửi.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => {
            resetForm();
            setCurrentView("list");
          }}>
            Hủy
          </Button>
          <Button variant="secondary" className="text-gray-600 border-gray-300">
            <Save size={18} className="mr-2" /> Lưu nháp
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200"
            onClick={handlePublish}
          >
            <Send size={18} className="mr-2" /> 
            {editingAnnouncementId ? "Cập nhật" : "Đăng ngay"}
          </Button>
        </div>
      </div>

      {/* Editor Content Layout (Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Main Form (Left - 2 Cols) */}
        <Card className="lg:col-span-2 h-full flex flex-col p-6 overflow-y-auto border border-gray-200 shadow-sm">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Tiêu đề thông báo <span className="text-red-500">*</span>
              </label>
              <input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (validationErrors.title) {
                    setValidationErrors({ ...validationErrors, title: null });
                  }
                }}
                type="text"
                placeholder="Nhập tiêu đề..."
                className={`w-full text-lg font-bold border-b-2 px-0 py-2 focus:outline-none placeholder-gray-300 transition-colors ${validationErrors.title
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-200 focus:border-blue-500"
                  }`}
              />
              {validationErrors.title && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.title}</p>
              )}
            </div>

            {/* Simulated Rich Text Editor */}
            <div className={`flex flex-col border rounded-lg overflow-hidden min-h-[400px] transition-all ${validationErrors.content
              ? "border-red-500 focus-within:ring-2 focus-within:ring-red-500"
              : "border-gray-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500"
              }`}>
              {/* Toolbar */}
              <div className="bg-gray-50 border-b border-gray-200 p-2 flex gap-1">
                <button
                  type="button"
                  className="p-1.5 hover:bg-gray-200 rounded text-gray-600"
                  onClick={() => editor?.chain().focus().toggleBold().run()}
                >
                  <Bold size={16} />
                </button>

                <button
                  type="button"
                  className="p-1.5 hover:bg-gray-200 rounded text-gray-600"
                  onClick={() => editor?.chain().focus().toggleItalic().run()}
                >
                  <Italic size={16} />
                </button>

                <button
                  type="button"
                  className="p-1.5 hover:bg-gray-200 rounded text-gray-600"
                  onClick={() =>
                    editor?.chain().focus().toggleBulletList().run()
                  }
                >
                  <List size={16} />
                </button>

                <button
                  type="button"
                  className="p-1.5 hover:bg-gray-200 rounded text-gray-600"
                  onClick={() => imageInputRef.current?.click()}
                >
                  <ImageIcon size={16} />
                </button>

                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file || !editor) return;

                    // 1) upload ảnh lên server / cloud -> lấy URL
                    // const url = await uploadAnnouncementImage(file);

                    // 2) chèn ảnh vào nội dung
                    editor
                      .chain()
                      .focus()
                      .setImage({ src: "", alt: file.name })
                      .run();

                    // reset để chọn lại cùng 1 file vẫn trigger change
                    e.target.value = "";
                  }}
                />

                <button className="p-1.5 hover:bg-gray-200 rounded text-gray-600">
                  <Paperclip size={16} />
                </button>
              </div>
              <div className="flex-1">
                <EditorContent editor={editor} />
              </div>
            </div>
            {validationErrors.content && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.content}</p>
            )}

            {/* Attachments */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Đính kèm tệp
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2 text-gray-500">
                  <Paperclip size={20} />
                </div>
                <p className="text-sm text-gray-600">
                  Kéo thả tệp vào đây hoặc{" "}
                  <span className="text-blue-600 font-bold hover:underline">
                    tải lên
                  </span>
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Hỗ trợ PDF, DOCX, JPG, PNG (Max 10MB)
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Sidebar Settings (Right - 1 Col) */}
        <div className="space-y-6">
          {/* Publishing Settings */}
          <Card className="p-5 border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4 uppercase text-xs tracking-wider">
              Thiết lập đăng tin
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loại thông báo
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-sm focus:border-blue-500 outline-none"
                >
                  <option value={ANNOUNCEMENT_CATEGORY.NEWS}>Tin tức</option>
                  <option value={ANNOUNCEMENT_CATEGORY.POLICY}>Chính sách</option>
                  <option value={ANNOUNCEMENT_CATEGORY.EVENT}>Sự kiện</option>
                  <option value={ANNOUNCEMENT_CATEGORY.OTHER}>Khác</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mức độ quan trọng
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-sm focus:border-blue-500 outline-none"
                >
                  <option value="URGENT">🔴 Khẩn cấp</option>
                  <option value="HIGH">🟠 Cao</option>
                  <option value="NORMAL">🟢 Bình thường</option>
                  <option value="LOW">⚪ Thấp</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thời gian đăng
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="schedule"
                      value={ANNOUNCEMENT_SCHEDULE_TYPE.NOW}
                      checked={scheduleType === ANNOUNCEMENT_SCHEDULE_TYPE.NOW}
                      onChange={(e) => {
                        setScheduleType(e.target.value);
                        setScheduledDate("");
                        setScheduledTime("");
                        if (validationErrors.scheduledDate) {
                          setValidationErrors({
                            ...validationErrors,
                            scheduledDate: null,
                            scheduledTime: null
                          });
                        }
                      }}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      Đăng ngay
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="schedule"
                      value={ANNOUNCEMENT_SCHEDULE_TYPE.SCHEDULE}
                      checked={scheduleType === ANNOUNCEMENT_SCHEDULE_TYPE.SCHEDULE}
                      onChange={(e) => setScheduleType(e.target.value)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      Lên lịch
                    </span>
                  </label>
                </div>

                {/* Date & Time Picker - chỉ hiện khi chọn "Lên lịch" */}
                {scheduleType === ANNOUNCEMENT_SCHEDULE_TYPE.SCHEDULE && (
                  <div className="mt-3 pl-6 space-y-2">
                    {/* Date Picker */}
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Chọn ngày
                      </label>
                      <input
                        type="date"
                        value={scheduledDate}
                        onChange={(e) => {
                          setScheduledDate(e.target.value);
                          if (validationErrors.scheduledDate) {
                            setValidationErrors({ ...validationErrors, scheduledDate: null });
                          }
                        }}
                        className={`w-full border rounded-lg p-2 text-sm outline-none ${validationErrors.scheduledDate
                          ? "border-red-500 focus:border-red-500"
                          : "border-gray-300 focus:border-blue-500"
                          }`}
                      />
                      {validationErrors.scheduledDate && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.scheduledDate}</p>
                      )}
                    </div>

                    {/* Time Picker */}
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Chọn giờ (24h)
                      </label>
                      <TimePicker
                        value={scheduledTime ? dayjs(scheduledTime, "HH:mm") : null}
                        onChange={(time) => {
                          const timeString = time ? time.format("HH:mm") : "";
                          setScheduledTime(timeString);
                          if (validationErrors.scheduledTime) {
                            setValidationErrors({ ...validationErrors, scheduledTime: null });
                          }
                        }}
                        format="HH:mm"
                        minuteStep={5}
                        placeholder="Chọn giờ"
                        className="w-full"
                        status={validationErrors.scheduledTime ? "error" : ""}
                      />
                      {validationErrors.scheduledTime && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.scheduledTime}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">Định dạng 24 giờ (VD: 14:30)</p>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đối tượng nhận tin
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="target"
                      value="all"
                      checked={targetType === "all"}
                      onChange={(e) => setTargetType(e.target.value)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 flex items-center gap-1">
                      <Users size={14} /> Toàn công ty
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="target"
                      value="specific"
                      checked={targetType === "specific"}
                      onChange={(e) => setTargetType(e.target.value)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      Phòng ban cụ thể
                    </span>
                  </label>
                </div>

                {/* Dropdown phòng ban - chỉ hiện khi chọn "Phòng ban cụ thể" */}
                {targetType === "specific" && (
                  <div className="mt-3 pl-6 space-y-2">
                    <select
                      onChange={handleDepartmentChange}
                      value=""
                      className={`w-full border rounded-lg p-2 text-sm outline-none ${validationErrors.departments
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-300 focus:border-blue-500"
                        }`}
                    >
                      <option value="">-- Chọn phòng ban --</option>
                      {departments.map((dept) => (
                        <option key={dept._id} value={dept._id}>
                          {dept.name} ({dept.deptCode})
                        </option>
                      ))}
                    </select>

                    {validationErrors.departments && (
                      <p className="text-red-500 text-xs">{validationErrors.departments}</p>
                    )}

                    {/* Hiển thị danh sách phòng ban đã chọn */}
                    {selectedDepartments.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500 font-medium">
                          Đã chọn:
                        </p>
                        {selectedDepartments.map((deptId) => {
                          const dept = departments.find((d) => d._id === deptId);
                          return (
                            <div
                              key={deptId}
                              className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded px-2 py-1"
                            >
                              <span className="text-xs text-blue-700">
                                {dept?.name} ({dept?.deptCode})
                              </span>
                              <button
                                onClick={() => handleRemoveDepartment(deptId)}
                                className="text-red-500 hover:text-red-700"
                                title="Xóa"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Info Box */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex gap-3">
            <div className="shrink-0 text-blue-600 mt-0.5">
              <Clock size={18} />
            </div>
            <div>
              <p className="text-sm font-bold text-blue-800">Lưu ý</p>
              <p className="text-xs text-blue-700 mt-1">
                Thông báo quan trọng (Policy/Holiday) sẽ được ghim lên Dashboard
                của nhân viên trong 3 ngày.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-[calc(100vh-100px)]">
      {currentView === "list" ? renderListView() : renderEditorView()}

      {/* Modal chi tiết thông báo */}
      <AnnouncementDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        announcementId={selectedAnnouncementId}
      />
    </div>
  );
};

export default Announcements;




