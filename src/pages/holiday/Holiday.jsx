import React, { useCallback, useEffect, useMemo, useState } from "react";
import { BarChart3, Calendar, ChevronDown, Clock, Edit, Eye, Info, Plus, Search, Trash2, Upload, X } from "lucide-react";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import MonthYearPicker from "../../components/common/MonthYearPicker";
import { holidayAPI } from "../../apis/holidayAPI";
import { shitfAPI } from "../../apis/shiftsAPI";
import { useAuth } from "../../context/AuthContext";
import { hasPermission } from "../../utils/authPermissions";
import { toast } from "react-toastify";

const createEmptyBulkHoliday = () => ({
  name: "",
  date: "",
  holidayType: "PUBLIC_HOLIDAY",
  isWorkDay: false,
  note: "",
});

const Holiday = () => {
  const { user } = useAuth();
  const canWriteHolidays = useMemo(() => hasPermission(user, "WRITE_HOLIDAYS"), [user]);
  const canWriteShifts = useMemo(() => hasPermission(user, "WRITE_SHIFTS"), [user]);
  const [activeTab, setActiveTab] = useState("holidays");

  // States cho Holidays
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [selectedHoliday, setSelectedHoliday] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [holidayTemplates, setHolidayTemplates] = useState([]);
  const [holidaySummary, setHolidaySummary] = useState(null);
  const [checkDate, setCheckDate] = useState("");
  const [checkResult, setCheckResult] = useState(null);
  const [bulkRows, setBulkRows] = useState(() => [createEmptyBulkHoliday()]);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [selectedMonthYear, setSelectedMonthYear] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
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
  const [editingShift, setEditingShift] = useState(null);
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
  const fetchHolidays = useCallback(async () => {
    try {
      setLoading(true);
      
      const [year, month] = selectedMonthYear.split("-");
      const res = await holidayAPI.getAll({
        year,
        month: Number(month),
        limit: 100,
      });
      const holidayData = res.data?.data || [];
      setHolidays(holidayData);
    } catch (error) {
      console.error("Error fetching holidays:", error);
      toast.error("Không thể tải dữ liệu lịch nghỉ");
    } finally {
      setLoading(false);
    }
  }, [selectedMonthYear]);

  // Fetch shifts từ API
  const fetchShifts = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchHolidays();
    fetchShifts();
  }, [fetchHolidays, fetchShifts]);

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

  const getHolidayTypeLabel = (holidayType) => {
    if (holidayType === "PUBLIC_HOLIDAY") return "Ngày lễ";
    if (holidayType === "SUBSTITUTE_WORK_DAY") return "Ngày làm bù";
    return "Ngày nghỉ";
  };

  const getCheckResultHoliday = (result) => result?.holiday || result?.data || null;

  // Open modal thêm mới
  const handleAdd = () => {
    if (!canWriteHolidays) {
      toast.error("Bạn không có quyền WRITE_HOLIDAYS để thay đổi ngày nghỉ");
      return;
    }
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
    if (!canWriteHolidays) {
      toast.error("Bạn không có quyền WRITE_HOLIDAYS để thay đổi ngày nghỉ");
      return;
    }
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

  const handleHolidayTypeChange = (holidayType) => {
    setFormData((current) => ({
      ...current,
      holidayType,
      isWorkDay: holidayType === "SUBSTITUTE_WORK_DAY",
    }));
  };

  // Submit form (thêm hoặc sửa)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canWriteHolidays) {
      toast.error("Bạn không có quyền WRITE_HOLIDAYS để thay đổi ngày nghỉ");
      return;
    }

    if (!formData.name.trim() || !formData.date) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      if (editingHoliday) {
        await holidayAPI.update(editingHoliday._id, {
          ...formData,
          appliedDepartments: formData.appliedDepartments.map((dept) =>
            typeof dept === "string" ? dept : dept._id,
          ),
          appliedRoles: formData.appliedRoles.map((role) =>
            typeof role === "string" ? role : role._id,
          ),
        });
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
    if (!canWriteHolidays) {
      toast.error("Bạn không có quyền WRITE_HOLIDAYS để thay đổi ngày nghỉ");
      return;
    }
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

  const handleLoadTemplates = async () => {
    try {
      const res = await holidayAPI.getTemplates();
      setHolidayTemplates(res.data?.data || res.data || []);
      toast.success("Đã tải template ngày nghỉ");
    } catch (error) {
      toast.error(error.normalizedMessage || "Không thể tải template ngày nghỉ");
    }
  };

  const handleLoadYearSummary = async () => {
    try {
      const [year] = selectedMonthYear.split("-");
      const res = await holidayAPI.getYearSummary(year);
      setHolidaySummary(res.data?.data || res.data);
      toast.success("Đã tải tổng hợp năm");
    } catch (error) {
      toast.error(error.normalizedMessage || "Không thể tải tổng hợp năm");
    }
  };

  const handleCheckHoliday = async () => {
    if (!checkDate) {
      toast.warning("Chọn ngày cần kiểm tra");
      return;
    }
    try {
      const res = await holidayAPI.checkDate({ date: checkDate });
      setCheckResult({
        isHoliday: Boolean(res.data?.isHoliday),
        holiday: res.data?.data || null,
      });
    } catch (error) {
      toast.error(error.normalizedMessage || "Kiểm tra ngày nghỉ thất bại");
    }
  };

  const handleCreateAttendanceForHoliday = async (holidayId) => {
    if (!canWriteHolidays) {
      toast.error("Bạn không có quyền WRITE_HOLIDAYS để tạo attendance ngày nghỉ");
      return;
    }
    if (!window.confirm("Tạo attendance records cho ngày nghỉ này?")) return;
    try {
      await holidayAPI.createAttendance(holidayId);
      toast.success("Đã tạo attendance cho ngày nghỉ");
    } catch (error) {
      toast.error(error.normalizedMessage || "Tạo attendance thất bại");
    }
  };

  const handleAddBulkRow = () => {
    setBulkRows((rows) => {
      if (rows.length >= 100) {
        toast.warning("Chỉ import tối đa 100 ngày nghỉ mỗi lần");
        return rows;
      }
      return [...rows, createEmptyBulkHoliday()];
    });
  };

  const handleRemoveBulkRow = (index) => {
    setBulkRows((rows) => {
      if (rows.length === 1) return [createEmptyBulkHoliday()];
      return rows.filter((_, rowIndex) => rowIndex !== index);
    });
  };

  const handleBulkRowChange = (index, field, value) => {
    setBulkRows((rows) =>
      rows.map((row, rowIndex) => {
        if (rowIndex !== index) return row;
        if (field === "holidayType") {
          return {
            ...row,
            holidayType: value,
            isWorkDay: value === "SUBSTITUTE_WORK_DAY" ? true : row.isWorkDay,
          };
        }
        return { ...row, [field]: value };
      }),
    );
  };

  const handleBulkImportHolidays = async () => {
    if (!canWriteHolidays) {
      toast.error("Bạn không có quyền WRITE_HOLIDAYS để import ngày nghỉ");
      return;
    }

    const holidays = bulkRows
      .map((row) => ({
        name: row.name.trim(),
        date: row.date,
        holidayType: row.holidayType,
        isWorkDay: Boolean(row.isWorkDay),
        note: row.note.trim(),
      }))
      .filter((row) => row.name || row.date || row.note);

    if (holidays.length === 0) {
      toast.warning("Thêm ít nhất một ngày nghỉ để import");
      return;
    }

    const invalidIndex = holidays.findIndex((row) => !row.name || !row.date);
    if (invalidIndex >= 0) {
      toast.error(`Dòng ${invalidIndex + 1} cần có tên và ngày`);
      return;
    }

    const payload = {
      holidays: holidays.map((row) => ({
        name: row.name,
        date: row.date,
        holidayType: row.holidayType,
        isWorkDay: row.isWorkDay,
        ...(row.note ? { note: row.note } : {}),
      })),
    };

    if (!window.confirm(`Import ${payload.holidays.length} ngày nghỉ?`)) return;
    try {
      await holidayAPI.bulkImport(payload);
      toast.success("Import ngày nghỉ thành công");
      setBulkRows([createEmptyBulkHoliday()]);
      fetchHolidays();
    } catch (error) {
      toast.error(error.normalizedMessage || "Import ngày nghỉ thất bại");
    }
  };

  // ===== SHIFTS FUNCTIONS =====

  const handleAddShift = () => {
    if (!canWriteShifts) {
      toast.error("Bạn không có quyền WRITE_SHIFTS để thay đổi ca làm việc");
      return;
    }
    setEditingShift(null);
    setShiftFormData({
      name: "",
      shiftCode: "",
      startTime: "08:00",
      endTime: "17:30",
      breakMinutes: 90,
      workHours: 8,
      isDefault: false,
      appliedDepartments: [],
      isActive: true,
    });
    setIsShiftModalOpen(true);
  };

  // Open modal sửa shift
  const handleEditShift = (shift) => {
    if (!canWriteShifts) {
      toast.error("Bạn không có quyền WRITE_SHIFTS để thay đổi ca làm việc");
      return;
    }
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
    if (!canWriteShifts) {
      toast.error("Bạn không có quyền WRITE_SHIFTS để thay đổi ca làm việc");
      return;
    }

    if (!shiftFormData.name.trim() || !shiftFormData.shiftCode.trim() || !shiftFormData.startTime || !shiftFormData.endTime) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    // Chỉ gửi các trường API yêu cầu
    const payload = {
      name: shiftFormData.name.trim(),
      shiftCode: shiftFormData.shiftCode.trim().toUpperCase(),
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
    if (!canWriteShifts) {
      toast.error("Bạn không có quyền WRITE_SHIFTS để thay đổi ca làm việc");
      return;
    }
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

  // ===== RENDER FUNCTIONS =====

  // Render nội dung Lịch nghỉ
  const renderHolidays = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Danh sách Ngày lễ</h2>
          <p className="text-sm text-gray-500 mt-1">Quản lý các ngày nghỉ lễ, tết trong năm</p>
        </div>
        <div className="flex items-center gap-3">
          <MonthYearPicker
            value={selectedMonthYear}
            onChange={(e) => setSelectedMonthYear(e.target.value)}
          />
          {canWriteHolidays && (
            <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
              <Plus size={18} /> Thêm ngày lễ
            </Button>
          )}
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg bg-white">
        <button
          type="button"
          onClick={() => setIsToolsOpen((current) => !current)}
          className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
        >
          <div>
            <p className="text-sm font-semibold text-gray-800">Công cụ nâng cao</p>
            <p className="text-xs text-gray-500 mt-0.5">Kiểm tra ngày nghỉ, xem mẫu từ hệ thống hoặc import hàng loạt khi cần.</p>
          </div>
          <ChevronDown
            size={18}
            className={`text-gray-500 transition-transform ${isToolsOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isToolsOpen && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 border-t border-gray-100 p-4 bg-gray-50">
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <BarChart3 size={16} className="text-blue-600" />
                Mẫu và tổng hợp
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button type="button" variant="secondary" onClick={handleLoadTemplates}>
                  Xem mẫu
                </Button>
                <Button type="button" variant="secondary" onClick={handleLoadYearSummary}>
                  Tổng hợp năm
                </Button>
              </div>
              {(holidayTemplates.length > 0 || holidaySummary) && (
                <div className="mt-3 space-y-3">
                  {holidaySummary && (
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-lg bg-blue-50 p-2">
                        <p className="text-lg font-bold text-blue-700">{holidaySummary.totalPublicHolidays || 0}</p>
                        <p className="text-[11px] text-blue-600">Ngày lễ</p>
                      </div>
                      <div className="rounded-lg bg-orange-50 p-2">
                        <p className="text-lg font-bold text-orange-700">{holidaySummary.totalSubstituteWorkDays || 0}</p>
                        <p className="text-[11px] text-orange-600">Ngày làm bù</p>
                      </div>
                      <div className="rounded-lg bg-green-50 p-2">
                        <p className="text-lg font-bold text-green-700">{holidaySummary.totalWorkDaysInYear || 0}</p>
                        <p className="text-[11px] text-green-600">Công/năm</p>
                      </div>
                    </div>
                  )}

                  {holidayTemplates.length > 0 && (
                    <div className="max-h-36 overflow-auto rounded-lg border border-gray-100">
                      {holidayTemplates.map((template) => (
                        <div key={template.key || template.name} className="border-b border-gray-100 p-2 last:border-0">
                          <p className="text-sm font-semibold text-gray-800">{template.name}</p>
                          <p className="text-xs text-gray-500">{template.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <Search size={16} className="text-green-600" />
                Kiểm tra một ngày
              </div>
              <div className="mt-3 flex gap-2">
                <input
                  type="date"
                  value={checkDate}
                  onChange={(e) => setCheckDate(e.target.value)}
                  className="min-w-0 flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
                <Button type="button" variant="secondary" onClick={handleCheckHoliday}>
                  Kiểm tra
                </Button>
              </div>
              {checkResult && (
                <div className={`mt-3 rounded-lg border p-3 text-sm ${
                  checkResult.isHoliday
                    ? "border-red-200 bg-red-50 text-red-700"
                    : "border-green-200 bg-green-50 text-green-700"
                }`}>
                  {checkResult.isHoliday ? (
                    <div>
                      <p className="font-semibold">Đây là ngày nghỉ</p>
                      <p className="mt-1 text-xs">
                        {getCheckResultHoliday(checkResult)?.name || "Ngày nghỉ"} - {getHolidayTypeLabel(getCheckResultHoliday(checkResult)?.holidayType)}
                      </p>
                    </div>
                  ) : (
                    <p className="font-semibold">Không phải ngày nghỉ</p>
                  )}
                </div>
              )}
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4 xl:col-span-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <Upload size={16} className="text-orange-600" />
                Import nâng cao
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Nhập nhiều ngày nghỉ cùng lúc, không cần thao tác với JSON.
              </p>
              <div className="mt-4 space-y-3">
                {bulkRows.map((row, index) => (
                  <div key={index} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                    <div className="grid grid-cols-1 lg:grid-cols-[minmax(180px,1fr)_160px_190px_120px_40px] gap-2 items-center">
                      <input
                        type="text"
                        value={row.name}
                        onChange={(e) => handleBulkRowChange(index, "name", e.target.value)}
                        className="min-w-0 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                        placeholder="Tên ngày nghỉ"
                      />
                      <input
                        type="date"
                        value={row.date}
                        onChange={(e) => handleBulkRowChange(index, "date", e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                      />
                      <select
                        value={row.holidayType}
                        onChange={(e) => handleBulkRowChange(index, "holidayType", e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                      >
                        <option value="PUBLIC_HOLIDAY">Ngày nghỉ/lễ</option>
                        <option value="SUBSTITUTE_WORK_DAY">Ngày làm bù</option>
                      </select>
                      <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                          type="checkbox"
                          checked={row.isWorkDay}
                          onChange={(e) => handleBulkRowChange(index, "isWorkDay", e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        Làm việc
                      </label>
                      <button
                        type="button"
                        onClick={() => handleRemoveBulkRow(index)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600"
                        title="Xóa dòng"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={row.note}
                      onChange={(e) => handleBulkRowChange(index, "note", e.target.value)}
                      className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                      placeholder="Ghi chú (không bắt buộc)"
                    />
                  </div>
                ))}

                <div className="flex flex-wrap justify-between gap-2">
                  <Button type="button" variant="secondary" onClick={handleAddBulkRow}>
                    <Plus size={16} /> Thêm dòng
                  </Button>
                  {canWriteHolidays ? (
                    <Button type="button" variant="secondary" onClick={handleBulkImportHolidays}>
                      <Upload size={16} /> Import {bulkRows.length} dòng
                    </Button>
                  ) : (
                    <p className="text-xs text-gray-500 self-center">Bạn cần quyền WRITE_HOLIDAYS để import.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
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
                          <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">Ngày làm việc bù</span>
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
                    {canWriteHolidays && (
                      <>
                        <button onClick={() => handleEdit(holiday)} className="p-2 text-gray-400 hover:text-blue-600 transition-colors" title="Sửa">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDelete(holiday)} className="p-2 text-gray-400 hover:text-red-600 transition-colors" title="Xóa">
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
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
        {canWriteShifts && (
          <Button onClick={handleAddShift} className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700">
            <Plus size={16} /> Thêm ca mới
          </Button>
        )}
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
                  {canWriteShifts && (
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
                  )}
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
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all text-left group ${activeTab === item.id ? "bg-blue-50 text-blue-700 shadow-sm" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 bg-gray-50 px-6 py-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Calendar size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">
                    {editingHoliday ? "Sửa ngày nghỉ" : "Thêm ngày nghỉ mới"}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {editingHoliday ? "Cập nhật thông tin ngày nghỉ trong hệ thống." : "Tạo ngày nghỉ hoặc ngày làm bù cho lịch làm việc."}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white hover:text-red-500"
                aria-label="Đóng"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="max-h-[calc(100vh-170px)] overflow-y-auto p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Tên ngày nghỉ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="VD: Tết Nguyên Đán"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Ngày <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    required
                  />
                </div>

                <label className="flex min-h-[44px] items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={formData.isWorkDay}
                    onChange={(e) => setFormData({ ...formData, isWorkDay: e.target.checked })}
                    className="h-4 w-4 rounded text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  Tính là ngày làm việc
                </label>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700">Loại ngày</label>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => handleHolidayTypeChange("PUBLIC_HOLIDAY")}
                      className={`rounded-lg border p-4 text-left transition ${
                        formData.holidayType === "PUBLIC_HOLIDAY"
                          ? "border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-100"
                          : "border-gray-200 bg-white text-gray-700 hover:border-blue-200"
                      }`}
                    >
                      <span className="block text-sm font-semibold">Ngày nghỉ/lễ</span>
                      <span className="mt-1 block text-xs text-gray-500">Không tính công làm việc</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleHolidayTypeChange("SUBSTITUTE_WORK_DAY")}
                      className={`rounded-lg border p-4 text-left transition ${
                        formData.holidayType === "SUBSTITUTE_WORK_DAY"
                          ? "border-orange-500 bg-orange-50 text-orange-700 ring-2 ring-orange-100"
                          : "border-gray-200 bg-white text-gray-700 hover:border-orange-200"
                      }`}
                    >
                      <span className="block text-sm font-semibold">Ngày làm bù</span>
                      <span className="mt-1 block text-xs text-gray-500">Có tính công làm việc</span>
                    </button>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">Ghi chú</label>
                  <textarea
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    rows="3"
                    className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="VD: Nghỉ theo lịch công ty"
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-col-reverse gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700">
                  {editingHoliday ? "Cập nhật" : "Thêm mới"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Thêm/Sửa Shift */}
      {isShiftModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 bg-gray-50 px-6 py-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <Clock size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">
                    {editingShift ? "Sửa ca làm việc" : "Thêm ca làm việc mới"}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {editingShift ? "Cập nhật thời gian và thiết lập của ca." : "Tạo ca làm việc để dùng cho chấm công và tính công."}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsShiftModalOpen(false)}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white hover:text-red-500"
                aria-label="Đóng"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitShift} className="max-h-[calc(100vh-170px)] overflow-y-auto p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Tên ca làm việc <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={shiftFormData.name}
                    onChange={(e) => setShiftFormData({ ...shiftFormData, name: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="VD: Ca hành chính"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Mã ca <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={shiftFormData.shiftCode}
                    onChange={(e) => setShiftFormData({ ...shiftFormData, shiftCode: e.target.value.toUpperCase() })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm uppercase outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 disabled:text-gray-500"
                    placeholder="VD: HC"
                    disabled={Boolean(editingShift)}
                    required
                  />
                  {editingShift && (
                    <p className="mt-1 text-xs text-gray-500">Mã ca không đổi sau khi tạo.</p>
                  )}
                </div>

                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 md:col-span-2">
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
                    <Clock size={16} className="text-indigo-600" />
                    Khung giờ làm việc
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Giờ bắt đầu <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="time"
                        value={shiftFormData.startTime}
                        onChange={(e) => setShiftFormData({ ...shiftFormData, startTime: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Giờ kết thúc <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="time"
                        value={shiftFormData.endTime}
                        onChange={(e) => setShiftFormData({ ...shiftFormData, endTime: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Giờ công</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={shiftFormData.workHours}
                    onChange={(e) => setShiftFormData({ ...shiftFormData, workHours: Number(e.target.value) })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Nghỉ giữa ca</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="5"
                      value={shiftFormData.breakMinutes}
                      onChange={(e) => setShiftFormData({ ...shiftFormData, breakMinutes: Number(e.target.value) })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 pr-14 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-gray-500">phút</span>
                  </div>
                </div>

                <label className="flex min-h-[52px] items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 md:col-span-2">
                  <input
                    type="checkbox"
                    checked={shiftFormData.isDefault}
                    onChange={(e) => setShiftFormData({ ...shiftFormData, isDefault: e.target.checked })}
                    className="h-4 w-4 rounded text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  Đặt làm ca mặc định
                </label>
              </div>

              <div className="mt-6 flex flex-col-reverse gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
                <Button type="button" variant="secondary" onClick={() => setIsShiftModalOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700">
                  {editingShift ? "Cập nhật" : "Thêm mới"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Chi tiết Ngày nghỉ */}
      {isDetailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-blue-50 to-purple-50">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Info size={20} className="text-blue-600" />
                Chi tiết ngày nghỉ
              </h3>
              <button onClick={() => setIsDetailModalOpen(false)}>
                <X size={20} className="text-gray-400 hover:text-red-500" />
              </button>
            </div>

            {loadingDetail ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-3"></div>
                <p className="text-sm text-gray-500">Đang tải...</p>
              </div>
            ) : selectedHoliday ? (
              <div className="p-6 space-y-6">
                {/* Date Card Large */}
                <div className="flex items-center gap-6 p-6 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border border-red-100">
                  <div className="p-4 bg-red-500 text-white rounded-2xl font-bold flex flex-col items-center min-w-[100px] shadow-lg">
                    <span className="text-sm uppercase opacity-90">
                      {formatDateForCard(selectedHoliday.date).month}/
                      {formatDateForCard(selectedHoliday.date).year}
                    </span>
                    <span className="text-4xl my-1">
                      {formatDateForCard(selectedHoliday.date).day}
                    </span>
                    <span className="text-xs opacity-90">
                      {new Date(selectedHoliday.date).toLocaleDateString("vi-VN", {
                        weekday: "short",
                      })}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-2xl font-bold text-gray-800 mb-2">
                      {selectedHoliday.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {formatFullDate(selectedHoliday.date)}
                    </p>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Loại ngày nghỉ */}
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-500 mb-2 font-medium uppercase">
                      Loại ngày nghỉ
                    </p>
                    {selectedHoliday.holidayType === "PUBLIC_HOLIDAY" ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium">
                        <Calendar size={14} />
                        Ngày lễ quốc gia
                      </span>
                    ) : selectedHoliday.holidayType === "COMPANY_HOLIDAY" ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                        <Calendar size={14} />
                        Ngày nghỉ công ty
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-sm font-medium">
                        <Calendar size={14} />
                        Ngày làm bù
                      </span>
                    )}
                  </div>

                  {/* Trạng thái làm việc */}
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-500 mb-2 font-medium uppercase">
                      Trạng thái
                    </p>
                    {selectedHoliday.isWorkDay ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                        <Clock size={14} />
                        Làm việc
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium">
                        <Clock size={14} />
                        Nghỉ làm
                      </span>
                    )}
                  </div>

                  {/* Trạng thái hoạt động */}
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-500 mb-2 font-medium uppercase">
                      Hoạt động
                    </p>
                    {selectedHoliday.isActive ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                        ✓ Đang áp dụng
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                        ✕ Không áp dụng
                      </span>
                    )}
                  </div>

                  {/* Ngày tạo */}
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-500 mb-2 font-medium uppercase">
                      Ngày tạo
                    </p>
                    <p className="text-sm text-gray-800 font-medium">
                      {new Date(selectedHoliday.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(selectedHoliday.createdAt).toLocaleTimeString("vi-VN")}
                    </p>
                  </div>
                </div>

                {/* Ghi chú */}
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-xs text-amber-700 mb-2 font-medium uppercase flex items-center gap-1">
                    <Info size={12} />
                    Ghi chú
                  </p>
                  <p className="text-sm text-gray-700">
                    {selectedHoliday.note || "Không có ghi chú"}
                  </p>
                </div>

                {/* Applied Departments & Roles */}
                {(selectedHoliday.appliedDepartments?.length > 0 ||
                  selectedHoliday.appliedRoles?.length > 0) && (
                    <div className="space-y-3">
                      {selectedHoliday.appliedDepartments?.length > 0 && (
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-xs text-blue-700 mb-2 font-medium uppercase">
                            Áp dụng cho phòng ban
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {selectedHoliday.appliedDepartments.map((dept, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium"
                              >
                                {typeof dept === 'string' ? dept : dept.name || dept.deptCode || dept._id}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedHoliday.appliedRoles?.length > 0 && (
                        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                          <p className="text-xs text-purple-700 mb-2 font-medium uppercase">
                            Áp dụng cho vai trò
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {selectedHoliday.appliedRoles.map((role, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium"
                              >
                                {role}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                {/* Footer Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  {canWriteHolidays && (
                    <Button
                      variant="secondary"
                      onClick={() => handleCreateAttendanceForHoliday(selectedHoliday._id)}
                    >
                      Tao attendance
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    onClick={() => setIsDetailModalOpen(false)}
                  >
                    Đóng
                  </Button>
                  {canWriteHolidays && (
                  <Button
                    onClick={() => {
                      setIsDetailModalOpen(false);
                      handleEdit(selectedHoliday);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                  >
                    <Edit size={16} />
                    Chỉnh sửa
                  </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-gray-500">
                Không có dữ liệu
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Holiday;
