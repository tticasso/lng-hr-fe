import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import DOMPurify from "dompurify";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
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

const Announcements = () => {
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingAnnouncementId, setEditingAnnouncementId] = useState(null);

  // State cho search và filter
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // State cho modal chi tiết
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState(null);

  // State cho form tạo/sửa thông báo
  const [departments, setDepartments] = useState([]);
  const [targetType, setTargetType] = useState("all"); // "all" hoặc "specific"
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [scheduleType, setScheduleType] = useState("now"); // "now" hoặc "schedule"
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [category, setCategory] = useState("NEWS"); // NEWS, EVENT, SCHEDULED
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
    try {
      // Lấy chi tiết thông báo từ API
      const res = await announcementAPI.getById(announcementId);
      const data = res.data.data;
      
      console.log("Edit announcement data:", data);

      // Fill dữ liệu vào form
      setTitle(data.title || "");
      setCategory(data.category || "NEWS");
      setPriority(data.priority || "LOW");
      
      // Set content vào editor
      if (editor && data.content) {
        editor.commands.setContent(data.content);
        setContentHtml(data.content);
      }

      // Xử lý schedule
      if (data.status === "SCHEDULED" && data.scheduledAt) {
        setScheduleType("schedule");
        const scheduleDate = new Date(data.scheduledAt);
        setScheduledDate(scheduleDate.toISOString().split('T')[0]);
        setScheduledTime(scheduleDate.toTimeString().slice(0, 5));
      } else {
        setScheduleType("now");
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
    const confirmDelete = window.confirm(
      `Bạn có chắc chắn muốn xóa thông báo "${announcementTitle}"?\n\nHành động này không thể hoàn tác.`
    );

    if (!confirmDelete) return;

    try {
      await announcementAPI.delete(announcementId);
      
      // Cập nhật danh sách sau khi xóa thành công
      setAnnouncements(announcements.filter(item => item.id !== announcementId));
      
      toast.success("Đã xóa thông báo thành công!");
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
    setCategory("NEWS");
    setPriority("LOW");
    setScheduleType("now");
    setScheduledDate("");
    setScheduledTime("");
    setTargetType("all");
    setSelectedDepartments([]);
    setValidationErrors({});
    setEditingAnnouncementId(null);
  };

  // Helper reload announcements
  const reloadAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await announcementAPI.get();
      const mappedData = res.data.data.map((item) => ({
        id: item._id,
        title: item.title,
        tag: mapCategoryToTag(item.category),
        author: item.authorId?.username || "Unknown",
        avatar: getAvatarInitials(item.authorId?.username || "Unknown"),
        date: formatDate(item.publishedAt || item.createdAt),
        status: mapStatus(item.status),
        scheduleDate: item.remindAt ? formatDateTime(item.remindAt) : null,
        views: item.readBy?.length || 0,
        totalUsers: 150,
        isPinned: item.isPinned,
        priority: item.priority,
        content: item.content,
        eventDetails: item.eventDetails,
      }));
      setAnnouncements(mappedData);
    } catch (error) {
      console.error("Error reloading announcements:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handler publish
  const handlePublish = async () => {
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

    if (scheduleType === "schedule") {
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
    if (scheduleType === "schedule" && scheduledDate && scheduledTime) {
      scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}:00Z`).toISOString();
    }

    // Chuyển HTML content sang plain text
    const contentText = editor?.getText() || "";

    // Xác định status dựa trên schedule type
    const status = scheduleType === "now" ? "PUBLISHED" : "SCHEDULED";

    // Log dữ liệu
    console.log("Publishing announcement with data:");
    console.log("Title:", title);
    console.log("Content (Text):", contentText);
    console.log("Category:", category);
    console.log("Priority:", priority);
    console.log("Status:", status);
    console.log("Scheduled DateTime (ISO):", scheduledDateTime);
    console.log("Target Type:", targetType);
    console.log("Selected Department IDs:", selectedDepartments);

    // Xác định sendToAll
    const sendToAll = selectedDepartments.length === 0;

    // Xác định scheduledAt
    const scheduledAt = status === "SCHEDULED" ? scheduledDateTime : null;

    // Tạo payload
    const payload = {
      title: title,
      content: contentText,
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

    console.log("[ABZ]PAYLOAD : ", payload);

    try {
      let res;
      if (editingAnnouncementId) {
        // Nếu đang edit, gọi API update
        res = await announcementAPI.update(editingAnnouncementId, payload);
        console.log("[ABZ]UPDATE RESPONSE :", res);
        toast.success("Thông báo đã được cập nhật thành công!");
      } else {
        // Nếu tạo mới, gọi API post
        res = await announcementAPI.post(payload);
        console.log("[ABZ]CREATE RESPONSE :", res);
        toast.success("Thông báo đã được đăng thành công!");
      }
      
      // Reset form và quay về list view
      resetForm();
      setCurrentView("list");
      
      // Reload danh sách thông báo
      await reloadAnnouncements();
    } catch (error) {
      console.log("[ABZ]ERROR :", error);
      toast.error(editingAnnouncementId 
        ? "Có lỗi xảy ra khi cập nhật thông báo!" 
        : "Có lỗi xảy ra khi đăng thông báo!");
    }
  };

  useEffect(() => {
    const callDepartments = async () => {
      try {
        const res = await departmentApi.getAll();
        console.log("Departments API RES:", res);
        setDepartments(res.data.data);
      } catch (error) {
        console.log("Departments API ERROR:", error);
      }
    };
    callDepartments();
  }, []);



  useEffect(() => {
    const callAPIAnnouncement = async () => {
      try {
        setLoading(true);
        const res = await announcementAPI.get();
        console.log("announcementAPI res :", res);

        // Map dữ liệu API sang format hiển thị
        const mappedData = res.data.data.map((item) => ({
          id: item._id,
          title: item.title,
          tag: mapCategoryToTag(item.category),
          author: item.authorId?.username || "Unknown",
          avatar: getAvatarInitials(item.authorId?.username || "Unknown"),
          date: formatDate(item.publishedAt || item.createdAt),
          status: mapStatus(item.status),
          scheduleDate: item.remindAt ? formatDateTime(item.remindAt) : null,
          views: item.readBy?.length || 0,
          totalUsers: 150, // Có thể lấy từ API khác hoặc tính toán
          isPinned: item.isPinned,
          priority: item.priority,
          content: item.content,
          eventDetails: item.eventDetails,
        }));

        setAnnouncements(mappedData);
        setError(null);
      } catch (error) {
        console.log("announcementAPI error :", error);
        setError("Không thể tải dữ liệu thông báo");
      } finally {
        setLoading(false);
      }
    };
    callAPIAnnouncement();
  }, []);

  // Helper functions để map dữ liệu
  const mapCategoryToTag = (category) => {
    const mapping = {
      NEWS: "HR Notice",
      EVENT: "Event",
      POLICY: "Policy",
      HOLIDAY: "Holiday",
    };
    return mapping[category] || "Others";
  };

  const mapStatus = (status) => {
    const mapping = {
      PUBLISHED: "Published",
      DRAFT: "Draft",
      SCHEDULED: "Scheduled",
      ARCHIVED: "Archived",
    };
    return mapping[status] || "Draft";
  };

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

  // Filtered announcements based on search and filters
  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((item) => {
      // Search filter - tìm trong title và author
      const matchesSearch =
        searchQuery === "" ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.author.toLowerCase().includes(searchQuery.toLowerCase());

      // Type filter
      const matchesType =
        filterType === "all" ||
        item.tag.toLowerCase() === filterType.toLowerCase();

      // Status filter
      const matchesStatus =
        filterStatus === "all" ||
        item.status.toLowerCase() === filterStatus.toLowerCase();

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [announcements, searchQuery, filterType, filterStatus]);

  // Helper render Tag Badge
  const renderTag = (tag) => {
    const tagMapping = {
      Holiday: "Ngày Lễ",
      Policy: "Chính Sách",
      Event: "Sự Kiện",
      "HR Notice": "Thông Báo HR",
      Others: "Khác",
    };
    const styles = {
      Holiday: "bg-red-50 text-red-600 border-red-100",
      Policy: "bg-blue-50 text-blue-600 border-blue-100",
      Event: "bg-orange-50 text-orange-600 border-orange-100",
      "HR Notice": "bg-purple-50 text-purple-600 border-purple-100",
      Others: "bg-gray-50 text-gray-600 border-gray-100",
    };
    return (
      <span
        className={`px-2.5 py-0.5 rounded text-[11px] font-bold border uppercase tracking-wide ${styles[tag] || styles["Others"]
          }`}
      >
        {tagMapping[tag] || tagMapping["Others"]}
      </span>
    );
  };

  // Helper render Status Badge
  const renderStatus = (status) => {
    const statusMapping = {
      Published: "Đã Đăng",
      Scheduled: "Đã Lên Lịch",
      Draft: "Bản Nháp",
      Archived: "Đã Lưu Trữ",
    };
    const styles = {
      Published: "bg-green-100 text-green-700",
      Scheduled: "bg-indigo-50 text-indigo-600",
      Draft: "bg-gray-100 text-gray-500",
      Archived: "bg-slate-100 text-slate-500 line-through",
    };
    const icons = {
      Published: <CheckCircle2 size={12} />,
      Scheduled: <Clock size={12} />,
      Draft: <FileText size={12} />,
      Archived: <FileText size={12} />,
    };

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${styles[status]}`}
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
        <Button
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200"
          onClick={() => {
            resetForm();
            setCurrentView("create");
          }}
        >
          <Plus size={18} /> Tạo thông báo
        </Button>
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
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 w-full bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg p-2 min-w-[140px] focus:border-blue-500 outline-none"
            >
              <option value="all">Tất cả loại</option>
              <option value="holiday">Ngày lễ</option>
              <option value="policy">Chính sách</option>
              <option value="event">Sự kiện</option>
              <option value="hr notice">Thông báo HR</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg p-2 min-w-[140px] focus:border-blue-500 outline-none"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="published">Đã đăng</option>
              <option value="draft">Bản nháp</option>
              <option value="scheduled">Đã lên lịch</option>
              <option value="archived">Đã lưu trữ</option>
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
          ) : filteredAnnouncements.length === 0 ? (
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
                  <th className="p-4">Lượt xem (Reach)</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredAnnouncements.map((item) => (
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
                        <div>{renderTag(item.tag)}</div>
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
                      {item.status === "Scheduled" ? (
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
                      {item.status === "Published" ||
                        item.status === "Archived" ? (
                        <div className="w-full max-w-[120px]">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="font-bold text-gray-700">
                              {item.views}/{item.totalUsers}
                            </span>
                            <span className="text-gray-400">
                              {Math.round((item.views / item.totalUsers) * 100)}%
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{
                                width: `${(item.views / item.totalUsers) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>
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
                        <button
                          className="p-1.5 text-blue-600 hover:bg-blue-100 rounded"
                          title="Chỉnh sửa"
                          onClick={() => handleEdit(item.id)}
                        >
                          <Edit size={16} />
                        </button>
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
                        <button
                          className="p-1.5 text-red-500 hover:bg-red-100 rounded"
                          title="Lưu trữ"
                          onClick={() => handleDelete(item.id, item.title)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
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
                  <option value="NEWS">Tin tức</option>
                  <option value="EVENT">Sự kiện</option>
                  {/* <option value="SCHEDULED">Lên lịch</option> */}
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
                      value="now"
                      checked={scheduleType === "now"}
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
                      value="schedule"
                      checked={scheduleType === "schedule"}
                      onChange={(e) => setScheduleType(e.target.value)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      Lên lịch
                    </span>
                  </label>
                </div>

                {/* Date & Time Picker - chỉ hiện khi chọn "Lên lịch" */}
                {scheduleType === "schedule" && (
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
                        Chọn giờ
                      </label>
                      <input
                        type="time"
                        value={scheduledTime}
                        onChange={(e) => {
                          setScheduledTime(e.target.value);
                          if (validationErrors.scheduledTime) {
                            setValidationErrors({ ...validationErrors, scheduledTime: null });
                          }
                        }}
                        className={`w-full border rounded-lg p-2 text-sm outline-none ${validationErrors.scheduledTime
                          ? "border-red-500 focus:border-red-500"
                          : "border-gray-300 focus:border-blue-500"
                          }`}
                      />
                      {validationErrors.scheduledTime && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.scheduledTime}</p>
                      )}
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
