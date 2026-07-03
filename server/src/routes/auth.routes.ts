import { Router } from "express";
import {
  facebookLoginController,
  googleLoginController,
  loginUser,
  register,
  sendEmailVerificationController,
  sendPhoneOtp,
  verifyEmailController,
  verifyPhoneOtp,
} from "../modules/auth/auth.controller";

const router = Router();

router.post("/register", register);
router.post("/login", loginUser);

router.post("/otp/send", sendPhoneOtp);
router.post("/otp/verify", verifyPhoneOtp);

router.post("/email/send-verification", sendEmailVerificationController);
router.get("/email/verify", verifyEmailController);
router.post("/email/verify", verifyEmailController);

router.post("/google", googleLoginController);
router.post("/facebook", facebookLoginController);

export default router;
