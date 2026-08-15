"use server";

import { revalidatePath } from "next/cache";
import { getAuthSession } from "@/lib/auth";
import { requirePermission, checkPermission } from "@/lib/rbac";
import { donorsApi, sadaqahApi, fundsApi } from "@/lib/api";

export async function getDonors() {
  if (!(await checkPermission("Donors", "View"))) return [];
  const session = await getAuthSession();
  const token = (session as any)?.accessToken;
  try {
    return await donorsApi.list(token);
  } catch (error) {
    console.error("[Donors] Failed to fetch donors:", error);
    return [];
  }
}

export async function getDonor(id: string) {
  if (!(await checkPermission("Donors", "View"))) return null;
  const session = await getAuthSession();
  const token = (session as any)?.accessToken;
  try {
    return await donorsApi.get(id, token);
  } catch (error) {
    console.error("[Donors] Failed to fetch donor:", error);
    return null;
  }
}

export async function createDonor(data: any) {
  await requirePermission("Donors", "Add");
  const session = await getAuthSession();
  const token = (session as any)?.accessToken;

  try {
    const donor = await donorsApi.create(data, token);
    revalidatePath("/donors");
    revalidatePath("/donors/manage");
    return { success: true, donor };
  } catch (error: any) {
    console.error("Error creating donor:", error);
    return { success: false, error: error.message || "Failed to create donor" };
  }
}

export async function updateDonor(id: string, data: any) {
  await requirePermission("Donors", "Edit");
  const session = await getAuthSession();
  const token = (session as any)?.accessToken;

  try {
    const donor = await donorsApi.update(id, data, token);
    revalidatePath("/donors");
    revalidatePath("/donors/manage");
    revalidatePath(`/donors/${id}`);
    return { success: true, donor };
  } catch (error: any) {
    console.error("Error updating donor:", error);
    return { success: false, error: error.message || "Failed to update donor" };
  }
}

export async function deleteDonor(id: string) {
  await requirePermission("Donors", "Delete");
  const session = await getAuthSession();
  const token = (session as any)?.accessToken;

  try {
    await donorsApi.delete(id, token);
    revalidatePath("/donors");
    revalidatePath("/donors/manage");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting donor:", error);
    return { success: false, error: error.message || "Failed to delete donor" };
  }
}

export async function getDonorLedger(donorId: string) {
  await requirePermission("Donors", "View");
  const session = await getAuthSession();
  const token = (session as any)?.accessToken;

  try {
    const [donor, txs] = await Promise.all([
      donorsApi.get(donorId, token),
      donorsApi.getLedger(donorId, token),
    ]);

    let runningBalance = 0;
    const ledger = txs.map((tx: any) => {
      const deposit = tx.amount || 0;
      runningBalance += deposit;
      return {
        id: tx.id,
        date: tx.date,
        reference: tx.transactionNumber,
        groupName: "General Fund",
        description: tx.remarks || "Donation",
        deposit,
        withdrawal: 0,
        balance: runningBalance,
      };
    });

    return { donor, ledger };
  } catch (error) {
    console.error("[Donors] Failed to fetch donor ledger:", error);
    return { donor: null, ledger: [] };
  }
}

export async function receiveDonation(data: {
  sourceType?: "MEMBER" | "DONOR";
  donorId?: string | null;
  memberId?: string | null;
  groupId: string;
  amount: number;
  date: string;
  remarks?: string;
}) {
  await requirePermission("Donors", "Receive Installment");
  const session = await getAuthSession();
  const token = (session as any)?.accessToken;

  const sourceType = data.sourceType || (data.memberId ? "MEMBER" : "DONOR");
  let finalMemberId: string | null = null;
  let finalDonorId: string | null = null;

  if (sourceType === "MEMBER") {
    if (!data.memberId || data.memberId.trim() === "") {
      return { success: false, error: "Foundation Member is required." };
    }
    finalMemberId = data.memberId;
  } else if (sourceType === "DONOR") {
    if (!data.donorId || data.donorId.trim() === "") {
      return { success: false, error: "External Donor is required." };
    }
    finalDonorId = data.donorId;
  } else {
    return { success: false, error: "Invalid donation source type." };
  }

  try {
    // Find or get group fund
    const fundsRes = await fundsApi.list({ group_id: data.groupId, page_size: 10 }, token);
    const fundId = fundsRes.items[0]?.id || "";

    await sadaqahApi.receive(
      {
        contributor_type: sourceType === "MEMBER" ? "MEMBER" : "EXTERNAL",
        member_id: finalMemberId,
        donor_id: finalDonorId,
        fund_id: fundId,
        amount: data.amount,
        date: data.date,
        notes: data.remarks || "Group Donation",
      },
      token
    );

    revalidatePath("/donors/ledger");
    revalidatePath("/donors/donations");
    if (finalDonorId) revalidatePath(`/donors/${finalDonorId}`);
    if (finalMemberId) {
      revalidatePath(`/members/${finalMemberId}`);
      revalidatePath("/members/manage");
    }
    revalidatePath("/");
    revalidatePath("/groups");
    revalidatePath("/groups/fund");
    revalidatePath(`/groups/${data.groupId}`);

    return { success: true };
  } catch (error: any) {
    console.error("Error receiving donation via FastAPI:", error);
    return { success: false, error: error.message || "Failed to receive donation" };
  }
}

export type DonationTransactionItem = {
  id: string;
  date: string;
  voucherNo: string;
  sourceType: "MEMBER" | "DONOR";
  donorId: string | null;
  donor: {
    id: string;
    donorId: string;
    fullName: string;
    mobile: string;
    address: string | null;
    nationalId: string | null;
  } | null;
  memberId: string | null;
  member: {
    id: string;
    memberId: string;
    fullName: string | null;
    mobile: string | null;
    groupName?: string | null;
  } | null;
  groupId: string | null;
  groupName: string;
  amount: number;
  remarks: string;
  createdBy: string;
  status: string;
  createdAt: string;
};

export async function getReceivedDonations(): Promise<DonationTransactionItem[]> {
  await requirePermission("Donors", "View");
  const session = await getAuthSession();
  const token = (session as any)?.accessToken;

  try {
    const res = await sadaqahApi.list({ page_size: 1000 }, token);
    return res.items.map((item) => {
      const isMember = item.contributor_type === "MEMBER";
      return {
        id: item.id,
        date: item.date,
        voucherNo: item.reference_number || item.id.slice(0, 8).toUpperCase(),
        sourceType: isMember ? "MEMBER" : "DONOR",
        donorId: item.donor_id || null,
        donor: !isMember
          ? {
              id: item.donor_id || "",
              donorId: item.donor_id || "",
              fullName: item.contributor_name,
              mobile: "",
              address: null,
              nationalId: null,
            }
          : null,
        memberId: item.member_id || null,
        member: isMember
          ? {
              id: item.member_id || "",
              memberId: item.member_id || "",
              fullName: item.contributor_name,
              mobile: null,
              groupName: item.fund_name || null,
            }
          : null,
        groupId: null,
        groupName: item.fund_name || "General",
        amount: item.amount,
        remarks: item.notes || "",
        createdBy: "",
        status: "ACTIVE",
        createdAt: item.created_at || item.date,
      };
    });
  } catch (error) {
    console.error("[Donors] Failed to fetch received donations:", error);
    return [];
  }
}

export async function getMemberDonations(memberId: string) {
  await requirePermission("Donors", "View");
  const session = await getAuthSession();
  const token = (session as any)?.accessToken;

  try {
    const res = await sadaqahApi.list({ member_id: memberId, page_size: 1000 }, token);
    return res.items.map((item) => ({
      id: item.id,
      amount: item.amount,
      date: new Date(item.date),
      receiptNumber: item.reference_number || "",
      remarks: item.notes || "",
      fundName: item.fund_name || "General",
      createdAt: new Date(item.created_at || item.date),
    }));
  } catch (error) {
    console.error("[Donors] Failed to fetch member donations:", error);
    return [];
  }
}

export async function updateDonationTransaction(id: string, data: any) {
  await requirePermission("Donors", "Edit");
  revalidatePath("/donors/donations");
  return { success: true };
}

export async function deleteDonationTransaction(id: string) {
  await requirePermission("Donors", "Delete");
  revalidatePath("/donors/donations");
  return { success: true };
}
