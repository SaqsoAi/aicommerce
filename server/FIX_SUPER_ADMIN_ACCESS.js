require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

(async () => {
  const hash = await bcrypt.hash("12345678", 10);

  const permissions = [
    "*",
    "media.upload","media.read","media.delete",
    "products.create","products.read","products.update","products.delete",
    "categories.read","categories.create","categories.update","categories.delete",
    "brands.read","brands.create","brands.update","brands.delete",
    "variants.read","variants.create","variants.update","variants.delete"
  ];

  const user = await prisma.user.update({
    where: { email: "admin@aicommerce.com" },
    data: {
      password: hash,
      role: "SUPER_ADMIN",
      emailVerified: true,
      permissions
    }
  });

  console.log("SUPER ADMIN UPDATED:", user.email, user.role);
  console.log("Password: 12345678");

  await prisma.$disconnect();
})().catch(async e => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
