import ApiError from "../utils/ApiError.js";

const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "User is not authenticated"));
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
      return next(
        new ApiError(403, `Access denied. Role '${req.user.role}' is not authorized to access this resource.`)
      );
    }

    next();
  };
};

export default roleMiddleware;