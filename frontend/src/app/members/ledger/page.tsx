import { getMembers } from "@/features/members/actions";
import { MemberLedgerView } from "@/features/ledger/components/member-ledger-view";

export default async function MemberLedgerPage() {
  const members = await getMembers();

  const formattedMembers = members.map((m) => ({
    id: m.id,
    memberId: m.memberId,
    fullName: m.fullName,
    group: m.group ? { name: m.group.name, code: m.group.code } : null,
    beneficiaryId: null,
  }));

  return (
    <div className="space-y-4">
      <MemberLedgerView members={formattedMembers} />
    </div>
  );
}
