import { Request, Response } from "express";


import bcrypt from "bcryptjs";


import jwt from "jsonwebtoken";


import { OAuth2Client } from "google-auth-library";



import prisma from "../config/prisma";

type AuthTokenUser = {
  id: string;
  email?: string | null;
  role: string;
};





const AUTH_JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN ?? "7d") as NonNullable<
  import("jsonwebtoken").SignOptions["expiresIn"]
>;
export const register = async (
  req: Request,
  res: Response
) => {
  try {
    const existingUser =
      await prisma.user.findUnique({
        where: {
          email: req.body.email,
        },
      });

    if (existingUser) {
      return res.status(400).json({
        message:
          "User already exists",
      });
    }

    const hashed =
      await bcrypt.hash(
        req.body.password,
        10
      );

    const user =
      await prisma.user.create({
        data: {
          ...req.body,
          password: hashed,
        },
      });

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: AUTH_JWT_EXPIRES_IN,
      }
    );

    res.status(201).json({
      token,
      user,
    });
  } catch (error: any) {
    console.log(error);

    res.status(500).json({
      message:
        "Registration failed",
    });
  }
};

export const loginUser = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      email,
      password,
    } = req.body;

    const user =
      await prisma.user.findUnique({
        where: {
          email,
        },
      });

    if (!user) {
      return res.status(404).json({
        message:
          "User not found",
      });
    }

    const valid =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!valid) {
      return res.status(400).json({
        message:
          "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: AUTH_JWT_EXPIRES_IN,
      }
    );

    res.status(200).json({
      token,
      user,
    });
  } catch (error: any) {
    console.log(error);

    res.status(500).json({
      message:
        "Login failed",
    });
  }
};

export const login = async (
  req: Request,
  res: Response
) => {
  try {
    const user =
      await prisma.user.findUnique({
        where: {
          email: req.body.email,
        },
      });

    if (!user) {
      return res.status(404).json({
        message:
          "User not found",
      });
    }

    const match =
      await bcrypt.compare(
        req.body.password,
        user.password
      );

    if (!match) {
      return res.status(401).json({
        message:
          "Wrong password",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: AUTH_JWT_EXPIRES_IN,
      }
    );

    res.json({
      token,
      user,
    });
  } catch (error: any) {
    console.log(error);

    res.status(500).json({
      message:
        "Login failed",
    });
  }
};
const signAuthToken = (user: AuthTokenUser) => {
  return jwt.sign(
    {
      id: user.id,
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET || "secret",
    { expiresIn: AUTH_JWT_EXPIRES_IN }
  );
};

const upsertSocialCustomer = async (payload: {
  email: string;
  name?: string | null;
  provider: "GOOGLE" | "FACEBOOK";
  providerId: string;
}) => {
  const existing = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (existing) return existing;

  return prisma.user.create({
    data: {
      name: String(payload.name || payload.email.split("@")[0]),
      email: payload.email,
      password: "",
      role: "CUSTOMER",
    },
  });
};
export const googleLoginController = async (req: Request, res: Response) => {
  try {
    const credential = req.body.credential || req.body.token;

    if (!credential) {
      return res.status(400).json({ message: "Google credential required" });
    }

    const googleClientId = process.env.GOOGLE_CLIENT_ID || "";
    const client = new OAuth2Client(googleClientId);

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: googleClientId,
    });

    const payload = ticket?.getPayload?.();

    if (!payload?.email || !payload?.sub) {
      return res.status(401).json({ message: "Invalid Google token" });
    }

    const user = await upsertSocialCustomer({
      email: payload.email,
      name: payload.name ?? null,
      provider: "GOOGLE",
      providerId: payload.sub,
    });

    const token = signAuthToken(user);

    return res.json({
      message: "Google login successful",
      token,
      user,
    });
  } catch (error: any) {
    console.error("Google login failed:", error);
    return res.status(401).json({ message: "Google login failed" });
  }
};
export const facebookLoginController = async (req: Request, res: Response) => {
  try {
    const accessToken = req.body.accessToken || req.body.token;

    if (!accessToken) {
      return res.status(400).json({ message: "Facebook access token required" });
    }

    const fbUrl =
      `https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`;

    const fbRes = await fetch(fbUrl);
    const fbUser = await fbRes.json();

    if (!fbRes.ok || !fbUser?.id) {
      return res.status(401).json({ message: "Invalid Facebook token" });
    }

    if (!fbUser.email) {
      return res.status(400).json({
        message: "Facebook email permission required",
      });
    }

    const user = await upsertSocialCustomer({
      email: fbUser.email,
      name: fbUser.name,
      provider: "FACEBOOK",
      providerId: fbUser.id,
    });

    const token = signAuthToken(user);

    return res.json({
      message: "Facebook login successful",
      token,
      user,
    });
  } catch (error: any) {
    console.error("Facebook login failed:", error);
    return res.status(401).json({ message: "Facebook login failed" });
  }
};