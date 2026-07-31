import { beneficiarySchema } from "../src/features/beneficiaries/schema";
import { prisma } from "../src/lib/prisma";

async function runTest() {
  console.log("Testing minimal beneficiary schema validation...");

  const input = {
    fullName: "Minimal Test Beneficiary",
  };

  const parsed = beneficiarySchema.safeParse(input);
  console.log("Zod SafeParse Success:", parsed.success);
  if (!parsed.success) {
    console.error("Zod Error:", parsed.error);
    return;
  }

  console.log("Parsed Data:", parsed.data);

  console.log("Testing Prisma DB Insertion...");
  const created = await prisma.beneficiary.create({
    data: {
      beneficiaryId: `BEN-TEST-${Date.now()}`,
      fullName: parsed.data.fullName.trim(),
      fatherOrHusbandName: parsed.data.fatherOrHusbandName?.trim() || null,
      email: parsed.data.email?.trim() || null,
      mobile: parsed.data.mobile?.trim() || null,
      phone: parsed.data.phone?.trim() || null,
      address: parsed.data.address?.trim() || parsed.data.presentAddress?.trim() || null,
      presentAddress: parsed.data.presentAddress?.trim() || null,
      permanentAddress: parsed.data.permanentAddress?.trim() || null,
      nationalId: parsed.data.nationalId?.trim() || null,
      idDocumentType: parsed.data.idDocumentType || "NID",
      status: parsed.data.status || "ACTIVE",
    }
  });

  console.log("DB Insert Result:", created);

  // Clean up
  await prisma.beneficiary.delete({ where: { id: created.id } });
  console.log("Cleanup completed successfully!");
}

runTest()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
