import { Search } from "lucide-react";

const OTFilters = ({ filters, setFilters }) => {
  return (
    <div className="border-b bg-gray-50/80 px-3 py-3 sm:px-4">
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1.35fr)_240px_240px]">
        <div className="relative min-w-0">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            className="w-full rounded-lg border py-2.5 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Tìm theo tên nhân sự..."
            value={filters.searchName}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, searchName: event.target.value }))
            }
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:contents">
          <select
            className="w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none"
            value={filters.statusGroup}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, statusGroup: event.target.value }))
            }
          >
            <option value="">Tất cả trạng thái</option>
            <option value="PENDING">Chờ duyệt</option>
            <option value="APPROVED">Đã duyệt</option>
            <option value="REJECTED">Từ chối</option>
          </select>

          <select
            className="w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none"
            value={filters.otType}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, otType: event.target.value }))
            }
          >
            <option value="">Tất cả loại OT</option>
            <option value="WEEKDAY">Ngày thường</option>
            <option value="WEEKEND">Cuối tuần</option>
            <option value="HOLIDAY">Ngày lễ</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default OTFilters;
