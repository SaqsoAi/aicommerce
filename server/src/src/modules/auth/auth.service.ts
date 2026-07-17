import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import prisma from "../../config/prisma";
import { Pool } from "pg";
import { sendVerificationEmail } from "../../services/email.service";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const authPool = new Pool({ connectionString: process.env.DATABASE_URL });

type LoginUserRecord = {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string | null;
  role: string;
  emailVerified: boolean;
  provider: string | null;
  tenantId: string | null;
  storeId: string | null;
};

type TokenUser = {
  id: string;
  email: string;
  role: string;
  tenantId?: string | null;
  storeId?: string | null;
};

const getJwtSecret = () => {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwtSecret;
};

const signToken = (user: TokenUser) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId ?? undefined,
      storeId: user.storeId ?? undefined,
    },
    getJwtSecret(),
    {
      expiresIn: "7d",
    },
  );
};

export const buildAuthResponse = (user: any) => {
  const token = signToken(user);

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      emailVerified: user.emailVerified,
      provider: user.provider,
      tenantId: user.tenantId ?? null,
      storeId: user.storeId ?? null,
    },
  };
};

export const registerUser = async (
  name: string,
  email: string,
  password: string,
) => {
  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    throw new Error("Email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      provider: "LOCAL",
      emailVerified: false,
    },
  });
};

export const loginUserService = async (
  email: string,
  password: string,
) => {
  const result = await authPool.query<LoginUserRecord>(
    `select
       id,
       name,
       email,
       password,
       phone,
       role::text as role,
       "emailVerified",
       provider,
       "tenantId",
       "storeId"
     from "User"
     where lower(email) = lower($1)
     limit 1`,
    [email],
  );

  const user = result.rows[0];

  if (!user) {
    throw new Error("User not found");
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    throw new Error("Invalid password");
  }

  return user;
};

export const generateOtp = () =>
  String(Math.floor(100000 + Math.random() * 900000));

export const sendPhoneOtpService = async (phone: string) => {
  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await prisma.otpVerification.create({
    data: {
      phone,
      otp,
      verified: false,
      expiresAt,
    },
  });

  if (process.env.NODE_ENV !== "production") {
    console.info(`PHONE OTP generated for ${phone}`);
  }

  return {
    phone,
    expiresAt,
    devOtp: process.env.NODE_ENV === "production" ? undefined : otp,
  };
};

export const verifyPhoneOtpService = async (
  phone: string,
  otp: string,
) => {
  const record = await prisma.otpVerification.findFirst({
    where: {
      phone,
      otp,
      verified: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!record) {
    throw new Error("Invalid or expired OTP");
  }

  await prisma.otpVerification.update({
    where: { id: record.id },
    data: { verified: true },
  });

  let user = await prisma.user.findUnique({
    where: { phone },
  });

  if (!user) {
    const pseudoEmail = `${phone.replace(/\D/g, "")}@phone.saqso.local`;
    const existingEmailUser = await prisma.user.findUnique({
      where: { email: pseudoEmail },
    });

    if (existingEmailUser) {
      user = existingEmailUser;
    } else {
      const randomPassword = await bcrypt.hash(
        `${phone}-${Date.now()}-${Math.random()}`,
        10,
      );

      user = await prisma.user.create({
        data: {
          name: `Customer ${phone}`,
          email: pseudoEmail,
          phone,
          password: randomPassword,
          provider: "PHONE",
          emailVerified: false,
        },
      });
    }
  }

  return buildAuthResponse(user);
};

export const createEmailVerificationToken = (user: any) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      purpose: "EMAIL_VERIFY",
    },
    getJwtSecret(),
    { expiresIn: "30m" },
  );
};

export const sendEmailVerificationService = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) throw new Error("User not found");

  if (user.emailVerified) {
    return { alreadyVerified: true };
  }

  const token = createEmailVerificationToken(user);
  const baseUrl =
    process.env.CLIENT_URL ||
    process.env.FRONTEND_URL ||
    "http://localhost:3000";

  const verifyUrl = `${baseUrl}/verify-email?token=${token}`;
  const result = await sendVerificationEmail(user.email, verifyUrl);

  return {
    sent: true,
    verifyUrl:
      process.env.NODE_ENV === "production" ? undefined : verifyUrl,
    result,
  };
};

export const verifyEmailService = async (token: string) => {
  const decoded = jwt.verify(token, getJwtSecret()) as {
    id?: string;
    purpose?: string;
  };

  if (decoded.purpose !== "EMAIL_VERIFY" || !decoded.id) {
    throw new Error("Invalid verification token");
  }

  const user = await prisma.user.update({
    where: { id: decoded.id },
    data: { emailVerified: true },
  });

  return buildAuthResponse(user);
};

export const loginWithGoogleService = async (credential: string) => {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;

  if (!googleClientId) {
    throw new Error("GOOGLE_CLIENT_ID is not configured");
  }

  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: googleClientId,
  });

  const payload = ticket.getPayload();

  if (!payload?.email) {
    throw new Error("Google account email not found");
  }

  const email = payload.email.toLowerCase();

  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    const randomPassword = await bcrypt.hash(
      `GOOGLE-${payload.sub}-${Date.now()}`,
      10,
    );

    user = await prisma.user.create({
      data: {
        name: payload.name || email.split("@")[0],
        email,
        password: randomPassword,
        avatar: payload.picture || undefined,
        provider: "GOOGLE",
        providerId: payload.sub,
        emailVerified: Boolean(payload.email_verified),
      },
    });
  } else {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        provider: user.provider || "GOOGLE",
        providerId: user.providerId || payload.sub,
        avatar: user.avatar || payload.picture || undefined,
        emailVerified:
          user.emailVerified || Boolean(payload.email_verified),
      },
    });
  }

  return buildAuthResponse(user);
};

export const loginWithFacebookService = async (accessToken: string) => {
  const response = await fetch(
    `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`,
  );

  if (!response.ok) {
    throw new Error("Invalid Facebook access token");
  }

  const profile = (await response.json()) as {
    id?: string;
    name?: string;
    email?: string;
    picture?: { data?: { url?: string } };
  };

  if (!profile.email || !profile.id) {
    throw new Error("Facebook account email not found");
  }

  const email = profile.email.toLowerCase();
  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    const randomPassword = await bcrypt.hash(
      `FACEBOOK-${profile.id}-${Date.now()}`,
      10,
    );

    user = await prisma.user.create({
      data: {
        name: profile.name || email.split("@")[0],
        email,
        password: randomPassword,
        avatar: profile.picture?.data?.url || undefined,
        provider: "FACEBOOK",
        providerId: profile.id,
        emailVerified: true,
      },
    });
  } else {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        provider: user.provider || "FACEBOOK",
        providerId: user.providerId || profile.id,
        avatar: user.avatar || profile.picture?.data?.url || undefined,
        emailVerified: true,
      },
    });
  }

  return buildAuthResponse(user);
};
