import React, { useState, useEffect } from "react";
import { Calendar, Plus, Edit, Trash2, X, Clock, Eye, Info } from "lucide-react";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import { holidayAPI } from "../../apis/holidayAPI";
import { shitfAPI } from "../../apis/shiftsAPI";
import { toast } from "react-toastify";

const Holiday = () => {
  const [activeTab, setActiveTab] = useState("holidays");
  
  // States cho Holidays
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [selectedHoliday, setSelectedHoliday] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    note: "",
    holidayType: "PUBLIC_HOLIDAY",
    isWorkDay: false,
    appliedDepartments: [],
    appliedRoles: [],
  });

  // States cho Shifts
  const [shifts, setShifts] = useState([]);
  const [loadingShifts, setLoadingShifts] = useState(true);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [isShiftDetailModalOpen, setIsShiftDetailModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [selectedShift, setSelectedShift] = useState(null);
  const [loadingShiftDetail, setLoadingShiftDetail] = useState(false);
  const [shiftFormData, setShiftFormData] = useState({
    name: "",
    shiftCode: "",
    startTime: "",
    endTime: "",
    breakMinutes: 0,
    workHours: 8,
    isDefault: false,
    appliedDepartments: [],
    isActive: true,
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

  // Fetch shifts từ API
  const fetchShifts = async () => {
    try {
      setLoadingShifts(true);
      const res = await shitfAPI.get();
      const shiftData = res.data?.data || [];
      setShifts(shiftData);
    } catch (error) {
      console.error("Error fetching shifts:", error);
      toast.error("Không thể tải dữ liệu ca làm việc");
    } finally {
      setLoadingShifts(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
    fetchShifts();
  }, []);

  // ===== HOLIDAYS FUNCTIONS =====
  
  // Format ngày cho card display
  const formatDateForCard = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return { day, month, year };
  };

  // Format ngày đầy đủ
  const formatFullDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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
      date: holiday.date.split("T")[0],
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
        await holidayAPI.update(editingHoliday._id, formData);
        toast.success("Cập nhật ngày nghỉ thành công");
      } else {
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

  // Xem chi tiết holiday
  const handleViewDetail = async (holidayId) => {
    try {
      setLoadingDetail(true);
      setIsDetailModalOpen(true);
      const res = await holidayAPI.getbyid(holidayId);
      setSelectedHoliday(res.data?.data || res.data);
    } catch (error) {
      console.error("Error fetching holiday detail:", error);
      toast.error("Không thể tải chi tiết ngày nghỉ");
      setIsDetailModalOpen(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  // ===== SHIFTS FUNCTIONS =====
  
  // Open modal thêm shift mới
  const handleAddShift = () => {
    setEditingShift(null);
    setShiftFormData({
      name: "",
      shiftCode: "",
      startTime: "",
      endTime: "",
      breakMinutes: 0,
      workHours: 8,
      isDefault: false,
      appliedDepartments: [],
      isActive: true,
    });
    setIsShiftModalOpen(true);
  };

  // Open modal sửa shift
  const handleEditShift = (shift) => {
    setEditingShift(shift);
    setShiftFormData({
      name: shift.name,
      shiftCode: shift.shiftCode,
      startTime: shift.startTime,
      endTime: shift.endTime,
      breakMinutes: shift.breakMinutes,
      workHours: shift.workHours,
      isDefault: shift.isDefault,
      appliedDepartments: shift.appliedDepartments || [],
      isActive: shift.isActive,
    });
    setIsShiftModalOpen(true);
  };

  // Submit form shift (thêm hoặc sửa)
  const handleSubmitShift = async (e) => {
    e.preventDefault();

    if (!shiftFormData.name.trim() || !shiftFormData.shiftCode.trim() || !shiftFormData.startTime || !shiftFormData.endTime) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    // Chỉ gửi các trường API yêu cầu
    const payload = {
      name: shiftFormData.name,
      shiftCode: shiftFormData.shiftCode,
      startTime: shiftFormData.startTime,
      endTime: shiftFormData.endTime,
      breakMinutes: shiftFormData.breakMinutes,
      workHours: shiftFormData.workHours,
      isDefault: shiftFormData.isDefault,
    };

    try {
      if (editingShift) {
        await shitfAPI.update(editingShift._id, payload);
        toast.success("Cập nhật ca làm việc thành công");
      } else {
        await shitfAPI.create(payload);
        toast.success("Thêm ca làm việc thành công");
      }

      setIsShiftModalOpen(false);
      fetchShifts();
    } catch (error) {
      console.error("Error saving shift:", error);
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  // Xóa shift
  const handleDeleteShift = async (shift) => {
    if (!window.confirm(`Bạn có chắc muốn xóa ca "${shift.name}"?`)) {
      return;
    }

    try {
      await shitfAPI.delete(shift._id);
      toast.success("Xóa ca làm việc thành công");
      fetchShifts();
    } catch (error) {
      console.error("Error deleting shift:", error);
      toast.error("Không thể xóa ca làm việc");
    }
  };

  // Xem chi tiết shift
  const handleViewShiftDetail = async (shiftId) => {
    try {
      setLoadingShiftDetail(true);
      setIsShiftDetailModalOpen(true);
      const res = await shitfAPI.getbyid(shiftId);
      setSelectedShift(res.data?.data || res.data);
    } catch (error) {
      console.error("Error fetching shift detail:", error);
      toast.error("Không thể tải chi tiết ca làm việc");
      setIsShiftDetailModalOpen(false);
    } finally {
      setLoadingShiftDetail(false);
    }
  };

  // ===== RENDER FUNCTIONS =====
  
  // Render nội dung Lịch nghỉ
  const renderHolidays = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Danh sách Ngày lễ</h2>
          <p className="text-sm text-gray-500 mt-1">Quản lý các ngày nghỉ lễ, tết trong năm</p>
        </div>
        <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
          <Plus size={18} /> Thêm ngày lễ
        </Button>
      </div>

      {loading ? (
        <div className="p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-sm text-gray-500">Đang tải dữ liệu...</p>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
          {holidays.length === 0 ? (
            <div className="p-12 text-center text-gray-500">Chưa có ngày nghỉ lễ nào</div>
          ) : (
            holidays.map((holiday) => {
              const { day, month, year } = formatDateForCard(holiday.date);
              return (
                <div key={holiday._id} className="flex justify-between items-center p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-50 text-red-600 rounded-lg font-bold flex flex-col items-center min-w-[70px]">
                      <span className="text-xs uppercase">{month}/{year}</span>
                      <span className="text-2xl">{day}</span>
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 flex items-center gap-2">
                        {holiday.name}
                        {holiday.holidayType === "PUBLIC_HOLIDAY" ? (
                          <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-medium">Ngày lễ quốc gia</span>
                        ) : (
                          <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">Ngày nghỉ công ty</span>
                        )}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">{holiday.note || "Không có ghi chú"}</p>
                      <div className="mt-1">
                        {holiday.isWorkDay ? (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-medium">Làm việc</span>
                        ) : (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-medium">Nghỉ làm</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleViewDetail(holiday._id)} className="p-2 text-gray-400 hover:text-green-600 transition-colors" title="Xem chi tiết">
                      <Eye size={16} />
                    </button>
                    <button onClick={() => handleEdit(holiday)} className="p-2 text-gray-400 hover:text-blue-600 transition-colors" title="Sửa">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(holiday)} className="p-2 text-gray-400 hover:text-red-600 transition-colors" title="Xóa">
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

  // Render nội dung Ca làm việc
  const renderSchedules = () => (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Cấu hình ca làm việc</h2>
        <Button onClick={handleAddShift} className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700">
          <Plus size={16} /> Thêm ca mới
        </Button>
      </div>

      {loadingShifts ? (
        <div className="p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-sm text-gray-500">Đang tải dữ liệu...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {shifts.length === 0 ? (
            <div className="p-12 text-center text-gray-500 border border-gray-200 rounded-lg">
              Chưa có ca làm việc nào. Nhấn "Thêm ca mới" để tạo ca làm việc.
            </div>
          ) : (
            shifts.map((shift) => (
              <div key={shift._id} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-gray-700 flex items-center gap-2">
                      <Clock size={18} /> {shift.name}
                      {shift.isDefault && (
                        <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-medium">
                          Mặc định
                        </span>
                      )}
                      {!shift.isActive && (
                        <span className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-medium">
                          Không hoạt động
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">Mã ca: {shift.shiftCode}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditShift(shift)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Chỉnh sửa"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteShift(shift)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Xóa"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giờ bắt đầu (Check-in)
                    </label>
                    <input
                      type="time"
                      value={shift.startTime}
                      disabled
                      className="w-full border border-gray-300 rounded-lg p-2.5 outline-none bg-white text-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giờ kết thúc (Check-out)
                    </label>
                    <input
                      type="time"
                      value={shift.endTime}
                      disabled
                      className="w-full border border-gray-300 rounded-lg p-2.5 outline-none bg-white text-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giờ làm việc
                    </label>
                    <input
                      type="text"
                      value={`${shift.workHours} giờ`}
                      disabled
                      className="w-full border border-gray-300 rounded-lg p-2.5 outline-none bg-white text-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Thời gian nghỉ
                    </label>
                    <input
                      type="text"
                      value={`${shift.breakMinutes} phút`}
                      disabled
                      className="w-full border border-gray-300 rounded-lg p-2.5 outline-none bg-white text-gray-700"
                    />
                  </div>
                </div>

                {shift.appliedDepartments && shift.appliedDepartments.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Áp dụng cho phòng ban
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {shift.appliedDepartments.map((dept, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium"
                        >
                          {dept}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col md:flex-row gap-6">
      {/* LEFT SIDEBAR */}
      <Card className="w-full md:w-72 flex-shrink-0 p-2 h-full overflow-y-auto">
        <div className="px-4 py-3 mb-2">
          <h3 className="font-bold text-gray-800 uppercase text-xs tracking-wider flex items-center gap-2">
            <Calendar size={16} /> Quản lý thời gian
          </h3>
        </div>
        <div className="space-y-1">
          {menuItems.map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all text-left group ${
                activeTab === item.id ? "bg-blue-50 text-blue-700 shadow-sm" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}>
              <span className={`${activeTab === item.id ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"}`}>
                {item.icon}
              </span>
              <div className="flex-1"><p>{item.label}</p></div>
              {activeTab === item.id && <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>}
            </button>
          ))}
        </div>
      </Card>

      {/* RIGHT CONTENT */}
      <Card className="flex-1 h-full overflow-y-auto p-6 md:p-8 border border-gray-200 shadow-sm bg-white">
        {activeTab === "holidays" && renderHolidays()}
        {activeTab === "schedules" && renderSchedules()}
      </Card>

      {/* Modal Thêm/Sửa Holiday */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800">{editingHoliday ? "Sửa ngày nghỉ" : "Thêm ngày nghỉ mới"}</h3>
              <button onClick={() => setIsModalOpen(false)}><X size={20} className="text-gray-400 hover:text-red-500" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên ngày nghỉ <span className="text-red-500">*</span></label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="VD: Tết Nguyên Đán" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày <span className="text-red-500">*</span></label>
                <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Loại ngày nghỉ</label>
                <select value={formData.holidayType} onChange={(e) => setFormData({ ...formData, holidayType: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="PUBLIC_HOLIDAY">Ngày lễ quốc gia</option>
                  <option value="SUBSTITUTE_WORK_DAY">Ngày làm việc bù</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                <textarea value={formData.note} onChange={(e) => setFormData({ ...formData, note: e.target.value })} rows="3"
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="VD: 1/1 Âm lịch" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isWorkDay" checked={formData.isWorkDay} onChange={(e) => setFormData({ ...formData, isWorkDay: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500" />
                <label htmlFor="isWorkDay" className="text-sm text-gray-700">Vẫn làm việc trong ngày này</label>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Hủy</Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">{editingHoliday ? "Cập nhật" : "Thêm mới"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Thêm/Sửa Shift */}
      {isShiftModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800">{editingShift ? "Sửa ca làm việc" : "Thêm ca làm việc mới"}</h3>
              <button onClick={() => setIsShiftModalOpen(false)}><X size={20} className="text-gray-400 hover:text-red-500" /></button>
            </div>
            <form onSubmit={handleSubmitShift} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên ca làm việc <span className="text-red-500">*</span></label>
                <input type="text" value={shiftFormData.name} onChange={(e) => setShiftFormData({ ...shiftFormData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="VD: Ca hành chính" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mã ca <span className="text-red-500">*</span></label>
                <input type="text" value={shiftFormData.shiftCode} onChange={(e) => setShiftFormData({ ...shiftFormData, shiftCode: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="VD: HC" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giờ bắt đầu <span className="text-red-500">*</span></label>
                  <input type="time" value={shiftFormData.startTime} onChange={(e) => setShiftFormData({ ...shiftFormData, startTime: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giờ kết thúc <span className="text-red-500">*</span></label>
                  <input type="time" value={shiftFormData.endTime} onChange={(e) => setShiftFormData({ ...shiftFormData, endTime: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giờ làm việc</label>
                  <input type="number" value={shiftFormData.workHours} onChange={(e) => setShiftFormData({ ...shiftFormData, workHours: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nghỉ (phút)</label>
                  <input type="number" value={shiftFormData.breakMinutes} onChange={(e) => setShiftFormData({ ...shiftFormData, breakMinutes: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isDefault" checked={shiftFormData.isDefault} onChange={(e) => setShiftFormData({ ...shiftFormData, isDefault: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500" />
                <label htmlFor="isDefault" className="text-sm text-gray-700">Đặt làm ca mặc định</label>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Button type="button" variant="secondary" onClick={() => setIsShiftModalOpen(false)}>Hủy</Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">{editingShift ? "Cập nhật" : "Thêm mới"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Holiday;
