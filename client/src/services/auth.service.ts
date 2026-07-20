import axios from "axios";

// Customer authentication must pass through the storefront origin. The backend
// returns the httpOnly `customer_session` cookie and this bridge makes the cookie
// belong to the storefront domain used by Next.js middleware/server components.
const authApi = axios.create({
  baseURL: "/api/backend",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export const loginUser = async (email: string, password: string) => {
  const res = await authApi.post("/auth/login", {
    email,
    password,
  });

  return res.data;
};

export const registerUser = async (
  name: string,
  email: string,
  password: string
) => {
  const res = await authApi.post("/auth/register", {
    name,
    email,
    password,
  });

  return res.data;
};

export const sendOtp = async (phone: string) => {
  const res = await authApi.post("/auth/otp/send", {
    phone,
    purpose: "LOGIN",
  });

  return res.data;
};

export const verifyOtp = async (phone: string, otp: string) => {
  const res = await authApi.post("/auth/otp/verify", {
    phone,
    otp,
    purpose: "LOGIN",
  });

  return res.data;
};

export const sendEmailVerification = async () => {
  const res = await authApi.post("/auth/email/send-verification");
  return res.data;
};

export const getMe = async () => {
  const res = await authApi.get("/auth/me");

  return res.data;
};

export const loginWithGoogle = async (credential: string) => {
  const res = await authApi.post("/auth/google", {
    credential,
    token: credential,
  });

  return res.data;
};

export const loginWithFacebook = async (accessToken: string) => {
  const res = await authApi.post("/auth/facebook", {
    accessToken,
    token: accessToken,
  });

  return res.data;
};

export const sendPhoneOtp = sendOtp;
export const verifyPhoneOtp = verifyOtp;
export const sendWhatsAppOtp = sendPhoneOtp;
export const verifyWhatsAppOtp = verifyPhoneOtp;

export const logoutUser = async () => {
  const res = await authApi.post("/auth/logout");
  return res.data;
};
