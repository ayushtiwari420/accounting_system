import express from "express";
import { register, login, refreshToken } from "../controllers/authController.js";
import validateMiddleware from "../middleware/validateMiddleware.js";
import { registerSchema, loginSchema, refreshSchema } from "../validators/authValidator.js";

const router = express.Router();

router.post("/register", validateMiddleware(registerSchema), register);
router.post("/login", validateMiddleware(loginSchema), login);
router.post("/refresh", validateMiddleware(refreshSchema), refreshToken);

export default router;