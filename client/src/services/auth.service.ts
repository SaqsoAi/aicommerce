import api from "@/lib/api";

export const loginUser = async (email: string, password: string) => {
  const res = await api.post("/auth/login", {
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
  const res = await api.post("/auth/register", {
    name,
    email,
    password,
  });

  return res.data;
};

export const sendOtp = async (phone: string) => {
  const res = await api.post("/sms/otp/send", {
    phone,
    purpose: "LOGIN",
  });

  return res.data;
};

export const verifyOtp = async (phone: string, otp: string) => {
  const res = await api.post("/sms/otp/verify", {
    phone,
    otp,
    purpose: "LOGIN",
  });

  return res.data;
};

export const sendEmailVerification = async () => {
  const res = await api.post("/auth/email/send-verification");
  return res.data;
};

export const getMe = async (token: string) => {
  const res = await api.get("/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

export const loginWithGoogle = async (credential: string) => {
  const res = await api.post("/auth/google", {
    credential,
    token: credential,
  });

  return res.data;
};

export const loginWithFacebook = async (accessToken: string) => {
  const res = await api.post("/auth/facebook", {
    accessToken,
    token: accessToken,
  });

  return res.data;
};

export const sendPhoneOtp = sendOtp;
export const verifyPhoneOtp = verifyOtp;