require("dotenv").config();

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

(async () => {

  const hash = await bcrypt.hash("12345678",10);

  const user = await prisma.user.update({
    where:{
      email:"admin@aicommerce.com"
    },
    data:{
      password:hash,
      role:"SUPER_ADMIN",
      emailVerified:true
    }
  });

  console.log("SUCCESS");
  console.log(user.email);
  console.log(user.role);

  await prisma.$disconnect();

})().catch(async e=>{
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
