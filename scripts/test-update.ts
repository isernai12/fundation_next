import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function test() {
  const member = await prisma.member.findFirst();
  if (!member) {
    console.log("No member found");
    return;
  }
  console.log("Found member", member.id);
  try {
    const updated = await prisma.member.update({
      where: { id: member.id },
      data: {
        fullName: member.fullName + " edited"
      }
    });
    console.log("Success", updated.id);
  } catch(e) {
    console.error("Error updating member", e);
  }
}
test().finally(() => prisma.$disconnect());
