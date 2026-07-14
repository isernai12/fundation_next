"use server"

import { prisma } from "@/lib/prisma"
import { memberSchema, type MemberFormValues } from "./schema"
import { revalidatePath } from "next/cache"
import { MemberStatus } from "@prisma/client"

export async function getMembers() {
  return prisma.member.findMany({
    where: { status: { not: "INACTIVE" } },
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
      group: true
    }
  })
}

async function generateMemberId() {
  const count = await prisma.member.count()
  const year = new Date().getFullYear()
  return `MBR-${year}-${(count + 1).toString().padStart(4, '0')}`
}

export async function createMember(data: MemberFormValues) {
  const parsed = memberSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: "Invalid data" }
  }

  const pd = parsed.data

  // Check unique constraints
  if (pd.nationalId) {
    const existingNid = await prisma.member.findUnique({ where: { nationalId: pd.nationalId } })
    if (existingNid) return { success: false, error: "National ID already exists" }
  }
  if (pd.mobile) {
    const existingMobile = await prisma.member.findUnique({ where: { mobile: pd.mobile } })
    if (existingMobile) return { success: false, error: "Mobile number already exists" }
  }
  if (pd.email) {
    const existingEmail = await prisma.member.findUnique({ where: { email: pd.email } })
    if (existingEmail) return { success: false, error: "Email already exists" }
  }

  const memberId = await generateMemberId()

  try {
    const member = await prisma.member.create({
      data: {
        memberId,
        groupId: pd.groupId,
        firstName: pd.firstName,
        lastName: pd.lastName,
        fatherName: pd.fatherName,
        motherName: pd.motherName,
        gender: pd.gender,
        dob: pd.dob ? new Date(pd.dob) : null,
        nationalId: pd.nationalId,
        occupation: pd.occupation,
        monthlyIncome: pd.monthlyIncome ? parseInt(pd.monthlyIncome as string) : null,
        bloodGroup: pd.bloodGroup,
        mobile: pd.mobile,
        altMobile: pd.altMobile,
        email: pd.email || null,
        phone: pd.phone,
        presentAddress: pd.presentAddress,
        permanentAddress: pd.permanentAddress,
        emergencyContactName: pd.emergencyContactName,
        emergencyContactMobile: pd.emergencyContactMobile,
        emergencyContactRelation: pd.emergencyContactRelation,
        joinDate: pd.joinDate ? new Date(pd.joinDate) : null,
        status: pd.status,
        remarks: pd.remarks,
      },
    })
    revalidatePath("/members")
    return { success: true, data: member }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create member" }
  }
}

export async function updateMember(id: string, data: MemberFormValues) {
  const parsed = memberSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: "Invalid data" }
  const pd = parsed.data

  if (pd.nationalId) {
    const existing = await prisma.member.findUnique({ where: { nationalId: pd.nationalId } })
    if (existing && existing.id !== id) return { success: false, error: "National ID already exists" }
  }
  if (pd.mobile) {
    const existing = await prisma.member.findUnique({ where: { mobile: pd.mobile } })
    if (existing && existing.id !== id) return { success: false, error: "Mobile number already exists" }
  }
  if (pd.email) {
    const existing = await prisma.member.findUnique({ where: { email: pd.email } })
    if (existing && existing.id !== id) return { success: false, error: "Email already exists" }
  }

  try {
    const member = await prisma.member.update({
      where: { id },
      data: {
        groupId: pd.groupId,
        firstName: pd.firstName,
        lastName: pd.lastName,
        fatherName: pd.fatherName,
        motherName: pd.motherName,
        gender: pd.gender,
        dob: pd.dob ? new Date(pd.dob) : null,
        nationalId: pd.nationalId,
        occupation: pd.occupation,
        monthlyIncome: pd.monthlyIncome ? parseInt(pd.monthlyIncome as string) : null,
        bloodGroup: pd.bloodGroup,
        mobile: pd.mobile,
        altMobile: pd.altMobile,
        email: pd.email || null,
        phone: pd.phone,
        presentAddress: pd.presentAddress,
        permanentAddress: pd.permanentAddress,
        emergencyContactName: pd.emergencyContactName,
        emergencyContactMobile: pd.emergencyContactMobile,
        emergencyContactRelation: pd.emergencyContactRelation,
        joinDate: pd.joinDate ? new Date(pd.joinDate) : null,
        status: pd.status,
        remarks: pd.remarks,
      },
    })
    revalidatePath("/members")
    revalidatePath(`/members/${id}`)
    return { success: true, data: member }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update member" }
  }
}

export async function archiveMember(id: string) {
  try {
    await prisma.member.update({
      where: { id },
      data: { status: MemberStatus.INACTIVE },
    })
    revalidatePath("/members")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to archive member" }
  }
}
