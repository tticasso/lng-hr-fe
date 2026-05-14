export const getPermissionNames = (user) => {
  const permissions =
    user?.accountId?.role?.permissions ||
    user?.role?.permissions ||
    user?.permissions ||
    [];

  return permissions.map((permission) => permission?.name || permission);
};

export const hasPermission = (user, permissionName) =>
  getPermissionNames(user).includes(permissionName);
