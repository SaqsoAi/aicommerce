require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

const emails = ["admin@aicommerce.com", "admin@admin.com"];

(async () => {
  const hash = await bcrypt.hash("12345678", 10);

  for (const email of emails) {
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        password: hash,
        role: "SUPER_ADMIN",
        emailVerified: true,
        permissions: ["*"]
      },
      create: {
        name: "Super Admin",
        email,
        password: hash,
        role: "SUPER_ADMIN",
        emailVerified: true,
        permissions: ["*"]
      }
    });

    console.log("UPDATED:", user.email, user.role);
  }

  await prisma.$disconnect();
})().catch(async e => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
