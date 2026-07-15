export const normalizeSyncPayload = (response) => (
  response?.data?.data || response?.data || response || null
);

export const getSyncStatusTone = (status) => {
  if (status === "SUCCESS" || status === "success") return "success";
  if (status === "FAILED" || status === "failed") return "error";
  return "default";
};

export const formatSyncDateTime = (value) => {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const formatSyncDateRange = (syncLog) => {
  if (!syncLog?.fromDate || !syncLog?.toDate) return "--";
  return `${syncLog.fromDate} -> ${syncLog.toDate}`;
};
