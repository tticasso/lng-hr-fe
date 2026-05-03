import React, { memo } from "react";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import { Megaphone, FileText, ChevronRight } from "lucide-react";

const AnnouncementList = memo(({ announcements, onAnnouncementClick, onViewAll }) => {
  return (
    <Card>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Megaphone size={20} className="text-blue-600" />
          <h3 className="text-base font-bold text-gray-800 sm:text-lg">Thông báo nội bộ</h3>
        </div>
        <Button
          onClick={onViewAll}
          variant="ghost"
          className="justify-start px-0 text-sm text-blue-600 hover:text-blue-700 sm:w-auto"
        >
          Xem tất cả
        </Button>
      </div>

      <div className="divide-y divide-gray-100">
        {announcements.length > 0 ? (
          announcements.map((news) => (
            <div
              key={news.id}
              className="group flex cursor-pointer items-start gap-3 py-4 first:pt-0 last:pb-0 sm:gap-4"
              onClick={() => onAnnouncementClick(news.id)}
            >
              <div className="mt-1 rounded-full bg-gray-50 p-2 transition-colors group-hover:bg-blue-50">
                <FileText
                  size={18}
                  className="text-gray-400 group-hover:text-blue-500"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      news.tag === "Important"
                        ? "bg-red-100 text-red-600"
                        : news.tag === "Policy"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-green-100 text-green-600"
                    }`}
                  >
                    {news.tag}
                  </span>
                  <span className="text-xs text-gray-400">• {news.date}</span>
                </div>
                <h4 className="line-clamp-2 text-sm font-semibold text-gray-800 transition-colors group-hover:text-blue-600">
                  {news.title}
                </h4>
              </div>
              <ChevronRight size={16} className="mt-3 hidden text-gray-300 sm:block" />
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-gray-400">
            <FileText size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">Chưa có thông báo nào</p>
          </div>
        )}
      </div>
    </Card>
  );
});

AnnouncementList.displayName = "AnnouncementList";

export default AnnouncementList;
