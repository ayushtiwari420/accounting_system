import ApiError from "../utils/ApiError.js";

const validateMiddleware = (schema) => (req, res, next) => {
  try {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const issue = result.error.issues ? result.error.issues[0] : null;
      const errorMessage = issue
        ? `${issue.path.join(".")}: ${issue.message}`
        : "Validation error";
      throw new ApiError(400, errorMessage);
    }
    req.body = result.data;
    next();
  } catch (error) {
    next(error);
  }
};

export default validateMiddleware;
