import React from "react";
import ModalOT from "../components/modals/OTModal";
import "antd/dist/reset.css";
import { useState, useEffect } from "react";
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
import { useAuth } from "../context/AuthContext";
import { employeeApi } from "../apis/employeeApi";
import LeaveRequestModal from "../components/modals/CreateLeaveModal";
import { leaveAPI } from "../../src/apis/leaveAPI";
import { toast } from "react-toastify";
import { OTApi } from "../apis/OTAPI";
import { attendancesAPI } from "../apis/attendancesAPI";
import { notification } from "antd";
import NotificationListener from "./notification/NotificationListener";
import SocketDebugger from "../components/SocketDebugger";
import useSocket from "./notification/useSocket";
import { announcementAPI } from "../apis/announcements";
import AnnouncementDetailModal from "../components/modals/AnnouncementDetailModal";
import { useNotification } from "../context/NotificationContext";
import HRSupportModal from "../components/modals/HRSupportModal";

const Dashboard = () => {

  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isHRSupportModalOpen, setIsHRSupportModalOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isOTModalOpen, setIsOTModalOpen] = useState(false);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [otRequests, setOTRequests] = useState([]);
  const [mySheetData, setMySheetData] = useState(null); // Thêm state cho My Sheet data
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState(null);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const { openNotificationPanel } = useNotification();



  useSocket((data) => {
    console.log("=".repeat(50));
    console.log("🔥 [DASHBOARD] SOCKET DATA RECEIVED!");
    console.log("=".repeat(50));
    console.log("[useSocket]📩 Data:", data);
    console.table(data); // Hiển thị dạng bảng
    console.log("[useSocket]Title:", data?.title);
    console.log("[useSocket]Message:", data?.message);
    console.log("[useSocket]Type:", data?.type);
    console.log("=".repeat(50));
  });


  useEffect(() => {
    let isMounted = true;

    const callAPICompany = async () => {
      try {
        const now = new Date();
        const month = now.getMonth() + 1; // getMonth() trả về 0-11
        const year = now.getFullYear();

        const resMySheet = await attendancesAPI.getdatamoth(month, year);
        console.log("[TEST_2] DỮ LIỆU My sheet:", resMySheet.data.data);

        if (isMounted) {
          setMySheetData(resMySheet.data.data);
        }
      } catch (error) {
        console.log("API ERROR:", error);
        if (isMounted) {
          setMySheetData(null);
        }
      }
    };

    callAPICompany();

    return () => {
      isMounted = false;
    };
  }, []);





  useEffect(() => {
    let isMounted = true;

    const callAPIrequest = async () => {
      try {
        const resLeave = await leaveAPI.getbyUSER();
        const resOT = await OTApi.get();
        console.log("[TEST_1]DỮ LIỆU XIN NGHỈ :", resLeave.data.data[0]);
        console.log("[TEST_1]DỮ LIỆU OT :", resOT.data.data[0]);

        if (isMounted) {
          setLeaveRequests(resLeave.data.data || []);
          setOTRequests(resOT.data.data || []);
        }
      } catch (error) {
        console.log("[TEST_1]API ERROR :", error);
      }
    };

    callAPIrequest();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    console.log("[OT] isOTModalOpen changed:", isOTModalOpen);
  }, [isOTModalOpen]);

  const handleClick = () => {
    setIsLeaveModalOpen(true)
  }
  const handleClickOT = () => {
    console.log("[OT] CLICK button - before set:", isOTModalOpen);
    setIsOTModalOpen(true);
  };

  const handleAnnouncementClick = (announcementId) => {
    setSelectedAnnouncementId(announcementId);
    setIsAnnouncementModalOpen(true);
  };

  const callOTAPI = async (payload) => {
    try {
      // payload dạng:
      // { date:"YYYY-MM-DD", otType:"WEEKDAY", startTime:"HH:mm", endTime:"HH:mm", reason:"" }

      // Đổi đúng theo hàm backend của bạn:
      // ví dụ OTApi.post(payload) hoặc OTApi.create(payload)
      const id = localStorage.getItem("accountID")
      console.log("ACCOUNT ID : ", id)
      const res = await OTApi.post(payload);

      console.log("OT created:", res);
      setIsOTModalOpen(false);
      toast.success("Đăng ký OT thành công, vui lòng chờ quản trị duyệt");
    } catch (error) {
      console.log("OT create error:", error.response.data.message);
      setIsOTModalOpen(false);
      toast.error(`Đăng ký OT thất bại : ${error.response.data.message}`, { autoClose: 5000 });
    }
  };
  const CallleaveAPI = async (data) => {
    try {
      const res = await leaveAPI.post(data);
      console.log("DỮ LIỆU API TRẢ VỀ:", res);

      setIsLeaveModalOpen(false);
      toast.success("Xin nghỉ thành công, Vui lòng chờ quản trị duyệt");

    } catch (error) {
      setIsLeaveModalOpen(false);

      const errors = error?.response?.data?.errors;
      const errorMessage = Array.isArray(errors) && errors.length
        ? errors.map(e => e.message).join(", ")
        : (error?.response?.data?.message || error?.message || "Có lỗi xảy ra");

      toast.error(`Xin nghỉ thất bại: ${errorMessage}`, { autoClose: 5000 });

      console.log("FULL ERROR:", error);
      console.log("RESPONSE DATA:", error?.response?.data);
    }
  };


  const employee = {
    name: "Nguyễn Hữu Tần",
    position: "Senior React Developer",
    department: "Developer",
    avatar: "TN", // Giả lập Avatar dạng text
  };
  const [employeeDetail, setEmployeeDetail] = useState(null);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    newEmployees: 0,
  });

  // Load thông tin chi tiết của user đang login để hiển thị Avatar/Position đúng
  useEffect(() => {
    if (user.isProfileUpdated === false) navigate("/profile");
    const fetchDashboardData = async () => {
      try {
        const userId = user?.id || user?._id || user?.account?._id;

        if (userId) {
          if (user?.roles?.includes("ADMIN") || user?.roles?.includes("HR")) {
            const res = await employeeApi.getAll({ limit: 1 }); // Chỉ cần lấy total
            setStats({
              totalEmployees: res.total || 0,
              newEmployees: 0,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, [user]);

  // Tạo summaryStats từ dữ liệu API
  const summaryStats = [
    {
      label: "Ngày công thực tế",
      value: mySheetData?.work?.actualWorkDays?.toFixed(2) || "0.00",
      unit: "công",
      icon: <Briefcase size={18} className="text-blue-600" />,
      bg: "bg-blue-100",
    },
    {
      label: "Giờ tăng ca (OT)",
      value: mySheetData?.overtime?.totalHours?.toFixed(2) || "0.00",
      unit: "giờ",
      icon: <Clock size={18} className="text-orange-600" />,
      bg: "bg-orange-100",
    },
    {
      label: "Phép năm còn lại",
      value: mySheetData?.leave?.remaining?.toFixed(2) || "0.00",
      unit: "ngày",
      icon: <Coffee size={18} className="text-green-600" />,
      bg: "bg-green-100",
    },
  ];

  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    const callAPIAnnouncement = async () => {
      try {
        const res = await announcementAPI.get();
        console.log("announcementAPI RES : ", res);

        // Lấy 3 thông báo mới nhất
        const latestAnnouncements = (res.data.data || [])
          .slice(0, 3)
          .map((item) => {
            // Map category sang tag và type
            let tag = "News";
            let type = "success";

            if (item.category === "SCHEDULED") {
              tag = "Scheduled";
              type = "primary";
            } else if (item.category === "EVENT") {
              tag = "Event";
              type = "primary";
            } else if (item.category === "NEWS") {
              tag = "News";
              type = "success";
            }

            // Map priority sang type nếu là URGENT hoặc HIGH
            if (item.priority === "URGENT") {
              type = "error";
              tag = "Important";
            } else if (item.priority === "HIGH") {
              type = "error";
            }

            return {
              id: item._id,
              title: item.title,
              date: new Date(item.createdAt).toLocaleDateString("vi-VN"),
              tag: tag,
              type: type,
              rawData: item, // Lưu data gốc để dùng sau
            };
          });

        setAnnouncements(latestAnnouncements);
      } catch (error) {
        console.log("announcementAPI ERROR : ", error);
        setAnnouncements([]);
      }
    };
    callAPIAnnouncement();
  }, []);

  // Map leaveType và otType sang tên tiếng Việt
  const leaveTypeMap = {
    ANNUAL: "Nghỉ phép năm",
    UNPAID: "Nghỉ không lương",
    SICK: "Nghỉ ốm",
    MATERNITY: "Nghỉ thai sản",
  };

  const otTypeMap = {
    WEEKDAY: "OT Ngày thường",
    WEEKEND: "OT Cuối tuần",
    HOLIDAY: "OT Ngày lễ",
  };

  // Merge dữ liệu từ 2 API thành 1 danh sách requests
  const requests = [
    ...leaveRequests.map((leave) => ({
      id: leave._id,
      title: leaveTypeMap[leave.leaveType] || leave.leaveType,
      date: new Date(leave.createdAt).toLocaleDateString("vi-VN"),
      status: leave.status === "PENDING" ? "Pending" : "Approved",
      type: "leave",
      rawData: leave,
    })),
    ...otRequests.map((ot) => ({
      id: ot._id,
      title: otTypeMap[ot.otType] || ot.otType,
      date: new Date(ot.createdAt).toLocaleDateString("vi-VN"),
      status: ot.status === "PENDING" ? "Pending" : "Approved",
      type: "ot",
      rawData: ot,
    })),
  ]
    .sort((a, b) => new Date(b.rawData.createdAt) - new Date(a.rawData.createdAt)) // Sắp xếp theo ngày mới nhất
    .slice(0, 3); // ✅ Chỉ lấy 3 yêu cầu mới nhất

  // Tính số lượng Pending và Approved từ TẤT CẢ requests (không giới hạn 3)
  const allRequests = [
    ...leaveRequests.map((leave) => ({
      status: leave.status === "PENDING" ? "Pending" : "Approved",
    })),
    ...otRequests.map((ot) => ({
      status: ot.status === "PENDING" ? "Pending" : "Approved",
    })),
  ];

  const pendingCount = allRequests.filter((r) => r.status === "Pending").length;
  const approvedCount = allRequests.filter((r) => r.status === "Approved").length;

  return (
    <div className="space-y-6">
      {/* Socket Debugger - Xem trạng thái kết nối */}
      {/* <SocketDebugger /> */}

      {/* --- OT MODAL (Imported Component) --- */}
      {isOTModalOpen && (
        <>
          {console.log("[OT] Rendering ModalOT...")}
          <ModalOT
            open={isOTModalOpen}
            onClose={() => {
              console.log("[OT] onClose called");
              setIsOTModalOpen(false);
            }}
            onSubmit={(payload) => {
              console.log("[OT] onSubmit payload:", payload);
              callOTAPI(payload);
            }}
            initialValues={{ otType: "WEEKDAY" }}
          />
        </>
      )}

      {/* --- LEAVE MODAL (Imported Component) --- */}
      {isLeaveModalOpen && (
        <LeaveRequestModal
          onClose={() => setIsLeaveModalOpen(false)}
          onConfirm={(payload) => {
            CallleaveAPI(payload)
            // gọi API tạo đơn nghỉ
            console.log("DỮ LIỆU XIN NGHỈ : ", payload);
            //setIsLeaveModalOpen(false);
          }}
        />
      )}

      {/* --- ANNOUNCEMENT DETAIL MODAL --- */}
      <AnnouncementDetailModal
        isOpen={isAnnouncementModalOpen}
        onClose={() => {
          setIsAnnouncementModalOpen(false);
          setSelectedAnnouncementId(null);
        }}
        announcementId={selectedAnnouncementId}
      />

      {/* --- HR SUPPORT MODAL --- */}
      <HRSupportModal
        isOpen={isHRSupportModalOpen}
        onClose={() => setIsHRSupportModalOpen(false)}
      />
      {/* --- HÀNG TRÊN: WELCOME & STATS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 1. Welcome Card (Chiếm 6/12 cột) */}
        <Card className="col-span-12 lg:col-span-6 bg-gradient-to-r from-blue-600 to-blue-500 text-white border-none shadow-lg relative overflow-hidden">
          {/* Background Decoration */}
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>

          <div className="flex items-center gap-5 relative z-10 h-full">
            <div className="h-16 w-16 rounded-full bg-white text-blue-600 flex items-center justify-center font-bold text-2xl shadow-sm border-2 border-blue-100">
              {(user?.fullName || "U").charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">
                Xin chào, {user?.fullName || "Unknown"}! 👋
              </h2>
              <p className="text-blue-100 opacity-90 mt-1">
                {user.jobLevel || "--"} | {user.jobTitle || "--"}
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
                <span className="text-xs font-bold uppercase">Thg 3</span>
                <span className="text-lg font-bold">29</span>
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">
                  Ngày Thành Lập Gia Đình của Nam
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Chúc a trăm năm hạnh phúc
                </p>
              </div>
            </div>

            {/* Sự kiện 2: Townhall */}
            <div className="flex gap-3 items-start">
              <div className="w-12 text-center pt-1">
                <span className="text-sm font-medium text-gray-500">29/03</span>
              </div>
              <div className="pt-1 border-l-2 border-gray-200 pl-3">
                <p className="text-sm font-medium text-gray-700">
                  Chúc mừng sinh nhật Linh 🎂🎉
                </p>
                <p className="text-xs text-black-600">
                  Chúc Linh tuổi mới thật nhiều sức khỏe, luôn vui vẻ và gặp thật nhiều may mắn trong cuộc sống. Mong rằng mọi dự định và ước mơ của Linh trong năm mới đều sẽ thành hiện thực. Hãy luôn giữ nụ cười rạng rỡ và tận hưởng thật nhiều khoảnh khắc hạnh phúc nhé. Chúc Linh có một ngày sinh nhật thật ý nghĩa và tràn đầy niềm vui! ✨🎈
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

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
                onClick={openNotificationPanel}
                variant="ghost"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Xem tất cả
              </Button>
            </div>

            <div className="divide-y divide-gray-100">
              {announcements.length > 0 ? (
                announcements.map((news) => (
                  <div
                    key={news.id}
                    className="py-4 first:pt-0 last:pb-0 flex items-start gap-4 group cursor-pointer"
                    onClick={() => handleAnnouncementClick(news.id)}
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
                                          ${news.tag === "Important"
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
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <FileText size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Chưa có thông báo nào</p>
                </div>
              )}
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
                {pendingCount > 0 && (
                  <div className="flex items-center gap-1 bg-orange-50 px-2 py-1 rounded text-xs font-medium text-orange-600 border border-orange-100">
                    <Clock size={12} /> {pendingCount} Pending
                  </div>
                )}
                {approvedCount > 0 && (
                  <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded text-xs font-medium text-green-600 border border-green-100">
                    <CheckCircle2 size={12} /> {approvedCount} Approved
                  </div>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              {requests.length > 0 ? (
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
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <FileText size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Chưa có yêu cầu nào</p>
                </div>
              )}
            </div>
            <div className="mt-4 text-center">
              <Button
                variant="ghost"
                className="text-sm w-full py-1"
                onClick={() => navigate("/leave")}
              >
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
              <button className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 hover:shadow-sm transition-all group"
                onClick={handleClick}
              >
                <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm text-blue-500 group-hover:text-blue-600 mb-3">
                  <Coffee size={20} />
                </div>
                <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-700">
                  Xin nghỉ phép
                </span>
              </button>

              {/* Action 2: Gửi OT */}
              <button
                className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-orange-50 hover:border-orange-200 hover:shadow-sm transition-all group"
                onClick={handleClickOT}
              >
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
              <button
                className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-purple-50 hover:border-purple-200 hover:shadow-sm transition-all group"
                onClick={() => setIsHRSupportModalOpen(true)}
              >
                <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm text-purple-500 group-hover:text-purple-600 mb-3">
                  <PlusCircle size={20} />
                </div>
                <span className="text-sm font-semibold text-gray-700 group-hover:text-purple-700">
                  Hỗ trợ
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
