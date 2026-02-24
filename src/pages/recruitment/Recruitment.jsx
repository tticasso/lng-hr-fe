import React, { useState } from "react";
import {
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  MapPin,
  Users,
  Briefcase,
  Clock,
  Linkedin,
  Globe,
  UserPlus,
  FileText,
  Calendar,
  Phone,
  Mail,
  X,
} from "lucide-react";

// Import UI Kit
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import StatusBadge from "../../components/common/StatusBadge";

const Recruitment = () => {
  const [activeTab, setActiveTab] = useState("jobs");
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // --- MOCK DATA ---

  // 1. Jobs Data
  const jobs = [
    {
      id: 1,
      title: "Seller",
      dept: "Product",
      location: "Hà Nội (Hybrid)",
      candidates: 12,
      status: "Open",
      type: "Full-time",
    },
    {
      id: 2,
      title: "UI/UX Designer",
      dept: "Design",
      location: "Hồ Chí Minh",
      candidates: 8,
      status: "Open",
      type: "Full-time",
    },
    {
      id: 3,
      title: "Marketing Intern",
      dept: "Marketing",
      location: "Hà Nội",
      candidates: 25,
      status: "On Hold",
      type: "Internship",
    },
    {
      id: 4,
      title: "Project Manager",
      dept: "Product",
      location: "Remote",
      candidates: 5,
      status: "Closed",
      type: "Contract",
    },
  ];

  // 2. Kanban Columns
  const pipelineColumns = [
    { id: "applied", title: "Applied", color: "border-blue-500" },
    { id: "screening", title: "Screening", color: "border-purple-500" },
    { id: "interview", title: "Interview", color: "border-orange-500" },
    { id: "offer", title: "Offer", color: "border-yellow-500" },
    { id: "hired", title: "Hired", color: "border-green-500" },
    { id: "rejected", title: "Rejected", color: "border-gray-500" },
  ];

  // 3. Candidates Data
  const candidates = [
    {
      id: 1,
      name: "Nguyễn Văn A",
      job: "Senior React Developer",
      source: "LinkedIn",
      date: "2 mins ago",
      status: "applied",
      avatar: "NA",
    },
    {
      id: 2,
      name: "Trần Thị B",
      job: "UI/UX Designer",
      source: "Referral",
      date: "1 hour ago",
      status: "applied",
      avatar: "TB",
    },
    {
      id: 3,
      name: "Lê Văn C",
      job: "Senior React Developer",
      source: "TopCV",
      date: "1 day ago",
      status: "screening",
      avatar: "LC",
    },
    {
      id: 4,
      name: "Phạm Minh D",
      job: "Project Manager",
      source: "LinkedIn",
      date: "2 days ago",
      status: "interview",
      avatar: "PD",
    },
    {
      id: 5,
      name: "Hoàng Tùng",
      job: "Marketing Intern",
      source: "Facebook",
      date: "3 days ago",
      status: "offer",
      avatar: "HT",
    },
    {
      id: 6,
      name: "Đỗ Mai",
      job: "Senior React Developer",
      source: "Referral",
      date: "1 week ago",
      status: "hired",
      avatar: "DM",
    },
  ];

  // Helper render Source Tag
  const renderSourceTag = (source) => {
    let style = "bg-gray-100 text-gray-600";
    let icon = <Globe size={10} />;

    if (source === "LinkedIn") {
      style = "bg-blue-50 text-blue-700";
      icon = <Linkedin size={10} />;
    }
    if (source === "Referral") {
      style = "bg-purple-50 text-purple-700";
      icon = <UserPlus size={10} />;
    }

    return (
      <span
        className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${style}`}
      >
        {icon} {source}
      </span>
    );
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col gap-6">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý tuyển dụng (Not yet active)</h1>
          <p className="text-sm text-gray-500">
            Quản lý tin tuyển dụng & theo dõi ứng viên
          </p>
        </div>

        {activeTab === "jobs" ? (
          <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200">
            <Plus size={18} /> Tạo Job mới
          </Button>
        ) : (
          <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200">
            <Plus size={18} /> Thêm ứng viên
          </Button>
        )}
      </div>

      {/* --- TABS NAVIGATION --- */}
      <div className="flex items-center justify-between border-b border-gray-200 shrink-0">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab("jobs")}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 
              ${
                activeTab === "jobs"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }
            `}
          >
            <Briefcase size={18} /> Jobs (Tin tuyển dụng)
          </button>
          <button
            onClick={() => setActiveTab("candidates")}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 
              ${
                activeTab === "candidates"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }
            `}
          >
            <Users size={18} /> Candidates (Pipeline)
          </button>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex gap-2 pb-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
            />
            <Search
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>
          <Button variant="secondary" className="px-3 py-1.5 h-auto text-xs">
            <Filter size={14} className="mr-1" /> Filter
          </Button>
        </div>
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {/* VIEW 1: JOBS LIST */}
        {activeTab === "jobs" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto h-full pr-1 pb-4">
            {jobs.map((job) => (
              <Card
                key={job.id}
                className="flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer group"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div
                      className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase
                         ${
                           job.status === "Open"
                             ? "bg-green-50 text-green-700"
                             : job.status === "Closed"
                             ? "bg-gray-100 text-gray-500"
                             : "bg-orange-50 text-orange-600"
                         }
                      `}
                    >
                      {job.status}
                    </div>
                    <button className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition">
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
                  <h3 className="font-bold text-gray-800 text-lg mb-1 line-clamp-1">
                    {job.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">{job.dept}</p>

                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <MapPin size={14} className="text-gray-400" />{" "}
                      {job.location}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Clock size={14} className="text-gray-400" /> {job.type}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="w-6 h-6 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[8px] text-gray-500"
                      >
                        U{i}
                      </div>
                    ))}
                    <div className="w-6 h-6 rounded-full border-2 border-white bg-blue-50 flex items-center justify-center text-[8px] font-bold text-blue-600">
                      +{job.candidates}
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-blue-600 hover:underline">
                    Chi tiết
                  </span>
                </div>
              </Card>
            ))}

            {/* Add New Placeholder */}
            <div className="border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/10 cursor-pointer transition min-h-[200px]">
              <Plus size={32} className="mb-2" />
              <span className="font-medium text-sm">Tạo Job mới</span>
            </div>
          </div>
        )}

        {/* VIEW 2: KANBAN BOARD */}
        {activeTab === "candidates" && (
          <div className="flex h-full gap-4 overflow-x-auto pb-2">
            {pipelineColumns.map((col) => {
              const colCandidates = candidates.filter(
                (c) => c.status === col.id
              );
              return (
                <div
                  key={col.id}
                  className="w-72 flex-shrink-0 flex flex-col bg-gray-50 rounded-xl border border-gray-200 max-h-full"
                >
                  {/* Column Header */}
                  <div
                    className={`p-3 border-b border-gray-200 flex justify-between items-center bg-white rounded-t-xl border-t-4 ${col.color}`}
                  >
                    <span className="font-bold text-sm text-gray-700">
                      {col.title}
                    </span>
                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-bold">
                      {colCandidates.length}
                    </span>
                  </div>

                  {/* Draggable Area */}
                  <div className="p-2 flex-1 overflow-y-auto space-y-2">
                    {colCandidates.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => setSelectedCandidate(c)}
                        className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm hover:shadow-md cursor-pointer transition active:scale-95 group"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-bold text-sm text-gray-800 group-hover:text-blue-600">
                            {c.name}
                          </span>
                          {renderSourceTag(c.source)}
                        </div>
                        <p className="text-xs text-gray-500 mb-3 line-clamp-1">
                          {c.job}
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-gray-400">
                          <span>{c.date}</span>
                          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 text-blue-600 flex items-center justify-center font-bold text-[8px] border border-white shadow-sm">
                            {c.avatar}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* --- DETAIL MODAL (SIDE PANEL) --- */}
      {selectedCandidate && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-[1px]"
          onClick={() => setSelectedCandidate(null)}
        >
          <div
            className="bg-white w-full max-w-md h-full shadow-2xl p-0 flex flex-col animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()} // Chặn click xuyên qua để ko đóng modal
          >
            {/* Panel Header */}
            <div className="p-5 border-b border-gray-100 flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-bold">
                  {selectedCandidate.avatar}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">
                    {selectedCandidate.name}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {selectedCandidate.job}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCandidate(null)}
                className="text-gray-400 hover:text-red-500"
              >
                <X size={20} />
              </button>
            </div>

            {/* Panel Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Status Bar */}
              <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-100">
                <span className="text-xs font-bold text-blue-800 uppercase">
                  Current Stage
                </span>
                <span className="bg-white text-blue-600 px-3 py-1 rounded shadow-sm text-sm font-bold border border-blue-100 capitalize">
                  {selectedCandidate.status}
                </span>
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                <h3 className="font-bold text-gray-800 text-sm uppercase">
                  Thông tin liên hệ
                </h3>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Mail size={16} className="text-gray-400" />{" "}
                  {selectedCandidate.name.toLowerCase().replace(/ /g, ".")}
                  @email.com
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Phone size={16} className="text-gray-400" /> 09xx xxx xxx
                </div>
                <div className="flex items-center gap-3 text-sm text-blue-600 hover:underline cursor-pointer">
                  <Linkedin size={16} /> LinkedIn Profile
                </div>
              </div>

              {/* Attachments */}
              <div className="space-y-3">
                <h3 className="font-bold text-gray-800 text-sm uppercase">
                  Hồ sơ đính kèm
                </h3>
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 text-red-600 rounded">
                      <FileText size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        CV_{selectedCandidate.name}.pdf
                      </p>
                      <p className="text-xs text-gray-400">
                        2.5 MB • Uploaded 2 days ago
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interview Timeline */}
              <div className="space-y-3">
                <h3 className="font-bold text-gray-800 text-sm uppercase">
                  Lịch sử phỏng vấn
                </h3>
                <div className="pl-2 border-l-2 border-gray-200 space-y-4">
                  <div className="pl-4 relative">
                    <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-gray-300"></div>
                    <p className="text-xs text-gray-400 mb-1">
                      Hôm nay, 10:00 AM
                    </p>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <p className="text-sm font-medium text-gray-800">
                        Phỏng vấn chuyên môn (Vòng 2)
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Interviewer: Tech Lead
                      </p>
                      <div className="mt-2 text-xs italic text-gray-600 bg-yellow-50 p-2 rounded border border-yellow-100">
                        "Note: Ứng viên có tư duy tốt, tiếng Anh khá. Cần check
                        kỹ hơn về Next.js."
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Panel Footer */}
            <div className="p-5 border-t border-gray-200 bg-gray-50 flex gap-3">
              <Button
                variant="secondary"
                className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
              >
                Reject
              </Button>
              <Button className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white">
                Move to Offer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recruitment;
