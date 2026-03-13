import React, { memo } from "react";
import Card from "../../components/common/Card";

const WelcomeCard = memo(({ user, onNavigate }) => {
  return (
    <Card className="col-span-12 lg:col-span-6 bg-gradient-to-r from-blue-600 to-blue-500 text-white border-none shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>

      <div className="flex items-center gap-5 relative z-10 h-full">
        <div className="h-16 w-16 rounded-full bg-white text-blue-600 flex items-center justify-center font-bold text-2xl shadow-sm border-2 border-blue-100">
          {(user?.fullName || "U").charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold">
            Xin chào, {user?.fullName || "Unknown"}! 👋
          </h2>
          <p className="text-blue-100 opacity-90 mt-1">
            {user.jobLevel || "--"} | {user.jobTitle || "--"}
          </p>
          <div className="mt-4 flex gap-3">
            <button
              onClick={onNavigate}
              className="text-sm bg-white/20 hover:bg-white/30 text-white px-4 py-1.5 rounded-full transition text-xs font-medium backdrop-blur-sm"
            >
              Xem hồ sơ cá nhân
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
});

WelcomeCard.displayName = "WelcomeCard";

export default WelcomeCard;
