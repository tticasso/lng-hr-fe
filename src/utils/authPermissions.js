const LEGACY_PERMISSION_ALIASES = {
  READ_ACCOUNTS: ["READ_USER"],
  WRITE_ACCOUNTS: ["CREATE_USER", "UPDATE_USER", "DELETE_USER"],
};

const REVERSE_LEGACY_PERMISSION_ALIASES = {
  READ_USER: ["READ_ACCOUNTS"],
  CREATE_USER: ["WRITE_ACCOUNTS"],
  UPDATE_USER: ["WRITE_ACCOUNTS"],
  DELETE_USER: ["WRITE_ACCOUNTS"],
};

export const getRoleName = (user) =>
  user?.accountId?.role?.name ||
  user?.role?.name ||
  (typeof user?.role === "string" ? user.role : "") ||
  "";

export const getPermissionNames = (user) => {
  const permissions =
    user?.accountId?.role?.permissions ||
    user?.role?.permissions ||
    user?.permissions ||
    [];

  const names = permissions
    .map((permission) => permission?.name || permission)
    .filter(Boolean);
  const expanded = new Set(names);

  names.forEach((name) => {
    (LEGACY_PERMISSION_ALIASES[name] || []).forEach((alias) => expanded.add(alias));
    (REVERSE_LEGACY_PERMISSION_ALIASES[name] || []).forEach((alias) => expanded.add(alias));
  });

  return Array.from(expanded);
};

export const hasPermission = (user, permissionName) =>
  getPermissionNames(user).includes(permissionName);

export const hasAnyPermission = (user, permissionNames = []) =>
  permissionNames.some((permissionName) => hasPermission(user, permissionName));

export const hasAllPermissions = (user, permissionNames = []) =>
  permissionNames.every((permissionName) => hasPermission(user, permissionName));

export const hasRole = (user, roleName) => getRoleName(user) === roleName;
