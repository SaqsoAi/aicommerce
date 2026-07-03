import {
  Request,
  Response,
} from "express";

import {
  loginSchema,
  registerSchema,
  sendOtpSchema,
  verifyOtpSchema,
  googleAuthSchema,
  facebookAuthSchema,
} from "./auth.validator";

import {
  buildAuthResponse,
  loginUserService,
  registerUser,
  sendPhoneOtpService,
  verifyPhoneOtpService,
  sendEmailVerificationService,
  verifyEmailService,
  loginWithGoogleService,
  loginWithFacebookService,
} from "./auth.service";

export const register = async (
  req: Request,
  res: Response
) => {
  try {
    const data = registerSchema.parse(req.body);

    const user = await registerUser(
      data.name,
      data.email,
      data.password
    );

    return res.status(201).json({
      success: true,
      ...buildAuthResponse(user),
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error?.message || "Registration failed",
    });
  }
};

export const loginUser = async (
  req: Request,
  res: Response
) => {
  try {
    const data = loginSchema.parse(req.body);

    const user = await loginUserService(
      data.email,
      data.password
    );

    return res.status(200).json({
      success: true,
      ...buildAuthResponse(user),
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error?.message || "Login failed",
    });
  }
};

export const sendPhoneOtp = async (
  req: Request,
  res: Response
) => {
  try {
    const data = sendOtpSchema.parse(req.body);

    const result = await sendPhoneOtpService(data.phone);

    return res.json({
      success: true,
      data: result,
      message: "OTP sent successfully",
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error?.message || "OTP send failed",
    });
  }
};

export const verifyPhoneOtp = async (
  req: Request,
  res: Response
) => {
  try {
    const data = verifyOtpSchema.parse(req.body);

    const result = await verifyPhoneOtpService(
      data.phone,
      data.otp
    );

    return res.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error?.message || "OTP verification failed",
    });
  }
};

const getUserIdFromRequest = (req: Request): string => {
  const user = (req as any).user;
  return user?.id || user?.userId || req.body?.userId || "";
};

export const sendEmailVerificationController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = getUserIdFromRequest(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const data = await sendEmailVerificationService(userId);

    return res.json({
      success: true,
      data,
      message: "Verification email sent",
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error?.message || "Verification email failed",
    });
  }
};

export const verifyEmailController = async (
  req: Request,
  res: Response
) => {
  try {
    const token =
      typeof req.query.token === "string"
        ? req.query.token
        : req.body?.token;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Verification token is required",
      });
    }

    const data = await verifyEmailService(token);

    return res.json({
      success: true,
      ...data,
      message: "Email verified successfully",
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error?.message || "Email verification failed",
    });
  }
};

export const googleLoginController = async (
  req: Request,
  res: Response
) => {
  try {
    const data = googleAuthSchema.parse(req.body);

    const result = await loginWithGoogleService(data.credential);

    return res.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error?.message || "Google login failed",
    });
  }
};

export const facebookLoginController = async (
  req: Request,
  res: Response
) => {
  try {
    const data = facebookAuthSchema.parse(req.body);

    const result = await loginWithFacebookService(data.accessToken);

    return res.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error?.message || "Facebook login failed",
    });
  }
};
