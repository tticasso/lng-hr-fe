export const getListData = (response) => {
  const body = response?.data ?? response;
  const data = body?.data ?? body;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.docs)) return data.docs;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.records)) return data.records;
  if (Array.isArray(data?.employees)) return data.employees;
  if (Array.isArray(data?.accounts)) return data.accounts;
  if (Array.isArray(data?.users)) return data.users;

  return [];
};

export const getPagination = (response, fallback = {}) => {
  const body = response?.data ?? response;
  const data = body?.data ?? {};
  const pagination = body?.pagination ?? data?.pagination ?? {};
  const page = Number(pagination.page ?? pagination.currentPage ?? fallback.page ?? 1);
  const limit = Number(pagination.limit ?? pagination.pageSize ?? fallback.limit ?? 10);
  const total = Number(
    pagination.totalRecords ??
      pagination.total ??
      pagination.count ??
      body?.total ??
      data?.total ??
      data?.totalRecords ??
      data?.count ??
      fallback.total ??
      0,
  );
  const totalPages = Number(
    pagination.totalPages ?? fallback.totalPages ?? Math.max(1, Math.ceil(total / limit)),
  );

  return { page, limit, total, totalPages };
};

export const hasPaginationMetadata = (response) => {
  const body = response?.data ?? response;
  const data = body?.data ?? {};
  const pagination = body?.pagination ?? data?.pagination;

  return Boolean(
    pagination ||
      body?.total !== undefined ||
      body?.totalRecords !== undefined ||
      body?.count !== undefined ||
      data?.total !== undefined ||
      data?.totalRecords !== undefined ||
      data?.count !== undefined,
  );
};
