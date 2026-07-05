require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const email = "admin@admin.com";

const permissions = [
  "media.upload",
  "media.read",
  "media.delete",
  "products.read",
  "products.create",
  "products.update",
  "products.delete",
  "categories.read",
  "brands.read",
  "variants.read"
];

(async () => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new Error("Admin user not found: " + email);
  }

  const existing = Array.isArray(user.permissions) ? user.permissions : [];
  const merged = Array.from(new Set([...existing, ...permissions]));

  const updated = await prisma.user.update({
    where: { email },
    data: {
      role: "ADMIN",
      emailVerified: true,
      permissions: merged
    },
    select: {
      id: true,
      email: true,
      role: true,
      permissions: true
    }
  });

  console.log("ADMIN PERMISSIONS UPDATED");
  console.log(updated);

  await prisma.$disconnect();
})().catch(async e => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
