import jwt from "jsonwebtoken";
import prisma  from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";

const authMiddleware = async (req, res, next) => {
  try {
    // Get Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new ApiError(
        401,
        "Authorization header is required"
      );
    }

    // Expected format:
    // Authorization: Bearer TOKEN
    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      throw new ApiError(
        401,
        "Invalid authorization format"
      );
    }

    const token = parts[1];

    // Verify JWT
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Find user
    const user = await prisma.users.findUnique({
      where: {
        id: decoded.id
      }
    });

    if (!user) {
      throw new ApiError(
        401,
        "User not found"
      );
    }

    if (!user.is_active) {
      throw new ApiError(
        401,
        "User account is inactive"
      );
    }

    // Attach user to request
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    next();

  } catch (error) {
    next(error);
  }
};

export default authMiddleware;