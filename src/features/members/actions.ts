"use server"

import { prisma } from "@/lib/prisma"
import { memberSchema, type MemberFormValues } from "./schema"
import { revalidatePath } from "next/cache"
import { MemberStatus } from "@prisma/client"
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary"

export async function getMembers() {
  return prisma.member.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      group: {
        select: { name: true, code: true }
      }
    }
  })
}

export async function getMember(id: string) {
  return prisma.member.findUnique({
    where: { id },
    include: {
      group: true,
      documents: true
    }
  })
}

async function generateMemberId() {
  const count = await prisma.member.count()
  const year = new Date().getFullYear()
  return `MBR-${year}-${(count + 1).toString().padStart(4, '0')}`
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
  const parsed = memberSchema.safeParse(data)
  if (!parsed.success) {
    console.error("Zod Validation Error:", parsed.error);
    return { success: false, error: "ফর্মের তথ্য সঠিক নয়", details: parsed.error.format() }
  }

  const pd = parsed.data

  // Check unique constraints only if provided
  if (pd.nationalId) {
    const existingNid = await prisma.member.findUnique({ where: { nationalId: pd.nationalId } })
    if (existingNid) return { success: false, error: "এই জাতীয় পরিচয়পত্র নম্বরটি ইতোমধ্যে ব্যবহৃত হয়েছে" }
  }
  if (pd.mobile) {
    const existingMobile = await prisma.member.findUnique({ where: { mobile: pd.mobile } })
    if (existingMobile) return { success: false, error: "এই মোবাইল নম্বরটি ইতোমধ্যে ব্যবহৃত হয়েছে" }
  }
  if (pd.email) {
    const existingEmail = await prisma.member.findUnique({ where: { email: pd.email } })
    if (existingEmail) return { success: false, error: "এই ইমেইলটি ইতোমধ্যে ব্যবহৃত হয়েছে" }
  }

  const memberId = await generateMemberId()

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
        memberId,
        group: { connect: { id: pd.groupId as string } },
        fullName: pd.fullName,
        fatherName: pd.fatherName || null,
        motherName: pd.motherName || null,
        dob: pd.dob ? new Date(pd.dob) : null,
        nationalId: pd.nationalId || null,
        occupation: pd.occupation || null,
        education: pd.education || null,
        presentAddress: pd.presentAddress || null,
        permanentAddress: pd.permanentAddress || null,
        mobile: pd.mobile || null,
        email: pd.email || null,
        bloodGroup: pd.bloodGroup || null,
        idDocumentType: pd.idDocumentType || "NID",
        
        emergencyContactName: pd.emergencyContactName || null,
        emergencyContactRelation: pd.emergencyContactRelation || null,
        emergencyContactMobile: pd.emergencyContactMobile || null,
        
        reference: referenceData,
        joinDate: new Date(),
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
    return { success: false, error: error.message || "সদস্য তৈরি করতে ব্যর্থ হয়েছে" }
  }
}

export async function updateMember(id: string, data: MemberFormValues) {
  const parsed = memberSchema.safeParse(data)
  if (!parsed.success) {
    console.error("Member update validation failed:", parsed.error);
    return { success: false, error: "ফর্মের তথ্য সঠিক নয়" }
  }
  const pd = parsed.data

  if (pd.nationalId) {
    const existing = await prisma.member.findUnique({ where: { nationalId: pd.nationalId } })
    if (existing && existing.id !== id) return { success: false, error: "এই জাতীয় পরিচয়পত্র নম্বরটি ইতোমধ্যে ব্যবহৃত হয়েছে" }
  }
  if (pd.mobile) {
    const existing = await prisma.member.findUnique({ where: { mobile: pd.mobile } })
    if (existing && existing.id !== id) return { success: false, error: "এই মোবাইল নম্বরটি ইতোমধ্যে ব্যবহৃত হয়েছে" }
  }
  if (pd.email) {
    const existing = await prisma.member.findUnique({ where: { email: pd.email } })
    if (existing && existing.id !== id) return { success: false, error: "এই ইমেইলটি ইতোমধ্যে ব্যবহৃত হয়েছে" }
  }

  try {
    const referenceData = (pd.referenceName || pd.referenceMobile || pd.referenceRelation) 
      ? JSON.stringify({
          name: pd.referenceName || "",
          mobile: pd.referenceMobile || "",
          relation: pd.referenceRelation || ""
        }) 
      : null;

    const member = await prisma.member.update({
      where: { id },
      data: {
        group: { connect: { id: pd.groupId as string } },
        fullName: pd.fullName,
        fatherName: pd.fatherName || null,
        motherName: pd.motherName || null,
        dob: pd.dob ? new Date(pd.dob) : null,
        nationalId: pd.nationalId || null,
        occupation: pd.occupation || null,
        education: pd.education || null,
        presentAddress: pd.presentAddress || null,
        permanentAddress: pd.permanentAddress || null,
        mobile: pd.mobile || null,
        email: pd.email || null,
        bloodGroup: pd.bloodGroup || null,
        idDocumentType: pd.idDocumentType || "NID",
        
        emergencyContactName: pd.emergencyContactName || null,
        emergencyContactRelation: pd.emergencyContactRelation || null,
        emergencyContactMobile: pd.emergencyContactMobile || null,
        
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

    revalidatePath("/members/manage")
    revalidatePath(`/members/${id}`)
    revalidatePath(`/members/${id}/edit`)
    return { success: true, data: member }
  } catch (error: any) {
    console.error("Prisma error in updateMember:", error);
    return { success: false, error: error.message || "সদস্য আপডেট করতে ব্যর্থ হয়েছে" }
  }
}

export async function deleteMemberDocument(memberId: string, title: string) {
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

export async function toggleMemberStatus(id: string, newStatus: MemberStatus) {
  try {
    await prisma.member.update({
      where: { id },
      data: { status: newStatus },
    })
    revalidatePath("/members/manage")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update member status" }
  }
}

export async function deleteMember(id: string) {
  try {
    // Also delete associated documents from DB
    await prisma.document.deleteMany({ where: { memberId: id } });
    
    await prisma.member.delete({
      where: { id },
    })
    revalidatePath("/members/manage")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete member. Make sure there are no related financial records." }
  }
}
