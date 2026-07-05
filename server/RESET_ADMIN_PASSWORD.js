require("dotenv").config();

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

(async () => {
  const hash = await bcrypt.hash("12345678", 10);

  const user = await prisma.user.upsert({
    where: { email: "admin@admin.com" },
    update: {
      password: hash,
      role: "ADMIN",
      isActive: true,
      emailVerified: true
    },
    create: {
      name: "Admin",
      email: "admin@admin.com",
      password: hash,
      role: "ADMIN",
      isActive: true,
      emailVerified: true
    }
  });

  console.log("ADMIN LOGIN READY");
  console.log("Email    : admin@admin.com");
  console.log("Password : 12345678");
  console.log("Role     :", user.role);

  await prisma.$disconnect();
})().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
