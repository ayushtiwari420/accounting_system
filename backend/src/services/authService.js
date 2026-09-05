import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import  prisma  from "../config/prisma.js";
import ApiError from "../utils/ApiError.js";

export const registerUser = async (data) => {
  const { name, email, password, role } = data;

  const existingUser = await prisma.users.findUnique({
    where: {
      email
    }
  });

  if (existingUser) {
    throw new ApiError(
      409,
      "User with this email already exists"
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const userRole = (role && ["ADMIN", "ACCOUNTANT", "CONTACT"].includes(role))
    ? role
    : "ACCOUNTANT";

  const user = await prisma.users.create({
    data: {
      name,
      email,
      password_hash: passwordHash,
      role: userRole,
      is_active: true
    }
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
};


export const loginUser = async (data) => {
  const { email, password } = data;

  const user = await prisma.users.findUnique({
    where: {
      email
    }
  });

  if (!user) {
    throw new ApiError(
      401,
      "Invalid email or password"
    );
  }

  if (!user.is_active) {
    throw new ApiError(
      401,
      "User account is inactive"
    );
  }

  const passwordMatch = await bcrypt.compare(
    password,
    user.password_hash
  );

  if (!passwordMatch) {
    throw new ApiError(
      401,
      "Invalid email or password"
    );
  }

  const accessToken = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d"
    }
  );

  const refreshToken = jwt.sign(
    {
      id: user.id
    },
    process.env.JWT_REFRESH_SECRET || (process.env.JWT_SECRET + "_refresh"),
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d"
    }
  );

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    token: accessToken,
    accessToken,
    refreshToken
  };
};

export const refreshTokenUser = async (tokenValue) => {
  if (!tokenValue) {
    throw new ApiError(401, "Refresh token is required");
  }

  try {
    const refreshSecret = process.env.JWT_REFRESH_SECRET || (process.env.JWT_SECRET + "_refresh");
    const decoded = jwt.verify(tokenValue, refreshSecret);

    const user = await prisma.users.findUnique({
      where: {
        id: decoded.id
      }
    });

    if (!user) {
      throw new ApiError(401, "User not found");
    }

    if (!user.is_active) {
      throw new ApiError(401, "User account is inactive");
    }

    const newAccessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "1d"
      }
    );

    const newRefreshToken = jwt.sign(
      {
        id: user.id
      },
      refreshSecret,
      {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d"
      }
    );

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token: newAccessToken,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(401, "Invalid or expired refresh token");
  }
};