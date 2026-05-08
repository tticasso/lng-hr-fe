import { memo } from "react";
import Card from "../../components/common/Card";
import { Calendar } from "lucide-react";

const EVENT_TYPE_STYLES = {
  PUBLIC_HOLIDAY: "bg-blue-100 text-blue-700 border-blue-100",
  SUBSTITUTE_WORK_DAY: "bg-amber-100 text-amber-700 border-amber-100",
  EVENT: "bg-emerald-100 text-emerald-700 border-emerald-100",
};

const formatEventDate = (dateString) => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return { month: "--", day: "--", shortDate: "--" };
  }

  return {
    month: `THG ${date.getMonth() + 1}`,
    day: String(date.getDate()).padStart(2, "0"),
    shortDate: date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
  };
};

const UpcomingEventItem = ({ event, featured }) => {
  const date = formatEventDate(event.date);
  const style = EVENT_TYPE_STYLES[event.type] || EVENT_TYPE_STYLES.EVENT;

  if (featured) {
    return (
      <div className="flex gap-3 rounded-lg border border-blue-100 bg-white p-3 shadow-sm">
        <div className={`flex min-w-[3.25rem] flex-col items-center justify-center rounded border p-1 ${style}`}>
          <span className="text-xs font-bold uppercase">{date.month}</span>
          <span className="text-lg font-bold">{date.day}</span>
        </div>
        <div className="min-w-0">
          <p className="line-clamp-2 text-sm font-semibold text-gray-800">{event.title}</p>
          <p className="mt-1 text-xs font-medium text-blue-700">{event.workImpact}</p>
          {event.description && (
            <p className="mt-1 line-clamp-2 text-xs text-gray-500">{event.description}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <div className="w-12 pt-1 text-center">
        <span className="text-sm font-medium text-gray-500">{date.shortDate}</span>
      </div>
      <div className="border-l-2 border-gray-200 pl-3 pt-1">
        <p className="line-clamp-1 text-sm font-medium text-gray-700">{event.title}</p>
        <p className="mt-1 text-xs text-gray-600">{event.workImpact || event.badgeLabel}</p>
      </div>
    </div>
  );
};

const UpcomingEvents = memo(({ events = [] }) => {
  const visibleEvents = events.slice(0, 4);

  return (
    <Card className="col-span-12 border-blue-100 bg-blue-50/50 md:col-span-6 lg:col-span-3">
      <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-700 sm:text-lg">
        <Calendar size={18} className="text-blue-500" />
        Sự kiện sắp tới
      </h3>

      {visibleEvents.length > 0 ? (
        <div className="space-y-3">
          {visibleEvents.map((event, index) => (
            <UpcomingEventItem
              key={event.id || `${event.source}-${event.sourceId}-${event.date}`}
              event={event}
              featured={index === 0}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-blue-100 bg-white/70 p-4 text-sm text-gray-500">
          Chưa có sự kiện hoặc ngày nghỉ sắp tới.
        </div>
      )}
    </Card>
  );
});

UpcomingEventItem.displayName = "UpcomingEventItem";
UpcomingEvents.displayName = "UpcomingEvents";

export default UpcomingEvents;