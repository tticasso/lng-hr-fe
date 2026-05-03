import { memo } from "react";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import { Clock, CheckCircle2, FileText, XCircle, AlertCircle } from "lucide-react";

const RequestsTable = memo(({ requests, pendingCount, approvedCount, onNavigate }) => {
  const renderStatusBadge = (status) => {
    const statusConfig = {
      PENDING: {
        bg: "bg-orange-50",
        text: "text-orange-700",
        border: "border-orange-200",
        icon: <Clock size={14} className="text-orange-600" />,
        label: "Chờ duyệt",
      },
      APPROVED: {
        bg: "bg-green-50",
        text: "text-green-700",
        border: "border-green-200",
        icon: <CheckCircle2 size={14} className="text-green-600" />,
        label: "Đã duyệt",
      },
      Rejected: {
        bg: "bg-red-50",
        text: "text-red-700",
        border: "border-red-200",
        icon: <XCircle size={14} className="text-red-600" />,
        label: "Từ chối",
      },
      CANCELLED: {
        bg: "bg-gray-50",
        text: "text-gray-700",
        border: "border-gray-200",
        icon: <XCircle size={14} className="text-gray-600" />,
        label: "Đã hủy",
      },
    };

    const config = statusConfig[status] || {
      bg: "bg-gray-50",
      text: "text-gray-700",
      border: "border-gray-200",
      icon: <AlertCircle size={14} className="text-gray-600" />,
      label: status,
    };

    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${config.bg} ${config.text} ${config.border}`}
      >
        {config.icon}
        {config.label}
      </span>
    );
  };

  return (
    <Card>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-base font-bold text-gray-800 sm:text-lg">Yêu cầu của tôi</h3>
        <div className="flex flex-wrap gap-2">
          {pendingCount > 0 && (
            <div className="flex items-center gap-1 rounded border border-orange-100 bg-orange-50 px-2 py-1 text-xs font-medium text-orange-600">
              <Clock size={12} /> {pendingCount} Đang chờ
            </div>
          )}
          {approvedCount > 0 && (
            <div className="flex items-center gap-1 rounded border border-green-100 bg-green-50 px-2 py-1 text-xs font-medium text-green-600">
              <CheckCircle2 size={12} /> {approvedCount} Đã duyệt
            </div>
          )}
        </div>
      </div>

      <div className="sm:hidden">
        {requests.length > 0 ? (
          <div className="space-y-3">
            {requests.map((req) => (
              <div key={req.id} className="rounded-xl border border-gray-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800">{req.title}</p>
                    <p className="mt-1 text-xs text-gray-500">{req.date}</p>
                  </div>
                  {renderStatusBadge(req.status)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-gray-400">
            <FileText size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">Chưa có yêu cầu nào</p>
          </div>
        )}
      </div>

      <div className="hidden overflow-x-auto sm:block">
        {requests.length > 0 ? (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="rounded-l-md px-4 py-3">Loại yêu cầu</th>
                <th className="px-4 py-3">Ngày gửi</th>
                <th className="rounded-r-md px-4 py-3 text-right">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {requests.map((req) => (
                <tr key={req.id} className="transition-colors hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-medium text-gray-800">{req.title}</td>
                  <td className="px-4 py-3 text-gray-500">{req.date}</td>
                  <td className="px-4 py-3 text-right">{renderStatusBadge(req.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-8 text-center text-gray-400">
            <FileText size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">Chưa có yêu cầu nào</p>
          </div>
        )}
      </div>

      <div className="mt-4 text-center">
        <Button variant="ghost" className="w-full py-1 text-sm" onClick={onNavigate}>
          Xem lịch sử yêu cầu
        </Button>
      </div>
    </Card>
  );
});

RequestsTable.displayName = "RequestsTable";

export default RequestsTable;
