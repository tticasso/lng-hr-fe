export const normalizeSearchText = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();

export const matchesSearchText = (values, query) => {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return true;

  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
  const normalizedValues = (Array.isArray(values) ? values : [values])
    .map(normalizeSearchText)
    .join(" ");

  return tokens.every((token) => normalizedValues.includes(token));
};
