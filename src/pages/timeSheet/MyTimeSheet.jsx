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

const MyTimesheet = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [defaultFromDate, setDefaultFromDate] = useState("");
  const [isOTModalOpen, setIsOTModalOpen] = useState(false);
  const [otPrefillDate, setOtPrefillDate] = useState(""); // YYYY-MM-DD
  const [timesheetData, setTimesheetData] = useState(null);

  const [todayInfo] = useState(() => {
    const now = new Date();
    const nowVN = new Date(now.getTime() + 7 * 60 * 60 * 1000);

    return {
      year: nowVN.getUTCFullYear(),
      month: nowVN.getUTCMonth(),
      day: nowVN.getUTCDate(),
    };
  });


  useEffect(() => {
    const callAPItimesheet = async () => {
      try {
        const now = new Date();
        const month = now.getMonth() + 1; // 0-11 → +1 thành 1-12
        const year = now.getFullYear();

        const res = await attendancesAPI.getdatamoth(month, year);
        console.log("[test_3]Timesheet:", res.data.data);
        setTimesheetData(res.data.data);
      } catch (error) {
        console.error("[test_3]API ERROR:", error);
      }
    };

    callAPItimesheet();
  }, []);



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
      toast.error(`Xin nghỉ thất bại : ${error.response.data.errors[0].message}`, { autoClose: 5000 });
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



  const CURRENT_YEAR = todayInfo.year;
  const CURRENT_MONTH = todayInfo.month;
  const TODAY = todayInfo.day;

  const generateCalendarData = () => {
    const days = [];
    // Ngày đầu tháng 12/2025 là Thứ 2 (Index = 1)
    const firstDayIndex = new Date(CURRENT_YEAR, CURRENT_MONTH, 1).getDay();
    const daysInMonth = new Date(CURRENT_YEAR, CURRENT_MONTH + 1, 0).getDate();

    // Padding ngày tháng trước (Tháng 11)
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ day: 0, inMonth: false }); // day 0 là placeholder
    }

    // Tạo dữ liệu cho 31 ngày trong tháng 12
    for (let i = 1; i <= daysInMonth; i++) {
      let type = "work";
      let status = [];
      let checkIn = "08:00";
      let checkOut = "17:30";
      let otHours = 0;
      let holidayName = "";
      let weekend_work = [13, 27];

      const dateObj = new Date(CURRENT_YEAR, CURRENT_MONTH, i);
      const dayOfWeek = dateObj.getDay();

      // Xử lý Ngày nghỉ cuối tuần
      if (dayOfWeek === 0 || (dayOfWeek === 6 && !weekend_work.includes(i))) {
        type = "weekend";
      }

      // Xử lý Ngày Lễ Đặc Biệt (Demo Noel)
      if (i === 24 || i === 25) {
        type = "holiday";
        holidayName = i === 24 ? "Đêm Giáng Sinh" : "Giáng Sinh";
      }

      // Xử lý Dữ liệu giả lập cho ngày làm việc
      if (type === "work" && i <= TODAY) {
        // Ngày 5: Đi muộn
        if (i === 5) {
          status.push("late");
          checkIn = "08:45";
        }
        // Ngày 8 (Hôm nay): Chưa có checkout
        if (i === 8) {
          checkOut = "--:--";
        }
        // Ngày 10: Vừa đi muộn VỪA OT (Yêu cầu của bạn)
        if (i === 10) {
          status.push("late", "ot");
          checkIn = "08:30"; // Muộn 30p
          checkOut = "19:30"; // OT 2 tiếng
          otHours = 2;
        }
        // Ngày 15: Chỉ OT
        if (i === 15) {
          status.push("ot");
          checkOut = "19:00";
          otHours = 1.5;
        }
        // Ngày 20: Nghỉ phép
        if (i === 20) {
          type = "leave";
          status.push("leave");
          checkIn = null;
          checkOut = null;
        }
      }
      const isoDate = `${CURRENT_YEAR}-${pad2(CURRENT_MONTH + 1)}-${pad2(i)}`;
      if (i <= TODAY) {
        days.push({
          day: i,
          inMonth: true,
          isToday: i === TODAY,
          type,
          status,
          checkIn,
          checkOut,
          otHours,
          holidayName,
          fullDate: `${pad2(i)}/${pad2(CURRENT_MONTH + 1)}/${CURRENT_YEAR}`,
          isoDate, // ✅ thêm dòng này
        });
      } else {
        days.push({
          day: i,
          inMonth: true,
          isToday: i === TODAY,
          type,
          status,
          checkIn,
          checkOut,
          otHours,
          holidayName,
          fullDate: `${pad2(i)}/${pad2(CURRENT_MONTH + 1)}/${CURRENT_YEAR}`,
          isoDate, // ✅ thêm dòng này
        });
      }
    }
    return days;
  };

  const calendarDays = useMemo(() => generateCalendarData(), []);

  const getDayStyle = (day) => {
    // Ô trống tháng trước
    if (!day.inMonth) return "bg-gray-50/50";

    // cơ bản
    let baseClass =
      "relative border-b border-r border-gray-200 p-1.5 h-28 transition-all hover:bg-blue-50 cursor-pointer flex flex-col justify-between group ";

    // Ngày Lễ
    if (day.type === "holiday")
      return `${baseClass} bg-red-50 hover:bg-red-100`;

    // Cuối tuần
    if (day.type === "weekend")
      return `${baseClass} bg-orange-100 text-gray-400 hover:bg-orange-200`;

    // Nghỉ phép
    if (day.type === "leave")
      return `${baseClass} bg-purple-50 hover:bg-purple-100`;

    // Ngày hôm nay
    if (day.isToday)
      return `${baseClass} bg-blue-100 ring-2 ring-inset ring-blue-400 z-10`;

    // Ngày đã đi làm
    if (day.day <= TODAY) {
      return `${baseClass} bg-green-100 hover:bg-green-200`;
    }
    return `${baseClass} bg-white`;
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
            Bảng công tháng 12/2025
          </h1>
        </div>

        {/* Month Filter */}
        <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
          <button className="p-2 hover:bg-gray-100 rounded-md text-gray-500">
            <ChevronLeft size={20} />
          </button>
          <span className="px-4 font-semibold text-gray-700 min-w-[140px] text-center">
            Tháng 12, 2025
          </span>
          <button className="p-2 hover:bg-gray-100 rounded-md text-gray-500">
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
                    {/* Trường hợp Ngày Lễ */}
                    {day.type === "holiday" && (
                      <div className="flex flex-col items-center justify-center h-full mt-2">
                        <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded text-center leading-tight">
                          🎄 {day.holidayName}
                        </span>
                      </div>
                    )}

                    {/* Trường hợp Nghỉ phép */}
                    {day.type === "leave" && (
                      <div className="mt-2 text-center">
                        <span className="text-[10px] font-medium text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">
                          Annual Leave
                        </span>
                      </div>
                    )}

                    {/* Trường hợp Đi làm (Hiện giờ thực tế) */}
                    {day.type === "work" && (
                      <>
                        <div className="flex justify-center items-center text-[11px] text-gray-500  px-1.5 py-0.5 rounded">
                          <span
                            className={`font-mono font-bold ${day.status.includes("late")
                              ? "text-red-600"
                              : "text-gray-700"
                              }`}
                          >
                            {day.checkIn}
                          </span>
                          <span className="px-2"> - </span>
                          <span className="font-mono font-bold text-gray-700">
                            {day.checkOut}
                          </span>
                        </div>

                        {/* Nếu có OT thì hiện thêm dòng OT */}
                        {day.status.includes("ot") && (
                          <div className="text-[10px] text-center font-bold text-orange-600 bg-orange-50 px-1 rounded mt-0.5">
                            OT: {day.otHours}h
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
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
                      <span className="text-xs bg-red-100 text-red-600 font-bold px-2 py-1 rounded">
                        Ngày lễ
                      </span>
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
                {selectedDate.type === "work" ? (
                  <div className="space-y-4">
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
                      </span>
                    </div>
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

                    {selectedDate.status.includes("ot") && (
                      <div className="p-3 bg-orange-50 border border-orange-100 rounded-lg">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-bold text-orange-700 flex items-center gap-1">
                            <Zap size={14} /> Overtime
                          </span>
                          <span className="text-lg font-bold text-orange-700">
                            {selectedDate.otHours} giờ
                          </span>
                        </div>
                        <p className="text-xs text-orange-600/80">
                          Dự án: Fix bug hệ thống cuối năm
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-4 text-center text-gray-500 italic bg-gray-50 rounded-lg">
                    {selectedDate.type === "weekend"
                      ? "Cuối tuần - Không có lịch làm việc"
                      : selectedDate.type === "holiday"
                        ? `Nghỉ lễ: ${selectedDate.holidayName}`
                        : "Nghỉ phép có lương"}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-6 pt-4 border-t border-gray-100 grid grid-cols-1 gap-2">
                  <Button variant="secondary" className="w-full text-xs">
                    Gửi giải trình chấm công
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* Quick Actions (Bottom Right) */}
          <div className="grid grid-cols-2 gap-3">
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
              <Zap size={20} /> <span className="text-xs ">Đăng ký OT</span>
            </Button>
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
