import React, { useState } from "react";
import {
  UserPlus,
  UserMinus,
  CheckSquare,
  Clock,
  Calendar,
  ChevronRight,
  MoreHorizontal,
  Mail,
  Shield,
  Monitor,
  FileText,
  UserCheck,
  AlertTriangle,
} from "lucide-react";

// Import UI Kit
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import StatusBadge from "../../components/common/StatusBadge";

const OnboardingOffboarding = () => {
  const [activeTab, setActiveTab] = useState("onboarding");
  const [selectedId, setSelectedId] = useState(1); // Mặc định chọn nhân viên đầu tiên

  // --- MOCK DATA: ONBOARDING ---
  const onboardingList = [
    {
      id: 1,
      name: "Phạm Văn Mới",
      position: "Junior Frontend",
      joinDate: "09/12/2025",
      mentor: "Nguyễn Văn An",
      progress: 60, // % hoàn thành
      avatar: "PM",
      tasks: [
        {
          id: 1,
          title: "Ký hợp đồng & Thu hồ sơ",
          assignee: "HR Admin",
          deadline: "09/12",
          status: "Done",
        },
        {
          id: 2,
          title: "Tạo tài khoản Email & Slack",
          assignee: "IT Support",
          deadline: "09/12",
          status: "Done",
        },
        {
          id: 3,
          title: "Cấp phát Laptop & Màn hình",
          assignee: "IT Support",
          deadline: "09/12",
          status: "Done",
        },
        {
          id: 4,
          title: "Giới thiệu Team & Văn hóa",
          assignee: "HR BP",
          deadline: "10/12",
          status: "In Progress",
        },
        {
          id: 5,
          title: "Training quy trình nội bộ",
          assignee: "Mentor",
          deadline: "12/12",
          status: "Pending",
        },
      ],
    },
    {
      id: 2,
      name: "Lê Thị Tester",
      position: "QC Engineer",
      joinDate: "15/12/2025",
      mentor: "Trần Thị B",
      progress: 20,
      avatar: "LT",
      tasks: [
        {
          id: 1,
          title: "Ký hợp đồng & Thu hồ sơ",
          assignee: "HR Admin",
          deadline: "15/12",
          status: "Done",
        },
        {
          id: 2,
          title: "Tạo tài khoản Email & Slack",
          assignee: "IT Support",
          deadline: "15/12",
          status: "Pending",
        },
        {
          id: 3,
          title: "Cấp phát Laptop & Màn hình",
          assignee: "IT Support",
          deadline: "15/12",
          status: "Pending",
        },
        {
          id: 4,
          title: "Giới thiệu Team & Văn hóa",
          assignee: "HR BP",
          deadline: "16/12",
          status: "Pending",
        },
      ],
    },
  ];

  // --- MOCK DATA: OFFBOARDING ---
  const offboardingList = [
    {
      id: 101,
      name: "Trần Văn Cũ",
      position: "Sales Executive",
      leaveDate: "30/12/2025",
      reason: "Personal reasons",
      progress: 40,
      avatar: "TC",
      statusTags: { asset: "Pending", account: "Active" }, // Trạng thái nhanh
      tasks: [
        {
          id: 1,
          title: "Thông báo nghỉ việc chính thức",
          assignee: "Manager",
          deadline: "01/12",
          status: "Done",
        },
        {
          id: 2,
          title: "Bàn giao công việc (Handover)",
          assignee: "Manager",
          deadline: "28/12",
          status: "In Progress",
        },
        {
          id: 3,
          title: "Thu hồi Laptop & Tài sản",
          assignee: "IT Support",
          deadline: "30/12",
          status: "Pending",
        },
        {
          id: 4,
          title: "Khóa tài khoản hệ thống",
          assignee: "IT Admin",
          deadline: "30/12",
          status: "Pending",
        },
        {
          id: 5,
          title: "Chốt lương & Bảo hiểm",
          assignee: "C&B",
          deadline: "05/01",
          status: "Pending",
        },
      ],
    },
  ];

  // Xác định danh sách đang hiển thị
  const currentList =
    activeTab === "onboarding" ? onboardingList : offboardingList;
  const currentDetail =
    currentList.find((item) => item.id === selectedId) || currentList[0];

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col gap-6">
      {/* --- HEADER --- */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Onboarding & Offboarding(Not yet active)
          </h1>
          <p className="text-sm text-gray-500">
            Quản lý quy trình nhân sự vào / ra
          </p>
        </div>
        {activeTab === "onboarding" ? (
          <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200">
            <UserPlus size={18} /> Tiếp nhận nhân viên
          </Button>
        ) : (
          <Button className="flex items-center gap-2 bg-orange-400 hover:bg-orange-600 text-white shadow-lg shadow-orange-200">
            <UserMinus size={18} /> Tạo yêu cầu nghỉ việc
          </Button>
        )}
      </div>

      {/* --- TABS --- */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit shrink-0">
        <button
          onClick={() => {
            setActiveTab("onboarding");
            setSelectedId(onboardingList[0].id);
          }}
          className={`flex items-center gap-2 px-6 py-2 rounded-md text-sm font-bold transition-all
            ${
              activeTab === "onboarding"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }
          `}
        >
          <UserPlus size={18} /> Onboarding
        </button>
        <button
          onClick={() => {
            setActiveTab("offboarding");
            setSelectedId(offboardingList[0].id);
          }}
          className={`flex items-center gap-2 px-6 py-2 rounded-md text-sm font-bold transition-all
            ${
              activeTab === "offboarding"
                ? "bg-white text-orange-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }
          `}
        >
          <UserMinus size={18} /> Offboarding
        </button>
      </div>

      {/* --- MAIN CONTENT (SPLIT VIEW) --- */}
      <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
        {/* LEFT: EMPLOYEE LIST (Chiếm 4 phần) */}
        <Card className="flex-[4] flex flex-col p-0 overflow-hidden border border-gray-200 shadow-sm">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-xs font-bold uppercase text-gray-500">
              Danh sách{" "}
              {activeTab === "onboarding"
                ? "nhân viên mới"
                : "nhân viên nghỉ việc"}
            </h3>
          </div>
          <div className="overflow-y-auto p-2 space-y-2">
            {currentList.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                className={`
                       p-4 rounded-lg cursor-pointer border transition-all hover:shadow-md
                       ${
                         selectedId === item.id
                           ? "bg-blue-50 border-blue-200 ring-1 ring-blue-100"
                           : "bg-white border-gray-100 hover:bg-gray-50"
                       }
                    `}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                             ${
                               activeTab === "onboarding"
                                 ? "bg-blue-100 text-blue-600"
                                 : "bg-orange-100 text-orange-600"
                             }
                          `}
                    >
                      {item.avatar}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 text-sm">
                        {item.name}
                      </h4>
                      <p className="text-xs text-gray-500">{item.position}</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-400" />
                </div>

                {/* Meta Info */}
                <div className="flex justify-between items-end">
                  <div className="text-xs text-gray-500 space-y-1">
                    {activeTab === "onboarding" ? (
                      <>
                        <p className="flex items-center gap-1">
                          <Calendar size={12} /> Start: {item.joinDate}
                        </p>
                        <p className="flex items-center gap-1">
                          <UserCheck size={12} /> Mentor: {item.mentor}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="flex items-center gap-1">
                          <Calendar size={12} /> Last day: {item.leaveDate}
                        </p>
                        <p className="flex items-center gap-1 text-red-500">
                          <AlertTriangle size={12} /> {item.reason}
                        </p>
                      </>
                    )}
                  </div>

                  {/* Circular Progress or Badges */}
                  <div className="text-right">
                    <span className="text-xs font-bold text-blue-600">
                      {item.progress}%
                    </span>
                    <div className="w-16 h-1.5 bg-gray-200 rounded-full mt-1">
                      <div
                        className={`h-1.5 rounded-full ${
                          activeTab === "onboarding"
                            ? "bg-blue-500"
                            : "bg-orange-500"
                        }`}
                        style={{ width: `${item.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* RIGHT: CHECKLIST DETAIL (Chiếm 6 phần) */}
        <Card className="flex-[6] flex flex-col p-0 overflow-hidden border border-gray-200 shadow-sm bg-white">
          {currentDetail ? (
            <>
              {/* Header Detail */}
              <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50/30">
                <div className="flex gap-4">
                  <div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold shadow-sm
                          ${
                            activeTab === "onboarding"
                              ? "bg-white text-blue-600 border border-blue-100"
                              : "bg-white text-orange-600 border border-orange-100"
                          }
                       `}
                  >
                    {currentDetail.avatar}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      {currentDetail.name}
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <span className="font-medium bg-gray-100 px-2 py-0.5 rounded">
                        {currentDetail.position}
                      </span>
                      <span>•</span>
                      <span>
                        {activeTab === "onboarding"
                          ? `Ngày vào: ${currentDetail.joinDate}`
                          : `Ngày nghỉ: ${currentDetail.leaveDate}`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress Overview */}
                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                    Tiến độ quy trình
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-gray-200 rounded-full">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          activeTab === "onboarding"
                            ? "bg-green-500"
                            : "bg-orange-500"
                        }`}
                        style={{ width: `${currentDetail.progress}%` }}
                      ></div>
                    </div>
                    <span className="font-bold text-sm">
                      {currentDetail.progress}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Checklist Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-gray-800 uppercase mb-4 flex items-center gap-2">
                    <CheckSquare size={18} className="text-gray-400" /> Danh
                    sách công việc cần làm
                  </h3>

                  <div className="space-y-3 relative">
                    {/* Vertical Line Connector */}
                    <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-gray-100 -z-10"></div>

                    {currentDetail.tasks.map((task, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-4 group"
                      >
                        {/* Checkbox Circle */}
                        <div
                          className={`
                                   w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 bg-white transition-colors z-10
                                   ${
                                     task.status === "Done"
                                       ? "border-green-500 text-green-500 bg-green-50"
                                       : "border-gray-300 text-transparent hover:border-blue-400"
                                   }
                                `}
                        >
                          <CheckSquare
                            size={14}
                            fill={
                              task.status === "Done" ? "currentColor" : "none"
                            }
                          />
                        </div>

                        {/* Task Card */}
                        <div
                          className={`flex-1 p-4 rounded-lg border transition-all
                                   ${
                                     task.status === "Done"
                                       ? "bg-gray-50 border-gray-200 opacity-70"
                                       : "bg-white border-gray-200 shadow-sm hover:border-blue-300"
                                   }
                                `}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4
                              className={`font-semibold text-sm ${
                                task.status === "Done"
                                  ? "text-gray-500 line-through"
                                  : "text-gray-800"
                              }`}
                            >
                              {task.title}
                            </h4>
                            <StatusBadge status={task.status} />
                          </div>

                          <div className="flex justify-between items-center text-xs text-gray-500 border-t border-gray-100 pt-2 mt-2">
                            <div className="flex items-center gap-2">
                              <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-medium flex items-center gap-1">
                                {getAssigneeIcon(task.assignee)} {task.assignee}
                              </span>
                            </div>
                            <div
                              className={`flex items-center gap-1 font-medium ${
                                task.status === "Pending" ? "text-red-500" : ""
                              }`}
                            >
                              <Clock size={12} /> Deadline: {task.deadline}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              Chọn nhân viên để xem chi tiết
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

// Helper để chọn icon cho người phụ trách
const getAssigneeIcon = (role) => {
  if (role.includes("IT")) return <Monitor size={10} />;
  if (role.includes("HR")) return <FileText size={10} />;
  if (role.includes("Mentor") || role.includes("Manager"))
    return <UserCheck size={10} />;
  return <Shield size={10} />;
};

export default OnboardingOffboarding;
