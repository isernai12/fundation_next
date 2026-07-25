import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const doc = await prisma.document.findFirst();
    console.log("Document:", doc);
  } catch (e) {
    console.error("Prisma error:", e);
  }
}

main().finally(() => prisma.$disconnect());
