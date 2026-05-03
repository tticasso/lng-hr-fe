import { AlertCircle, Search } from "lucide-react";

import FilterBar from "../../../components/shared/FilterBar";

const AttendanceFilters = ({
  filters,
  departments,
  onFilterChange,
  errorCount,
}) => {
  const controls = (
    <>
      <div className="relative max-w-sm w-full">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          name="search"
          value={filters.search}
          onChange={onFilterChange}
          placeholder="Tìm tên hoặc mã nhân viên..."
          className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <select
        name="department"
        value={filters.department}
        onChange={onFilterChange}
        className="w-full rounded-lg border border-gray-300 bg-white p-2 text-sm text-gray-700 focus:border-blue-500 focus:ring-blue-500 sm:w-auto"
      >
        <option value="">Tất cả phòng ban</option>
        {departments.map((dept) => (
          <option key={dept._id} value={dept.name}>
            {dept.name}
          </option>
        ))}
      </select>

      <select
        name="status"
        value={filters.status}
        onChange={onFilterChange}
        className="w-full rounded-lg border border-gray-300 bg-white p-2 text-sm text-gray-700 focus:border-blue-500 focus:ring-blue-500 sm:w-auto"
      >
        <option value="">Tất cả trạng thái</option>
        <option value="Valid">Valid</option>
        <option value="Error">Error</option>
      </select>
    </>
  );

  const summary = (
    <div className="flex items-start gap-2 text-sm text-gray-500">
      <AlertCircle size={16} className="text-red-500" />
      <span>
        Tìm thấy <strong>{errorCount}</strong> nhân viên có lỗi chấm công
      </span>
    </div>
  );

  return <FilterBar controls={controls} summary={summary} />;
};

export default AttendanceFilters;
