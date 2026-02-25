import React, { useState, useEffect, useMemo } from "react";
import {
    Calendar,
    Search,
    Filter,
    Download,
    RefreshCw,
    Loader2,
    AlertCircle,
    TrendingUp,
    Users,
    DollarSign,
} from "lucide-react";

import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import MonthYearPicker from "../../components/common/MonthYearPicker";
import { payrollAPI } from "../../apis/payrollAPI";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";

const AllPayRoll = () => {
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        return `${year}-${month}`;
    }); // Default: tháng hiện tại
    const [payrollData, setPayrollData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]); // State lưu các hàng được chọn

    // Filter state
    const [filters, setFilters] = useState({
        search: "",
        department: "",
        status: "",
    });

    // Status options
    const statusOptions = [
        { value: "FINALIZED", label: "Đã hoàn tất" },
        { value: "PAID", label: "Đã thanh toán" },
    ];

    // Fetch data when month changes
    useEffect(() => {
        fetchPayrollData();
    }, [selectedMonth]);

    const fetchPayrollData = async () => {
        try {
            setLoading(true);
            const [year, month] = selectedMonth.split("-");

            const res = await payrollAPI.getall(month, year);
            console.log("✅ Payroll data loaded:", res);

            const apiData = res.data?.data?.data || res.data?.data || [];
            setPayrollData(apiData);

            toast.success("Tải dữ liệu lương thành công");
        } catch (error) {
            console.error("❌ Error fetching payroll data:", error);
            toast.error("Không thể tải dữ liệu lương. Vui lòng thử lại.");
            setPayrollData([]);
        } finally {
            setLoading(false);
        }
    };

    // Filter logic (local)
    const filteredData = useMemo(() => {
        let result = [...payrollData];

        // Filter by search
        if (filters.search.trim()) {
            const searchLower = filters.search.toLowerCase();
            result = result.filter(
                (item) =>
                    item.employeeId?.fullName?.toLowerCase().includes(searchLower) ||
                    item.employeeId?.employeeCode?.toLowerCase().includes(searchLower) ||
                    item.departmentId?.name?.toLowerCase().includes(searchLower)
            );
        }

        // Filter by department
        if (filters.department) {
            result = result.filter(
                (item) => item.departmentId?.name === filters.department
            );
        }

        // Filter by status
        if (filters.status) {
            result = result.filter((item) => item.status === filters.status);
        }

        return result;
    }, [payrollData, filters]);

    // Get unique departments for filter
    const departments = useMemo(() => {
        const deptSet = new Set();
        payrollData.forEach((item) => {
            if (item.departmentId?.name) {
                deptSet.add(item.departmentId.name);
            }
        });
        return Array.from(deptSet);
    }, [payrollData]);

    // Calculate summary statistics
    const summary = useMemo(() => {
        return {
            totalEmployees: filteredData.length,
            totalGross: filteredData.reduce((sum, item) => sum + (item.grossIncome || 0), 0),
            totalNet: filteredData.reduce((sum, item) => sum + (item.netIncome || 0), 0),
            totalDeduction: filteredData.reduce((sum, item) => sum + (item.insurance?.total || 0), 0),
        };
    }, [filteredData]);

    // Format money
    const formatMoney = (amount) =>
        new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);

    // Handle filter change
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    // Handler chọn/bỏ chọn một hàng
    const handleSelectRow = (rowId) => {
        setSelectedRows((prev) => {
            if (prev.includes(rowId)) {
                return prev.filter((id) => id !== rowId);
            } else {
                return [...prev, rowId];
            }
        });
    };

    // Handler chọn/bỏ chọn tất cả
    const handleSelectAll = () => {
        if (selectedRows.length === filteredData.length) {
            setSelectedRows([]);
        } else {
            setSelectedRows(filteredData.map((row) => row._id));
        }
    };

    // Check xem tất cả có được chọn không
    const isAllSelected = filteredData.length > 0 && selectedRows.length === filteredData.length;
    const isSomeSelected = selectedRows.length > 0 && selectedRows.length < filteredData.length;

    // Handle payment
    const handlePayment = async () => {
        if (selectedRows.length === 0) {
            toast.warning("Vui lòng chọn ít nhất một bản lương để thanh toán!");
            return;
        }

        const [year, month] = selectedMonth.split("-");

        let payload;

        // Nếu chọn tất cả
        if (isAllSelected) {
            payload = {
                month: parseInt(month, 10),
                year: parseInt(year, 10),
            };
            console.log("📤 Payload (Chọn tất cả):", payload);
        } else {
            // Nếu chọn một hoặc nhiều (nhưng không phải tất cả)
            payload = {
                month: parseInt(month, 10),
                year: parseInt(year, 10),
                payrollIds: selectedRows, // Mảng các ID đã chọn
            };
            console.log("📤 Payload (Chọn từng cái):", payload);
        }

        // TODO: Gọi API thanh toán ở đây
        try {
            const res = await payrollAPI.markpaid(payload);
            console.log("📤 Payload gửi API:", payload);
            console.log("API :", res)
            toast.success("Thanh toán thành công!");
            fetchPayrollData(); // Reload data
            setSelectedRows([]); // Clear selection
        } catch (error) {
            toast.error("Thanh toán thất bại!");
        }

        toast.info(`Sẵn sàng thanh toán cho ${selectedRows.length} bản lương`);
    };

    // Export to Excel
    const handleExportExcel = () => {
        try {
            const exportData = filteredData.map((item, index) => ({
                "Số thứ tự": index + 1,
                "Mã nhân viên": item.employeeId?.employeeCode || "",
                "Họ và tên": item.employeeId?.fullName || "",
                "Phòng ban": item.departmentId?.name || "",
                "Lương cơ bản": item.baseSalary || 0,
                "Lương làm thêm": item.otPay || 0,
                "Phụ cấp": item.totalAllowance || 0,
                "Khấu trừ": item.totalDeduction || 0,
                "Thực nhận": item.netIncome || 0,
                "Trạng thái": item.status || "",
            }));

            const ws = XLSX.utils.json_to_sheet(exportData, { origin: "A4" });

            const [year, month] = selectedMonth.split("-");
            XLSX.utils.sheet_add_aoa(
                ws,
                [
                    ["Tập đoàn LNG"],
                    [`Bảng lương tháng ${month}/${year}`],
                    [new Date().toLocaleDateString("vi-VN")],
                ],
                { origin: "A1" }
            );

            ws["!merges"] = [
                { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } },
                { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } },
                { s: { r: 2, c: 0 }, e: { r: 2, c: 8 } },
            ];

            const headerStyle = {
                font: { bold: true, sz: 16, color: { rgb: "1F4E78" } },
                alignment: { horizontal: "center", vertical: "center" },
            };

            ["A1", "A2", "A3"].forEach((cell) => {
                if (ws[cell]) ws[cell].s = headerStyle;
            });

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Bảng lương");

            XLSX.writeFile(wb, `Bang_luong_${month}_${year}.xlsx`);
            toast.success(`Đã xuất ${exportData.length} bản lương ra Excel`);
        } catch (error) {
            console.error("Lỗi xuất file:", error);
            toast.error("Không thể xuất file Excel");
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Bảng lương theo tháng
                    </h1>
                    <p className="text-sm text-gray-500">
                        Quản lý và theo dõi bảng lương nhân viên
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Month Selector */}
                    <MonthYearPicker
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                    />

                    <Button
                        variant="secondary"
                        onClick={fetchPayrollData}
                        disabled={loading}
                        className="flex items-center gap-2"
                    >
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                        Tải lại
                    </Button>

                    <Button
                        onClick={handlePayment}
                        disabled={selectedRows.length === 0}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <DollarSign size={16} />
                        Thanh toán ({selectedRows.length})
                    </Button>

                    <Button
                        onClick={handleExportExcel}
                        disabled={filteredData.length === 0}
                        className="flex items-center gap-2"
                    >
                        <Download size={16} />
                        Xuất Excel
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-blue-600 font-medium uppercase">
                                Tổng nhân viên
                            </p>
                            <p className="text-2xl font-bold text-blue-700 mt-1">
                                {summary.totalEmployees}
                            </p>
                        </div>
                        <div className="p-3 bg-blue-200 rounded-lg">
                            <Users size={24} className="text-blue-700" />
                        </div>
                    </div>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-green-600 font-medium uppercase">
                                Tổng thu nhập
                            </p>
                            <p className="text-xl font-bold text-green-700 mt-1">
                                {formatMoney(summary.totalGross)}
                            </p>
                        </div>
                        <div className="p-3 bg-green-200 rounded-lg">
                            <DollarSign size={24} className="text-green-700" />
                        </div>
                    </div>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-purple-600 font-medium uppercase">
                                Tổng thực nhận
                            </p>
                            <p className="text-xl font-bold text-purple-700 mt-1">
                                {formatMoney(summary.totalNet)}
                            </p>
                        </div>
                        <div className="p-3 bg-purple-200 rounded-lg">
                            <TrendingUp size={24} className="text-purple-700" />
                        </div>
                    </div>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-orange-600 font-medium uppercase">
                                Tổng khấu trừ
                            </p>
                            <p className="text-xl font-bold text-orange-700 mt-1">
                                {formatMoney(summary.totalDeduction)}
                            </p>
                        </div>
                        <div className="p-3 bg-orange-200 rounded-lg">
                            <AlertCircle size={24} className="text-orange-700" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Filters */}
            <Card className="p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search
                            size={20}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                            type="text"
                            name="search"
                            value={filters.search}
                            onChange={handleFilterChange}
                            placeholder="Tìm kiếm theo tên, mã nhân viên, phòng ban..."
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                        />
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <div className="relative">
                            <Filter
                                size={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            <select
                                name="department"
                                value={filters.department}
                                onChange={handleFilterChange}
                                className="pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-blue-500 cursor-pointer min-w-[160px]"
                            >
                                <option value="">Phòng ban (Tất cả)</option>
                                {departments.map((dept) => (
                                    <option key={dept} value={dept}>
                                        {dept}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <select
                            name="status"
                            value={filters.status}
                            onChange={handleFilterChange}
                            className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-blue-500 cursor-pointer min-w-[140px]"
                        >
                            <option value="">Trạng thái (Tất cả)</option>
                            <option value="FINALIZED">Đã hoàn tất</option>
                            <option value="PAID">Đã thanh toán</option>
                        </select>

                        {selectedRows.length > 0 && (
                            <div className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                                Đã chọn: {selectedRows.length}/{filteredData.length}
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            {/* Data Table */}
            <Card className="p-0 overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="flex flex-col items-center gap-3">
                                <Loader2 size={40} className="animate-spin text-blue-600" />
                                <p className="text-sm text-gray-500">Đang tải dữ liệu lương...</p>
                            </div>
                        </div>
                    ) : filteredData.length === 0 ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="text-center text-gray-400">
                                <AlertCircle size={48} className="mx-auto mb-3 opacity-50" />
                                <p className="text-sm font-medium">Không có dữ liệu lương</p>
                                <p className="text-xs mt-1">Vui lòng chọn tháng khác hoặc thử lại</p>
                            </div>
                        </div>
                    ) : (
                        <table className="w-full text-left text-sm border-collapse">
                            <thead className="bg-gradient-to-r from-blue-50 to-blue-100 border-b-2 border-blue-200 text-xs uppercase text-blue-700 font-bold tracking-wider sticky top-0 z-10">
                                <tr>
                                    <th className="p-4 w-12">
                                        <div className="flex items-center justify-center">
                                            <input
                                                type="checkbox"
                                                checked={isAllSelected}
                                                ref={(el) => {
                                                    if (el) el.indeterminate = isSomeSelected;
                                                }}
                                                onChange={handleSelectAll}
                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                            />
                                        </div>
                                    </th>
                                    <th className="p-4 w-10">#</th>
                                    <th className="p-4">Nhân viên</th>
                                    <th className="p-4">Phòng ban</th>
                                    <th className="p-4 text-right">Lương cơ bản</th>
                                    <th className="p-4 text-right">Lương làm thêm</th>
                                    <th className="p-4 text-right">Phụ cấp</th>
                                    <th className="p-4 text-right">Khấu trừ</th>
                                    <th className="p-4 text-right bg-blue-100">Thực nhận</th>
                                    <th className="p-4 text-center">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {filteredData.map((row, index) => {
                                    const isSelected = selectedRows.includes(row._id);
                                    return (
                                        <tr
                                            key={row._id}
                                            className={`hover:bg-blue-50/50 transition-colors group ${isSelected ? 'bg-blue-50/50' : ''}`}
                                        >
                                            <td className="p-4">
                                                <div className="flex items-center justify-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => handleSelectRow(row._id)}
                                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                                    />
                                                </div>
                                            </td>
                                            <td className="p-4 text-gray-500 font-mono text-xs">
                                                {index + 1}
                                            </td>
                                            <td className="p-4">
                                                <div>
                                                    <p className="font-semibold text-gray-900">
                                                        {row.employeeId?.fullName || "--"}
                                                    </p>
                                                    <p className="text-xs text-gray-500 font-mono">
                                                        {row.employeeId?.employeeCode || "--"}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="p-4 text-gray-600">
                                                {row.departmentId?.name || "--"}
                                            </td>
                                            <td className="p-4 text-right font-mono text-gray-700">
                                                {formatMoney(row.baseSalary || 0)}
                                            </td>
                                            <td className="p-4 text-right font-mono text-orange-600">
                                                {formatMoney(row.otPay || 0)}
                                            </td>
                                            <td className="p-4 text-right font-mono text-green-600">
                                                {formatMoney(row.totalAllowance || 0)}
                                            </td>
                                            <td className="p-4 text-right font-mono text-red-600">
                                                -{formatMoney(row.totalDeduction || 0)}
                                            </td>
                                            <td className="p-4 text-right font-mono font-bold text-blue-700 bg-blue-50/50 text-base">
                                                {formatMoney(row.netIncome || 0)}
                                            </td>
                                            <td className="p-4 text-center">
                                                {row.status === "FINALIZED" ? (
                                                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">
                                                        Đã hoàn tất
                                                    </span>
                                                ) : row.status === "PAID" ? (
                                                    <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-bold">
                                                        Đã thanh toán
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-bold">
                                                        {row.status}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Footer */}
                {!loading && filteredData.length > 0 && (
                    <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center text-sm text-gray-600">
                        <div>
                            Hiển thị <strong>{filteredData.length}</strong> bản lương
                        </div>
                        <div className="text-xs text-gray-500">
                            Cập nhật lần cuối: {new Date().toLocaleString("vi-VN")}
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default AllPayRoll;
