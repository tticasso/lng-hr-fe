import { Link } from "react-router-dom";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { ROUTES } from "../config/routes";

const FeatureUnavailable = ({
  title = "Chức năng chưa kích hoạt",
  description = "Trang này chưa được kết nối dữ liệu thật. Hệ thống đã tạm ẩn dữ liệu mẫu để tránh nhầm lẫn khi sử dụng.",
  returnTo = ROUTES.DASHBOARD,
  returnLabel = "Quay lại tổng quan",
}) => (
  <div className="flex min-h-[calc(100dvh-7rem)] items-center justify-center px-4 py-10">
    <div className="w-full max-w-xl rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white text-amber-600 shadow-sm">
        <AlertCircle size={24} />
      </div>
      <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
      <Link
        to={returnTo}
        className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
      >
        <ArrowLeft size={16} />
        {returnLabel}
      </Link>
    </div>
  </div>
);

export default FeatureUnavailable;
