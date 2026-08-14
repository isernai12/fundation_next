"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission, checkPermission } from "@/lib/rbac";
import { getAuthSession } from "@/lib/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { revalidatePath } from "next/cache";
import { getNow } from "@/lib/date";
import { baseMemberSchema, type BaseMemberFormValues } from "@/features/members/schema";
import { generateMemberId } from "@/features/members/actions";
import { membersApi, groupsApi } from "@/lib/api";

/**
 * Migration Note:
 * This file is migrated to proxy public registration and admin review through the FastAPI backend
 * (/api/v1/member-requests) while keeping full backward compatibility for the React components.
 */

async function uploadBase64(base64Str: string, folder: string) {
  const buffer = Buffer.from(base64Str.replace(/^data:image\/\w+;base64,/, ""), "base64");
  return uploadToCloudinary(buffer, { folder });
}

export async function getGroups() {
  try {
    const res = await groupsApi.list({ member_signup_enabled: true, page_size: 1000 });
    return res.items
      .filter((g) => !g.is_foundation_group && g.member_signup_enabled)
      .map((g) => ({
        id: g.id,
        name: g.name,
        code: g.code,
        shortName: g.short_name,
        memberSignupEnabled: g.member_signup_enabled,
        isFoundationGroup: g.is_foundation_group,
      }));
  } catch (error) {
    return prisma.group.findMany({
      where: {
        isFoundationGroup: false,
        memberSignupEnabled: true,
      },
      select: {
        id: true,
        name: true,
        code: true,
        shortName: true,
        memberSignupEnabled: true,
        isFoundationGroup: true,
      },
      orderBy: { name: "asc" },
    });
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

    // Upload files to Cloudinary
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
  const request = await prisma.memberRequest.findUnique({
    where: { applicationNumber },
    select: {
      id: true,
      applicationNumber: true,
      status: true,
      fullName: true,
      submittedAt: true,
      approvedAt: true,
      adminMessage: true,
      rejectionReason: true,
    },
  });
  return request;
}

export async function getMemberRequests() {
  await requirePermission("Members", "View");
  return prisma.memberRequest.findMany({
    orderBy: { submittedAt: "desc" },
  });
}

export async function getMemberRequest(id: string) {
  await requirePermission("Members", "View");
  return prisma.memberRequest.findUnique({ where: { id } });
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
    await prisma.memberRequest.update({
      where: { id },
      data: {
        adminMessage,
        status: "PENDING",
      },
    });

    revalidatePath("/members/requests");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to request changes" };
  }
}
