import ApiError from "../utils/ApiError.js";

const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "User is not authenticated"));
    }

    // Allow read-only (GET) viewing for all authenticated system users
    if (req.method === "GET") {
      return next();
    }

    // Restrict modifying actions (POST, PUT, PATCH, DELETE) to authorized roles
    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `Access denied. Role '${req.user.role}' has Read-Only view access and is not authorized to make changes.`
        )
      );
    }

    next();
  };
};

export default roleMiddleware;