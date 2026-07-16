import { Router } from "express";
import {
  facebookLoginController, googleLoginController, loginUser, register,
  sendEmailVerificationController, sendPhoneOtp, verifyEmailController, verifyPhoneOtp,
} from "../modules/auth/auth.controller";
import { protect, type AuthRequest } from "../modules/auth/auth.middleware";

const router = Router();
router.post("/register", register);
router.post("/login", loginUser);
router.post("/otp/send", sendPhoneOtp);
router.post("/otp/verify", verifyPhoneOtp);
router.post("/email/send-verification", protect, sendEmailVerificationController);
router.get("/email/verify", verifyEmailController);
router.post("/email/verify", verifyEmailController);
router.post("/google", googleLoginController);
router.post("/facebook", facebookLoginController);
router.get("/me", protect, (req: AuthRequest, res) => res.json({ success: true, data: req.user }));
router.post("/logout", (_req, res) => {
  res.clearCookie("customer_session", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/" });
  return res.json({ success: true, message: "Logged out" });
});
export default router;
