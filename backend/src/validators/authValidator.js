import  z  from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must contain at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),

  email: z
    .string()
    .email("Invalid email address"),

  password: z
    .string()
    .min(6, "Password must contain at least 6 characters"),

  role: z
    .enum(["ADMIN", "ACCOUNTANT", "CONTACT"])
    .optional()
});


export const loginSchema = z.object({
  email: z
    .string()
    .email("Invalid email address"),

  password: z
    .string()
    .min(1, "Password is required")
});

export const refreshSchema = z.object({
  refreshToken: z
    .string()
    .min(1, "Refresh token is required")
});

export const requestOtpSchema = z.object({
  email: z
    .string({ required_error: "Email address is required" })
    .transform((val) => val.trim().toLowerCase())
    .pipe(z.string().email("Please enter a valid email address"))
});

export const resetPasswordSchema = z.object({
  email: z
    .string({ required_error: "Email address is required" })
    .transform((val) => val.trim().toLowerCase())
    .pipe(z.string().email("Please enter a valid email address")),
  otp: z
    .string({ required_error: "OTP code is required" })
    .transform((val) => val.trim()),
  newPassword: z
    .string()
    .min(6, "New password must be at least 6 characters long")
});