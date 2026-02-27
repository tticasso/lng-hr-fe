import React from "react";
import { X, Mail, Phone, MessageCircle, Headphones, Sparkles } from "lucide-react";

const HRSupportModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header với gradient đẹp */}
        <div className="relative bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 p-8 text-white overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors z-10"
          >
            <X size={20} />
          </button>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Headphones size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Hỗ trợ người dùng</h2>
                <p className="text-purple-100 text-sm">Chúng tôi luôn sẵn sàng giúp đỡ bạn</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="mb-6">
            <p className="text-gray-600 leading-relaxed">
              Chúng tôi luôn sẵn sàng hỗ trợ bạn trong quá trình sử dụng ứng dụng. 
              Nếu bạn gặp bất kỳ vấn đề nào hoặc cần được hướng dẫn thêm, vui lòng liên hệ với chúng tôi qua:
            </p>
          </div>

          {/* Contact Cards */}
          <div className="space-y-4">
            {/* Email Card */}
            <div className="group relative bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-xl p-5 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-500 text-white rounded-xl group-hover:scale-110 transition-transform">
                  <Mail size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 mb-1 flex items-center gap-2">
                    Email
                    <Sparkles size={14} className="text-blue-500" />
                  </h3>
                  <a 
                    href="mailto:lanhigroup68@gmail.com"
                    className="text-blue-600 hover:text-blue-700 font-medium text-lg hover:underline"
                  >
                    lanhigroup68@gmail.com
                  </a>
                  <p className="text-xs text-gray-500 mt-1">Gửi email cho chúng tôi bất cứ lúc nào</p>
                </div>
              </div>
            </div>

            {/* Phone Card */}
            <div className="group relative bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-xl p-5 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-500 text-white rounded-xl group-hover:scale-110 transition-transform">
                  <Phone size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 mb-1 flex items-center gap-2">
                    Hotline
                    <Sparkles size={14} className="text-green-500" />
                  </h3>
                  <a 
                    href="tel:0988488061"
                    className="text-green-600 hover:text-green-700 font-medium text-lg hover:underline"
                  >
                    0988488061
                  </a>
                  <p className="text-xs text-gray-500 mt-1">Hỗ trợ trực tiếp qua điện thoại</p>
                </div>
              </div>
            </div>

            {/* Message Card */}
            <div className="group relative bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-xl p-5 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-xl group-hover:scale-110 transition-transform">
                  <MessageCircle size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 mb-1 flex items-center gap-2">
                    Tin nhắn trực tiếp
                    <Sparkles size={14} className="text-purple-500" />
                  </h3>
                  <p className="text-purple-600 font-medium text-lg">
                    Group Lan Nhi Group
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Gửi tin nhắn trực tiếp cho đội ngũ hỗ trợ</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Message */}
          <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
            <p className="text-sm text-gray-700 text-center">
              <span className="font-semibold text-amber-700">💡 Lưu ý:</span> Chúng tôi sẽ phản hồi trong thời gian sớm nhất để đảm bảo trải nghiệm tốt nhất cho bạn!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-8 pb-8">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium shadow-lg hover:shadow-xl"
          >
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  );
};

export default HRSupportModal;
