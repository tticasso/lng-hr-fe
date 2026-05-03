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
  HOLIDAY: "HOLIDAY",
};

const ANNOUNCEMENT_TAG_MAP = {
  [ANNOUNCEMENT_CATEGORY.HOLIDAY]: "Holiday",
  [ANNOUNCEMENT_CATEGORY.POLICY]: "Policy",
  [ANNOUNCEMENT_CATEGORY.EVENT]: "Event",
  [ANNOUNCEMENT_CATEGORY.NEWS]: "HR Notice",
};

const ANNOUNCEMENT_STATUS_LABEL_MAP = {
  [ANNOUNCEMENT_STATUS.PUBLISHED]: "Published",
  [ANNOUNCEMENT_STATUS.DRAFT]: "Draft",
  [ANNOUNCEMENT_STATUS.SCHEDULED]: "Scheduled",
  [ANNOUNCEMENT_STATUS.ARCHIVED]: "Archived",
};

export const getAnnouncementTag = (category) =>
  ANNOUNCEMENT_TAG_MAP[category] || "Others";

export const getAnnouncementStatusLabel = (status) =>
  ANNOUNCEMENT_STATUS_LABEL_MAP[status] || "Draft";

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
  let tag = "News";
  let type = "success";

  if (item.category === ANNOUNCEMENT_STATUS.SCHEDULED) {
    tag = "Scheduled";
    type = "primary";
  } else if (item.category === ANNOUNCEMENT_CATEGORY.EVENT) {
    tag = "Event";
    type = "primary";
  } else if (item.category === ANNOUNCEMENT_CATEGORY.NEWS) {
    tag = "News";
    type = "success";
  }

  if (item.priority === "URGENT") {
    type = "error";
    tag = "Important";
  } else if (item.priority === "HIGH") {
    type = "error";
  }

  return { tag, type };
};
