import { prisma } from "./src/lib/prisma";
async function run() {
  const count = await prisma.member.count();
  const res = await prisma.member.create({
    data: {
      memberId: `TEST-${count}`,
      firstName: "Test",
      lastName: "User",
      maritalStatus: "Single",
      groupId: null,
      nationalId: null,
      mobile: null,
      email: null,
    }
  });
  console.log("Success:", res.id);
  process.exit(0);
}
run().catch(console.error);
