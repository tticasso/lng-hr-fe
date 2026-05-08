import { useEffect, useState } from "react";
import { X, Calendar, Tag, Pin, Clock, MapPin, Users } from "lucide-react";
import DOMPurify from "dompurify";
import { announcementAPI } from "../../apis/announcements";

const CATEGORY_LABELS = {
  NEWS: "Tin tức",
  EVENT: "Sự kiện",
  POLICY: "Chính sách",
  OTHER: "Khác",
};

const CATEGORY_STYLES = {
  NEWS: "bg-purple-50 text-purple-600 border-purple-100",
  EVENT: "bg-orange-50 text-orange-600 border-orange-100",
  POLICY: "bg-blue-50 text-blue-600 border-blue-100",
  OTHER: "bg-gray-50 text-gray-600 border-gray-100",
};

const PRIORITY_LABELS = {
  URGENT: "Khẩn cấp",
  HIGH: "Cao",
  NORMAL: "Bình thường",
  LOW: "Thấp",
};

const PRIORITY_STYLES = {
  URGENT: "bg-red-100 text-red-700",
  HIGH: "bg-red-100 text-red-700",
  NORMAL: "bg-green-100 text-green-700",
  LOW: "bg-gray-100 text-gray-500",
};

const AnnouncementDetailModal = ({ isOpen, onClose, announcementId }) => {
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !announcementId) return;

    const fetchAnnouncementDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await announcementAPI.getById(announcementId);
        setAnnouncement(res.data.data);
        announcementAPI.markAsRead(announcementId).catch(() => {});
      } catch (err) {
        console.error("Error fetching announcement:", err);
        setError("Không thể tải chi tiết thông báo");
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncementDetail();
  }, [isOpen, announcementId]);

  if (!isOpen) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "--";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCategoryBadge = (category) => (
    <span
      className={`px-3 py-1 rounded-full text-xs font-bold border ${
        CATEGORY_STYLES[category] || CATEGORY_STYLES.OTHER
      }`}
    >
      {CATEGORY_LABELS[category] || CATEGORY_LABELS.OTHER}
    </span>
  );

  const getPriorityBadge = (priority) => (
    <span
      className={`px-2 py-1 rounded text-xs font-medium ${
        PRIORITY_STYLES[priority] || PRIORITY_STYLES.NORMAL
      }`}
    >
      {PRIORITY_LABELS[priority] || PRIORITY_LABELS.NORMAL}
    </span>
  );

  const audienceText = announcement?.sendToAll
    ? "Toàn công ty"
    : `${announcement?.targetDepartments?.length || 0} phòng ban`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
          <h2 className="text-xl font-bold text-gray-800">Chi tiết thông báo</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 transition-colors hover:bg-white/80"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="text-gray-500">Đang tải...</div>
            </div>
          ) : error ? (
            <div className="flex h-64 items-center justify-center">
              <div className="text-red-500">{error}</div>
            </div>
          ) : announcement ? (
            <div className="space-y-6">
              <div>
                <div className="mb-3 flex items-start gap-3">
                  {announcement.isPinned && (
                    <Pin size={20} className="mt-1 text-red-500" />
                  )}
                  <h1 className="flex-1 text-2xl font-bold text-gray-900">
                    {announcement.title}
                  </h1>
                </div>
                <div className="flex flex-wrap gap-2">
                  {getCategoryBadge(announcement.category)}
                  {getPriorityBadge(announcement.priority)}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 rounded-lg bg-gray-50 p-4 md:grid-cols-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar size={16} className="text-green-500" />
                  <span className="font-medium">Ngày đăng:</span>
                  <span>{formatDate(announcement.publishedAt || announcement.createdAt)}</span>
                </div>
                {announcement.remindAt && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock size={16} className="text-orange-500" />
                    <span className="font-medium">Nhắc nhở:</span>
                    <span>{formatDate(announcement.remindAt)}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users size={16} className="text-purple-500" />
                  <span className="font-medium">Đối tượng:</span>
                  <span>{audienceText}</span>
                </div>
              </div>

              {announcement.eventDetails?.startDate && (
                <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                  <h3 className="mb-3 flex items-center gap-2 font-bold text-orange-800">
                    <Calendar size={18} />
                    Thông tin sự kiện
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Clock size={14} className="text-orange-500" />
                      <span className="font-medium">Thời gian:</span>
                      <span>{formatDate(announcement.eventDetails.startDate)}</span>
                    </div>
                    {announcement.eventDetails.location && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <MapPin size={14} className="text-orange-500" />
                        <span className="font-medium">Địa điểm:</span>
                        <span>{announcement.eventDetails.location}</span>
                      </div>
                    )}
                    {announcement.eventDetails.isMandatory && (
                      <div className="font-medium text-red-600">Bắt buộc tham gia</div>
                    )}
                  </div>
                </div>
              )}

              <div className="prose max-w-none">
                <h3 className="mb-3 text-lg font-bold text-gray-800">Nội dung</h3>
                <div
                  className="leading-relaxed text-gray-700"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(announcement.content || ""),
                  }}
                />
              </div>

              {announcement.attachments?.length > 0 && (
                <div>
                  <h3 className="mb-3 text-lg font-bold text-gray-800">Tệp đính kèm</h3>
                  <div className="space-y-2">
                    {announcement.attachments.map((file, index) => {
                      const fileUrl = typeof file === "string" ? file : file.url;
                      const fileName = typeof file === "string" ? file : file.name;

                      return (
                        <div
                          key={`${fileName || "file"}-${index}`}
                          className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded bg-blue-100">
                            <Tag size={18} className="text-blue-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-gray-800">
                              {fileName || `File ${index + 1}`}
                            </p>
                          </div>
                          {fileUrl && (
                            <a
                              href={fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-medium text-blue-600 hover:text-blue-700"
                            >
                              Tải xuống
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 p-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 bg-white px-6 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementDetailModal;