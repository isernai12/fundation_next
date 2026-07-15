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
        groupId: pd.groupId || null,
        firstName: pd.firstName || pd.fullName.split(" ")[0] || "Unknown",
        lastName: pd.lastName || pd.fullName.substring(pd.fullName.indexOf(" ") + 1) || "Unknown",
        fatherName: pd.fatherName || null,
        motherName: pd.motherName || null,
        gender: pd.gender || null,
        dob: pd.dob ? new Date(pd.dob) : null,
        nationalId: pd.nationalId || null,
        occupation: pd.occupation || null,
        monthlyIncome: pd.monthlyIncome ? parseInt(pd.monthlyIncome as string) : null,
        bloodGroup: pd.bloodGroup || null,
        mobile: pd.mobile || null,
        altMobile: pd.altMobile || null,
        email: pd.email || null,
        phone: pd.phone || null,
        presentAddress: pd.presentAddress || null,
        permanentAddress: pd.permanentAddress || null,
        emergencyContactName: pd.emergencyContactName || null,
        emergencyContactMobile: pd.emergencyContactMobile || null,
        emergencyContactRelation: pd.emergencyContactRelation || null,
        joinDate: pd.joinDate ? new Date(pd.joinDate) : null,
        status: pd.status || "ACTIVE",
        remarks: pd.remarks || null,
        
        // Extended Information
        maritalStatus: pd.maritalStatus || null,
        education: pd.education || null,
        workplace: pd.workplace || null,
        designation: pd.designation || null,
        skills: pd.skills && pd.skills.length > 0 ? JSON.stringify(pd.skills) : null,
        reference: pd.reference || null,
        reasonForJoining: pd.reasonForJoining || null,
        participation: pd.participation && pd.participation.length > 0 ? JSON.stringify(pd.participation) : null,
        declarationAccepted: pd.declarationAccepted,
        memberType: pd.memberType || null,
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
        groupId: pd.groupId || null,
        firstName: pd.firstName || pd.fullName.split(" ")[0] || "Unknown",
        lastName: pd.lastName || pd.fullName.substring(pd.fullName.indexOf(" ") + 1) || "Unknown",
        fatherName: pd.fatherName || null,
        motherName: pd.motherName || null,
        gender: pd.gender || null,
        dob: pd.dob ? new Date(pd.dob) : null,
        nationalId: pd.nationalId || null,
        occupation: pd.occupation || null,
        monthlyIncome: pd.monthlyIncome ? parseInt(pd.monthlyIncome as string) : null,
        bloodGroup: pd.bloodGroup || null,
        mobile: pd.mobile || null,
        altMobile: pd.altMobile || null,
        email: pd.email || null,
        phone: pd.phone || null,
        presentAddress: pd.presentAddress || null,
        permanentAddress: pd.permanentAddress || null,
        emergencyContactName: pd.emergencyContactName || null,
        emergencyContactMobile: pd.emergencyContactMobile || null,
        emergencyContactRelation: pd.emergencyContactRelation || null,
        joinDate: pd.joinDate ? new Date(pd.joinDate) : null,
        status: pd.status || "ACTIVE",
        remarks: pd.remarks || null,
        
        maritalStatus: pd.maritalStatus || null,
        education: pd.education || null,
        workplace: pd.workplace || null,
        designation: pd.designation || null,
        skills: pd.skills && pd.skills.length > 0 ? JSON.stringify(pd.skills) : null,
        reference: pd.reference || null,
        reasonForJoining: pd.reasonForJoining || null,
        participation: pd.participation && pd.participation.length > 0 ? JSON.stringify(pd.participation) : null,
        declarationAccepted: pd.declarationAccepted,
        memberType: pd.memberType || null,
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
