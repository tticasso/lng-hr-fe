import { useCallback, useEffect, useState } from "react";

import { Alert, Button, DatePicker, Descriptions, InputNumber, Space, Statistic, Tag } from "antd";
import dayjs from "dayjs";
import { ChevronDown, RefreshCcw, Wifi, WifiOff } from "lucide-react";
import { toast } from "react-toastify";

import { sqlServerApi } from "../../../apis/sqlServerApi";
import {
  formatSyncDateRange,
  formatSyncDateTime,
  getSyncStatusTone,
  normalizeSyncPayload,
} from "./sqlAttendanceSyncView";

const DEFAULT_LIMIT = 5000;

const SqlAttendanceSyncPanel = ({ canWriteAttendance = false, onSynced }) => {
  const [health, setHealth] = useState(null);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(1, "day"),
    dayjs(),
  ]);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  const loadSyncState = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [healthRes, statusRes] = await Promise.all([
        sqlServerApi.getHealth(),
        sqlServerApi.getAttendanceSyncStatus(),
      ]);
      setHealth(normalizeSyncPayload(healthRes));
      setStatus(normalizeSyncPayload(statusRes));
    } catch (err) {
      setError(err.normalizedMessage || "Không thể tải trạng thái đồng bộ Wise Eye");
      setHealth(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSyncState();
  }, [loadSyncState]);

  const handleSyncNow = async () => {
    if (!canWriteAttendance) {
      toast.error("Bạn không có quyền WRITE_ATTENDANCE để đồng bộ Wise Eye");
      return;
    }

    const [fromDate, toDate] = dateRange || [];
    if (!fromDate || !toDate) {
      toast.error("Chọn khoảng ngày cần đồng bộ");
      return;
    }

    try {
      setSyncing(true);
      setError("");
      const res = await sqlServerApi.syncAttendance({
        fromDate: fromDate.format("YYYY-MM-DD"),
        toDate: toDate.format("YYYY-MM-DD"),
        limit,
      });
      const result = normalizeSyncPayload(res);
      setStatus(result);
      toast.success(
        `Đồng bộ Wise Eye thành công: ${result?.operations || 0} bản ghi, bỏ qua ${result?.skippedEmployees?.length || 0}`,
      );
      await onSynced?.();
      await loadSyncState();
    } catch (err) {
      const message = err.normalizedMessage || "Đồng bộ Wise Eye thất bại";
      setError(message);
      toast.error(message);
    } finally {
      setSyncing(false);
    }
  };

  const isConnected = Boolean(health?.connected);
  const latestStatus = status?.status || "--";
  const skippedCount = status?.skippedEmployees?.length || 0;

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold text-gray-900">Đồng bộ Wise Eye</h2>
            <Tag color={isConnected ? "success" : "error"} className="m-0">
              <span className="inline-flex items-center gap-1">
                {isConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
                {isConnected ? "SQL connected" : "SQL disconnected"}
              </span>
            </Tag>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Theo dõi kết nối SQL và kết quả đồng bộ gần nhất.
          </p>
        </div>

        <Button
          icon={<RefreshCcw size={15} />}
          loading={loading}
          onClick={loadSyncState}
        >
          Làm mới
        </Button>
      </div>

      {error && (
        <Alert
          className="mb-4"
          type="error"
          showIcon
          message="Lỗi đồng bộ Wise Eye"
          description={error}
        />
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Statistic
          title="Trạng thái lần cuối"
          value={latestStatus}
          valueStyle={{
            color: getSyncStatusTone(latestStatus) === "error" ? "#dc2626" : "#16a34a",
            fontSize: 20,
          }}
        />
        <Statistic title="Số bản ghi" value={status?.operations || 0} />
        <Statistic title="Đã khớp" value={status?.matchedEmployees || 0} />
        <Statistic
          title="Bỏ qua"
          value={skippedCount}
          valueStyle={{ color: skippedCount > 0 ? "#dc2626" : undefined }}
        />
      </div>

      {canWriteAttendance && (
        <details className="mt-4 rounded-lg border border-gray-200 bg-gray-50">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-gray-700">
            <span>Đồng bộ thủ công</span>
            <ChevronDown size={16} className="text-gray-500" />
          </summary>
          <Space direction="vertical" className="w-full border-t border-gray-200 bg-white p-4" size="middle">
            <DatePicker.RangePicker
              className="w-full"
              value={dateRange}
              onChange={(value) => setDateRange(value || [])}
              allowClear={false}
            />
            <div className="flex gap-2">
              <InputNumber
                className="min-w-0 flex-1"
                min={1}
                max={10000}
                value={limit}
                onChange={(value) => setLimit(value || DEFAULT_LIMIT)}
              />
              <Button
                type="primary"
                loading={syncing}
                onClick={handleSyncNow}
              >
                Đồng bộ ngay
              </Button>
            </div>
          </Space>
        </details>
      )}

      <Descriptions className="mt-4" size="small" bordered column={{ xs: 1, md: 2 }}>
        <Descriptions.Item label="Database">
          {health?.databaseName || "--"}
        </Descriptions.Item>
        <Descriptions.Item label="Login">
          {health?.loginName || "--"}
        </Descriptions.Item>
        <Descriptions.Item label="Khoảng sync">
          {formatSyncDateRange(status)}
        </Descriptions.Item>
        <Descriptions.Item label="Kết thúc lúc">
          {formatSyncDateTime(status?.finishedAt)}
        </Descriptions.Item>
        {status?.errorMessage && (
          <Descriptions.Item label="Lỗi gần nhất" span={2}>
            <span className="text-red-600">{status.errorMessage}</span>
          </Descriptions.Item>
        )}
      </Descriptions>
    </section>
  );
};

export default SqlAttendanceSyncPanel;
