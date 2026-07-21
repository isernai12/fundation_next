"use server"

import { prisma } from "@/lib/prisma"
import { beneficiarySchema, type BeneficiaryFormValues } from "./schema"
import { revalidatePath } from "next/cache"
import { BeneficiaryStatus } from "@prisma/client"
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary"

export async function getBeneficiaries() {
  return prisma.beneficiary.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      member: { select: { fullName: true, memberId: true } }
    }
  })
}

export async function getBeneficiary(id: string) {
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
  const year = new Date().getFullYear()
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
        beneficiaryId,
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
  const parsed = beneficiarySchema.safeParse(data)
  if (!parsed.success) return { success: false, error: "Invalid data" }
  
  const pd = parsed.data

  if (pd.nationalId) {
    const existingNid = await prisma.beneficiary.findUnique({ where: { nationalId: pd.nationalId } })
    if (existingNid) return { success: false, error: "National ID already exists" }
  }

  const beneficiaryId = await generateBeneficiaryId()
  
  try {
    const beneficiary = await prisma.beneficiary.create({
      data: {
        beneficiaryId,
        fullName: pd.fullName,
        fatherOrHusbandName: pd.fatherOrHusbandName,
        email: null,
        mobile: pd.mobile,
        address: pd.address || pd.presentAddress,
        presentAddress: pd.presentAddress,
        permanentAddress: pd.permanentAddress,
        nationalId: pd.nationalId || null,
        idDocumentType: pd.idDocumentType || "NID",
        beneficiaryPhoto: pd.beneficiaryPhoto,
        nidOrBirthCertificate: pd.nidOrBirthCertificate,

        emergencyContactName: pd.emergencyContactName,
        emergencyContactRelation: pd.emergencyContactRelation,
        emergencyContactMobile: pd.emergencyContactMobile,
        
        status: (pd.status as BeneficiaryStatus) || BeneficiaryStatus.ACTIVE,
      }
    });
    
    // Handle Documents
    await handleDocumentUpload(pd.photoBase64, "Beneficiary Photo", "foundation/beneficiaries/photos", beneficiary.id, "P", "beneficiaryPhoto");
    await handleDocumentUpload(pd.signatureBase64, "Signature", "foundation/beneficiaries/signatures", beneficiary.id, "SIG");
    
    if (pd.idDocumentType === "NID") {
      await handleDocumentUpload(pd.nidFrontBase64, "NID Front", "foundation/beneficiaries/ids", beneficiary.id, "NIDF", "nidOrBirthCertificate");
      await handleDocumentUpload(pd.nidBackBase64, "NID Back", "foundation/beneficiaries/ids", beneficiary.id, "NIDB");

      // Cleanup Birth Certificate if exists
      const bcDoc = await prisma.document.findFirst({ where: { beneficiaryId: beneficiary.id, title: "Birth Certificate" } });
      if (bcDoc) {
        if (bcDoc.cloudinaryPublicId) await deleteFromCloudinary(bcDoc.cloudinaryPublicId).catch(() => {});
        await prisma.document.delete({ where: { id: bcDoc.id } });
      }
    } else if (pd.idDocumentType === "BIRTH_CERTIFICATE") {
      await handleDocumentUpload(pd.birthCertificateBase64, "Birth Certificate", "foundation/beneficiaries/ids", beneficiary.id, "BC", "nidOrBirthCertificate");

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
  const parsed = beneficiarySchema.safeParse(data)
  if (!parsed.success) return { success: false, error: "Invalid data" }
  
  const pd = parsed.data

  if (pd.nationalId) {
    const existingNid = await prisma.beneficiary.findUnique({ where: { nationalId: pd.nationalId } })
    if (existingNid && existingNid.id !== id) return { success: false, error: "National ID already exists" }
  }

  try {
    const beneficiary = await prisma.beneficiary.update({
      where: { id },
      data: {
        fullName: pd.fullName,
        fatherOrHusbandName: pd.fatherOrHusbandName,
        email: null,
        mobile: pd.mobile,
        address: pd.address || pd.presentAddress,
        presentAddress: pd.presentAddress,
        permanentAddress: pd.permanentAddress,
        nationalId: pd.nationalId || null,
        idDocumentType: pd.idDocumentType || "NID",
        
        emergencyContactName: pd.emergencyContactName,
        emergencyContactRelation: pd.emergencyContactRelation,
        emergencyContactMobile: pd.emergencyContactMobile,
        
        status: (pd.status as BeneficiaryStatus) || BeneficiaryStatus.ACTIVE,
      }
    })

    // Handle Documents
    await handleDocumentUpload(pd.photoBase64, "Beneficiary Photo", "foundation/beneficiaries/photos", id, "P", "beneficiaryPhoto");
    await handleDocumentUpload(pd.signatureBase64, "Signature", "foundation/beneficiaries/signatures", id, "SIG");
    
    if (pd.idDocumentType === "NID") {
      await handleDocumentUpload(pd.nidFrontBase64, "NID Front", "foundation/beneficiaries/ids", id, "NIDF", "nidOrBirthCertificate");
      await handleDocumentUpload(pd.nidBackBase64, "NID Back", "foundation/beneficiaries/ids", id, "NIDB");

      // Cleanup Birth Certificate if exists
      const bcDoc = await prisma.document.findFirst({ where: { beneficiaryId: id, title: "Birth Certificate" } });
      if (bcDoc) {
        if (bcDoc.cloudinaryPublicId) await deleteFromCloudinary(bcDoc.cloudinaryPublicId).catch(() => {});
        await prisma.document.delete({ where: { id: bcDoc.id } });
      }
    } else if (pd.idDocumentType === "BIRTH_CERTIFICATE") {
      await handleDocumentUpload(pd.birthCertificateBase64, "Birth Certificate", "foundation/beneficiaries/ids", id, "BC", "nidOrBirthCertificate");

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
