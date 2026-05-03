import React, { memo } from "react";
import Card from "../../components/common/Card";

const WelcomeCard = memo(({ user, onNavigate }) => {
  return (
    <Card className="col-span-12 overflow-hidden border-none bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg lg:col-span-6">
      <div className="relative">
        <div className="absolute -right-4 -top-4 h-32 w-32 rounded-full bg-white opacity-10 blur-2xl" />

        <div className="relative z-10 flex h-full flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-blue-100 bg-white text-2xl font-bold text-blue-600 shadow-sm sm:h-16 sm:w-16">
            {(user?.fullName || "U").charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold sm:text-2xl">
              Xin chào, {user?.fullName || "Unknown"}!
            </h2>
            <p className="mt-1 text-sm text-blue-100 opacity-90">
              {user?.jobLevel || "--"} | {user?.jobTitle || "--"}
            </p>
            <div className="mt-4">
              <button
                onClick={onNavigate}
                className="rounded-full bg-white/20 px-4 py-2 text-xs font-medium text-white backdrop-blur-sm transition hover:bg-white/30 sm:text-sm"
              >
                Xem hồ sơ cá nhân
              </button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
});

WelcomeCard.displayName = "WelcomeCard";

export default WelcomeCard;
