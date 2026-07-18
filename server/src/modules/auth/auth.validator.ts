import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const sendOtpSchema = z.object({
  phone: z.string().min(6),
});

export const verifyOtpSchema = z.object({
  phone: z.string().min(6),
  otp: z.string().min(4).max(8),
});
export const googleAuthSchema = z.object({
  credential: z.string().min(10),
});
export const facebookAuthSchema = z.object({
  accessToken: z.string().min(10),
});
