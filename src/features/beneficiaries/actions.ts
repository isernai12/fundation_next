"use server"
import { getNow } from "@/lib/date";

import { prisma } from "@/lib/prisma"
import { beneficiarySchema, type BeneficiaryFormValues } from "./schema"
import { revalidatePath } from "next/cache"
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary"
import { requirePermission, checkPermission } from "@/lib/rbac";

export async function getBeneficiaries() {
  if (!await checkPermission("Beneficiaries", "View")) return [];
  return prisma.beneficiary.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      member: { select: { fullName: true, memberId: true } }
    }
  })
}

export async function getBeneficiary(id: string) {
  if (!await checkPermission("Beneficiaries", "View")) return null;
  return prisma.beneficiary.findUnique({
    where: { id },
    include: {
      member: true,
      loans: true,
      grants: true,
      documents: true,
    }
  })
}

async function generateBeneficiaryId() {
  const count = await prisma.beneficiary.count()
  const year = getNow().getFullYear()
  return `BEN-${year}-${(count + 1).toString().padStart(4, '0')}`
}

async function handleDocumentUpload(
  base64Str: string | undefined, 
  title: string, 
  folder: string, 
  beneficiaryId: string, 
  documentNumberSuffix: string,
  updateLegacyField?: "beneficiaryPhoto" | "nidOrBirthCertificate"
) {
  if (!base64Str) return;
  
  const buffer = Buffer.from(base64Str.replace(/^data:image\/\w+;base64,/, ""), 'base64')
  const uploaded = await uploadToCloudinary(buffer, { folder })
  
  const existingDoc = await prisma.document.findFirst({
    where: { beneficiaryId, title }
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
        targetType: "BENEFICIARY",
        beneficiary: { connect: { id: beneficiaryId } },
      }
    });
  }

  if (updateLegacyField) {
    await prisma.beneficiary.update({
      where: { id: beneficiaryId },
      data: { [updateLegacyField]: uploaded.secure_url }
    });
  }
}

export async function createBeneficiary(data: BeneficiaryFormValues) {
    await requirePermission("Beneficiaries", "Add");
  const parsed = beneficiarySchema.safeParse(data)
  if (!parsed.success) {
    console.error("Zod Validation Error:", parsed.error);
    return { success: false, error: "Invalid data", details: parsed.error.format() }
  }
  
  const pd = parsed.data

  if (pd.nationalId && pd.nationalId.trim() !== "") {
    const existingNid = await prisma.beneficiary.findUnique({ where: { nationalId: pd.nationalId.trim() } })
    if (existingNid) return { success: false, error: "National ID already exists" }
  }

  const beneficiaryId = await generateBeneficiaryId()
  
  try {
    const beneficiary = await prisma.beneficiary.create({
      data: {
        beneficiaryId,
        fullName: pd.fullName.trim(),
        fatherOrHusbandName: pd.fatherOrHusbandName?.trim() || null,
        email: pd.email?.trim() || null,
        mobile: pd.mobile?.trim() || null,
        phone: pd.phone?.trim() || null,
        address: pd.address?.trim() || pd.presentAddress?.trim() || null,
        presentAddress: pd.presentAddress?.trim() || null,
        permanentAddress: pd.permanentAddress?.trim() || null,
        nationalId: pd.nationalId?.trim() || null,
        idDocumentType: pd.idDocumentType || "NID",
        beneficiaryPhoto: pd.beneficiaryPhoto || null,
        nidOrBirthCertificate: pd.nidOrBirthCertificate || null,
        occupation: pd.occupation?.trim() || null,
        remarks: pd.remarks?.trim() || null,
        relationToMember: pd.relationToMember?.trim() || null,

        emergencyContactName: pd.emergencyContactName?.trim() || null,
        emergencyContactRelation: pd.emergencyContactRelation?.trim() || null,
        emergencyContactMobile: pd.emergencyContactMobile?.trim() || null,
        
        memberId: pd.memberId || null,
        status: pd.status || "ACTIVE",
      }
    });
    
    // Handle Documents if provided
    if (pd.photoBase64) {
      await handleDocumentUpload(pd.photoBase64, "Beneficiary Photo", "foundation/beneficiaries/photos", beneficiary.id, "P", "beneficiaryPhoto");
    }
    if (pd.signatureBase64) {
      await handleDocumentUpload(pd.signatureBase64, "Signature", "foundation/beneficiaries/signatures", beneficiary.id, "SIG");
    }
    
    if (pd.idDocumentType === "NID") {
      if (pd.nidFrontBase64) {
        await handleDocumentUpload(pd.nidFrontBase64, "NID Front", "foundation/beneficiaries/ids", beneficiary.id, "NIDF", "nidOrBirthCertificate");
      }
      if (pd.nidBackBase64) {
        await handleDocumentUpload(pd.nidBackBase64, "NID Back", "foundation/beneficiaries/ids", beneficiary.id, "NIDB");
      }

      // Cleanup Birth Certificate if exists
      const bcDoc = await prisma.document.findFirst({ where: { beneficiaryId: beneficiary.id, title: "Birth Certificate" } });
      if (bcDoc) {
        if (bcDoc.cloudinaryPublicId) await deleteFromCloudinary(bcDoc.cloudinaryPublicId).catch(() => {});
        await prisma.document.delete({ where: { id: bcDoc.id } });
      }
    } else if (pd.idDocumentType === "BIRTH_CERTIFICATE") {
      if (pd.birthCertificateBase64) {
        await handleDocumentUpload(pd.birthCertificateBase64, "Birth Certificate", "foundation/beneficiaries/ids", beneficiary.id, "BC", "nidOrBirthCertificate");
      }

      // Cleanup NID if exists
      const nidDocs = await prisma.document.findMany({ where: { beneficiaryId: beneficiary.id, title: { in: ["NID Front", "NID Back", "National ID (Front)", "National ID (Back)"] } } });
      for (const d of nidDocs) {
        if (d.cloudinaryPublicId) await deleteFromCloudinary(d.cloudinaryPublicId).catch(() => {});
        await prisma.document.delete({ where: { id: d.id } });
      }
    }

    revalidatePath("/beneficiaries")
    return { success: true, data: beneficiary }
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to create beneficiary" }
  }
}

export async function updateBeneficiary(id: string, data: BeneficiaryFormValues) {
    await requirePermission("Beneficiaries", "Edit");
  const parsed = beneficiarySchema.safeParse(data)
  if (!parsed.success) return { success: false, error: "Invalid data" }
  
  const pd = parsed.data

  if (pd.nationalId && pd.nationalId.trim() !== "") {
    const existingNid = await prisma.beneficiary.findUnique({ where: { nationalId: pd.nationalId.trim() } })
    if (existingNid && existingNid.id !== id) return { success: false, error: "National ID already exists" }
  }

  try {
    const beneficiary = await prisma.beneficiary.update({
      where: { id },
      data: {
        fullName: pd.fullName.trim(),
        fatherOrHusbandName: pd.fatherOrHusbandName?.trim() || null,
        email: pd.email?.trim() || null,
        mobile: pd.mobile?.trim() || null,
        phone: pd.phone?.trim() || null,
        address: pd.address?.trim() || pd.presentAddress?.trim() || null,
        presentAddress: pd.presentAddress?.trim() || null,
        permanentAddress: pd.permanentAddress?.trim() || null,
        nationalId: pd.nationalId?.trim() || null,
        idDocumentType: pd.idDocumentType || "NID",
        occupation: pd.occupation?.trim() || null,
        remarks: pd.remarks?.trim() || null,
        relationToMember: pd.relationToMember?.trim() || null,
        
        emergencyContactName: pd.emergencyContactName?.trim() || null,
        emergencyContactRelation: pd.emergencyContactRelation?.trim() || null,
        emergencyContactMobile: pd.emergencyContactMobile?.trim() || null,
        
        memberId: pd.memberId || null,
        status: pd.status || "ACTIVE",
      }
    })

    // Handle Documents if provided
    if (pd.photoBase64) {
      await handleDocumentUpload(pd.photoBase64, "Beneficiary Photo", "foundation/beneficiaries/photos", id, "P", "beneficiaryPhoto");
    }
    if (pd.signatureBase64) {
      await handleDocumentUpload(pd.signatureBase64, "Signature", "foundation/beneficiaries/signatures", id, "SIG");
    }
    
    if (pd.idDocumentType === "NID") {
      if (pd.nidFrontBase64) {
        await handleDocumentUpload(pd.nidFrontBase64, "NID Front", "foundation/beneficiaries/ids", id, "NIDF", "nidOrBirthCertificate");
      }
      if (pd.nidBackBase64) {
        await handleDocumentUpload(pd.nidBackBase64, "NID Back", "foundation/beneficiaries/ids", id, "NIDB");
      }

      // Cleanup Birth Certificate if exists
      const bcDoc = await prisma.document.findFirst({ where: { beneficiaryId: id, title: "Birth Certificate" } });
      if (bcDoc) {
        if (bcDoc.cloudinaryPublicId) await deleteFromCloudinary(bcDoc.cloudinaryPublicId).catch(() => {});
        await prisma.document.delete({ where: { id: bcDoc.id } });
      }
    } else if (pd.idDocumentType === "BIRTH_CERTIFICATE") {
      if (pd.birthCertificateBase64) {
        await handleDocumentUpload(pd.birthCertificateBase64, "Birth Certificate", "foundation/beneficiaries/ids", id, "BC", "nidOrBirthCertificate");
      }

      // Cleanup NID if exists
      const nidDocs = await prisma.document.findMany({ where: { beneficiaryId: id, title: { in: ["NID Front", "NID Back", "National ID (Front)", "National ID (Back)"] } } });
      for (const d of nidDocs) {
        if (d.cloudinaryPublicId) await deleteFromCloudinary(d.cloudinaryPublicId).catch(() => {});
        await prisma.document.delete({ where: { id: d.id } });
      }
    }

    revalidatePath("/beneficiaries")
    revalidatePath(`/beneficiaries/${id}`)
    return { success: true, data: beneficiary }
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to update beneficiary" }
  }
}

export async function deleteBeneficiaryDocument(beneficiaryId: string, title: string) {
    await requirePermission("Beneficiaries", "Delete");
  try {
    const doc = await prisma.document.findFirst({ 
      where: { beneficiaryId, title } 
    });

    if (doc) {
      if (doc.cloudinaryPublicId) {
        await deleteFromCloudinary(doc.cloudinaryPublicId).catch(() => {});
      }
      await prisma.document.delete({ where: { id: doc.id } });
    }
    
    // Clear the legacy fields corresponding to the document just in case
    if (title === "Beneficiary Photo") {
      await prisma.beneficiary.update({
        where: { id: beneficiaryId },
        data: { beneficiaryPhoto: null }
      });
    } else if (title === "NID Front" || title === "NID Back" || title === "Birth Certificate") {
      // Check if any ID document is left
      const remainingIdDocs = await prisma.document.count({
        where: {
          beneficiaryId,
          title: { in: ["NID Front", "NID Back", "Birth Certificate"] }
        }
      });
      if (remainingIdDocs === 0) {
        await prisma.beneficiary.update({
          where: { id: beneficiaryId },
          data: { nidOrBirthCertificate: null }
        });
      }
    }

    revalidatePath(`/beneficiaries/${beneficiaryId}`)
    revalidatePath(`/beneficiaries/${beneficiaryId}/edit`)
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete document" };
  }
}

export async function deleteBeneficiary(id: string) {
    await requirePermission("Beneficiaries", "Delete");
  try {
    const beneficiary = await prisma.beneficiary.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            loans: true,
            grants: true,
          }
        }
      }
    })
    
    if (!beneficiary) return { success: false, error: "Beneficiary not found" }
    
    // Check constraints before deleting
    if (beneficiary._count.loans > 0) return { success: false, error: "Cannot delete beneficiary with existing loans" }
    if (beneficiary._count.grants > 0) return { success: false, error: "Cannot delete beneficiary with existing grants" }

    await prisma.document.deleteMany({ where: { beneficiaryId: id } });
    await prisma.beneficiary.delete({ where: { id } })
    
    revalidatePath("/beneficiaries")
    return { success: true }
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete beneficiary" }
  }
}
