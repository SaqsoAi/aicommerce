import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

const defaults = [
  {
    key: "email",
    name: "Email Login",
    enabled: true,
    required: false,
    configJson: {}
  },
  {
    key: "google",
    name: "Google Login",
    enabled: false,
    required: false,
    configJson: {
      clientIdEnv: "GOOGLE_CLIENT_ID",
      clientSecretEnv: "GOOGLE_CLIENT_SECRET"
    }
  },
  {
    key: "facebook",
    name: "Facebook Login",
    enabled: false,
    required: false,
    configJson: {
      appIdEnv: "FACEBOOK_APP_ID",
      appSecretEnv: "FACEBOOK_APP_SECRET"
    }
  },
  {
    key: "otp",
    name: "Phone OTP",
    enabled: false,
    required: false,
    configJson: {
      channel: "sms"
    }
  },
  {
    key: "guest_checkout",
    name: "Guest Checkout",
    enabled: true,
    required: false,
    configJson: {}
  }
];

router.get("/", async (_req, res) => {
  const providers = await prisma.authProvider.findMany({
    include: {
      settings: true
    }
  });

  res.json({
    success: true,
    providers
  });
});

router.post("/seed", async (_req, res) => {
  for (const item of defaults) {
    await prisma.authProvider.upsert({
      where: {
        key: item.key
      },
      update: {
        name: item.name,
        enabled: item.enabled,
        required: item.required,
        configJson: item.configJson
      },
      create: {
        key: item.key,
        name: item.name,
        enabled: item.enabled,
        required: item.required,
        configJson: item.configJson
      }
    });
  }

  const providers = await prisma.authProvider.findMany({
    include: {
      settings: true
    }
  });

  res.json({
    success: true,
    providers
  });
});

router.patch("/:id", async (req, res) => {
  const provider = await prisma.authProvider.update({
    where: {
      id: req.params.id
    },
    data: {
      enabled: req.body.enabled,
      required: req.body.required,
      configJson: req.body.configJson
    },
    include: {
      settings: true
    }
  });

  res.json({
    success: true,
    provider
  });
});

export default router;
