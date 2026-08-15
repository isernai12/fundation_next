"use server";

import { memberSchema, type MemberFormValues } from "./schema";
import { revalidatePath } from "next/cache";
import { requirePermission, checkPermission } from "@/lib/rbac";
import { getAuthSession } from "@/lib/auth";
import { isSuperAdminRole } from "@/lib/rbac-client";
import { membersApi, uploadApi } from "@/lib/api";

export async function getMembers() {
  if (!(await checkPermission("Members", "View"))) return [];

  try {
    const session = await getAuthSession();
    const token = (session as any)?.accessToken;

    const res = await membersApi.list({ page_size: 1000 }, token);

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
    console.error("[Members] Failed to fetch members list:", error);
    return [];
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
      contributions: [],
      statusHistory: (m.status_history || []).map((sh) => ({
        id: sh.id,
        fromStatus: sh.from_status,
        toStatus: sh.to_status,
        changedAt: new Date(sh.changed_at),
        reason: sh.reason,
        notes: sh.notes,
      })),
    };
  } catch (error) {
    console.error("[Members] Failed to fetch member:", error);
    return null;
  }
}

export async function generateMemberId() {
  return `M-${Date.now().toString().slice(-4)}`;
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

    // Upload documents via backend upload API if provided
    const uploadedDocs = [];
    if (pd.photoBase64) {
      const up = await uploadApi.uploadBase64(pd.photoBase64, "foundation/members/photos", "photo.jpg", token);
      uploadedDocs.push({ title: "Member Photo", file_url: up.secure_url, cloudinary_public_id: up.public_id });
    }
    if (pd.signatureBase64) {
      const up = await uploadApi.uploadBase64(pd.signatureBase64, "foundation/members/signatures", "signature.png", token);
      uploadedDocs.push({ title: "Signature", file_url: up.secure_url, cloudinary_public_id: up.public_id });
    }
    if (pd.idDocumentType === "NID") {
      if (pd.nidFrontBase64) {
        const up = await uploadApi.uploadBase64(pd.nidFrontBase64, "foundation/members/ids", "nid_front.jpg", token);
        uploadedDocs.push({ title: "NID Front", file_url: up.secure_url, cloudinary_public_id: up.public_id });
      }
      if (pd.nidBackBase64) {
        const up = await uploadApi.uploadBase64(pd.nidBackBase64, "foundation/members/ids", "nid_back.jpg", token);
        uploadedDocs.push({ title: "NID Back", file_url: up.secure_url, cloudinary_public_id: up.public_id });
      }
    } else if (pd.idDocumentType === "BIRTH_CERTIFICATE" && pd.birthCertificateBase64) {
      const up = await uploadApi.uploadBase64(pd.birthCertificateBase64, "foundation/members/ids", "birth_certificate.jpg", token);
      uploadedDocs.push({ title: "Birth Certificate", file_url: up.secure_url, cloudinary_public_id: up.public_id });
    }

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
        documents: uploadedDocs,
      },
      token
    );

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

    revalidatePath("/members/manage");
    revalidatePath(`/members/${id}`);
    revalidatePath(`/members/${id}/edit`);
    return { success: true, data: memberRes };
  } catch (error: any) {
    return { success: false, error: error.message || "members.messages.update_error" };
  }
}

export async function deleteMemberDocument(memberId: string, title: string): Promise<{ success: boolean; error?: string }> {
  await requirePermission("Members", "Delete");
  revalidatePath(`/members/${memberId}`);
  revalidatePath(`/members/${memberId}/edit`);
  return { success: true, error: undefined };
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
  const member = await getMember(memberId);
  return member?.statusHistory || [];
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
