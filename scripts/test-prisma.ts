import { prisma } from '../src/lib/prisma';

async function main() {
  try {
    const doc = await prisma.document.findFirst();
    console.log("Document:", doc);
  } catch (e) {
    console.error("Prisma error:", e);
  }
}

main().finally(() => prisma.$disconnect());
