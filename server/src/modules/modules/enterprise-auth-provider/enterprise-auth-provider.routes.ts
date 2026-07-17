import express from "express";
import { PrismaClient } from "@prisma/client";
const router = express.Router();
const prisma = new PrismaClient();

router.get("/", async (_req, res) => {
  const providers = await prisma.enterpriseAuthProviderSetting.findMany({
    orderBy: { provider: "asc" },
  });
  res.json({ success: true, providers });
});

router.post("/seed", async (_req, res) => {
  const defaults = [
    ["email","Email Login",true,false],
    ["google","Google Login",false,false],
    ["facebook","Facebook Login",false,false],
    ["otp","Phone OTP",false,false],
    ["guest_checkout","Guest Checkout",true,false],
  ];

  for (const [provider,label,enabled,required] of defaults) {
    await prisma.enterpriseAuthProviderSetting.upsert({
      where: { provider: String(provider) },
      update: { label: String(label) },
      create: {
        provider: String(provider),
        label: String(label),
        enabled: Boolean(enabled),
        required: Boolean(required),
      },
    });
  }

  res.json({ success: true, message: "Enterprise auth providers seeded" });
});

router.patch("/:provider", async (req, res) => {
  const { provider } = req.params;
  const updated = await prisma.enterpriseAuthProviderSetting.update({
    where: { provider },
    data: req.body,
  });
  res.json({ success: true, provider: updated });
});

export default router;