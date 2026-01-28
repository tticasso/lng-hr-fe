import React, { useState } from "react";
import {
  BookOpen,
  Award,
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  Calendar,
  Users,
  Clock,
  Star,
  CheckCircle2,
  X,
  ChevronRight,
  Target,
  UserCheck,
} from "lucide-react";

// Import UI Kit
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import StatusBadge from "../../components/common/StatusBadge";

const TrainingPerformance = () => {
  const [activeTab, setActiveTab] = useState("training");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [reviewFilter, setReviewFilter] = useState("Q4 2025");

  // --- MOCK DATA: TRAINING ---
  const courses = [
    {
      id: 1,
      title: "React Advanced Patterns",
      type: "Hard Skill",
      dept: "Product Engineering",
      participants: 12,
      status: "On-going",
      startDate: "01/12/2025",
      endDate: "15/12/2025",
      trainer: "Senior Architect",
      description:
        "Khóa học chuyên sâu về Higher-Order Components, Render Props, và Custom Hooks tối ưu hiệu năng.",
    },
    {
      id: 2,
      title: "Kỹ năng Giao tiếp Hiệu quả",
      type: "Soft Skill",
      dept: "All Departments",
      participants: 45,
      status: "Upcoming",
      startDate: "20/12/2025",
      endDate: "20/12/2025",
      trainer: "HR Director",
      description:
        "Workshop tương tác giúp cải thiện kỹ năng lắng nghe và phản hồi trong môi trường công sở.",
    },
    {
      id: 3,
      title: "Quản lý dự án Agile/Scrum",
      type: "Management",
      dept: "Project Manager",
      participants: 8,
      status: "Finished",
      startDate: "10/11/2025",
      endDate: "12/11/2025",
      trainer: "Scrum Master",
      description: "Đào tạo lấy chứng chỉ Scrum Master cơ bản.",
    },
  ];

  // --- MOCK DATA: PERFORMANCE ---
  const reviews = [
    {
      id: 101,
      name: "Nguyễn Văn An",
      dept: "Product",
      leader: "Trần Thị B",
      status: "Completed",
      rating: 4.5,
      selfStatus: "Done",
      leaderStatus: "Done",
      avatar: "NA",
    },
    {
      id: 102,
      name: "Lê Thị Hoa",
      dept: "Design",
      leader: "Nguyễn Văn C",
      status: "In Progress",
      rating: null,
      selfStatus: "Done",
      leaderStatus: "Pending",
      avatar: "LH",
    },
    {
      id: 103,
      name: "Phạm Văn Dũng",
      dept: "Marketing",
      leader: "Lê Văn E",
      status: "Not Started",
      rating: null,
      selfStatus: "Pending",
      leaderStatus: "Pending",
      avatar: "PD",
    },
  ];

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col gap-6">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Training & Performance
          </h1>
          <p className="text-sm text-gray-500">
            Quản lý đào tạo và đánh giá năng lực nhân viên
          </p>
        </div>

        {activeTab === "training" && (
          <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200">
            <Plus size={18} /> Tạo khóa đào tạo
          </Button>
        )}
        {activeTab === "performance" && (
          <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200">
            <Plus size={18} /> Tạo kỳ đánh giá mới
          </Button>
        )}
      </div>

      {/* --- TABS --- */}
      <div className="flex items-center justify-between border-b border-gray-200 shrink-0">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab("training")}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 
                  ${
                    activeTab === "training"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }
               `}
          >
            <BookOpen size={18} /> Training (Đào tạo)
          </button>
          <button
            onClick={() => setActiveTab("performance")}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 
                  ${
                    activeTab === "performance"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }
               `}
          >
            <Award size={18} /> Performance Review (Đánh giá)
          </button>
        </div>
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="flex-1 min-h-0 overflow-hidden relative">
        {/* VIEW 1: TRAINING LIST */}
        {activeTab === "training" && (
          <div className="h-full overflow-y-auto pr-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <Card
                  key={course.id}
                  className="hover:shadow-md transition-shadow cursor-pointer flex flex-col h-full group"
                  onClick={() => setSelectedCourse(course)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase
                              ${
                                course.type.includes("Hard")
                                  ? "bg-blue-50 text-blue-700"
                                  : "bg-purple-50 text-purple-700"
                              }
                           `}
                    >
                      {course.type}
                    </span>
                    <StatusBadge status={course.status} />
                  </div>

                  <h3 className="font-bold text-gray-800 text-lg mb-2 group-hover:text-blue-600 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
                    {course.description}
                  </p>

                  <div className="border-t border-gray-100 pt-4 space-y-2 text-sm text-gray-600">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-gray-400">
                        <Calendar size={14} /> Thời gian:
                      </span>
                      <span className="font-medium">{course.startDate}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-gray-400">
                        <Users size={14} /> Học viên:
                      </span>
                      <span className="font-medium">
                        {course.participants} người
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-gray-400">
                        <UserCheck size={14} /> Trainer:
                      </span>
                      <span className="font-medium">{course.trainer}</span>
                    </div>
                  </div>
                </Card>
              ))}

              {/* Empty State / Add New Placeholder */}
              <div className="border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-400 min-h-[250px] hover:border-blue-300 hover:bg-blue-50/10 cursor-pointer transition">
                <Plus size={40} className="mb-2 opacity-50" />
                <span className="font-medium">Tạo khóa học mới</span>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: PERFORMANCE REVIEW TABLE */}
        {activeTab === "performance" && (
          <Card className="flex flex-col h-full p-0 overflow-hidden border border-gray-200">
            {/* Toolbar */}
            <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row gap-4 justify-between bg-gray-50">
              <div className="relative max-w-sm w-full">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Tìm nhân viên..."
                  className="pl-9 pr-4 py-2 w-full border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Kỳ đánh giá:</span>
                <select
                  value={reviewFilter}
                  onChange={(e) => setReviewFilter(e.target.value)}
                  className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 font-medium"
                >
                  <option>Q4 2025</option>
                  <option>Q3 2025</option>
                  <option>Yearly 2024</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-200 uppercase text-xs sticky top-0 z-10">
                  <tr>
                    <th className="p-4">Nhân viên</th>
                    <th className="p-4">Phòng ban</th>
                    <th className="p-4">Quản lý (Reviewer)</th>
                    <th className="p-4 text-center">Self Review</th>
                    <th className="p-4 text-center">Manager Review</th>
                    <th className="p-4 text-center">Kết quả</th>
                    <th className="p-4 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {reviews.map((review) => (
                    <tr
                      key={review.id}
                      className="hover:bg-gray-50 cursor-pointer group"
                      onClick={() => setSelectedReview(review)}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                            {review.avatar}
                          </div>
                          <span className="font-bold text-gray-800">
                            {review.name}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-gray-600">{review.dept}</td>
                      <td className="p-4 text-gray-600">{review.leader}</td>
                      <td className="p-4 text-center">
                        {review.selfStatus === "Done" ? (
                          <CheckCircle2
                            size={18}
                            className="text-green-500 mx-auto"
                          />
                        ) : (
                          <Clock size={18} className="text-gray-300 mx-auto" />
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {review.leaderStatus === "Done" ? (
                          <CheckCircle2
                            size={18}
                            className="text-green-500 mx-auto"
                          />
                        ) : (
                          <Clock size={18} className="text-gray-300 mx-auto" />
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {review.status === "Completed" ? (
                          <div className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded font-bold border border-yellow-200">
                            {review.rating}{" "}
                            <Star size={12} fill="currentColor" />
                          </div>
                        ) : (
                          <StatusBadge status={review.status} />
                        )}
                      </td>
                      <td className="p-4">
                        <ChevronRight
                          size={16}
                          className="text-gray-400 group-hover:text-blue-500"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* --- OVERLAY PANEL: COURSE DETAIL --- */}
      {selectedCourse && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-[1px]"
          onClick={() => setSelectedCourse(null)}
        >
          <div
            className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-gray-100 flex justify-between items-start bg-gray-50">
              <div>
                <span className="text-xs font-bold uppercase text-blue-600 mb-1 block">
                  {selectedCourse.type}
                </span>
                <h2 className="text-xl font-bold text-gray-800">
                  {selectedCourse.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedCourse(null)}
                className="text-gray-400 hover:text-red-500"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="space-y-2">
                <h3 className="font-bold text-gray-800 text-sm uppercase">
                  Mô tả khóa học
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {selectedCourse.description}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-blue-600 font-semibold uppercase">
                    Ngày bắt đầu
                  </p>
                  <p className="font-bold text-gray-800">
                    {selectedCourse.startDate}
                  </p>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <p className="text-xs text-orange-600 font-semibold uppercase">
                    Số lượng
                  </p>
                  <p className="font-bold text-gray-800">
                    {selectedCourse.participants} Học viên
                  </p>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-gray-800 text-sm uppercase">
                    Danh sách học viên
                  </h3>
                  <button className="text-xs text-blue-600 hover:underline">
                    Xuất Excel
                  </button>
                </div>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 border-b border-gray-100 last:border-0 hover:bg-gray-50"
                    >
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">
                        HV
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">
                          Nhân viên {i}
                        </p>
                        <p className="text-xs text-gray-500">Product Team</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-gray-200">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Chỉnh sửa khóa học
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* --- OVERLAY PANEL: REVIEW DETAIL --- */}
      {selectedReview && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-[1px]"
          onClick={() => setSelectedReview(null)}
        >
          <div
            className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Review Header */}
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-lg font-bold text-blue-600">
                  {selectedReview.avatar}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">
                    {selectedReview.name}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {selectedReview.dept} • {reviewFilter}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={selectedReview.status} />
                <button
                  onClick={() => setSelectedReview(null)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Review Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Section 1: Objectives */}
              <div className="space-y-3">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <Target size={18} className="text-blue-500" /> Mục tiêu
                  (Objectives)
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle2
                      size={16}
                      className="text-green-500 mt-0.5 shrink-0"
                    />
                    <span className="text-sm text-gray-700">
                      Hoàn thành dự án HR Portal đúng hạn (Trọng số 40%)
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2
                      size={16}
                      className="text-green-500 mt-0.5 shrink-0"
                    />
                    <span className="text-sm text-gray-700">
                      Đạt chứng chỉ AWS Solutions Architect (Trọng số 30%)
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock
                      size={16}
                      className="text-orange-500 mt-0.5 shrink-0"
                    />
                    <span className="text-sm text-gray-700">
                      Đào tạo 2 Junior Dev (Trọng số 30%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 2: Reviews Side-by-Side */}
              <div className="grid grid-cols-2 gap-6">
                {/* Self Review */}
                <div className="space-y-2">
                  <h4 className="font-bold text-gray-700 text-sm uppercase">
                    Self Review
                  </h4>
                  <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 min-h-[150px]">
                    <p className="text-sm text-gray-600 italic">
                      "Tôi đã hoàn thành tốt các mục tiêu đề ra. Tuy nhiên phần
                      đào tạo Junior còn hơi chậm do dự án gấp."
                    </p>
                    <div className="mt-4 pt-4 border-t border-blue-100 flex justify-between items-center">
                      <span className="text-xs font-bold text-blue-600">
                        Tự đánh giá:
                      </span>
                      <span className="font-bold text-gray-800">4.0/5</span>
                    </div>
                  </div>
                </div>

                {/* Manager Review */}
                <div className="space-y-2">
                  <h4 className="font-bold text-gray-700 text-sm uppercase">
                    Manager Review
                  </h4>
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm min-h-[150px]">
                    <textarea
                      className="w-full h-24 text-sm border-none focus:ring-0 resize-none p-0 text-gray-700"
                      placeholder="Nhập nhận xét của quản lý..."
                      defaultValue="Nhân sự có năng lực tốt, chủ động trong công việc..."
                    ></textarea>
                    <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-500">
                        Đánh giá chốt:
                      </span>
                      <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded border border-yellow-200">
                        <input
                          type="number"
                          className="w-12 bg-transparent text-right font-bold text-sm outline-none"
                          defaultValue={4.5}
                        />
                        <Star
                          size={12}
                          className="text-yellow-600"
                          fill="currentColor"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <Button variant="secondary">Lưu nháp</Button>
              <Button className="bg-green-600 hover:bg-green-700 text-white shadow-md">
                Hoàn tất đánh giá
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingPerformance;
