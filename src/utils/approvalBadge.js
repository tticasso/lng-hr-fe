export const getApprovalBadgeCount = (item = {}, approvalCounts = {}) => {
  const badgeKeys = Array.isArray(item.badgeKeys)
    ? item.badgeKeys
    : item.badgeKey
      ? [item.badgeKey]
      : [];

  return badgeKeys.reduce((total, key) => total + (Number(approvalCounts?.[key]) || 0), 0);
};
