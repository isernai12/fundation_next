"use server"
import { getNow } from "@/lib/date";

import { prisma } from "@/lib/prisma"
import { memberSchema, type MemberFormValues } from "./schema"
import { revalidatePath } from "next/cache"
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary"
import { requirePermission, checkPermission } from "@/lib/rbac";
import { getAuthSession } from "@/lib/auth";
import { isSuperAdminRole } from "@/lib/rbac-client";

export async function getMembers() {
  if (!await checkPermission("Members", "View")) return [];
  return prisma.member.findMany({
    where: {
      status: { not: "DELETED" }
    },
    orderBy: { createdAt: "desc" },
    include: {
      group: {
        select: { name: true, code: true }
      }
    }
  })
}

export async function getMember(id: string) {
  if (!await checkPermission("Members", "View")) return null;
  return prisma.member.findUnique({
    where: { id },
    include: {
      group: true,
      documents: true
    }
  })
}

export async function generateMemberId(tx?: any) {
  const db = tx || prisma
  const members = await db.member.findMany({
    select: { memberId: true }
  })
  let maxNum = 0
  for (const m of members) {
    if (!m.memberId) continue
    const match = m.memberId.match(/(\d+)$/)
    if (match) {
      const num = parseInt(match[1], 10)
      if (!isNaN(num) && num > maxNum) {
        maxNum = num
      }
    }
  }
  let nextNum = maxNum + 1
  let candidate = `M-${nextNum.toString().padStart(4, '0')}`
  while (await db.member.findUnique({ where: { memberId: candidate } })) {
    nextNum++
    candidate = `M-${nextNum.toString().padStart(4, '0')}`
  }
  return candidate
}

async function handleDocumentUpload(
  base64Str: string | undefined, 
  title: string, 
  folder: string, 
  memberId: string, 
  documentNumberSuffix: string
) {
  if (!base64Str) return;
  
  const buffer = Buffer.from(base64Str.replace(/^data:image\/\w+;base64,/, ""), 'base64')
  const uploaded = await uploadToCloudinary(buffer, { folder })
  
  const existingDoc = await prisma.document.findFirst({
    where: { memberId, title }
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
      }
    });
  } else {
    await prisma.document.create({
      data: {
        documentNumber: `DOC-${Date.now()}-${documentNumberSuffix}`,
        title,
        type: "IMAGE",
        cloudinaryPublicId: uploaded.public_id,
        secureUrl: uploaded.secure_url,
        originalFilename: `${title.toLowerCase().replace(/\s/g, '_')}.jpg`,
        mimeType: "image/jpeg",
        sizeBytes: uploaded.bytes || 0,
        targetType: "MEMBER",
        member: { connect: { id: memberId } },
      }
    });
  }
}

export async function createMember(data: MemberFormValues) {
    await requirePermission("Members", "Add");
  const parsed = memberSchema.safeParse(data)
  if (!parsed.success) {
    console.error("Zod Validation Error:", parsed.error);
    return { success: false, error: "members.validation.invalid_form", details: parsed.error.format() }
  }

  const pd = parsed.data

  // Check unique constraints only if non-empty string provided
  if (pd.nationalId && pd.nationalId.trim() !== "") {
    const existingNid = await prisma.member.findUnique({ where: { nationalId: pd.nationalId.trim() } })
    if (existingNid) return { success: false, error: "members.validation.nid_exists" }
  }
  if (pd.mobile && pd.mobile.trim() !== "") {
    const existingMobile = await prisma.member.findUnique({ where: { mobile: pd.mobile.trim() } })
    if (existingMobile) return { success: false, error: "members.validation.mobile_exists" }
  }
  if (pd.email && pd.email.trim() !== "") {
    const existingEmail = await prisma.member.findUnique({ where: { email: pd.email.trim() } })
    if (existingEmail) return { success: false, error: "members.validation.email_exists" }
  }

  // Validate memberId
  const existingId = await prisma.member.findUnique({ where: { memberId: pd.memberId } })
  if (existingId) return { success: false, error: "members.validation.memberId_exists" }

  try {
    const referenceData = (pd.referenceName || pd.referenceMobile || pd.referenceRelation) 
      ? JSON.stringify({
          name: pd.referenceName || "",
          mobile: pd.referenceMobile || "",
          relation: pd.referenceRelation || ""
        }) 
      : null;

    const member = await prisma.member.create({
      data: {
        memberId: pd.memberId,
        group: { connect: { id: pd.groupId as string } },
        fullName: pd.fullName.trim(),
        fatherName: pd.fatherName?.trim() || null,
        motherName: pd.motherName?.trim() || null,
        dob: pd.dob ? new Date(pd.dob) : null,
        nationalId: pd.nationalId?.trim() || null,
        occupation: pd.occupation?.trim() || null,
        education: pd.education?.trim() || null,
        presentAddress: pd.presentAddress?.trim() || null,
        permanentAddress: pd.permanentAddress?.trim() || null,
        mobile: pd.mobile?.trim() || null,
        email: pd.email?.trim() || null,
        bloodGroup: pd.bloodGroup?.trim() || null,
        position: pd.position || "GENERAL_MEMBER",
        idDocumentType: pd.idDocumentType || "NID",
        
        emergencyContactName: pd.emergencyContactName?.trim() || null,
        emergencyContactRelation: pd.emergencyContactRelation?.trim() || null,
        emergencyContactMobile: pd.emergencyContactMobile?.trim() || null,
        
        reference: referenceData,
        joinDate: pd.joinDate ? new Date(pd.joinDate) : new Date(),
        status: "ACTIVE",
        declarationAccepted: true,
      },
    })

    // Handle Documents
    await handleDocumentUpload(pd.photoBase64, "Member Photo", "foundation/members/photos", member.id, "P");
    await handleDocumentUpload(pd.signatureBase64, "Signature", "foundation/members/signatures", member.id, "SIG");
    
    if (pd.idDocumentType === "NID") {
      await handleDocumentUpload(pd.nidFrontBase64, "NID Front", "foundation/members/ids", member.id, "NIDF");
      await handleDocumentUpload(pd.nidBackBase64, "NID Back", "foundation/members/ids", member.id, "NIDB");
      
      // Cleanup Birth Certificate if exists
      const bcDoc = await prisma.document.findFirst({ where: { memberId: member.id, title: "Birth Certificate" } });
      if (bcDoc) {
        if (bcDoc.cloudinaryPublicId) await deleteFromCloudinary(bcDoc.cloudinaryPublicId).catch(() => {});
        await prisma.document.delete({ where: { id: bcDoc.id } });
      }
    } else if (pd.idDocumentType === "BIRTH_CERTIFICATE") {
      await handleDocumentUpload(pd.birthCertificateBase64, "Birth Certificate", "foundation/members/ids", member.id, "BC");
      
      // Cleanup NID if exists
      const nidDocs = await prisma.document.findMany({ where: { memberId: member.id, title: { in: ["NID Front", "NID Back", "National ID"] } } });
      for (const d of nidDocs) {
        if (d.cloudinaryPublicId) await deleteFromCloudinary(d.cloudinaryPublicId).catch(() => {});
        await prisma.document.delete({ where: { id: d.id } });
      }
    }

    revalidatePath("/members/manage")
    return { success: true, data: member }
  } catch (error: any) {
    return { success: false, error: error.message || "members.messages.add_error" }
  }
}

export async function updateMember(id: string, data: MemberFormValues) {
    await requirePermission("Members", "Edit");
  const parsed = memberSchema.safeParse(data)
  if (!parsed.success) {
    console.error("Member update validation failed:", parsed.error);
    return { success: false, error: "members.validation.invalid_form" }
  }
  const pd = parsed.data

  if (pd.nationalId && pd.nationalId.trim() !== "") {
    const existing = await prisma.member.findUnique({ where: { nationalId: pd.nationalId.trim() } })
    if (existing && existing.id !== id) return { success: false, error: "members.validation.nid_exists" }
  }
  
  if (pd.memberId) {
    const existing = await prisma.member.findUnique({ where: { memberId: pd.memberId } })
    if (existing && existing.id !== id) return { success: false, error: "members.validation.memberId_exists" }
  }
  if (pd.mobile && pd.mobile.trim() !== "") {
    const existing = await prisma.member.findUnique({ where: { mobile: pd.mobile.trim() } })
    if (existing && existing.id !== id) return { success: false, error: "members.validation.mobile_exists" }
  }
  if (pd.email && pd.email.trim() !== "") {
    const existing = await prisma.member.findUnique({ where: { email: pd.email.trim() } })
    if (existing && existing.id !== id) return { success: false, error: "members.validation.email_exists" }
  }

  try {
    const referenceData = (pd.referenceName || pd.referenceMobile || pd.referenceRelation) 
      ? JSON.stringify({
          name: pd.referenceName || "",
          mobile: pd.referenceMobile || "",
          relation: pd.referenceRelation || ""
        }) 
      : null;

    const currentMember = await prisma.member.findUnique({ where: { id } });
    if (!currentMember) return { success: false, error: "members.messages.update_error" };

    const member = await prisma.member.update({
      where: { id },
      data: {
        memberId: pd.memberId,
        joinDate: pd.joinDate ? new Date(pd.joinDate) : currentMember.joinDate,
        group: { connect: { id: pd.groupId as string } },
        fullName: pd.fullName.trim(),
        fatherName: pd.fatherName?.trim() || null,
        motherName: pd.motherName?.trim() || null,
        dob: pd.dob ? new Date(pd.dob) : null,
        nationalId: pd.nationalId?.trim() || null,
        occupation: pd.occupation?.trim() || null,
        education: pd.education?.trim() || null,
        presentAddress: pd.presentAddress?.trim() || null,
        permanentAddress: pd.permanentAddress?.trim() || null,
        mobile: pd.mobile?.trim() || null,
        email: pd.email?.trim() || null,
        bloodGroup: pd.bloodGroup?.trim() || null,
        position: pd.position || "GENERAL_MEMBER",
        idDocumentType: pd.idDocumentType || "NID",
        
        emergencyContactName: pd.emergencyContactName?.trim() || null,
        emergencyContactRelation: pd.emergencyContactRelation?.trim() || null,
        emergencyContactMobile: pd.emergencyContactMobile?.trim() || null,
        
        reference: referenceData,
      },
    })

    // Document replacements
    await handleDocumentUpload(pd.photoBase64, "Member Photo", "foundation/members/photos", id, "P");
    await handleDocumentUpload(pd.signatureBase64, "Signature", "foundation/members/signatures", id, "SIG");
    
    if (pd.idDocumentType === "NID") {
      await handleDocumentUpload(pd.nidFrontBase64, "NID Front", "foundation/members/ids", id, "NIDF");
      await handleDocumentUpload(pd.nidBackBase64, "NID Back", "foundation/members/ids", id, "NIDB");
      
      // Cleanup Birth Certificate if exists
      const bcDoc = await prisma.document.findFirst({ where: { memberId: id, title: "Birth Certificate" } });
      if (bcDoc) {
        if (bcDoc.cloudinaryPublicId) await deleteFromCloudinary(bcDoc.cloudinaryPublicId).catch(() => {});
        await prisma.document.delete({ where: { id: bcDoc.id } });
      }
    } else if (pd.idDocumentType === "BIRTH_CERTIFICATE") {
      await handleDocumentUpload(pd.birthCertificateBase64, "Birth Certificate", "foundation/members/ids", id, "BC");
      
      // Cleanup NID if exists
      const nidDocs = await prisma.document.findMany({ where: { memberId: id, title: { in: ["NID Front", "NID Back", "National ID"] } } });
      for (const d of nidDocs) {
        if (d.cloudinaryPublicId) await deleteFromCloudinary(d.cloudinaryPublicId).catch(() => {});
        await prisma.document.delete({ where: { id: d.id } });
      }
    }

    // Audit Log for Member ID or Join Date Change
    if (pd.memberId !== currentMember.memberId) {
      await prisma.auditLog.create({
        data: {
          action: "UPDATE",
          module: "MEMBER",
          referenceId: id,
          oldValue: currentMember.memberId,
          newValue: pd.memberId,
          remarks: "Member ID changed",
        }
      });
    }

    if (pd.joinDate) {
      const oldJoinDate = currentMember.joinDate ? currentMember.joinDate.toISOString().split('T')[0] : null;
      if (oldJoinDate && pd.joinDate !== oldJoinDate) {
        await prisma.auditLog.create({
          data: {
            action: "UPDATE",
            module: "MEMBER",
            referenceId: id,
            oldValue: oldJoinDate,
            newValue: pd.joinDate,
            remarks: "Joining Date changed",
          }
        });
      }
    }

    revalidatePath("/members/manage")
    revalidatePath(`/members/${id}`)
    revalidatePath(`/members/${id}/edit`)
    return { success: true, data: member }
  } catch (error: any) {
    console.error("Prisma error in updateMember:", error);
    return { success: false, error: error.message || "members.messages.update_error" }
  }
}

export async function deleteMemberDocument(memberId: string, title: string) {
    await requirePermission("Members", "Delete");
  try {
    const doc = await prisma.document.findFirst({ 
      where: { memberId, title } 
    });

    if (doc) {
      if (doc.cloudinaryPublicId) {
        await deleteFromCloudinary(doc.cloudinaryPublicId).catch(() => {});
      }
      await prisma.document.delete({ where: { id: doc.id } });
    }
    
    revalidatePath(`/members/${memberId}`)
    revalidatePath(`/members/${memberId}/edit`)
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
    const currentMember = await prisma.member.findUnique({ where: { id } });
    if (!currentMember) return { success: false, error: "members.messages.not_found" };

    const fromStatus = currentMember.status;
    const session = await getAuthSession();
    const changedBy = (session?.user as any)?.name || (session?.user as any)?.username || "System";

    const member = await prisma.$transaction(async (tx) => {
      const updated = await tx.member.update({
        where: { id },
        data: { status: newStatus },
      });

      await tx.memberStatusHistory.create({
        data: {
          memberId: id,
          fromStatus: fromStatus,
          toStatus: newStatus,
          reason: reason || null,
          notes: notes || null,
          changedBy: changedBy,
          changedAt: new Date(),
        },
      });

      return updated;
    });

    revalidatePath("/members/manage");
    revalidatePath("/members/dues");
    revalidatePath(`/members/${id}`);
    return { success: true, data: member };
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
    const currentMember = await prisma.member.findUnique({ where: { id } });
    if (!currentMember) return { success: false, error: "members.messages.not_found" };

    const changedBy = (session?.user as any)?.name || "Super Admin";

    await prisma.$transaction(async (tx) => {
      await tx.member.update({
        where: { id },
        data: { status: "ACTIVE" }
      });

      await tx.memberStatusHistory.create({
        data: {
          memberId: id,
          fromStatus: currentMember.status,
          toStatus: "ACTIVE",
          reason: reason || "Restored by Super Admin",
          changedBy: changedBy,
          changedAt: new Date()
        }
      });
    });

    revalidatePath("/members/manage");
    revalidatePath(`/members/${id}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "members.messages.restore_error" };
  }
}

export async function getMemberStatusHistory(memberId: string) {
  await requirePermission("Members", "View");
  return prisma.memberStatusHistory.findMany({
    where: { memberId },
    orderBy: { changedAt: "desc" }
  });
}

export async function deleteMember(id: string) {
  await requirePermission("Members", "Delete");
  try {
    // 1. Check for linked financial records (contributions, loans, campaign contributions)
    const [contributions, loans, campaignContributions] = await Promise.all([
      prisma.monthlyContribution.count({ where: { memberId: id } }),
      prisma.loan.count({ where: { memberId: id } }),
      prisma.campaignContribution.count({ where: { memberId: id } }),
    ]);

    if (contributions > 0 || loans > 0 || campaignContributions > 0) {
      return {
        success: false,
        error: "members.messages.delete_prevented_financial"
      };
    }

    // 2. Soft Delete: update status to DELETED
    const session = await getAuthSession();
    const changedBy = (session?.user as any)?.name || "System";

    await prisma.$transaction(async (tx) => {
      await tx.member.update({
        where: { id },
        data: { status: "DELETED" }
      });

      await tx.memberStatusHistory.create({
        data: {
          memberId: id,
          fromStatus: "ACTIVE",
          toStatus: "DELETED",
          reason: "Soft Deleted",
          changedBy: changedBy,
          changedAt: new Date()
        }
      });
    });

    revalidatePath("/members/manage")
    revalidatePath("/members")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "members.messages.delete_error" }
  }
}
