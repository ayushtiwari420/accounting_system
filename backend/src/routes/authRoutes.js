import express from "express";
import { register, login, refreshToken, requestOtp, resetPassword } from "../controllers/authController.js";
import validateMiddleware from "../middleware/validateMiddleware.js";
import { registerSchema, loginSchema, refreshSchema, requestOtpSchema, resetPasswordSchema } from "../validators/authValidator.js";

const router = express.Router();

router.post("/register", validateMiddleware(registerSchema), register);
router.post("/login", validateMiddleware(loginSchema), login);
router.post("/refresh", validateMiddleware(refreshSchema), refreshToken);
router.post("/request-otp", validateMiddleware(requestOtpSchema), requestOtp);
router.post("/reset-password", validateMiddleware(resetPasswordSchema), resetPassword);

export default router;