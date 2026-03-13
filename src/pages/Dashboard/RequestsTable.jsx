import { memo, useEffect } from "react";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import { Clock, CheckCircle2, FileText, XCircle, AlertCircle } from "lucide-react";

const RequestsTable = memo(({ requests, pendingCount, approvedCount, onNavigate }) => {

  useEffect(()=>{
    console.log("CHECK :",requests)
  },[])
  // Function để render status badge với màu sắc và icon đẹp
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
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border} transition-all hover:shadow-sm`}
      >
        {config.icon}
        {config.label}
      </span>
    );
  };
  return (
    <Card>
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-gray-800 text-lg">Yêu cầu của tôi</h3>
        <div className="flex gap-2">
          {pendingCount > 0 && (
            <div className="flex items-center gap-1 bg-orange-50 px-2 py-1 rounded text-xs font-medium text-orange-600 border border-orange-100">
              <Clock size={12} /> {pendingCount} Đang chờ
            </div>
          )}
          {approvedCount > 0 && (
            <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded text-xs font-medium text-green-600 border border-green-100">
              <CheckCircle2 size={12} /> {approvedCount} Đã duyệt
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        {requests.length > 0 ? (
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 rounded-l-md">Loại yêu cầu</th>
                <th className="px-4 py-3">Ngày gửi</th>
                <th className="px-4 py-3 rounded-r-md text-right">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {req.title}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{req.date}</td>
                  <td className="px-4 py-3 text-right">
                    {renderStatusBadge(req.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <FileText size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">Chưa có yêu cầu nào</p>
          </div>
        )}
      </div>
      <div className="mt-4 text-center">
        <Button
          variant="ghost"
          className="text-sm w-full py-1"
          onClick={onNavigate}
        >
          Xem lịch sử yêu cầu
        </Button>
      </div>
    </Card>
  );
});

RequestsTable.displayName = "RequestsTable";

export default RequestsTable;
