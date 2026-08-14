import { createMember } from "./src/features/members/actions";

async function main() {
  const result = await createMember({
    groupId: "0796c376-acf0-4e52-bf83-898b000ec57b",
    fullName: "John Doe 2",
    mobile: "01700000001",
    email: "", // Test empty email
  } as any);

  console.log(JSON.stringify(result, null, 2));
}

main().catch(console.error);
