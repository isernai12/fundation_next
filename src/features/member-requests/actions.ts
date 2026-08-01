"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission, checkPermission } from "@/lib/rbac";
import { getAuthSession } from "@/lib/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { revalidatePath } from "next/cache";
import { getNow } from "@/lib/date";
import { baseMemberSchema, type BaseMemberFormValues } from "@/features/members/schema";

async function uploadBase64(base64Str: string, folder: string) {
  const buffer = Buffer.from(base64Str.replace(/^data:image\/\w+;base64,/, ""), "base64");
  return uploadToCloudinary(buffer, { folder });
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

    const year = getNow().getFullYear();
    const count = await prisma.memberRequest.count();
    const applicationNumber = `MR-${year}-${(count + 1).toString().padStart(5, "0")}`;

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

    const memberRequest = await prisma.memberRequest.create({
      data: {
        applicationNumber,
        fullName: restData.fullName,
        fatherName: restData.fatherName || null,
        motherName: restData.motherName || null,
        gender: restData.gender || null,
        dob: restData.dob || null,
        nationalId: restData.nationalId || null,
        idDocumentType: restData.idDocumentType || "NID",
        occupation: restData.occupation || null,
        education: restData.education || null,
        bloodGroup: restData.bloodGroup || null,
        maritalStatus: restData.maritalStatus || null,
        mobile: restData.mobile || null,
        altMobile: restData.altMobile || null,
        email: restData.email || null,
        phone: restData.phone || null,
        presentAddress: restData.presentAddress || null,
        permanentAddress: restData.permanentAddress || null,
        emergencyContactName: restData.emergencyContactName || null,
        emergencyContactMobile: restData.emergencyContactMobile || null,
        emergencyContactRelation: restData.emergencyContactRelation || null,
        referenceName: restData.referenceName || null,
        referenceMobile: restData.referenceMobile || null,
        referenceRelation: restData.referenceRelation || null,
        groupId: restData.groupId || null,
        reasonForJoining: restData.reasonForJoining || null,
        documents: uploadedDocuments.length > 0 ? JSON.stringify(uploadedDocuments) : null,
        status: "PENDING",
      },
    });

    return { success: true, applicationNumber, id: memberRequest.id };
  } catch (error: any) {
    console.error("Failed to submit member request:", error);
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
  const session = await getAuthSession();
  const user = session?.user as any;

  const canApprove = (await checkPermission("Members", "Add"));
  if (!canApprove) {
    return { success: false, error: "Unauthorized" };
  }

  const request = await prisma.memberRequest.findUnique({ where: { id } });
  if (!request) return { success: false, error: "Request not found" };
  if (request.status === "APPROVED") return { success: false, error: "Already approved" };
  if (!request.groupId) return { success: false, error: "Group not selected in application" };

  try {
    const result = await prisma.$transaction(async (tx) => {
      const memberCount = await tx.member.count();
      const year = getNow().getFullYear();
      const memberId = `MBR-${year}-${(memberCount + 1).toString().padStart(4, "0")}`;

      const referenceData = (request.referenceName || request.referenceMobile || request.referenceRelation)
        ? JSON.stringify({
            name: request.referenceName || "",
            mobile: request.referenceMobile || "",
            relation: request.referenceRelation || "",
          })
        : null;

      const member = await tx.member.create({
        data: {
          memberId,
          groupId: request.groupId!,
          fullName: request.fullName,
          fatherName: request.fatherName,
          motherName: request.motherName,
          gender: request.gender,
          dob: request.dob ? new Date(request.dob) : null,
          nationalId: request.nationalId,
          idDocumentType: request.idDocumentType,
          occupation: request.occupation,
          monthlyIncome: request.monthlyIncome,
          bloodGroup: request.bloodGroup,
          education: request.education,
          maritalStatus: request.maritalStatus,
          mobile: request.mobile,
          altMobile: request.altMobile,
          email: request.email,
          phone: request.phone,
          presentAddress: request.presentAddress,
          permanentAddress: request.permanentAddress,
          emergencyContactName: request.emergencyContactName,
          emergencyContactMobile: request.emergencyContactMobile,
          emergencyContactRelation: request.emergencyContactRelation,
          reference: referenceData,
          joinDate: getNow(),
          status: "ACTIVE",
          position: "GENERAL_MEMBER",
          reasonForJoining: request.reasonForJoining,
          declarationAccepted: true,
        },
      });

      // Copy documents to member
      if (request.documents) {
        try {
          const docs = JSON.parse(request.documents) as Array<{ title: string; cloudinaryPublicId: string; secureUrl: string }>;
          for (const doc of docs) {
            await tx.document.create({
              data: {
                documentNumber: `DOC-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
                title: doc.title === "Photo" ? "Member Photo" : doc.title,
                type: "IMAGE",
                cloudinaryPublicId: doc.cloudinaryPublicId,
                secureUrl: doc.secureUrl,
                originalFilename: `${doc.title.toLowerCase().replace(/\s/g, "_")}.jpg`,
                mimeType: "image/jpeg",
                sizeBytes: 0,
                targetType: "MEMBER",
                memberId: member.id,
              },
            });
          }
        } catch (e) {
          // Documents parsing failed, continue without documents
        }
      }

      await tx.memberRequest.update({
        where: { id },
        data: {
          status: "APPROVED",
          approvedAt: getNow(),
          approvedBy: user?.name || user?.id || "Admin",
          createdMemberId: member.id,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: user?.id,
          action: "APPROVE",
          module: "MEMBER_REQUEST",
          referenceId: id,
          remarks: `Approved member request ${request.applicationNumber}, created member ${member.memberId}`,
        },
      });

      revalidatePath("/members/manage");
      revalidatePath("/members/requests");

      return { success: true, memberId: member.memberId };
    });

    return result;
  } catch (error: any) {
    console.error("Failed to approve member request:", error);
    return { success: false, error: error.message || "Failed to approve" };
  }
}

export async function rejectMemberRequest(id: string, reason: string) {
  const session = await getAuthSession();
  const user = session?.user as any;
  await requirePermission("Members", "Edit");

  try {
    const request = await prisma.memberRequest.update({
      where: { id },
      data: {
        status: "REJECTED",
        rejectionReason: reason,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user?.id,
        action: "REJECT",
        module: "MEMBER_REQUEST",
        referenceId: id,
        remarks: `Rejected member request ${request.applicationNumber}. Reason: ${reason}`,
      },
    });

    revalidatePath("/members/requests");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function requestChangesMemberRequest(id: string, message: string) {
  const session = await getAuthSession();
  const user = session?.user as any;
  await requirePermission("Members", "Edit");

  try {
    const request = await prisma.memberRequest.update({
      where: { id },
      data: {
        status: "NEEDS_CHANGES",
        adminMessage: message,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user?.id,
        action: "REQUEST_CHANGES",
        module: "MEMBER_REQUEST",
        referenceId: id,
        remarks: `Requested changes for ${request.applicationNumber}: ${message}`,
      },
    });

    revalidatePath("/members/requests");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteMemberRequest(id: string) {
  const session = await getAuthSession();
  const user = session?.user as any;
  await requirePermission("Members", "Delete");

  try {
    const request = await prisma.memberRequest.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        userId: user?.id,
        action: "DELETE",
        module: "MEMBER_REQUEST",
        referenceId: id,
        remarks: `Deleted member request ${request.applicationNumber}`,
      },
    });

    revalidatePath("/members/requests");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getGroups() {
  return prisma.group.findMany({
    where: { status: "ACTIVE" },
    orderBy: { name: "asc" },
    select: { id: true, name: true, code: true },
  });
}
