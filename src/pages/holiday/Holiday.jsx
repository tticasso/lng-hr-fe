import React, { useState, useEffect } from "react";
import { Calendar, Plus, Edit, Trash2, X, Clock } from "lucide-react";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import { holidayAPI } from "../../apis/holidayAPI";
import { toast } from "react-toastify";

const Holiday = () => {
  const [activeTab, setActiveTab] = useState("holidays");
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    note: "",
    holidayType: "PUBLIC_HOLIDAY",
    isWorkDay: false,
    appliedDepartments: [],
    appliedRoles: [],
  });

  // Menu items cho sidebar
  const menuItems = [
    {
      id: "holidays",
      label: "Lịch nghỉ",
      icon: <Calendar size={18} />,
      desc: "Quản lý ngày nghỉ lễ",
    },
    {
      id: "schedules",
      label: "Ca làm việc",
      icon: <Clock size={18} />,
      desc: "Quản lý ca làm việc",
    },
  ];

  // Fetch holidays từ API
  const fetchHolidays = async () => {
    try {
      setLoading(true);
      const res = await holidayAPI.get();
      const holidayData = res.data?.data || [];
      setHolidays(holidayData);
    } catch (error) {
      console.error("Error fetching holidays:", error);
      toast.error("Không thể tải dữ liệu lịch nghỉ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  // Format ngày cho card display
  const formatDateForCard = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return { day, month, year };
  };

  // Open modal thêm mới
  const handleAdd = () => {
    setEditingHoliday(null);
    setFormData({
      name: "",
      date: "",
      note: "",
      holidayType: "PUBLIC_HOLIDAY",
      isWorkDay: false,
      appliedDepartments: [],
      appliedRoles: [],
    });
    setIsModalOpen(true);
  };

  // Open modal sửa
  const handleEdit = (holiday) => {
    setEditingHoliday(holiday);
    setFormData({
      name: holiday.name,
      date: holiday.date.split("T")[0], // Convert ISO to YYYY-MM-DD
      note: holiday.note || "",
      holidayType: holiday.holidayType,
      isWorkDay: holiday.isWorkDay,
      appliedDepartments: holiday.appliedDepartments || [],
      appliedRoles: holiday.appliedRoles || [],
    });
    setIsModalOpen(true);
  };

  // Submit form (thêm hoặc sửa)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.date) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      if (editingHoliday) {
        // Update
        await holidayAPI.update(editingHoliday._id, formData);
        toast.success("Cập nhật ngày nghỉ thành công");
      } else {
        // Create
        await holidayAPI.create(formData);
        toast.success("Thêm ngày nghỉ thành công");
      }

      setIsModalOpen(false);
      fetchHolidays();
    } catch (error) {
      console.error("Error saving holiday:", error);
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  // Xóa holiday
  const handleDelete = async (holiday) => {
    if (!window.confirm(`Bạn có chắc muốn xóa "${holiday.name}"?`)) {
      return;
    }

    try {
      await holidayAPI.delete(holiday._id);
      toast.success("Xóa ngày nghỉ thành công");
      fetchHolidays();
    } catch (error) {
      console.error("Error deleting holiday:", error);
      toast.error("Không thể xóa ngày nghỉ");
    }
  };

  // Render nội dung Lịch nghỉ
  const renderHolidays = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Danh sách Ngày lễ</h2>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý các ngày nghỉ lễ, tết trong năm
          </p>
        </div>

        <Button
          onClick={handleAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
        >
          <Plus size={18} />
          Thêm ngày lễ
        </Button>
      </div>

      {/* Holiday List */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-sm text-gray-500">Đang tải dữ liệu...</p>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
          {holidays.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              Chưa có ngày nghỉ lễ nào
            </div>
          ) : (
            holidays.map((holiday) => {
              const { day, month, year } = formatDateForCard(holiday.date);
              return (
                <div
                  key={holiday._id}
                  className="flex justify-between items-center p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {/* Date Card */}
                    <div className="p-3 bg-red-50 text-red-600 rounded-lg font-bold flex flex-col items-center min-w-[70px]">
                      <span className="text-xs uppercase">
                        {month}/{year}
                      </span>
                      <span className="text-2xl">{day}</span>
                    </div>

                    {/* Holiday Info */}
                    <div>
                      <p className="font-bold text-gray-800 flex items-center gap-2">
                        {holiday.name}
                        {holiday.holidayType === "PUBLIC_HOLIDAY" ? (
                          <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-medium">
                            Ngày lễ quốc gia
                          </span>
                        ) : (
                          <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">
                            Ngày nghỉ công ty
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {holiday.note || "Không có ghi chú"}
                      </p>
                      <div className="mt-1">
                        {holiday.isWorkDay ? (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-medium">
                            Làm việc
                          </span>
                        ) : (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-medium">
                            Nghỉ làm
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(holiday)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Sửa"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(holiday)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Xóa"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );

  // Render nội dung Ca làm việc (placeholder)
  const renderSchedules = () => (
    <div className="flex flex-col items-center justify-center h-full text-gray-400 animate-in fade-in">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Clock size={32} className="opacity-30" />
      </div>
      <p className="font-medium">Chức năng Ca làm việc đang được phát triển</p>
    </div>
  );

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col md:flex-row gap-6">
      {/* --- LEFT SIDEBAR: MENU --- */}
      <Card className="w-full md:w-72 flex-shrink-0 p-2 h-full overflow-y-auto">
        <div className="px-4 py-3 mb-2">
          <h3 className="font-bold text-gray-800 uppercase text-xs tracking-wider flex items-center gap-2">
            <Calendar size={16} />
            Quản lý thời gian
          </h3>
        </div>
        <div className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all text-left group ${
                activeTab === item.id
                  ? "bg-blue-50 text-blue-700 shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <span
                className={`${
                  activeTab === item.id
                    ? "text-blue-600"
                    : "text-gray-400 group-hover:text-gray-600"
                }`}
              >
                {item.icon}
              </span>
              <div className="flex-1">
                <p>{item.label}</p>
              </div>
              {activeTab === item.id && (
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
              )}
            </button>
          ))}
        </div>
      </Card>

      {/* --- RIGHT CONTENT AREA --- */}
      <Card className="flex-1 h-full overflow-y-auto p-6 md:p-8 border border-gray-200 shadow-sm bg-white">
        {activeTab === "holidays" && renderHolidays()}
        {activeTab === "schedules" && renderSchedules()}
      </Card>

      {/* Modal Thêm/Sửa */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800">
                {editingHoliday ? "Sửa ngày nghỉ" : "Thêm ngày nghỉ mới"}
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X size={20} className="text-gray-400 hover:text-red-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên ngày nghỉ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="VD: Tết Nguyên Đán"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loại ngày nghỉ
                </label>
                <select
                  value={formData.holidayType}
                  onChange={(e) => setFormData({ ...formData, holidayType: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="PUBLIC_HOLIDAY">Ngày lễ quốc gia</option>
                  <option value="SUBSTITUTE_WORK_DAY">Ngày làm việc bù</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ghi chú
                </label>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  rows="3"
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="VD: 1/1 Âm lịch"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isWorkDay"
                  checked={formData.isWorkDay}
                  onChange={(e) => setFormData({ ...formData, isWorkDay: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="isWorkDay" className="text-sm text-gray-700">
                  Vẫn làm việc trong ngày này
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Hủy
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                  {editingHoliday ? "Cập nhật" : "Thêm mới"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Holiday;
