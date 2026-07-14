"use server"

import { prisma } from "@/lib/prisma"
import { beneficiarySchema, type BeneficiaryFormValues } from "./schema"
import { revalidatePath } from "next/cache"
import { BeneficiaryStatus } from "@prisma/client"

export async function getBeneficiaries() {
  return prisma.beneficiary.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      member: { select: { firstName: true, lastName: true, memberId: true } }
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
        firstName: pd.firstName,
        lastName: pd.lastName,
        memberId: pd.memberId || null,
        relationToMember: pd.relationToMember,
        email: pd.email || null,
        phone: pd.phone,
        mobile: pd.mobile,
        address: pd.address,
        nationalId: pd.nationalId || null,
        occupation: pd.occupation,
        remarks: pd.remarks,
        status: pd.status as BeneficiaryStatus,
      }
    })
    revalidatePath("/beneficiaries")
    return { success: true, data: beneficiary }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create beneficiary" }
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
        firstName: pd.firstName,
        lastName: pd.lastName,
        memberId: pd.memberId || null,
        relationToMember: pd.relationToMember,
        email: pd.email || null,
        phone: pd.phone,
        mobile: pd.mobile,
        address: pd.address,
        nationalId: pd.nationalId || null,
        occupation: pd.occupation,
        remarks: pd.remarks,
        status: pd.status as BeneficiaryStatus,
      }
    })
    revalidatePath("/beneficiaries")
    revalidatePath(`/beneficiaries/${id}`)
    return { success: true, data: beneficiary }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update beneficiary" }
  }
}
