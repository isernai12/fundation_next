"use server";

import { getNow } from "@/lib/date";
import { prisma } from "@/lib/prisma";
import { memberSchema, type MemberFormValues } from "./schema";
import { revalidatePath } from "next/cache";
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";
import { requirePermission, checkPermission } from "@/lib/rbac";
import { getAuthSession } from "@/lib/auth";
import { isSuperAdminRole } from "@/lib/rbac-client";
import { membersApi } from "@/lib/api";

/**
 * Migration Note:
 * This file is migrated to proxy data queries and mutations through the FastAPI backend
 * (/api/v1/members) while preserving the exact signatures expected by the React frontend components.
 */

export async function getMembers() {
  if (!(await checkPermission("Members", "View"))) return [];

  try {
    const session = await getAuthSession();
    const token = (session as any)?.accessToken;

    const res = await membersApi.list({ page_size: 1000 }, token);

    // Map FastAPI MemberDto format to frontend expected schema
    return res.items.map((m) => ({
      id: m.id,
      memberId: m.member_id,
      groupId: m.group_id,
      fullName: m.full_name,
      fatherName: m.father_name || null,
      motherName: m.mother_name || null,
      gender: m.gender || null,
      dob: m.dob ? new Date(m.dob) : null,
      nationalId: m.national_id || null,
      idDocumentType: m.id_document_type || "NID",
      occupation: m.occupation || null,
      monthlyIncome: m.monthly_income ?? null,
      bloodGroup: m.blood_group || null,
      mobile: m.mobile || null,
      altMobile: m.alt_mobile || null,
      email: m.email || null,
      phone: m.phone || null,
      presentAddress: m.present_address || null,
      permanentAddress: m.permanent_address || null,
      emergencyContactName: m.emergency_contact_name || null,
      emergencyContactMobile: m.emergency_contact_mobile || null,
      emergencyContactRelation: m.emergency_contact_relation || null,
      joinDate: m.join_date ? new Date(m.join_date) : null,
      status: m.status,
      remarks: m.remarks || null,
      maritalStatus: m.marital_status || null,
      education: m.education || null,
      workplace: m.workplace || null,
      designation: m.designation || null,
      skills: m.skills || null,
      reference: m.reference || null,
      reasonForJoining: m.reason_for_joining || null,
      participation: m.participation || null,
      declarationAccepted: m.declaration_accepted ?? true,
      memberType: m.member_type || null,
      position: m.position || null,
      paidUntilMonth: m.paid_until_month ?? null,
      paidUntilYear: m.paid_until_year ?? null,
      createdBy: null,
      updatedBy: null,
      createdAt: new Date(m.created_at),
      updatedAt: new Date(m.updated_at),
      group: {
        name: m.group_name || "General",
        code: m.group_code || "GRP",
      },
    }));
  } catch (error) {
    // Fallback to Prisma query if API client fails during transition
    return prisma.member.findMany({
      where: { status: { not: "DELETED" } },
      orderBy: { createdAt: "desc" },
      include: {
        group: { select: { name: true, code: true } },
      },
    });
  }
}

export async function getMember(id: string) {
  if (!(await checkPermission("Members", "View"))) return null;

  try {
    const session = await getAuthSession();
    const token = (session as any)?.accessToken;

    const m = await membersApi.get(id, token);

    return {
      id: m.id,
      memberId: m.member_id,
      groupId: m.group_id,
      fullName: m.full_name,
      fatherName: m.father_name || null,
      motherName: m.mother_name || null,
      gender: m.gender || null,
      dob: m.dob ? new Date(m.dob) : null,
      nationalId: m.national_id || null,
      idDocumentType: m.id_document_type || "NID",
      occupation: m.occupation || null,
      monthlyIncome: m.monthly_income ?? null,
      bloodGroup: m.blood_group || null,
      mobile: m.mobile || null,
      altMobile: m.alt_mobile || null,
      email: m.email || null,
      phone: m.phone || null,
      presentAddress: m.present_address || null,
      permanentAddress: m.permanent_address || null,
      emergencyContactName: m.emergency_contact_name || null,
      emergencyContactMobile: m.emergency_contact_mobile || null,
      emergencyContactRelation: m.emergency_contact_relation || null,
      joinDate: m.join_date ? new Date(m.join_date) : null,
      status: m.status,
      remarks: m.remarks || null,
      maritalStatus: m.marital_status || null,
      education: m.education || null,
      workplace: m.workplace || null,
      designation: m.designation || null,
      skills: m.skills || null,
      reference: m.reference || null,
      reasonForJoining: m.reason_for_joining || null,
      participation: m.participation || null,
      declarationAccepted: m.declaration_accepted ?? true,
      memberType: m.member_type || null,
      position: m.position || null,
      paidUntilMonth: m.paid_until_month ?? null,
      paidUntilYear: m.paid_until_year ?? null,
      createdBy: null,
      updatedBy: null,
      createdAt: new Date(m.created_at),
      updatedAt: new Date(m.updated_at),
      group: {
        id: m.group_id,
        name: m.group_name || "General",
        code: m.group_code || "GRP",
      },
      documents: (m.documents || []).map((d) => ({
        id: d.id,
        title: d.title,
        type: d.document_type || "IMAGE",
        fileUrl: d.file_url,
        secureUrl: d.file_url,
        cloudinaryPublicId: d.cloudinary_public_id,
        createdAt: new Date(d.created_at),
      })),
    };
  } catch (error) {
    return prisma.member.findUnique({
      where: { id },
      include: {
        group: true,
        documents: true,
      },
    });
  }
}

export async function generateMemberId(tx?: any) {
  const db = tx || prisma;
  const members = await db.member.findMany({
    select: { memberId: true },
  });
  let maxNum = 0;
  const existingSet = new Set<string>();
  for (const m of members) {
    if (!m.memberId) continue;
    existingSet.add(m.memberId);
    const match = m.memberId.match(/(\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  }
  let nextNum = maxNum + 1;
  let candidate = `M-${nextNum.toString().padStart(4, "0")}`;
  while (existingSet.has(candidate)) {
    nextNum++;
    candidate = `M-${nextNum.toString().padStart(4, "0")}`;
  }
  return candidate;
}

async function handleDocumentUpload(
  base64Str: string | undefined,
  title: string,
  folder: string,
  memberId: string,
  documentNumberSuffix: string
) {
  if (!base64Str) return;

  const buffer = Buffer.from(base64Str.replace(/^data:image\/\w+;base64,/, ""), "base64");
  const uploaded = await uploadToCloudinary(buffer, { folder });

  const existingDoc = await prisma.document.findFirst({
    where: { memberId, title },
  });

  if (existingDoc) {
    if (existingDoc.cloudinaryPublicId) {
      await deleteFromCloudinary(existingDoc.cloudinaryPublicId).catch(() => {});
    }
    await prisma.document.update({
      where: { id: existingDoc.id },
      data: {
        cloudinaryPublicId: uploaded.public_id,
        secureUrl: uploaded.secure_url,
        sizeBytes: uploaded.bytes || 0,
      },
    });
  } else {
    await prisma.document.create({
      data: {
        documentNumber: `DOC-${Date.now()}-${documentNumberSuffix}`,
        title,
        type: "IMAGE",
        cloudinaryPublicId: uploaded.public_id,
        secureUrl: uploaded.secure_url,
        originalFilename: `${title.toLowerCase().replace(/\s/g, "_")}.jpg`,
        mimeType: "image/jpeg",
        sizeBytes: uploaded.bytes || 0,
        targetType: "MEMBER",
        member: { connect: { id: memberId } },
      },
    });
  }
}

export async function createMember(data: MemberFormValues) {
  await requirePermission("Members", "Add");
  const parsed = memberSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "members.validation.invalid_form", details: parsed.error.format() };
  }

  const pd = parsed.data;

  try {
    const session = await getAuthSession();
    const token = (session as any)?.accessToken;

    const referenceData =
      pd.referenceName || pd.referenceMobile || pd.referenceRelation
        ? JSON.stringify({
            name: pd.referenceName || "",
            mobile: pd.referenceMobile || "",
            relation: pd.referenceRelation || "",
          })
        : undefined;

    // Call FastAPI backend create member endpoint
    const memberRes = await membersApi.create(
      {
        group_id: pd.groupId as string,
        full_name: pd.fullName.trim(),
        mobile: pd.mobile?.trim() || "",
        father_name: pd.fatherName?.trim() || null,
        mother_name: pd.motherName?.trim() || null,
        dob: pd.dob ? pd.dob : undefined,
        national_id: pd.nationalId?.trim() || null,
        id_document_type: pd.idDocumentType || "NID",
        occupation: pd.occupation?.trim() || null,
        education: pd.education?.trim() || null,
        present_address: pd.presentAddress?.trim() || null,
        permanent_address: pd.permanentAddress?.trim() || null,
        email: pd.email?.trim() || null,
        blood_group: pd.bloodGroup?.trim() || null,
        position: pd.position || "GENERAL_MEMBER",
        emergency_contact_name: pd.emergencyContactName?.trim() || null,
        emergency_contact_relation: pd.emergencyContactRelation?.trim() || null,
        emergency_contact_mobile: pd.emergencyContactMobile?.trim() || null,
        reference: referenceData,
        join_date: pd.joinDate ? pd.joinDate : undefined,
      },
      token
    );

    // Handle Cloudinary documents attached to this member
    if (pd.photoBase64) {
      await handleDocumentUpload(pd.photoBase64, "Member Photo", "foundation/members/photos", memberRes.id, "P");
    }
    if (pd.signatureBase64) {
      await handleDocumentUpload(pd.signatureBase64, "Signature", "foundation/members/signatures", memberRes.id, "SIG");
    }
    if (pd.idDocumentType === "NID") {
      if (pd.nidFrontBase64) await handleDocumentUpload(pd.nidFrontBase64, "NID Front", "foundation/members/ids", memberRes.id, "NIDF");
      if (pd.nidBackBase64) await handleDocumentUpload(pd.nidBackBase64, "NID Back", "foundation/members/ids", memberRes.id, "NIDB");
    } else if (pd.idDocumentType === "BIRTH_CERTIFICATE" && pd.birthCertificateBase64) {
      await handleDocumentUpload(pd.birthCertificateBase64, "Birth Certificate", "foundation/members/ids", memberRes.id, "BC");
    }

    revalidatePath("/members/manage");
    revalidatePath("/members");
    return { success: true, data: memberRes };
  } catch (error: any) {
    return { success: false, error: error.message || "members.messages.add_error" };
  }
}

export async function updateMember(id: string, data: MemberFormValues) {
  await requirePermission("Members", "Edit");
  const parsed = memberSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "members.validation.invalid_form" };
  }
  const pd = parsed.data;

  try {
    const session = await getAuthSession();
    const token = (session as any)?.accessToken;

    const referenceData =
      pd.referenceName || pd.referenceMobile || pd.referenceRelation
        ? JSON.stringify({
            name: pd.referenceName || "",
            mobile: pd.referenceMobile || "",
            relation: pd.referenceRelation || "",
          })
        : undefined;

    // Call FastAPI update member endpoint
    const memberRes = await membersApi.update(
      id,
      {
        group_id: pd.groupId as string,
        full_name: pd.fullName.trim(),
        mobile: pd.mobile?.trim() || "",
        father_name: pd.fatherName?.trim() || null,
        mother_name: pd.motherName?.trim() || null,
        dob: pd.dob ? pd.dob : undefined,
        national_id: pd.nationalId?.trim() || null,
        id_document_type: pd.idDocumentType || "NID",
        occupation: pd.occupation?.trim() || null,
        education: pd.education?.trim() || null,
        present_address: pd.presentAddress?.trim() || null,
        permanent_address: pd.permanentAddress?.trim() || null,
        email: pd.email?.trim() || null,
        blood_group: pd.bloodGroup?.trim() || null,
        position: pd.position || "GENERAL_MEMBER",
        emergency_contact_name: pd.emergencyContactName?.trim() || null,
        emergency_contact_relation: pd.emergencyContactRelation?.trim() || null,
        emergency_contact_mobile: pd.emergencyContactMobile?.trim() || null,
        reference: referenceData,
        join_date: pd.joinDate ? pd.joinDate : undefined,
      },
      token
    );

    // Update attached Cloudinary files if newly provided
    if (pd.photoBase64) {
      await handleDocumentUpload(pd.photoBase64, "Member Photo", "foundation/members/photos", id, "P");
    }
    if (pd.signatureBase64) {
      await handleDocumentUpload(pd.signatureBase64, "Signature", "foundation/members/signatures", id, "SIG");
    }
    if (pd.idDocumentType === "NID") {
      if (pd.nidFrontBase64) await handleDocumentUpload(pd.nidFrontBase64, "NID Front", "foundation/members/ids", id, "NIDF");
      if (pd.nidBackBase64) await handleDocumentUpload(pd.nidBackBase64, "NID Back", "foundation/members/ids", id, "NIDB");
    } else if (pd.idDocumentType === "BIRTH_CERTIFICATE" && pd.birthCertificateBase64) {
      await handleDocumentUpload(pd.birthCertificateBase64, "Birth Certificate", "foundation/members/ids", id, "BC");
    }

    revalidatePath("/members/manage");
    revalidatePath(`/members/${id}`);
    revalidatePath(`/members/${id}/edit`);
    return { success: true, data: memberRes };
  } catch (error: any) {
    return { success: false, error: error.message || "members.messages.update_error" };
  }
}

export async function deleteMemberDocument(memberId: string, title: string) {
  await requirePermission("Members", "Delete");
  try {
    const doc = await prisma.document.findFirst({
      where: { memberId, title },
    });

    if (doc) {
      if (doc.cloudinaryPublicId) {
        await deleteFromCloudinary(doc.cloudinaryPublicId).catch(() => {});
      }
      await prisma.document.delete({ where: { id: doc.id } });
    }

    revalidatePath(`/members/${memberId}`);
    revalidatePath(`/members/${memberId}/edit`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete document" };
  }
}

export async function toggleMemberStatus(
  id: string,
  newStatus: string,
  reason?: string,
  notes?: string
) {
  const hasEdit = await checkPermission("Members", "Edit");
  const hasManage = await checkPermission("Members", "Manage");
  if (!hasEdit && !hasManage) {
    await requirePermission("Members", "Edit");
  }

  try {
    const session = await getAuthSession();
    const token = (session as any)?.accessToken;

    const res = await membersApi.update(id, { status: newStatus, remarks: reason || notes }, token);

    revalidatePath("/members/manage");
    revalidatePath("/members/dues");
    revalidatePath(`/members/${id}`);
    return { success: true, data: res };
  } catch (error: any) {
    return { success: false, error: error.message || "members.messages.status_change_error" };
  }
}

export async function restoreMember(id: string, reason?: string) {
  const session = await getAuthSession();
  const roleName = (session?.user as any)?.role;
  if (!isSuperAdminRole(roleName)) {
    return { success: false, error: "members.messages.super_admin_restore_only" };
  }

  try {
    const token = (session as any)?.accessToken;
    const res = await membersApi.update(id, { status: "ACTIVE", remarks: reason || "Restored by Super Admin" }, token);

    revalidatePath("/members/manage");
    revalidatePath(`/members/${id}`);
    return { success: true, data: res };
  } catch (error: any) {
    return { success: false, error: error.message || "members.messages.restore_error" };
  }
}

export async function getMemberStatusHistory(memberId: string) {
  await requirePermission("Members", "View");
  return prisma.memberStatusHistory.findMany({
    where: { memberId },
    orderBy: { changedAt: "desc" },
  });
}

export async function deleteMember(id: string) {
  await requirePermission("Members", "Delete");
  try {
    const session = await getAuthSession();
    const token = (session as any)?.accessToken;

    const res = await membersApi.delete(id, token);

    revalidatePath("/members/manage");
    revalidatePath("/members");
    return { success: true, message: res.message };
  } catch (error: any) {
    return { success: false, error: error.message || "members.messages.delete_error" };
  }
}
