import React, { memo } from "react";
import Card from "../../components/common/Card";
import { getAvatarUrl, hasAvatar } from "../../utils/avatar";

const WelcomeCard = memo(({ user, onNavigate }) => {
  const avatarUrl = user?.avatar || user?.employee?.avatar || "";

  return (
    <Card className="col-span-12 overflow-hidden border-none bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg lg:col-span-6">
      <div className="relative">
        <div className="absolute -right-4 -top-4 h-32 w-32 rounded-full bg-white opacity-10 blur-2xl" />

        <div className="relative z-10 flex h-full flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-blue-100 bg-white text-3xl font-bold text-blue-600 shadow-sm sm:h-24 sm:w-24">
            {hasAvatar(avatarUrl) ? (
              <img
                src={getAvatarUrl(avatarUrl, 128)}
                alt="Avatar"
                className="h-full w-full object-cover"
              />
            ) : (
              (user?.fullName || "U").charAt(0).toUpperCase()
            )}
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
