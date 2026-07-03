const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function run() {
  const provider = await prisma.integrationProvider.findUnique({
    where: { key: "SMS_GATEWAY" },
    include: { credentials: true }
  });

  console.log(JSON.stringify(provider, null, 2));
}

run()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
