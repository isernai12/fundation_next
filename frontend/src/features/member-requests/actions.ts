"use server";

import { requirePermission, checkPermission } from "@/lib/rbac";
import { getAuthSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { baseMemberSchema, type BaseMemberFormValues } from "@/features/members/schema";
import { membersApi, groupsApi, uploadApi } from "@/lib/api";

async function uploadBase64(base64Str: string, folder: string) {
  return uploadApi.uploadBase64(base64Str, folder);
}

export async function getGroups() {
  try {
    const session = await getAuthSession();
    const token = (session as any)?.accessToken;
    const res = await groupsApi.list({ member_signup_enabled: true, status: "ACTIVE", page_size: 1000 }, token);
    return res.items
      .filter((g) => !g.is_foundation_group && g.member_signup_enabled && g.status === "ACTIVE")
      .map((g) => ({
        id: g.id,
        name: g.name,
        code: g.code,
        shortName: g.short_name,
        memberSignupEnabled: g.member_signup_enabled,
        isFoundationGroup: g.is_foundation_group,
      }));
  } catch (error) {
    console.error("[MemberRequests] Failed to fetch groups:", error);
    return [];
  }
}

export async function submitMemberRequest(data: BaseMemberFormValues) {
  try {
    const parsed = baseMemberSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: "Validation failed" };
    }

    const {
      photoBase64,
      nidFrontBase64,
      nidBackBase64,
      birthCertificateBase64,
      signatureBase64,
      ...restData
    } = parsed.data;

    // Upload files to Cloudinary via FastAPI backend
    const uploadedDocuments: Array<{ title: string; cloudinaryPublicId: string; secureUrl: string }> = [];

    if (photoBase64) {
      const res = await uploadBase64(photoBase64, "foundation/member-requests/photos");
      uploadedDocuments.push({ title: "Photo", cloudinaryPublicId: res.public_id, secureUrl: res.secure_url });
    }
    if (nidFrontBase64) {
      const res = await uploadBase64(nidFrontBase64, "foundation/member-requests/ids");
      uploadedDocuments.push({ title: "NID Front", cloudinaryPublicId: res.public_id, secureUrl: res.secure_url });
    }
    if (nidBackBase64) {
      const res = await uploadBase64(nidBackBase64, "foundation/member-requests/ids");
      uploadedDocuments.push({ title: "NID Back", cloudinaryPublicId: res.public_id, secureUrl: res.secure_url });
    }
    if (birthCertificateBase64) {
      const res = await uploadBase64(birthCertificateBase64, "foundation/member-requests/ids");
      uploadedDocuments.push({ title: "Birth Certificate", cloudinaryPublicId: res.public_id, secureUrl: res.secure_url });
    }
    if (signatureBase64) {
      const res = await uploadBase64(signatureBase64, "foundation/member-requests/signatures");
      uploadedDocuments.push({ title: "Signature", cloudinaryPublicId: res.public_id, secureUrl: res.secure_url });
    }

    // Call FastAPI public member request submission endpoint
    const res = await membersApi.submitRequest({
      group_id: restData.groupId || "",
      full_name: restData.fullName,
      mobile: restData.mobile || "",
      father_name: restData.fatherName || null,
      mother_name: restData.motherName || null,
      gender: restData.gender || null,
      dob: restData.dob || undefined,
      national_id: restData.nationalId || null,
      id_document_type: restData.idDocumentType || "NID",
      occupation: restData.occupation || null,
      education: restData.education || null,
      blood_group: restData.bloodGroup || null,
      marital_status: restData.maritalStatus || null,
      alt_mobile: restData.altMobile || null,
      email: restData.email || null,
      phone: restData.phone || null,
      present_address: restData.presentAddress || null,
      permanent_address: restData.permanentAddress || null,
      emergency_contact_name: restData.emergencyContactName || null,
      emergency_contact_mobile: restData.emergencyContactMobile || null,
      emergency_contact_relation: restData.emergencyContactRelation || null,
      reference:
        restData.referenceName || restData.referenceMobile || restData.referenceRelation
          ? JSON.stringify({
              name: restData.referenceName || "",
              mobile: restData.referenceMobile || "",
              relation: restData.referenceRelation || "",
            })
          : undefined,
      reason_for_joining: restData.reasonForJoining || null,
      documents: uploadedDocuments.map((d) => ({
        title: d.title,
        file_url: d.secureUrl,
        cloudinary_public_id: d.cloudinaryPublicId,
      })),
    });

    return { success: true, applicationNumber: res.application_number, id: res.id };
  } catch (error: any) {
    console.error("Failed to submit member request via FastAPI:", error);
    return { success: false, error: error.message || "Failed to submit" };
  }
}

export async function getMemberRequestByApplicationNumber(applicationNumber: string) {
  try {
    const res = await membersApi.getRequestStatus(applicationNumber);
    return {
      id: res.id,
      applicationNumber: res.application_number,
      status: res.status,
      fullName: res.full_name,
      submittedAt: res.submitted_at,
      approvedAt: res.approved_at,
      adminMessage: res.admin_message,
      rejectionReason: res.rejection_reason,
    };
  } catch (error) {
    return null;
  }
}

export async function getMemberRequests() {
  await requirePermission("Members", "View");
  const session = await getAuthSession();
  const token = (session as any)?.accessToken;
  try {
    const res = await membersApi.listRequests({ page_size: 100 }, token);
    return res.items.map((item) => ({
      id: item.id,
      applicationNumber: item.application_number,
      fullName: item.full_name,
      mobile: item.mobile,
      groupId: item.group_id,
      group: item.group_name ? { name: item.group_name } : null,
      status: item.status,
      submittedAt: item.submitted_at,
      approvedAt: item.approved_at,
    }));
  } catch (error) {
    console.error("[MemberRequests] Failed to fetch member requests:", error);
    return [];
  }
}

export async function getMemberRequest(id: string) {
  await requirePermission("Members", "View");
  const session = await getAuthSession();
  const token = (session as any)?.accessToken;
  try {
    const req = await membersApi.getRequest(id, token);
    return {
      id: req.id,
      applicationNumber: req.application_number,
      groupId: req.group_id,
      group: req.group_name ? { id: req.group_id, name: req.group_name } : null,
      fullName: req.full_name,
      mobile: req.mobile,
      fatherName: req.father_name,
      motherName: req.mother_name,
      gender: req.gender,
      dob: req.dob,
      nationalId: req.national_id,
      idDocumentType: req.id_document_type,
      occupation: req.occupation,
      education: req.education,
      bloodGroup: req.blood_group,
      maritalStatus: req.marital_status,
      altMobile: req.alt_mobile,
      email: req.email,
      phone: req.phone,
      presentAddress: req.present_address,
      permanentAddress: req.permanent_address,
      emergencyContactName: req.emergency_contact_name,
      emergencyContactMobile: req.emergency_contact_mobile,
      emergencyContactRelation: req.emergency_contact_relation,
      reference: req.reference,
      reasonForJoining: req.reason_for_joining,
      status: req.status,
      rejectionReason: req.rejection_reason,
      adminMessage: req.admin_message,
      submittedAt: req.submitted_at,
      approvedAt: req.approved_at,
      documents: (req.documents || []).map((d) => ({
        id: d.id,
        title: d.title,
        fileUrl: d.file_url,
        cloudinaryPublicId: d.cloudinary_public_id,
      })),
    };
  } catch (error) {
    console.error("[MemberRequests] Failed to fetch member request detail:", error);
    return null;
  }
}

export async function approveMemberRequest(id: string) {
  const canApprove = await checkPermission("Members", "Add");
  if (!canApprove) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const session = await getAuthSession();
    const token = (session as any)?.accessToken;

    const member = await membersApi.approveRequest(id, {}, token);

    revalidatePath("/members/requests");
    revalidatePath("/members/manage");
    revalidatePath("/members");
    return { success: true, memberId: member.member_id };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to approve request" };
  }
}

export async function rejectMemberRequest(id: string, reason: string, adminMessage?: string) {
  const canReject = await checkPermission("Members", "Add");
  if (!canReject) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const session = await getAuthSession();
    const token = (session as any)?.accessToken;

    await membersApi.rejectRequest(id, { rejection_reason: reason, remarks: adminMessage }, token);

    revalidatePath("/members/requests");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to reject request" };
  }
}

export async function requestChangesMemberRequest(id: string, adminMessage: string) {
  const canReject = await checkPermission("Members", "Add");
  if (!canReject) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const session = await getAuthSession();
    const token = (session as any)?.accessToken;
    await membersApi.rejectRequest(id, { rejection_reason: "Changes requested", remarks: adminMessage }, token);
    revalidatePath("/members/requests");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to request changes" };
  }
}
