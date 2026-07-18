import "dotenv/config";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const demoPassword = "RoleTest@123";

const demoUsers = [
  {
    name: "Role Test Admin",
    email: "admin@aicommerce.local",
    role: "ADMIN",
  },
  {
    name: "Role Test User Admin",
    email: "useradmin@aicommerce.local",
    role: "MANAGER",
  },
] as const;

async function upsertDemoUser(user: (typeof demoUsers)[number], password: string) {
  const result = await pool.query(
    `insert into "User" (id, name, email, password, role, "emailVerified", provider, "createdAt", "updatedAt")
     values ($1, $2, $3, $4, $5::"UserRole", true, 'LOCAL', now(), now())
     on conflict (email) do update set
       name = excluded.name,
       password = excluded.password,
       role = excluded.role,
       "emailVerified" = true,
       provider = 'LOCAL',
       "updatedAt" = now()
     returning email, role::text as role`,
    [randomUUID(), user.name, user.email, password, user.role]
  );

  return result.rows[0] as { email: string; role: string };
}

async function main() {
  const password = await bcrypt.hash(demoPassword, 10);

  for (const user of demoUsers) {
    const saved = await upsertDemoUser(user, password);
    console.log(`${saved.email} => ${saved.role}`);
  }

  console.log("Demo password for both users:", demoPassword);
}

main()
  .catch((error) => {
    console.error("Demo role user seed failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });