import { createGroup } from './src/features/groups/actions'

async function main() {
  const result = await createGroup({
    name: "Test Group",
    code: "TG001",
    shortName: "TG",
    description: "A test group",
    status: "ACTIVE",
    remarks: "Testing foundation creation"
  })
  console.log("Create Group Result:", result)
}

main().catch(console.error)
