import React, { useState, useMemo, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  Briefcase,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Zap,
  CheckCircle2,
  Info,
} from "lucide-react";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import StatusBadge from "../../components/common/StatusBadge";
import LeaveRequestModal from "../../components/modals/CreateLeaveModal";
import { toast } from "react-toastify";
import { leaveAPI } from "../../apis/leaveAPI";
import ModalOT from "../../components/modals/OTModal";
import { OTApi } from "../../apis/OTAPI";
import { attendancesAPI } from "../../apis/attendancesAPI";
import { holidayAPI } from "../../apis/holidayAPI";

const MyTimesheet = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [defaultFromDate, setDefaultFromDate] = useState("");
  const [isOTModalOpen, setIsOTModalOpen] = useState(false);
  const [otPrefillDate, setOtPrefillDate] = useState(""); // YYYY-MM-DD
  const [timesheetData, setTimesheetData] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [holidayData, setHolidayData] = useState([]);
  const [loading, setLoading] = useState(true);

  // State cho việc chọn tháng
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return now.getMonth(); // 0-11
  });
  const [selectedYear, setSelectedYear] = useState(() => {
    const now = new Date();
    return now.getFullYear();
  });

  const [todayInfo] = useState(() => {
    const now = new Date();
    // Lấy tháng/năm hiện tại theo local time
    return {
      year: now.getFullYear(),
      month: now.getMonth(), // 0-11
      day: now.getDate(),
    };
  });



  useEffect(() => {
    const callAPIAttendences = async () => {
      try {
        setLoading(true);
        const month = selectedMonth + 1; // 0-11 → +1 thành 1-12
        const year = selectedYear;

        const res = await attendancesAPI.getme(month, year);
        console.log("[DEBUG1] API returned records:", res.data.data?.length);
        console.log("[DEBUG1] Sample record:", res.data);

        setAttendanceData(res.data.data || []);
      } catch (error) {
        console.log("[DEBUG1] API ERROR:", error);
      } finally {
        setLoading(false);
      }
    }

    const callAPIHolidays = async () => {
      try {
        const month = selectedMonth + 1; // 0-11 → +1 thành 1-12
        const year = selectedYear;

        // Tạo startDate và endDate cho tháng hiện tại
        const startDate = `${year}-${pad2(month)}-01`;
        const lastDay = new Date(year, month, 0).getDate(); // Ngày cuối tháng
        const endDate = `${year}-${pad2(month)}-${pad2(lastDay)}`;

        const res = await holidayAPI.get(startDate, endDate);
        const holidayData = res.data?.data || [];
        console.log("CHECK_HOLIDAY :", holidayData);
        setHolidayData(holidayData);
      } catch (error) {
        console.log("HOLIDAY API ERROR:", error);
        setHolidayData([]);
      }
    };

    callAPIAttendences();
    callAPIHolidays();
  }, [selectedMonth, selectedYear]) // Thêm dependencies

  useEffect(() => {
    const callAPItimesheet = async () => {
      try {
        const month = selectedMonth + 1; // 0-11 → +1 thành 1-12
        const year = selectedYear;

        const res = await attendancesAPI.getdatamoth(month, year);
        console.log("[test_3]Timesheet:", res.data.data);
        setTimesheetData(res.data.data);
      } catch (error) {
        console.error("[test_3]API ERROR:", error);
      }
    };

    callAPItimesheet();
    fetchHolidays();
  }, [selectedMonth, selectedYear]); // Thêm dependencies

  // Fetch holidays từ API
  const fetchHolidays = async () => {
    try {
      setLoading(true);

      // Tính toán startDate và endDate từ selectedMonthYear
      const month = selectedMonth + 1; // 0-11 → +1 thành 1-12
      const year = selectedYear;
      const startDate = `${year}-${month}-01`;

      // Tính ngày cuối cùng của tháng
      const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
      const endDate = `${year}-${month}-${lastDay}`;

      const res = await holidayAPI.get(startDate, endDate);
      const holidayData = res.data?.data || [];
      console.log("CHECK_HOLIDAY :",holidayData)
    } catch (error) {
      console.error("Error CHECK_HOLIDAY:", error);
      toast.error("Không thể tải dữ liệu lịch nghỉ");
    } finally {
      setLoading(false);
    }
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
      toast.error(`Xin nghỉ thất bại : ${error.response.data.message}`, { autoClose: 5000 });
    }
  };
  console.log("defaultFromDate gửi vào modal:", defaultFromDate);

  const pad2 = (n) => String(n).padStart(2, "0");

  const CallleaveAPI = async (data) => {
    console.log("ĐANG CALL API: CallleaveAPI")
    try {
      const res = await leaveAPI.post(data)
      console.log("DỮ LIỆU API TRẢ VỀ : ", res)
      setIsLeaveModalOpen(false);
      toast.success("Xin nghỉ thành công, Vui lòng chờ quản trị duyệt");
    } catch (error) {
      setIsLeaveModalOpen(false);
      // console.log('lỗi API :', error)
      toast.error(`Xin nghỉ thất bại : ${error.response.data.message}`, { autoClose: 5000 });
      // toast.error(`Xin nghỉ thất bại `);
      console.log("CÓ LỖI API : ", error.response.data.errors[0].message)
    }
  }


  const handleOT = () => {
    if (!selectedDate?.inMonth || !selectedDate?.isoDate) {
      toast.info("Vui lòng chọn ngày trên lịch trước khi đăng ký OT.");
      return;
    }
    setOtPrefillDate(selectedDate.isoDate); // YYYY-MM-DD
    setIsOTModalOpen(true);
  };



  const handleTest = () => {
    if (!selectedDate?.inMonth || !selectedDate?.isoDate) return;

    setDefaultFromDate(selectedDate.isoDate); // ✅ dùng isoDate đúng của ô
    setIsLeaveModalOpen(true);
  };

  // ✅ Xác định loại nghỉ mặc định dựa trên số phép còn lại
  const defaultLeaveType = useMemo(() => {
    const remaining = timesheetData?.leave?.remaining || 0;
    return remaining > 0 ? "ANNUAL" : "UNPAID";
  }, [timesheetData?.leave?.remaining]);



  const CURRENT_YEAR = selectedYear;
  const CURRENT_MONTH = selectedMonth;
  const TODAY = todayInfo.day;

  // Hàm xử lý chuyển tháng
  const handlePreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const generateCalendarData = () => {
    const days = [];
    const firstDayIndex = new Date(CURRENT_YEAR, CURRENT_MONTH, 1).getDay();
    const daysInMonth = new Date(CURRENT_YEAR, CURRENT_MONTH + 1, 0).getDate();

    // Padding ngày tháng trước
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ day: 0, inMonth: false });
    }

    // Tạo map từ API data theo ngày (dùng ISO date làm key)
    const attendanceMap = {};
    console.log("[DEBUG1] Processing", attendanceData.length, "records from API");

    attendanceData.forEach((record, index) => {
      // Xử lý nhiều format ngày từ backend
      let dateKey;
      if (record.date) {
        // Nếu là ISO string (có T hoặc không)
        if (typeof record.date === 'string') {
          dateKey = record.date.split('T')[0]; // Lấy phần YYYY-MM-DD
        } else if (record.date instanceof Date) {
          // Nếu đã là Date object
          const d = record.date;
          dateKey = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
        }
      }

      if (dateKey) {
        attendanceMap[dateKey] = record;
      }
    });

    // Tạo map cho holiday data
    const holidayMap = {};
    console.log("[DEBUG_HOLIDAY] Processing", holidayData.length, "holiday records");

    holidayData.forEach((holiday) => {
      let dateKey;
      if (holiday.date) {
        if (typeof holiday.date === 'string') {
          dateKey = holiday.date.split('T')[0]; // Lấy phần YYYY-MM-DD
        } else if (holiday.date instanceof Date) {
          const d = holiday.date;
          dateKey = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
        }
      }

      if (dateKey) {
        holidayMap[dateKey] = holiday;
      }
    });

    console.log("[DEBUG1] Mapped", Object.keys(attendanceMap).length, "unique dates");
    console.log("[DEBUG_HOLIDAY] Mapped", Object.keys(holidayMap).length, "unique holidays");
    console.log("[DEBUG1] Keys:", Object.keys(attendanceMap).sort());

    // Tạo dữ liệu cho từng ngày trong tháng
    console.log("[DEBUG1] Starting to generate days for month", CURRENT_MONTH + 1, "year", CURRENT_YEAR);
    for (let i = 1; i <= daysInMonth; i++) {
      const dateObj = new Date(CURRENT_YEAR, CURRENT_MONTH, i);
      const dayOfWeek = dateObj.getDay();
      const isoDate = `${CURRENT_YEAR}-${pad2(CURRENT_MONTH + 1)}-${pad2(i)}`;

      // Lấy dữ liệu từ API theo ISO date key
      const apiData = attendanceMap[isoDate];
      const holidayInfo = holidayMap[isoDate];

      // Log chi tiết cho 5 ngày đầu và những ngày có data
      if (i <= 5 || apiData || holidayInfo) {
        console.log(`[DEBUG1] Day ${i}: isoDate="${isoDate}", apiData exists=${!!apiData}, holiday exists=${!!holidayInfo}, checkIn=${apiData?.checkIn}, checkOut=${apiData?.checkOut}`);
      }

      let type = "work";
      let status = [];
      let checkIn = null;
      let checkOut = null;
      let otHours = 0;
      let otTimeRanges = []; // Mảng chứa các khoảng thời gian OT
      let holidayName = "";
      let lateMinutes = 0;

      // Kiểm tra ngày lễ trước - phân biệt theo holidayType
      if (holidayInfo) {
        if (holidayInfo.holidayType === "SUBSTITUTE_WORK_DAY") {
          type = "substitute_work"; // Ngày làm việc bù
        } else {
          type = "holiday"; // Ngày nghỉ lễ (PUBLIC_HOLIDAY)
        }
        holidayName = holidayInfo.name;
        console.log(`[DEBUG_HOLIDAY] Found holiday on ${isoDate}: ${holidayName}, type: ${holidayInfo.holidayType}`);
      }
      // Xử lý cuối tuần (nếu không có dữ liệu từ API và không phải ngày lễ)
      else if (!apiData && (dayOfWeek === 0 || dayOfWeek === 6)) {
        type = "weekend";
      }

      // Nếu có dữ liệu từ API
      if (apiData) {
        checkIn = apiData.checkIn || null;
        checkOut = apiData.checkOut || null;
        lateMinutes = apiData.lateMinutes || 0;

        // Xử lý status - ưu tiên holiday nếu có
        if (holidayInfo) {
          // Giữ type = "holiday" hoặc "substitute_work" nhưng vẫn xử lý attendance data
        } else if (apiData.status === "PAID_LEAVE") {
          type = "leave";
          status.push("leave");
        } else if (apiData.status === "UNPAID_LEAVE") {
          type = "leave";
          status.push("leave");
        } else if (apiData.status === "PRESENT") {
          type = "work";
        } else if (apiData.status === "ABSENT") {
          type = "work";
          status.push("absent");
        }

        // Check late (áp dụng cho tất cả status)
        if (lateMinutes > 0) {
          status.push("late");
        }

        // Check OT (áp dụng cho tất cả status)
        const totalOT = (apiData.finalOtHours?.weekday || 0) +
          (apiData.finalOtHours?.weekend || 0) +
          (apiData.finalOtHours?.holiday || 0);

        // Lấy thông tin thời gian OT từ overtimeId array
        if (apiData.overtimeId && Array.isArray(apiData.overtimeId) && apiData.overtimeId.length > 0) {
          otTimeRanges = apiData.overtimeId.map(ot => ({
            startTime: ot.approvedStartTime || ot.startTime, // Ưu tiên approvedStartTime
            endTime: ot.approvedEndTime || ot.endTime, // Ưu tiên approvedEndTime
            otType: ot.otType,
            totalHours: ot.totalHours,
            approvedHours: ot.approvedHours,
            status: ot.status
          }));
          status.push("ot");
          otHours = totalOT;
        } else if (totalOT > 0) {
          status.push("ot");
          otHours = totalOT;
        }
      }

      // Kiểm tra isToday: phải cùng ngày, tháng VÀ năm
      const isToday = (i === TODAY && CURRENT_MONTH === todayInfo.month && CURRENT_YEAR === todayInfo.year);

      days.push({
        day: i,
        inMonth: true,
        isToday,
        type,
        status,
        checkIn,
        checkOut,
        otHours,
        otTimeRanges, // Thêm mảng thời gian OT
        holidayName,
        lateMinutes,
        fullDate: `${pad2(i)}/${pad2(CURRENT_MONTH + 1)}/${CURRENT_YEAR}`,
        isoDate,
        apiData, // Lưu toàn bộ data từ API để dùng sau
        holidayInfo, // Lưu thông tin holiday
        leaveInfo: apiData?.leaveId || null, // Lưu thông tin leave
      });
    }

    console.log("[DEBUG1] Final result: Generated", days.length, "days,", days.filter(d => d.apiData).length, "have data");
    console.log("[DEBUG_HOLIDAY] Days with holidays:", days.filter(d => d.holidayInfo).length);

    return days;
  };

  const calendarDays = useMemo(() => {
    const result = generateCalendarData();
    console.log("[DEBUG1] calendarDays generated:", result.length, "total");
    console.log("[DEBUG1] Days with checkIn:", result.filter(d => d.checkIn).length);
    console.log("[DEBUG1] Days with apiData:", result.filter(d => d.apiData).length);
    return result;
  }, [attendanceData]);

  const getDayStyle = (day) => {
    // Ô trống tháng trước
    if (!day.inMonth) return "bg-gray-50/50";

    // Kiểm tra xem ô này có đang được chọn không
    const isSelected = selectedDate?.isoDate === day.isoDate;

    // cơ bản (bỏ hover:bg-blue-50)
    let baseClass =
      "relative border-b border-r border-gray-200 p-1.5 h-28 transition-all cursor-pointer flex flex-col justify-between group ";

    // Nếu đang được chọn, thêm background đậm hơn
    if (isSelected) {
      baseClass += "z-10 ";
    }

    // Ngày Lễ (PUBLIC_HOLIDAY)
    if (day.type === "holiday")
      return `${baseClass} ${isSelected ? "bg-red-200" : "bg-red-50"}`;

    // Ngày làm việc bù (SUBSTITUTE_WORK_DAY)
    if (day.type === "substitute_work")
      return `${baseClass} ${isSelected ? "bg-yellow-200" : "bg-yellow-50"}`;

    // Cuối tuần (T7, CN)
    if (day.type === "weekend")
      return `${baseClass} ${isSelected ? "bg-orange-300" : "bg-orange-100"} text-gray-400`;

    // Nghỉ phép
    if (day.type === "leave") {
      // Phân biệt màu theo loại nghỉ
      if (day.apiData?.status === "PAID_LEAVE") {
        return `${baseClass} ${isSelected ? "bg-purple-200" : "bg-purple-50"}`;
      } else {
        return `${baseClass} ${isSelected ? "bg-orange-200" : "bg-orange-50"}`;
      }
    }

    // Ngày hôm nay - viền xanh nước biển
    if (day.isToday)
      return `${baseClass} ${isSelected ? "bg-blue-200" : "bg-blue-100"} ring-2 ring-inset ring-blue-400`;

    // Kiểm tra xem đang xem tháng hiện tại hay không
    const isCurrentMonth = CURRENT_YEAR === todayInfo.year && CURRENT_MONTH === todayInfo.month;

    // Ngày đã qua (trước ngày hiện tại) - màu xanh
    if (isCurrentMonth && day.day < TODAY) {
      return `${baseClass} ${isSelected ? "bg-green-200" : "bg-green-100"}`;
    }

    // Ngày trong quá khứ (tháng trước tháng hiện tại)
    if (CURRENT_YEAR < todayInfo.year || (CURRENT_YEAR === todayInfo.year && CURRENT_MONTH < todayInfo.month)) {
      return `${baseClass} ${isSelected ? "bg-green-200" : "bg-green-100"}`;
    }

    // Ngày trong tương lai - màu trắng
    return `${baseClass} ${isSelected ? "bg-blue-100" : "bg-white"}`;
  };

  return (
    <div className="space-y-6 max-w-full">
      {isOTModalOpen && (
        <>
          {console.log("[OT] Rendering ModalOT...")}
          <ModalOT
            open={isOTModalOpen}
            onClose={() => setIsOTModalOpen(false)}
            onSubmit={(payload) => callOTAPI(payload)}
            initialValues={{
              otType: "WEEKDAY",
              date: otPrefillDate, // ✅ tự điền ngày đã chọn
            }}
          />

        </>
      )}
      {/* Open modal xin nghi*/}
      {isLeaveModalOpen && (
        <LeaveRequestModal
          defaultFromDate={defaultFromDate}
          defaultLeaveType={defaultLeaveType}
          onClose={() => setIsLeaveModalOpen(false)}
          onConfirm={(payload) => {
            CallleaveAPI(payload)
            // console.log("LEAVE CONFIRM:", payload);
            // setIsLeaveModalOpen(false);
          }}
        />
      )}
      {/* --- HEADER --- */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Bảng công tháng {CURRENT_MONTH + 1}/{CURRENT_YEAR}
          </h1>
        </div>

        {/* Month Filter */}
        <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
          <button
            onClick={handlePreviousMonth}
            className="p-2 hover:bg-gray-100 rounded-md text-gray-500 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="px-4 font-semibold text-gray-700 min-w-[140px] text-center">
            Tháng {CURRENT_MONTH + 1}, {CURRENT_YEAR}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-100 rounded-md text-gray-500 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* --- STATS CARDS (Đã thêm Card Giờ làm việc) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* NEW CARD: CA LÀM VIỆC */}
        <Card className=" font-bold text-gray-800 border-green-100 flex flex-col justify-between ">
          <div className="flex items-center gap-2 text-gray-500 text-[11px] font-bold uppercase tracking-wide">
            <Clock size={16} color="green" /> Ca làm việc chuẩn
          </div>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between items-center text-sm">
              <span className="opacity-80">Sáng:</span>
              <span className="font-mono font-bold text-lg">
                {timesheetData?.shift?.morning || "08:00 - 11:30"}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm border-t border-white/10 pt-1">
              <span className="opacity-80">Chiều:</span>
              <span className="font-mono font-bold text-lg">
                {timesheetData?.shift?.afternoon || "13:00 - 17:30"}
              </span>
            </div>
          </div>
        </Card>

        {/* Existing Stats */}
        <StatCard
          icon={<Briefcase size={20} />}
          label="Tổng giờ làm"
          value={`${timesheetData?.work?.totalHours || 0}h`}
          sub={`${timesheetData?.work?.totalDays || 0} công`}
          color="blue"
        />
        <StatCard
          icon={<Zap size={20} />}
          label="Tổng giờ OT"
          value={`${timesheetData?.overtime?.totalHours || 0}h`}
          sub={timesheetData?.overtime?.status || "Chưa có"}
          color="orange"
        />
        <StatCard
          icon={<Coffee size={20} />}
          label="Phép năm"
          value={`${timesheetData?.leave?.used || 0}/${timesheetData?.leave?.totalLimit || 12}`}
          sub={`Còn lại: ${timesheetData?.leave?.remaining || 0}`}
          color="purple"
        />
        <StatCard
          icon={<AlertCircle size={20} />}
          label="Đi muộn"
          value={`${timesheetData?.late?.count || 0}`}
          sub="Lần vi phạm"
          color="red"
          isWarning={timesheetData?.late?.count > 0}
        />
      </div>

      {/* --- MAIN CONTENT: CALENDAR --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
        {/* CALENDAR GRID  */}
        <Card className="lg:col-span-8 xl:col-span-9 p-0 overflow-hidden border border-gray-200 shadow-sm ">
          {/* Calendar Header Days */}
          <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
            {["CN", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"].map(
              (d, i) => (
                <div
                  key={d}
                  className={`py-3 text-center text-xs font-bold uppercase tracking-wide ${i === 0 || i === 6 ? "text-red-400" : "text-gray-500"
                    }`}
                >
                  {d}
                </div>
              )
            )}
          </div>

          {/* Calendar Body */}
          {loading ? (
            <div className="flex items-center justify-center h-96 bg-white">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="text-sm text-gray-500">Đang tải dữ liệu chấm công...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-7 bg-white">
              {calendarDays.map((day, idx) => (
                <div
                  key={idx}
                  onClick={() => day.inMonth && setSelectedDate(day)}
                  className={getDayStyle(day)}
                >
                  {/* Date Number & Badges */}
                  <div className="flex justify-between items-start ">
                    <span
                      className={`text-lg font-semibold w-7 h-7 flex items-center justify-center rounded-full
                      ${day.isToday
                          ? "bg-blue-600 text-white"
                          : day.type === "holiday"
                            ? "text-red-600"
                            : day.type === "substitute_work"
                              ? "text-yellow-600"
                              : day.type === "weekend"
                                ? "text-red-400"
                                : "text-gray-700"
                        }
                   `}
                    >
                      {day.inMonth ? day.day : ""}
                    </span>

                    {/* Badges Container (Hiển thị nhiều status cùng lúc) */}
                    <div className="flex gap-1">
                      {day.status?.includes("late") && (
                        <span
                          className="w-2 h-2 rounded-full bg-red-500"
                          title="Đi muộn"
                        ></span>
                      )}
                      {day.status?.includes("ot") && (
                        <span
                          className="w-2 h-2 rounded-full bg-orange-500"
                          title="OT"
                        ></span>
                      )}
                      {day.type === "leave" && (
                        <span
                          className="w-2 h-2 rounded-full bg-purple-500"
                          title="Nghỉ phép"
                        ></span>
                      )}
                    </div>
                  </div>

                  {/* 2. Content bên trong ô (Chỉ hiện nếu không phải weekend/trống) */}
                  {day.inMonth && day.type !== "weekend" && (
                    <div className="mt-1 flex flex-col gap-0.5">
                      {/* Trường hợp Ngày Lễ (PUBLIC_HOLIDAY) */}
                      {day.type === "holiday" && (
                        <div className="flex flex-col items-center justify-center h-full mt-2">
                          <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded text-center leading-tight">
                            🎄 {day.holidayName}
                          </span>
                        </div>
                      )}

                      {/* Trường hợp Ngày làm việc bù (SUBSTITUTE_WORK_DAY) */}
                      {day.type === "substitute_work" && (
                        <div className="flex flex-col items-center justify-center h-full mt-2">
                          <span className="text-[10px] font-bold text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded text-center leading-tight">
                            🔄 {day.holidayName}
                          </span>
                          {/* Hiển thị check in/out nếu có */}
                          {(day.checkIn || day.checkOut) && (
                            <div className="flex justify-center items-center text-[10px] text-gray-500 px-1.5 py-0.5 rounded mt-1">
                              <span className={`font-mono ${day.status.includes("late") ? "text-red-600 font-bold" : "text-gray-600"}`}>
                                {day.checkIn || "--:--"}
                              </span>
                              <span className="px-1"> - </span>
                              <span className="font-mono text-gray-600">
                                {day.checkOut || "--:--"}
                              </span>
                            </div>
                          )}
                          {/* Hiển thị OT nếu có */}
                          {day.status.includes("ot") && day.otTimeRanges && day.otTimeRanges.length > 0 && (
                            <div className="text-[10px] text-center font-bold text-orange-600 bg-orange-50 px-1 rounded mt-0.5">
                              OT: {day.otTimeRanges.map(ot => `${ot.startTime}-${ot.endTime}`).join(", ")}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Trường hợp Nghỉ phép */}
                      {day.type === "leave" && (
                        <div className="mt-1">
                          <div className="text-center mb-1">
                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                              day.apiData?.status === "PAID_LEAVE" 
                                ? "text-purple-700 bg-purple-100" 
                                : "text-orange-700 bg-orange-100"
                            }`}>
                              {day.apiData?.status === "PAID_LEAVE" ? "Nghỉ có lương" : "Nghỉ không lương"}
                            </span>
                          </div>
                          {/* Hiển thị lý do nghỉ nếu có */}
                          {/* {day.leaveInfo?.reason && (
                            <div className="text-[9px] text-center text-gray-500 mb-1 px-1">
                              {day.leaveInfo.reason}
                            </div>
                          )} */}
                          {/* Hiển thị check in/out nếu có */}
                          {(day.checkIn || day.checkOut) && (
                            <div className="flex justify-center items-center text-[10px] text-gray-500 px-1.5 py-0.5 rounded">
                              <span className={`font-mono ${day.status.includes("late") ? "text-red-600 font-bold" : "text-gray-600"}`}>
                                {day.checkIn || "--:--"}
                              </span>
                              <span className="px-1"> - </span>
                              <span className="font-mono text-gray-600">
                                {day.checkOut || "--:--"}
                              </span>
                            </div>
                          )}
                          {/* Hiển thị OT nếu có */}
                          {day.status.includes("ot") && day.otTimeRanges && day.otTimeRanges.length > 0 && (
                            <div className="text-[10px] text-center font-bold text-orange-600 bg-orange-50 px-1 rounded mt-0.5">
                              OT: {day.otTimeRanges.map(ot => `${ot.startTime}-${ot.endTime}`).join(", ")}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Trường hợp Đi làm */}
                      {day.type === "work" && (() => {
                        // Kiểm tra xem có phải ngày trong tương lai không
                        const isCurrentMonth = CURRENT_YEAR === todayInfo.year && CURRENT_MONTH === todayInfo.month;
                        const isFutureDay = isCurrentMonth ? day.day > TODAY :
                          (CURRENT_YEAR > todayInfo.year || (CURRENT_YEAR === todayInfo.year && CURRENT_MONTH > todayInfo.month));

                        // Nếu là ngày tương lai và không có dữ liệu chấm công, không hiển thị gì
                        if (isFutureDay && !day.checkIn && !day.checkOut) {
                          return null;
                        }

                        return (
                          <>
                            {day.checkIn || day.checkOut ? (
                              <div className="flex justify-center items-center text-[11px] text-gray-500 px-1.5 py-0.5 rounded">
                                <span
                                  className={`font-mono font-bold ${day.status.includes("late")
                                    ? "text-red-600"
                                    : "text-gray-700"
                                    }`}
                                >
                                  {day.checkIn || "--:--"}
                                </span>
                                <span className="px-2"> - </span>
                                <span className="font-mono font-bold text-gray-700">
                                  {day.checkOut || "--:--"}
                                </span>
                              </div>
                            ) : (
                              <div className="text-[10px] text-center text-gray-400 mt-2">
                                Chưa chấm công
                              </div>
                            )}

                            {/* Nếu có OT thì hiện thêm dòng OT */}
                            {day.status.includes("ot") && day.otTimeRanges && day.otTimeRanges.length > 0 && (
                              <div className="text-[10px] text-center font-bold text-orange-600 bg-orange-50 px-1 rounded mt-0.5">
                                OT: {day.otTimeRanges.map(ot => `${ot.startTime}-${ot.endTime}`).join(", ")}
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* RIGHT PANEL */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-6">
          {/* Detail Box */}
          <Card className="h-fit sticky top-6">
            {!selectedDate ? (
              <div className="text-center py-8 text-gray-400">
                <Info size={40} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm">
                  Chọn một ngày trên lịch để xem chi tiết chấm công.
                </p>
              </div>
            ) : (
              <div className="animate-in fade-in duration-200">
                <div className="border-b border-gray-100 pb-4 mb-4">
                  <p className="text-xs text-gray-500 uppercase font-bold">
                    Chi tiết ngày
                  </p>
                  <h2 className="text-2xl font-bold text-blue-600">
                    {selectedDate.fullDate}
                  </h2>
                  <div className="flex gap-2 mt-2">
                    {selectedDate.isToday && <StatusBadge status="Hôm nay" />}
                    {selectedDate.type === "holiday" && (
                      <StatusBadge status="Ngày lễ" />
                    )}
                    {selectedDate.type === "substitute_work" && (
                      <StatusBadge status="Ngày làm việc bù" />
                    )}
                    {selectedDate.status?.includes("late") && (
                      <span className="text-xs bg-red-100 text-red-600 font-bold px-2 py-1 rounded">
                        Đi muộn
                      </span>
                    )}
                    {selectedDate.status?.includes("ot") && (
                      <span className="text-xs bg-orange-100 text-orange-600 font-bold px-2 py-1 rounded">
                        Có OT
                      </span>
                    )}
                  </div>
                </div>

                {/* Time Detail */}
                {selectedDate.type === "work" || selectedDate.type === "substitute_work" ? (
                  <div className="space-y-4">
                    {selectedDate.checkIn && (
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-green-100 text-green-600 rounded">
                            <Clock size={16} />
                          </div>
                          <span className="text-sm font-medium text-gray-600">
                            Check In
                          </span>
                        </div>
                        <span
                          className={`font-mono text-lg font-bold ${selectedDate.status.includes("late")
                            ? "text-red-600"
                            : "text-gray-800"
                            }`}
                        >
                          {selectedDate.checkIn}
                          {selectedDate.lateMinutes > 0 && (
                            <span className="text-xs text-red-500 ml-2">
                              (+{selectedDate.lateMinutes}p)
                            </span>
                          )}
                        </span>
                      </div>
                    )}

                    {selectedDate.checkOut && (
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-blue-100 text-blue-600 rounded">
                            <Clock size={16} />
                          </div>
                          <span className="text-sm font-medium text-gray-600">
                            Check Out
                          </span>
                        </div>
                        <span className="font-mono text-lg font-bold text-gray-800">
                          {selectedDate.checkOut}
                        </span>
                      </div>
                    )}

                    {!selectedDate.checkIn && !selectedDate.checkOut && (
                      <div className="text-center py-4 text-gray-400 text-sm">
                        Chưa có dữ liệu chấm công
                      </div>
                    )}

                    {selectedDate.status.includes("ot") && selectedDate.otTimeRanges && selectedDate.otTimeRanges.length > 0 && (
                      <div className="p-3 bg-orange-50 border border-orange-100 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-bold text-orange-700 flex items-center gap-1">
                            <Zap size={14} /> Overtime
                          </span>
                          <span className="text-sm font-bold text-orange-700">
                            {selectedDate.otHours} giờ
                          </span>
                        </div>
                        {/* Hiển thị từng khoảng thời gian OT */}
                        <div className="space-y-1">
                          {selectedDate.otTimeRanges.map((ot, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs bg-white px-2 py-1.5 rounded">
                              <div className="flex flex-col">
                                <span className="text-gray-600">{ot.otType}</span>
                                {ot.status && (
                                  <span className={`text-[10px] font-bold ${ot.status === 'APPROVED' ? 'text-green-600' :
                                      ot.status === 'PENDING' ? 'text-yellow-600' : 'text-red-600'
                                    }`}>
                                    {ot.status}
                                  </span>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="font-mono font-bold text-orange-600">
                                  {ot.startTime} - {ot.endTime}
                                </div>
                                {ot.approvedHours && (
                                  <div className="text-[10px] text-gray-500">
                                    {ot.approvedHours}h duyệt
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        {selectedDate.apiData?.note && (
                          <p className="text-xs text-orange-600/80 mt-2">
                            {selectedDate.apiData.note}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ) : selectedDate.type === "leave" ? (
                  <div className="space-y-4">
                    {/* Thông tin nghỉ phép */}
                    <div className={`p-3 border rounded-lg ${
                      selectedDate.apiData?.status === "PAID_LEAVE" 
                        ? "bg-purple-50 border-purple-100" 
                        : "bg-orange-50 border-orange-100"
                    }`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className={`text-sm font-bold flex items-center gap-1 ${
                          selectedDate.apiData?.status === "PAID_LEAVE" 
                            ? "text-purple-700" 
                            : "text-orange-700"
                        }`}>
                          <Coffee size={14} /> 
                          {selectedDate.apiData?.status === "PAID_LEAVE" ? "Nghỉ có lương" : "Nghỉ không lương"}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded font-bold ${
                          selectedDate.leaveInfo?.status === 'APPROVED' ? 'bg-green-100 text-green-600' :
                          selectedDate.leaveInfo?.status === 'PENDING' ? 'bg-yellow-100 text-yellow-600' : 
                          'bg-red-100 text-red-600'
                        }`}>
                          {selectedDate.leaveInfo?.status || 'N/A'}
                        </span>
                      </div>
                      
                      {/* Loại nghỉ phép */}
                      {selectedDate.leaveInfo?.leaveType && (
                        <div className="text-xs text-gray-600 mb-1">
                          <span className="font-medium">Loại: </span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            selectedDate.leaveInfo.leaveType === 'ANNUAL' ? 'bg-blue-100 text-blue-600' :
                            selectedDate.leaveInfo.leaveType === 'SICK' ? 'bg-red-100 text-red-600' :
                            selectedDate.leaveInfo.leaveType === 'UNPAID' ? 'bg-gray-100 text-gray-600' :
                            'bg-purple-100 text-purple-600'
                          }`}>
                            {selectedDate.leaveInfo.leaveType}
                          </span>
                        </div>
                      )}
                      
                      {/* Lý do nghỉ */}
                      {selectedDate.leaveInfo?.reason && (
                        <div className="text-xs text-gray-600 mb-2">
                          <span className="font-medium">Lý do: </span>
                          <span className="italic">{selectedDate.leaveInfo.reason}</span>
                        </div>
                      )}
                      
                      {/* Note từ API */}
                      {/* {selectedDate.apiData?.note && (
                        <div className="text-xs text-gray-500 italic">
                          {selectedDate.apiData.note}
                        </div>
                      )} */}
                    </div>

                    {/* Thông tin chấm công nếu có */}
                    {(selectedDate.checkIn || selectedDate.checkOut) && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">Thông tin chấm công:</h4>
                        
                        {selectedDate.checkIn && (
                          <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="text-xs text-gray-600">Check In:</span>
                            <span className="font-mono text-sm font-bold text-gray-800">
                              {selectedDate.checkIn}
                            </span>
                          </div>
                        )}
                        
                        {selectedDate.checkOut && (
                          <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="text-xs text-gray-600">Check Out:</span>
                            <span className="font-mono text-sm font-bold text-gray-800">
                              {selectedDate.checkOut}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* OT nếu có */}
                    {selectedDate.status.includes("ot") && selectedDate.otTimeRanges && selectedDate.otTimeRanges.length > 0 && (
                      <div className="p-3 bg-orange-50 border border-orange-100 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-bold text-orange-700 flex items-center gap-1">
                            <Zap size={14} /> Overtime
                          </span>
                          <span className="text-sm font-bold text-orange-700">
                            {selectedDate.otHours} giờ
                          </span>
                        </div>
                        <div className="space-y-1">
                          {selectedDate.otTimeRanges.map((ot, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs bg-white px-2 py-1.5 rounded">
                              <div className="flex flex-col">
                                <span className="text-gray-600">{ot.otType}</span>
                                {ot.status && (
                                  <span className={`text-[10px] font-bold ${ot.status === 'APPROVED' ? 'text-green-600' :
                                      ot.status === 'PENDING' ? 'text-yellow-600' : 'text-red-600'
                                    }`}>
                                    {ot.status}
                                  </span>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="font-mono font-bold text-orange-600">
                                  {ot.startTime} - {ot.endTime}
                                </div>
                                {ot.approvedHours && (
                                  <div className="text-[10px] text-gray-500">
                                    {ot.approvedHours}h duyệt
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-4 text-center text-gray-500 italic bg-gray-50 rounded-lg">
                    {selectedDate.type === "weekend"
                      ? "Cuối tuần - Không có lịch làm việc"
                      : selectedDate.type === "holiday"
                        ? `Nghỉ lễ: ${selectedDate.holidayName}`
                        : selectedDate.type === "substitute_work"
                          ? `Ngày làm việc bù: ${selectedDate.holidayName}`
                          : "Không có thông tin"}
                  </div>
                )}

                {/* Action Buttons */}
                {/* <div className="mt-6 pt-4 border-t border-gray-100 grid grid-cols-1 gap-2">
                  <Button variant="secondary" className="w-full text-xs">
                    Gửi giải trình chấm công
                  </Button>
                </div> */}
              </div>
            )}
          </Card>

          {/* Quick Actions (Bottom Right) */}
          <div className="grid grid-cols-2 gap-3">
            {(() => {
              // Kiểm tra xem ngày được chọn có phải là ngày trong quá khứ không
              const isCurrentMonth = CURRENT_YEAR === todayInfo.year && CURRENT_MONTH === todayInfo.month;
              const isPastDay = isCurrentMonth
                ? selectedDate?.day < TODAY
                : (CURRENT_YEAR < todayInfo.year || (CURRENT_YEAR === todayInfo.year && CURRENT_MONTH < todayInfo.month));

              // Chỉ kiểm tra ngày lễ PUBLIC_HOLIDAY (bỏ chủ nhật và ngày làm việc bù)
              const isHoliday = selectedDate?.type === "holiday";

              // Nếu là ngày quá khứ, chỉ hiện nút OT
              if (isPastDay) {
                return (
                  <Button
                    onClick={handleOT}
                    variant="OT"
                    className="col-span-2 flex flex-col items-center gap-1 py-3 bg-orange-400 text-white shadow-md hover:bg-orange-600"
                  >
                    <Zap size={20} /> <span className="text-xs">Đăng ký OT</span>
                  </Button>
                );
              }

              // Nếu là ngày lễ, chỉ hiện nút OT
              if (isHoliday) {
                return (
                  <Button
                    onClick={handleOT}
                    variant="OT"
                    className="col-span-2 flex flex-col items-center gap-1 py-3 bg-orange-400 text-white shadow-md hover:bg-orange-600"
                  >
                    <Zap size={20} /> <span className="text-xs">Đăng ký OT</span>
                  </Button>
                );
              }

              // Ngày hiện tại hoặc tương lai (không phải lễ), hiển thị cả 2 nút
              return (
                <>
                  <Button
                    onClick={handleTest}
                    className="flex flex-col items-center gap-1 py-3 bg-blue-600 text-white shadow-md hover:bg-blue-700">
                    <Coffee size={20} /> <span className="text-xs">Xin nghỉ</span>
                  </Button>
                  <Button
                    onClick={handleOT}
                    variant="OT"
                    className="flex flex-col items-center gap-1 py-3 bg-orange-400 text-white shadow-md hover:bg-orange-600"
                  >
                    <Zap size={20} /> <span className="text-xs">Đăng ký OT</span>
                  </Button>
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Sub-components giữ nguyên như cũ ---
const StatCard = ({ icon, label, value, sub, color, isWarning }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    red: "bg-red-50 text-red-600 border-red-100",
  };

  return (
    <Card
      className={`flex items-start gap-3 p-4 border ${isWarning
        ? "border-red-300 ring-1 ring-red-50"
        : colors[color].split(" ")[2]
        }`}
    >
      <div className={`p-2.5 rounded-lg shrink-0 ${colors[color]}`}>{icon}</div>
      <div>
        <p className="text-gray-500 text-[11px] font-bold uppercase tracking-wide">
          {label}
        </p>
        <h4 className="text-xl font-bold text-gray-800 mt-0.5">{value}</h4>
        <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
      </div>
    </Card>
  );
};

export default MyTimesheet;
