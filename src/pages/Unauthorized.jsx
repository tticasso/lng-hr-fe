import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Home, ShieldAlert } from "lucide-react";

import Button from "../components/common/Button";
import Card from "../components/common/Card";
import { ROUTES } from "../config/routes";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-600">
          <ShieldAlert size={40} />
        </div>

        <h1 className="mt-6 text-2xl font-bold text-gray-900">Không có quyền truy cập</h1>
        <p className="mt-3 text-sm leading-6 text-gray-500">
          Tài khoản của bạn chưa có quyền để xem trang này. Nếu bạn cần truy cập, vui lòng liên hệ quản trị viên để được cấp quyền phù hợp.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button
            variant="secondary"
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2"
          >
            <ArrowLeft size={18} />
            Quay lại
          </Button>

          <Link to={ROUTES.DASHBOARD}>
            <Button className="flex w-full items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 sm:w-auto">
              <Home size={18} />
              Về tổng quan
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Unauthorized;
