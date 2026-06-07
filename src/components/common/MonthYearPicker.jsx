import { Calendar } from "lucide-react";
import { DatePicker } from "antd";
import viVN from "antd/es/date-picker/locale/vi_VN";
import "dayjs/locale/vi";

import dayjs from "../../untils/dayjs";

dayjs.locale("vi");

const parseMonthValue = (value) => {
  if (!value) return null;

  const parsed = dayjs(`${value}-01`);
  return parsed.isValid() ? parsed : null;
};

const MonthYearPicker = ({
  value,
  onChange,
  className = "",
  disabled = false,
  placeholder = "Chọn tháng",
}) => {
  const selectedValue = parseMonthValue(value);

  const handleChange = (date) => {
    if (!date) return;

    onChange?.({
      target: {
        value: date.format("YYYY-MM"),
      },
    });
  };

  return (
    <DatePicker
      picker="month"
      value={selectedValue}
      onChange={handleChange}
      allowClear={false}
      disabled={disabled}
      format="[Tháng] M/YYYY"
      locale={viVN}
      placeholder={placeholder}
      size="large"
      suffixIcon={<Calendar size={18} className="text-gray-400" />}
      className={`h-12 w-full rounded-xl border-gray-300 px-4 text-base font-semibold ${className}`}
    />
  );
};

export default MonthYearPicker;
