"use server"

import { prisma } from "@/lib/prisma"
import { beneficiarySchema, type BeneficiaryFormValues } from "./schema"
import { revalidatePath } from "next/cache"
import { BeneficiaryStatus } from "@prisma/client"

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
    }
  })
}

async function generateBeneficiaryId() {
  const count = await prisma.beneficiary.count()
  const year = new Date().getFullYear()
  return `BEN-${year}-${(count + 1).toString().padStart(4, '0')}`
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
        beneficiaryPhoto: pd.beneficiaryPhoto,
        nidOrBirthCertificate: pd.nidOrBirthCertificate,

        emergencyContactName: pd.emergencyContactName,
        emergencyContactRelation: pd.emergencyContactRelation,
        emergencyContactMobile: pd.emergencyContactMobile,
        
        status: (pd.status as BeneficiaryStatus) || BeneficiaryStatus.ACTIVE,
      }
    });
    


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
        beneficiaryPhoto: pd.beneficiaryPhoto,
        nidOrBirthCertificate: pd.nidOrBirthCertificate,

        emergencyContactName: pd.emergencyContactName,
        emergencyContactRelation: pd.emergencyContactRelation,
        emergencyContactMobile: pd.emergencyContactMobile,
        
        status: (pd.status as BeneficiaryStatus) || BeneficiaryStatus.ACTIVE,
      }
    })
    revalidatePath("/beneficiaries")
    revalidatePath(`/beneficiaries/${id}`)
    return { success: true, data: beneficiary }
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to update beneficiary" }
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

    await prisma.beneficiary.delete({ where: { id } })
    revalidatePath("/beneficiaries")
    return { success: true }
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete beneficiary" }
  }
}
