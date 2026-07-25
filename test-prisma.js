require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@libsql/client');
const { PrismaLibSql } = require('@prisma/adapter-libsql');

async function test() {
  const libsql = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  const adapter = new PrismaLibSql(libsql);
  const prisma = new PrismaClient({ adapter });
  const count = await prisma.user.count();
  console.log("Users:", count);
}
test().catch(console.error);
