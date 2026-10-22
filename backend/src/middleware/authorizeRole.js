
const VALID_ROLES = [
  "admin",
  "dispatcher",
  "driver",
  "user",
];

export const authorizeRole = (...allowedRoles) => {
  const invalidRoles = allowedRoles.filter(
    (role) => !VALID_ROLES.includes(role)
  );

  if (invalidRoles.length > 0) {
    throw new Error(
      `Invalid roles: ${invalidRoles.join(", ")}`
    );
  }

  return (req, res, next) => {
    // Authentication middleware must run first
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action",
      });
    }

    next();
  };
};
