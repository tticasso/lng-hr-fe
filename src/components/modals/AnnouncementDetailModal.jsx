import React, { useEffect, useState } from "react";
import { X, Calendar, User, Tag, Pin, Clock, MapPin, Users } from "lucide-react";
import DOMPurify from "dompurify";
import { announcementAPI } from "../../apis/announcements";

const AnnouncementDetailModal = ({ isOpen, onClose, announcementId }) => {
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && announcementId) {
      fetchAnnouncementDetail();
    }
  }, [isOpen, announcementId]);

  const fetchAnnouncementDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await announcementAPI.getById(announcementId);
      console.log("Announcement detail:", res.data);
      setAnnouncement(res.data.data);
    } catch (err) {
      console.error("Error fetching announcement:", err);
      setError("Không thể tải chi tiết thông báo");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const formatDate = (dateString) => {
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

  const getCategoryBadge = (category) => {
    const styles = {
      NEWS: "bg-purple-50 text-purple-600 border-purple-100",
      EVENT: "bg-orange-50 text-orange-600 border-orange-100",
      POLICY: "bg-blue-50 text-blue-600 border-blue-100",
      HOLIDAY: "bg-red-50 text-red-600 border-red-100",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-bold border ${
          styles[category] || "bg-gray-50 text-gray-600 border-gray-100"
        }`}
      >
        {category}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      HIGH: "bg-red-100 text-red-700",
      NORMAL: "bg-green-100 text-green-700",
      LOW: "bg-gray-100 text-gray-500",
    };
    return (
      <span
        className={`px-2 py-1 rounded text-xs font-medium ${
          styles[priority] || styles.NORMAL
        }`}
      >
        {priority}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h2 className="text-xl font-bold text-gray-800">Chi tiết thông báo</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/80 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">Đang tải...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-red-500">{error}</div>
            </div>
          ) : announcement ? (
            <div className="space-y-6">
              {/* Title & Badges */}
              <div>
                <div className="flex items-start gap-3 mb-3">
                  {announcement.isPinned && (
                    <Pin size={20} className="text-red-500 mt-1" />
                  )}
                  <h1 className="text-2xl font-bold text-gray-900 flex-1">
                    {announcement.title}
                  </h1>
                </div>
                <div className="flex flex-wrap gap-2">
                  {getCategoryBadge(announcement.category)}
                  {getPriorityBadge(announcement.priority)}
                </div>
              </div>

              {/* Meta Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User size={16} className="text-blue-500" />
                  <span className="font-medium">Người tạo:</span>
                  <span>{announcement.authorId?.username || "Unknown"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar size={16} className="text-green-500" />
                  <span className="font-medium">Ngày đăng:</span>
                  <span>{formatDate(announcement.publishedAt)}</span>
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
                  <span>
                    {announcement.sendToAll
                      ? "Toàn công ty"
                      : `${announcement.targetDepartments?.length || 0} phòng ban`}
                  </span>
                </div>
              </div>

              {/* Event Details */}
              {announcement.eventDetails && announcement.eventDetails.startDate && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <h3 className="font-bold text-orange-800 mb-3 flex items-center gap-2">
                    <Calendar size={18} />
                    Thông tin sự kiện
                  </h3>
                  <div className="space-y-2 text-sm">
                    {announcement.eventDetails.startDate && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Clock size={14} className="text-orange-500" />
                        <span className="font-medium">Thời gian:</span>
                        <span>{formatDate(announcement.eventDetails.startDate)}</span>
                      </div>
                    )}
                    {announcement.eventDetails.location && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <MapPin size={14} className="text-orange-500" />
                        <span className="font-medium">Địa điểm:</span>
                        <span>{announcement.eventDetails.location}</span>
                      </div>
                    )}
                    {announcement.eventDetails.isMandatory && (
                      <div className="text-red-600 font-medium">
                        ⚠️ Bắt buộc tham gia
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="prose max-w-none">
                <h3 className="text-lg font-bold text-gray-800 mb-3">Nội dung</h3>
                <div
                  className="text-gray-700 leading-relaxed whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(announcement.content),
                  }}
                />
              </div>

              {/* Attachments */}
              {announcement.attachments && announcement.attachments.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-3">
                    Tệp đính kèm
                  </h3>
                  <div className="space-y-2">
                    {announcement.attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
                          <Tag size={18} className="text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">
                            {file.name || `File ${index + 1}`}
                          </p>
                          <p className="text-xs text-gray-500">
                            {file.size || "Unknown size"}
                          </p>
                        </div>
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          Tải xuống
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Read Stats */}
              {/* <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-800">
                    Đã xem: {announcement.readBy?.length || 0} người
                  </span>
                  <span className="text-xs text-blue-600">
                    Trạng thái: {announcement.status}
                  </span>
                </div>
              </div> */}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementDetailModal;
