import React from "react";
import {
  Briefcase,
  Clock,
  Calendar,
  Megaphone,
  FileText,
  PlusCircle,
  ChevronRight,
  Coffee,
  CheckCircle2,
  AlertCircle,
  XCircle,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import StatusBadge from "../components/common/StatusBadge";
import { Link, Navigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";
const Dashboard = () => {
  const navigate = useNavigate();
  const employee = {
    name: "Nguyễn Hữu Tần",
    position: "Senior React Developer",
    department: "Developer",
    avatar: "TN", // Giả lập Avatar dạng text
  };

  const summaryStats = [
    {
      label: "Ngày công thực tế",
      value: "18.5",
      unit: "công",
      icon: <Briefcase size={18} className="text-blue-600" />,
      bg: "bg-blue-100",
    },
    {
      label: "Giờ tăng ca (OT)",
      value: "4.0",
      unit: "giờ",
      icon: <Clock size={18} className="text-orange-600" />,
      bg: "bg-orange-100",
    },
    {
      label: "Phép năm còn lại",
      value: "8.5",
      unit: "ngày",
      icon: <Coffee size={18} className="text-green-600" />,
      bg: "bg-green-100",
    },
  ];

  const announcements = [
    {
      id: 1,
      title: "Thông báo lịch nghỉ lễ Quốc Khánh 2/9",
      date: "28/08/2025",
      tag: "Important",
      type: "error",
    },
    {
      id: 2,
      title: "Chính sách thưởng dự án Quý 3/2025",
      date: "25/08/2025",
      tag: "Policy",
      type: "primary",
    },
    {
      id: 3,
      title: "Chào đón nhân viên mới tháng 8",
      date: "20/08/2025",
      tag: "News",
      type: "success",
    },
  ];

  const requests = [
    {
      id: 1,
      title: "Xin nghỉ phép (Annual Leave)",
      date: "05/09/2025",
      status: "Pending",
    },
    {
      id: 2,
      title: "Đăng ký OT dự án X",
      date: "01/09/2025",
      status: "Approved",
    },
    {
      id: 3,
      title: "Xác nhận bảng công T8",
      date: "31/08/2025",
      status: "Approved",
    },
  ];

  return (
    <div className="space-y-6">
      {/* --- HÀNG TRÊN: WELCOME & STATS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 1. Welcome Card (Chiếm 6/12 cột) */}
        <Card className="col-span-12 lg:col-span-6 bg-gradient-to-r from-blue-600 to-blue-500 text-white border-none shadow-lg relative overflow-hidden">
          {/* Background Decoration */}
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>

          <div className="flex items-center gap-5 relative z-10 h-full">
            <div className="h-16 w-16 rounded-full bg-white text-blue-600 flex items-center justify-center font-bold text-2xl shadow-sm border-2 border-blue-100">
              {employee.avatar}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">
                Xin chào, {employee.name}! 👋
              </h2>
              <p className="text-blue-100 opacity-90 mt-1">
                {employee.position} | {employee.department}
              </p>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => navigate("/profile")}
                  className="text-sm bg-white/20 hover:bg-white/30 text-white px-4 py-1.5 rounded-full transition text-xs font-medium backdrop-blur-sm"
                >
                  Xem hồ sơ cá nhân
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* 2. My Summary (Chiếm 3/12 cột) */}
        <Card className="col-span-12 md:col-span-6 lg:col-span-3 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700">Tháng này của bạn</h3>
            <TrendingUp size={16} className="text-gray-400" />
          </div>
          <div className="space-y-4">
            {summaryStats.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${item.bg}`}>{item.icon}</div>
                  <span className="text-sm text-gray-600">{item.label}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-gray-800">{item.value}</span>
                  <span className="text-xs text-gray-400 ml-1">
                    {item.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* 3. Next Important Date (Chiếm 3/12 cột) */}
        <Card className="col-span-12 md:col-span-6 lg:col-span-3 bg-blue-50/50 border-blue-100">
          <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-blue-500" />
            Sự kiện sắp tới
          </h3>

          <div className="space-y-3">
            {/* Sự kiện 1: Lương */}
            <div className="flex gap-3 items-start p-3 bg-white rounded-lg border border-blue-100 shadow-sm">
              <div className="flex flex-col items-center justify-center bg-blue-100 text-blue-600 rounded p-1 w-12 min-w-[3.5rem]">
                <span className="text-xs font-bold uppercase">Thg 12</span>
                <span className="text-lg font-bold">10</span>
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">
                  Ngày nhận lương
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Dự kiến thanh toán lương T11
                </p>
              </div>
            </div>

            {/* Sự kiện 2: Townhall */}
            <div className="flex gap-3 items-start">
              <div className="w-12 text-center pt-1">
                <span className="text-sm font-medium text-gray-500">10/09</span>
              </div>
              <div className="pt-1 border-l-2 border-gray-200 pl-3">
                <p className="text-sm font-medium text-gray-700">
                  Họp toàn công ty (Townhall)
                </p>
                <p className="text-xs text-gray-400">
                  09:00 AM - Phòng họp lớn
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* --- KHU VỰC CHÍNH: GRID 2 CỘT LỆCH (2/3 & 1/3) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CỘT TRÁI (8/12) - Announcements & Requests */}
        <div className="lg:col-span-8 space-y-6">
          {/* Block Announcements */}
          <Card>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Megaphone size={20} className="text-blue-600" />
                <h3 className="font-bold text-gray-800 text-lg">
                  Thông báo nội bộ
                </h3>
              </div>
              <Button
                variant="ghost"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Xem tất cả
              </Button>
            </div>

            <div className="divide-y divide-gray-100">
              {announcements.map((news) => (
                <div
                  key={news.id}
                  className="py-4 first:pt-0 last:pb-0 flex items-start gap-4 group cursor-pointer"
                >
                  {/* Icon tin tức */}
                  <div className="mt-1 p-2 bg-gray-50 rounded-full group-hover:bg-blue-50 transition-colors">
                    <FileText
                      size={18}
                      className="text-gray-400 group-hover:text-blue-500"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider 
                                        ${
                                          news.tag === "Important"
                                            ? "bg-red-100 text-red-600"
                                            : news.tag === "Policy"
                                            ? "bg-blue-100 text-blue-600"
                                            : "bg-green-100 text-green-600"
                                        }`}
                      >
                        {news.tag}
                      </span>
                      <span className="text-xs text-gray-400">
                        • {news.date}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {news.title}
                    </h4>
                  </div>
                  <ChevronRight size={16} className="text-gray-300 mt-3" />
                </div>
              ))}
            </div>
          </Card>

          {/* Block My Requests */}
          <Card>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-800 text-lg">
                Yêu cầu của tôi
              </h3>
              <div className="flex gap-2">
                {/* Mini Stats Badges */}
                <div className="flex items-center gap-1 bg-orange-50 px-2 py-1 rounded text-xs font-medium text-orange-600 border border-orange-100">
                  <Clock size={12} /> 1 Pending
                </div>
                <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded text-xs font-medium text-green-600 border border-green-100">
                  <CheckCircle2 size={12} /> 12 Approved
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3 rounded-l-md">Loại yêu cầu</th>
                    <th className="px-4 py-3">Ngày gửi</th>
                    <th className="px-4 py-3 rounded-r-md text-right">
                      Trạng thái
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {requests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {req.title}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{req.date}</td>
                      <td className="px-4 py-3 text-right">
                        <StatusBadge status={req.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-center">
              <Button variant="ghost" className="text-sm w-full py-1">
                Xem lịch sử yêu cầu
              </Button>
            </div>
          </Card>
        </div>

        {/* CỘT PHẢI (4/12) - Quick Actions */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="h-full">
            <h3 className="font-bold text-gray-800 text-lg mb-5">
              Truy cập nhanh
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {/* Action 1: Xin nghỉ phép */}
              <button className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 hover:shadow-sm transition-all group">
                <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm text-blue-500 group-hover:text-blue-600 mb-3">
                  <Coffee size={20} />
                </div>
                <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-700">
                  Xin nghỉ phép
                </span>
              </button>

              {/* Action 2: Gửi OT */}
              <button className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-orange-50 hover:border-orange-200 hover:shadow-sm transition-all group">
                <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm text-orange-500 group-hover:text-orange-600 mb-3">
                  <Clock size={20} />
                </div>
                <span className="text-sm font-semibold text-gray-700 group-hover:text-orange-700">
                  Đăng ký OT
                </span>
              </button>

              {/* Action 3: Xem phiếu lương */}
              <button
                className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-green-50 hover:border-green-200 hover:shadow-sm transition-all group"
                onClick={() => navigate("/payroll")}
              >
                <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm text-green-500 group-hover:text-green-600 mb-3">
                  <DollarSign size={20} />
                </div>
                <span className="text-sm font-semibold text-gray-700 group-hover:text-green-700">
                  Phiếu lương
                </span>
              </button>

              {/* Action 4: Gửi Ticket HR */}
              <button className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-purple-50 hover:border-purple-200 hover:shadow-sm transition-all group">
                <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm text-purple-500 group-hover:text-purple-600 mb-3">
                  <PlusCircle size={20} />
                </div>
                <span className="text-sm font-semibold text-gray-700 group-hover:text-purple-700">
                  Hỗ trợ HR
                </span>
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <h4 className="text-xs font-semibold text-gray-400 uppercase mb-3">
                Liên hệ khẩn cấp
              </h4>
              <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                <AlertCircle size={20} className="text-red-500" />
                <div>
                  <p className="text-sm font-bold text-gray-800">IT Support</p>
                  <p className="font-bold text-red-500">
                    Không phải lỗi! Đấy là tính năng.
                  </p>
                  <p className="text-xs text-gray-500">huuluan0511@gmail.com</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
