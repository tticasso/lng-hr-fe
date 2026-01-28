import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";

// Import UI Kit
import Button from "../components/common/Button";
import Card from "../components/common/Card";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Illustration Area */}
        <div className="relative">
          {/* Background circles effect */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-50 rounded-full blur-xl -z-10"></div>

          {/* Main Icon */}
          <div className="mx-auto w-24 h-24 bg-white border-4 border-blue-50 rounded-full flex items-center justify-center shadow-sm">
            <FileQuestion size={48} className="text-blue-500" />
          </div>

          {/* 404 Text */}
          <h1 className="mt-6 text-8xl font-black text-gray-900 tracking-tighter">
            4<span className="text-blue-600">0</span>4
          </h1>
        </div>

        {/* Text Content */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-800">
            Oops! Không tìm thấy trang này.
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Có vẻ như đường dẫn bạn truy cập không tồn tại hoặc đã bị di chuyển.
            Vui lòng kiểm tra lại URL hoặc quay về trang chủ.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="secondary"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 justify-center"
          >
            <ArrowLeft size={18} />
            Quay lại
          </Button>

          <Link to="/">
            <Button className="w-full sm:w-auto flex items-center gap-2 justify-center bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200">
              <Home size={18} />
              Về Dashboard
            </Button>
          </Link>
        </div>

        {/* Footer Support */}
        <div className="pt-8 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Nếu bạn cho rằng đây là lỗi hệ thống, vui lòng liên hệ{" "}
            <span className="text-blue-600 font-medium cursor-pointer hover:underline">
              IT Support
            </span>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
