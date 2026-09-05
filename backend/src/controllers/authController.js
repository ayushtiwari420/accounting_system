import * as authService from "../services/authService.js";
import asyncHandler from "../utils/asyncHandler.js";
import  successResponse  from "../utils/response.js";

export const register = asyncHandler(async (req, res) => {
  const user = await authService.registerUser(req.body);

  return successResponse(
    res,
    user,
    201,
    "User registered successfully"
  );
});

export const login = asyncHandler(async (req, res) => {
  const result = await authService.loginUser(req.body);

  return successResponse(
    res,
    result,
    200,
    "Login successful"
  );
});

export const refreshToken = asyncHandler(async (req, res) => {
  const token = req.body.refreshToken || req.headers["x-refresh-token"];
  const result = await authService.refreshTokenUser(token);

  return successResponse(
    res,
    result,
    200,
    "Token refreshed successfully"
  );
});

export const requestOtp = asyncHandler(async (req, res) => {
  const result = await authService.requestOtp(req.body);

  return successResponse(
    res,
    result,
    200,
    result.message || "OTP sent successfully"
  );
});

export const resetPassword = asyncHandler(async (req, res) => {
  const result = await authService.resetPassword(req.body);

  return successResponse(
    res,
    result,
    200,
    result.message || "Password updated successfully"
  );
});