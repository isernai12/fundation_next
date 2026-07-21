import { prisma } from "@/lib/prisma"
import { MemberLedgerView } from "@/features/ledger/components/member-ledger-view"

export default async function MemberLedgerPage() {
  const members = await prisma.member.findMany({
    select: {
      id: true,
      memberId: true,
      fullName: true,
      group: { select: { name: true, code: true } }
    },
    orderBy: { createdAt: "desc" }
  })

  // We add beneficiaryId: null to conform to the ComboboxMember type, although it's optional
  const formattedMembers = members.map(m => ({
    ...m,
    beneficiaryId: null
  }))

  return (
    <div className="space-y-6">
      <MemberLedgerView members={formattedMembers} />
    </div>
  )
}
