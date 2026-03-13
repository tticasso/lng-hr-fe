import React, { memo } from "react";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import { Megaphone, FileText, ChevronRight } from "lucide-react";

const AnnouncementList = memo(({ announcements, onAnnouncementClick, onViewAll }) => {
  return (
    <Card>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Megaphone size={20} className="text-blue-600" />
          <h3 className="font-bold text-gray-800 text-lg">Thông báo nội bộ</h3>
        </div>
        <Button
          onClick={onViewAll}
          variant="ghost"
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          Xem tất cả
        </Button>
      </div>

      <div className="divide-y divide-gray-100">
        {announcements.length > 0 ? (
          announcements.map((news) => (
            <div
              key={news.id}
              className="py-4 first:pt-0 last:pb-0 flex items-start gap-4 group cursor-pointer"
              onClick={() => onAnnouncementClick(news.id)}
            >
              <div className="mt-1 p-2 bg-gray-50 rounded-full group-hover:bg-blue-50 transition-colors">
                <FileText
                  size={18}
                  className="text-gray-400 group-hover:text-blue-500"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider 
                      ${
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
                <h4 className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-1">
                  {news.title}
                </h4>
              </div>
              <ChevronRight size={16} className="text-gray-300 mt-3" />
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-400">
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
