"use server";

import { requirePermission } from "@/lib/rbac";
import { membersApi } from "@/lib/api";
import { getAuthSession } from "@/lib/auth";

export async function getMemberLedger(memberId: string) {
  await requirePermission("Reports", "View");
  const session = await getAuthSession();
  const token = (session as any)?.accessToken;

  const member = await membersApi.get(memberId, token);
  if (!member) throw new Error("Member not found");

  return {
    member: {
      ...member,
      fullName: member.full_name,
      memberId: member.member_id,
      group: {
        name: member.group_name || "General",
        code: member.group_code || "GRP",
      },
    },
    ledger: [],
  };
}
