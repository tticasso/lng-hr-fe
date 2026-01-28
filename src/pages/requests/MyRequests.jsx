import React, { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  MessageSquare,
  Paperclip,
  Send,
  X,
  CheckCircle,
  Clock,
  FileText,
  AlertCircle,
  MoreHorizontal,
} from "lucide-react";

// Import UI Kit
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import StatusBadge from "../../components/common/StatusBadge";

const MyRequests = () => {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("All");

  // 1. Mock Data: Danh sách yêu cầu
  const requests = [
    {
      id: "REQ-2025-001",
      type: "Payroll",
      title: "Thắc mắc về khoản khấu trừ thuế T12",
      date: "09/12/2025",
      dept: "C&B Team",
      status: "In Progress",
      content:
        "Chào HR, tôi thấy khoản thuế TNCN tháng này cao hơn tháng trước dù thu nhập không đổi. Nhờ HR kiểm tra lại giúp.",
      history: [
        {
          sender: "Me",
          time: "09:00 AM",
          text: "Chào HR, tôi thấy khoản thuế TNCN tháng này cao hơn tháng trước dù thu nhập không đổi.",
        },
        {
          sender: "HR Support",
          time: "09:30 AM",
          text: "Chào bạn, mình đã nhận được yêu cầu. Mình sẽ kiểm tra lại bảng tính thuế và phản hồi bạn trong chiều nay nhé.",
        },
      ],
    },
    {
      id: "REQ-2025-002",
      type: "IT Asset",
      title: "Yêu cầu cấp màn hình rời",
      date: "08/12/2025",
      dept: "IT Helpdesk",
      status: "Pending",
      content:
        "Do tính chất công việc cần code nhiều màn hình, tôi xin cấp thêm 1 màn hình Dell 24 inch.",
      history: [
        {
          sender: "Me",
          time: "Yesterday",
          text: "Do tính chất công việc cần code nhiều màn hình, tôi xin cấp thêm 1 màn hình Dell 24 inch.",
        },
      ],
    },
    {
      id: "REQ-2025-003",
      type: "HR Policy",
      title: "Hỏi về chính sách nghỉ thai sản",
      date: "01/12/2025",
      dept: "HR Admin",
      status: "Resolved",
      content:
        "Cho mình xin tài liệu hướng dẫn quy trình nghỉ thai sản cho nhân viên nam.",
      history: [
        {
          sender: "Me",
          time: "01/12/2025",
          text: "Cho mình xin tài liệu hướng dẫn quy trình nghỉ thai sản cho nhân viên nam.",
        },
        {
          sender: "HR Admin",
          time: "02/12/2025",
          text: "Đã gửi tài liệu qua email cho bạn. Ticket closed.",
        },
      ],
    },
    {
      id: "REQ-2025-004",
      type: "Other",
      title: "Đề xuất team building",
      date: "20/11/2025",
      dept: "BOD",
      status: "Rejected",
      content: "Đề xuất tổ chức đi Hạ Long vào cuối tháng.",
      history: [
        {
          sender: "Me",
          time: "20/11/2025",
          text: "Đề xuất tổ chức đi Hạ Long vào cuối tháng.",
        },
        {
          sender: "Manager",
          time: "21/11/2025",
          text: "Hiện tại công ty đang tập trung chạy dự án cuối năm nên chưa duyệt đi chơi xa được nhé.",
        },
      ],
    },
  ];

  const getTypeColor = (type) => {
    switch (type) {
      case "Payroll":
        return "text-green-600 bg-green-50 border-green-100";
      case "IT Asset":
        return "text-blue-600 bg-blue-50 border-blue-100";
      case "HR Policy":
        return "text-purple-600 bg-purple-50 border-purple-100";
      default:
        return "text-gray-600 bg-gray-50 border-gray-100";
    }
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col gap-6">
      {/* --- HEADER: ACTIONS & FILTERS --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Yêu cầu hỗ trợ (Ticket)
          </h1>
          <p className="text-sm text-gray-500">
            Gửi và theo dõi các yêu cầu tới các bộ phận
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200"
        >
          <Plus size={18} /> Tạo yêu cầu mới
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 shrink-0">
        {/* Status Filter Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-lg overflow-x-auto">
          {["All", "Pending", "In Progress", "Resolved", "Rejected"].map(
            (status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap
                     ${
                       filterStatus === status
                         ? "bg-white text-blue-600 shadow-sm"
                         : "text-gray-500 hover:text-gray-700"
                     }
                  `}
              >
                {status === "All" ? "Tất cả" : status}
              </button>
            )
          )}
        </div>

        {/* Type Filter Dropdown (Giả lập) */}
        <div className="relative">
          <select className="appearance-none bg-white border border-gray-200 text-gray-700 py-2 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
            <option>Tất cả loại yêu cầu</option>
            <option>Payroll & C&B</option>
            <option>IT & Tài sản</option>
            <option>HR Admin</option>
          </select>
          <Filter
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>
      </div>

      {/* --- MAIN CONTENT: SPLIT VIEW (TABLE & DETAIL) --- */}
      <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
        {/* LEFT PANEL: REQUEST LIST (Chiếm 7 phần) */}
        <Card className="flex-[7] flex flex-col p-0 overflow-hidden border border-gray-200 shadow-sm">
          <div className="overflow-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold sticky top-0 z-10">
                <tr>
                  <th className="p-4 border-b border-gray-200">Mã Ticket</th>
                  <th className="p-4 border-b border-gray-200">Loại</th>
                  <th className="p-4 border-b border-gray-200">Tiêu đề</th>
                  <th className="p-4 border-b border-gray-200">Ngày gửi</th>
                  <th className="p-4 border-b border-gray-200">Xử lý bởi</th>
                  <th className="p-4 border-b border-gray-200">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {requests.map((req) => (
                  <tr
                    key={req.id}
                    onClick={() => setSelectedRequest(req)}
                    className={`cursor-pointer transition-colors hover:bg-blue-50/50 
                              ${
                                selectedRequest?.id === req.id
                                  ? "bg-blue-50 ring-1 ring-inset ring-blue-200"
                                  : ""
                              }
                           `}
                  >
                    <td className="p-4 font-mono text-xs text-gray-500">
                      {req.id}
                    </td>
                    <td className="p-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getTypeColor(
                          req.type
                        )}`}
                      >
                        {req.type}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-gray-800 line-clamp-1 max-w-[200px]">
                      {req.title}
                    </td>
                    <td className="p-4 text-sm text-gray-500">{req.date}</td>
                    <td className="p-4 text-sm text-gray-600">{req.dept}</td>
                    <td className="p-4">
                      <StatusBadge status={req.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* RIGHT PANEL: DETAIL (Chiếm 5 phần) */}
        <Card className="flex-[5] flex flex-col p-0 overflow-hidden border border-gray-200 shadow-sm bg-gray-50/50">
          {!selectedRequest ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <MessageSquare size={48} className="mb-4 opacity-20" />
              <p>Chọn một yêu cầu để xem chi tiết</p>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              {/* Detail Header */}
              <div className="p-4 bg-white border-b border-gray-200 flex justify-between items-start shrink-0">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-gray-500">
                      {selectedRequest.id}
                    </span>
                    <StatusBadge status={selectedRequest.status} />
                  </div>
                  <h3 className="font-bold text-gray-800 text-lg leading-tight">
                    {selectedRequest.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Phụ trách: <strong>{selectedRequest.dept}</strong>
                  </p>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreHorizontal size={20} />
                </button>
              </div>

              {/* Chat History Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Original Content Block */}
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-6 text-sm">
                  <p className="font-bold text-blue-800 text-xs uppercase mb-1">
                    Nội dung yêu cầu
                  </p>
                  <p className="text-gray-700">{selectedRequest.content}</p>
                </div>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-gray-200"></div>
                  <span className="flex-shrink-0 mx-4 text-gray-400 text-xs">
                    Lịch sử trao đổi
                  </span>
                  <div className="flex-grow border-t border-gray-200"></div>
                </div>

                {/* Chat Bubbles */}
                {selectedRequest.history.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${
                      msg.sender === "Me" ? "items-end" : "items-start"
                    }`}
                  >
                    <div className="flex items-end gap-2 max-w-[85%]">
                      {msg.sender !== "Me" && (
                        <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-[10px] font-bold text-orange-600">
                          HR
                        </div>
                      )}
                      <div
                        className={`
                                 p-3 rounded-2xl text-sm shadow-sm
                                 ${
                                   msg.sender === "Me"
                                     ? "bg-blue-600 text-white rounded-br-none"
                                     : "bg-white text-gray-700 border border-gray-200 rounded-bl-none"
                                 }
                              `}
                      >
                        {msg.text}
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1 px-1">
                      {msg.time}
                    </span>
                  </div>
                ))}
              </div>

              {/* Action Footer */}
              <div className="p-4 bg-white border-t border-gray-200 shrink-0">
                {selectedRequest.status === "Resolved" ||
                selectedRequest.status === "Rejected" ? (
                  <div className="text-center py-2 bg-gray-100 rounded text-sm text-gray-500 flex items-center justify-center gap-2">
                    <CheckCircle size={16} /> Ticket này đã được đóng.
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Nhập nội dung phản hồi..."
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600">
                      <Paperclip size={20} />
                    </button>
                    <button className="p-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-white">
                      <Send size={20} />
                    </button>
                  </div>
                )}

                {/* Close Button (Optional) */}
                {selectedRequest.status === "In Progress" && (
                  <div className="mt-3 flex justify-end">
                    <button className="text-xs text-red-500 hover:underline flex items-center gap-1">
                      Đóng yêu cầu này (Đã xong)
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* --- POPUP MODAL: CREATE REQUEST --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-800">
                Tạo yêu cầu mới
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-red-500 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loại yêu cầu <span className="text-red-500">*</span>
                </label>
                <select className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white">
                  <option>Payroll - Thắc mắc lương/thuế</option>
                  <option>IT - Cấp phát tài sản/Sửa chữa</option>
                  <option>HR - Chế độ/Chính sách/Bảo hiểm</option>
                  <option>Khác</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tiêu đề <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Vd: Xin cấp lại thẻ nhân viên"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nội dung chi tiết <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows="4"
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  placeholder="Mô tả chi tiết vấn đề bạn đang gặp phải..."
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Đính kèm tệp (Nếu có)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 cursor-pointer transition">
                  <Paperclip className="mx-auto text-gray-400 mb-2" size={24} />
                  <p className="text-xs text-gray-500">
                    Click để tải lên ảnh hoặc tài liệu (Max 5MB)
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                Hủy bỏ
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md">
                Gửi yêu cầu
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyRequests;
