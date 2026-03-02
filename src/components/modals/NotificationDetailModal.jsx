import React, { useEffect, useState } from "react";
import { X, Clock, CheckCircle } from "lucide-react";
import logoImage from "../../assets/logo.png";
import { announcementAPI } from "../../apis/announcements";

const formatDetailTime = (dateInput) => {
  if (!dateInput) return "--";
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return "--";

  return date.toLocaleString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const NotificationDetailModal = ({ notification, onClose }) => {
  const [content,setContent]=useState("");
  
  if (!notification) return null;


  useEffect(() => {
    const fetchData = async () => {
      console.log("notification :", notification.relatedId);
      try {
        const res = await announcementAPI.getById(notification.relatedId);
        console.log("notification API :", res.data.data.content);
        setContent(res.data.data.content)
      } catch (error) {
        console.log("notification error :", error);
      }
    };

    if (notification?.relatedId) {
      fetchData();
    }
  }, [notification]);


  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-white flex justify-between items-start">
            <div className="flex gap-4 items-start flex-1">
              <img
                src={logoImage}
                alt="notify"
                className="h-14 w-14 rounded-full object-cover ring-2 ring-blue-200 shadow-sm bg-white p-1"
              />
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  {notification.title}
                </h2>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{formatDetailTime(notification.createdAt)}</span>
                  </div>
                  {!notification.unread && (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle size={14} />
                      <span className="text-xs">Đã đọc</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Đóng"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {content}
              </p>

              {/* Thêm thông tin chi tiết nếu có */}
              {notification.details && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">
                    Thông tin chi tiết
                  </h3>
                  <p className="text-sm text-gray-600">{notification.details}</p>
                </div>
              )}

              {/* Action buttons nếu có */}
              {notification.actionUrl && (
                <div className="mt-6">
                  <a
                    href={notification.actionUrl}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Xem chi tiết
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors text-sm font-medium"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationDetailModal;
