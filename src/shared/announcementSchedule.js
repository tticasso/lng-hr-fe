export const ANNOUNCEMENT_SCHEDULE_TYPE = {
  NOW: "now",
  SCHEDULE: "schedule",
};

export const ANNOUNCEMENT_STATUS = {
  PUBLISHED: "PUBLISHED",
  DRAFT: "DRAFT",
  SCHEDULED: "SCHEDULED",
  ARCHIVED: "ARCHIVED",
};

export const ANNOUNCEMENT_CATEGORY = {
  NEWS: "NEWS",
  EVENT: "EVENT",
  POLICY: "POLICY",
  OTHER: "OTHER",
};

const ANNOUNCEMENT_TAG_MAP = {
  [ANNOUNCEMENT_CATEGORY.NEWS]: "Tin tức",
  [ANNOUNCEMENT_CATEGORY.POLICY]: "Chính sách",
  [ANNOUNCEMENT_CATEGORY.EVENT]: "Sự kiện",
  [ANNOUNCEMENT_CATEGORY.OTHER]: "Khác",
};

const ANNOUNCEMENT_STATUS_LABEL_MAP = {
  [ANNOUNCEMENT_STATUS.PUBLISHED]: "Đã đăng",
  [ANNOUNCEMENT_STATUS.DRAFT]: "Bản nháp",
  [ANNOUNCEMENT_STATUS.SCHEDULED]: "Đã lên lịch",
  [ANNOUNCEMENT_STATUS.ARCHIVED]: "Đã lưu trữ",
};

export const getAnnouncementTag = (category) =>
  ANNOUNCEMENT_TAG_MAP[category] || "Khác";

export const getAnnouncementStatusLabel = (status) =>
  ANNOUNCEMENT_STATUS_LABEL_MAP[status] || "Bản nháp";

export const parseScheduledAt = (isoString) => {
  if (!isoString || !isoString.includes("T")) {
    return { date: "", time: "" };
  }

  const date = isoString.split("T")[0];
  const time = isoString.split("T")[1].split(".")[0].substring(0, 5);
  return { date, time };
};

export const buildScheduledDateTime = (date, time) => {
  if (!date || !time) return null;
  return `${date}T${time}:00`;
};

export const getAnnouncementDashboardMeta = (item) => {
  let tag = "Tin tức";
  let type = "success";

  if (item.status === ANNOUNCEMENT_STATUS.SCHEDULED) {
    tag = "Đã lên lịch";
    type = "primary";
  } else if (item.category === ANNOUNCEMENT_CATEGORY.EVENT) {
    tag = "Sự kiện";
    type = "primary";
  } else if (item.category === ANNOUNCEMENT_CATEGORY.POLICY) {
    tag = "Chính sách";
    type = "primary";
  } else if (item.category === ANNOUNCEMENT_CATEGORY.NEWS) {
    tag = "Tin tức";
    type = "success";
  }

  if (item.priority === "URGENT") {
    type = "error";
    tag = "Quan trọng";
  } else if (item.priority === "HIGH") {
    type = "error";
  }

  return { tag, type };
};
