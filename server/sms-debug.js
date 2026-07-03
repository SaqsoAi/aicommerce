const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function run() {
  const row = await prisma.smsLog.findFirst({
    orderBy: { createdAt: "desc" }
  });

  console.log(JSON.stringify(row, null, 2));
}

run()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
