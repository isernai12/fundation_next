import { createMember } from "./src/features/members/actions";

async function main() {
  const result = await createMember({
    fullName: "Test User",
    fatherName: "",
    motherName: "",
    gender: "",
    dob: "",
    bloodGroup: "",
    maritalStatus: "",
    nationalId: "",
    presentAddress: "",
    permanentAddress: "",

    mobile: "01800000000",
    altMobile: "", 
    email: "",

    education: "",
    occupation: "",
    workplace: "",
    designation: "",

    skills: [],

    reference: "",
    reasonForJoining: "",

    participation: ["Monthly Contribution"],

    emergencyContactName: "",
    emergencyContactRelation: "",
    emergencyContactMobile: "",

    declarationAccepted: true,

    groupId: "0796c376-acf0-4e52-bf83-898b000ec57b",
    status: "ACTIVE",
    memberType: "REGULAR",
    joinDate: "2026-07-18",
    remarks: "",
  } as any);

  console.log(JSON.stringify(result, null, 2));
}

main().catch(console.error);
