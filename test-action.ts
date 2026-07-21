import { updateMember } from "./src/features/members/actions";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function test() {
  const member = await prisma.member.findFirst();
  if (!member) return;
  
  const payload = {
    groupId: member.groupId,
    fullName: member.fullName || "",
    fatherName: member.fatherName || "",
    motherName: member.motherName || "",
    dob: member.dob ? member.dob.toISOString() : "",
    nationalId: member.nationalId || "",
    occupation: member.occupation || "",
    education: member.education || "",
    presentAddress: member.presentAddress || "",
    permanentAddress: member.permanentAddress || "",
    mobile: member.mobile || "",
    email: member.email || "",
    bloodGroup: member.bloodGroup || "",
    idDocumentType: (member.idDocumentType || "NID") as any,
  };
  
  console.log("Calling updateMember...");
  const res = await updateMember(member.id, payload);
  console.log("Result:", res);
}

test().catch(console.error).finally(() => prisma.$disconnect());
