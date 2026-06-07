import { DATA_SCOPE_POLICIES } from "../config/accessControl";

const LEGACY_PERMISSION_ALIASES = {
  READ_ACCOUNTS: ["READ_USER"],
  READ_USER: ["READ_ACCOUNTS"],
  WRITE_ACCOUNTS: ["CREATE_USER", "UPDATE_USER", "DELETE_USER"],
  CREATE_USER: ["WRITE_ACCOUNTS"],
  UPDATE_USER: ["WRITE_ACCOUNTS"],
  DELETE_USER: ["WRITE_ACCOUNTS"],
  WRITE_PAYROLLS: ["RUN_PAYROLL"],
  RUN_PAYROLL: ["WRITE_PAYROLLS"],
  READ_LEAVES: ["READ_LEAVE"],
  READ_LEAVE: ["READ_LEAVES"],
  WRITE_LEAVE_BALANCES: ["UPDATE_LEAVE"],
  UPDATE_LEAVE: ["WRITE_LEAVE_BALANCES"],
  APPROVE_ALL_LEAVES: ["APPROVE_LEAVE"],
  APPROVE_LEAVE: ["APPROVE_ALL_LEAVES"],
  READ_ALL_OTS: ["APPROVE_OT"],
  APPROVE_OT: ["READ_ALL_OTS"],
};

const normalizePermission = (permission) => permission?.name || permission;

export const getAccount = (user) => {
  if (!user) return null;
  if (user.account) return user.account;
  if (user.accountId && typeof user.accountId === "object") return user.accountId;
  return null;
};

export const getEmployee = (user) => {
  if (!user) return null;
  if (user.employee) return user.employee;
  if (user.account || user.accountId?.role) {
    return user._id ? user : null;
  }
  return user;
};

export const getRoleName = (user) => {
  const account = getAccount(user);
  return (
    account?.role?.name ||
    user?.role?.name ||
    (typeof user?.role === "string" ? user.role : "") ||
    ""
  );
};

export const getPermissionNames = (user) => {
  const account = getAccount(user);
  const permissionSources = [
    user?.permissionNames,
    account?.permissionNames,
    account?.role?.permissions,
    user?.accountId?.role?.permissions,
    user?.role?.permissions,
    user?.permissions,
  ];

  const names = permissionSources
    .flatMap((permissions) => (Array.isArray(permissions) ? permissions : []))
    .map(normalizePermission)
    .filter(Boolean);
  const expanded = new Set(names);

  names.forEach((name) => {
    (LEGACY_PERMISSION_ALIASES[name] || []).forEach((alias) => expanded.add(alias));
  });

  return Array.from(expanded);
};

export const isSuperAdmin = (user) =>
  getRoleName(user) === "ADMIN" || getPermissionNames(user).includes("MANAGE_SYSTEM");

export const hasPermission = (user, permissionName) =>
  isSuperAdmin(user) || getPermissionNames(user).includes(permissionName);

export const hasAnyPermission = (user, permissionNames = []) =>
  isSuperAdmin(user) || permissionNames.some((permissionName) => hasPermission(user, permissionName));

export const hasAllPermissions = (user, permissionNames = []) =>
  isSuperAdmin(user) || permissionNames.every((permissionName) => hasPermission(user, permissionName));

export const hasRole = (user, roleName) => isSuperAdmin(user) || getRoleName(user) === roleName;

export const DATA_SCOPE_LEVELS = {
  NONE: "none",
  OWN: "own",
  SCOPED: "scoped",
  ALL: "all",
};

export const getDataScope = (user, policyOrKey) => {
  const policy =
    typeof policyOrKey === "string" ? DATA_SCOPE_POLICIES[policyOrKey] : policyOrKey;

  if (!policy || !user) return DATA_SCOPE_LEVELS.NONE;
  if (isSuperAdmin(user) || hasAnyPermission(user, policy.fullAccess || [policy.all])) {
    return DATA_SCOPE_LEVELS.ALL;
  }
  if (policy.scoped && hasPermission(user, policy.scoped)) {
    return DATA_SCOPE_LEVELS.SCOPED;
  }
  if (policy.own && hasPermission(user, policy.own)) {
    return DATA_SCOPE_LEVELS.OWN;
  }

  return DATA_SCOPE_LEVELS.NONE;
};

export const isScopedDataAccess = (user, policyOrKey) =>
  getDataScope(user, policyOrKey) === DATA_SCOPE_LEVELS.SCOPED;
