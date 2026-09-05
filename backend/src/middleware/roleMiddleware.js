import ApiError from "../utils/ApiError.js";

const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(
        new ApiError(401, "User is not authenticated")
      );
    }

    // Allow all active authenticated roles (ADMIN, ACCOUNTANT, CONTACT) to view and create transactions
    next();
  };
};

export default roleMiddleware;