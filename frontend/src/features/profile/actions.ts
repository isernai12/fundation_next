"use server"

import { prisma } from "@/lib/prisma"
import { getAuthSession } from "@/lib/auth"

import bcrypt from "bcryptjs"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import crypto from "crypto"
import { revalidatePath } from "next/cache"

import { redirect } from "next/navigation"
import { requirePermission } from "@/lib/rbac";

async function getSessionUser() {
  const session = await getAuthSession()
  const user = session?.user as any
  if (!user?.id) redirect("/login")
  return { ...session, user } as any
}

export async function getUserProfile() {
    await requirePermission("Users", "View");
  const session = await getSessionUser()
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { role: true }
  })
  if (!user) throw new Error("User not found")
  
  return {
    name: user.name,
    username: user.username,
    role: user.role.name,
    mobile: user.mobile,
    email: user.email,
    photo: user.photo,
  }
}

export async function updateUserProfile(data: { name: string, username: string, mobile: string }) {
    await requirePermission("Users", "Edit");
  const session = await getSessionUser()
  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user) throw new Error("User not found")

  if (data.username !== user.username) {
    const existing = await prisma.user.findUnique({ where: { username: data.username } })
    if (existing) return { success: false, error: "Username already taken." }
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: data.name,
      username: data.username,
      mobile: data.mobile || null,
    }
  })

  let requireReauth = false
  if (data.username !== user.username) {
    await prisma.userSession.deleteMany({ where: { userId: user.id } })
    requireReauth = true
  }

  revalidatePath("/profile")
  return { success: true, requireReauth }
}

export async function uploadProfilePhoto(formData: FormData) {
    await requirePermission("Users", "Manage");
  const session = await getSessionUser()
  const file = formData.get("file") as File | null
  
  if (!file) return { success: false, error: "No file provided" }
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    return { success: false, error: "Unsupported image type. Use JPG, PNG or WEBP." }
  }

  if (file.size > 2 * 1024 * 1024) return { success: false, error: "File exceeds 2MB limit" }

  const buffer = Buffer.from(await file.arrayBuffer())
  const ext = file.name.split('.').pop()
  const generatedFilename = `${crypto.randomBytes(16).toString("hex")}.${ext}`
  const uploadDir = join(process.cwd(), "public", "uploads", "profiles")
  
  try {
    await mkdir(uploadDir, { recursive: true })
  } catch (e) { }

  const path = join(uploadDir, generatedFilename)
  
  try {
    await writeFile(path, buffer)
    const secureUrl = `/uploads/profiles/${generatedFilename}`

    await prisma.user.update({
      where: { id: session.user.id },
      data: { photo: secureUrl }
    })

    revalidatePath("/profile")
    return { success: true, url: secureUrl }
  } catch (e: any) {
    return { success: false, error: "Failed to upload photo" }
  }
}

export async function changeUserPassword(data: { current: string, new: string }) {
    await requirePermission("Users", "Manage");
  const session = await getSessionUser()
  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user) throw new Error("User not found")

  const isValid = await bcrypt.compare(data.current, user.password)
  if (!isValid) return { success: false, error: "Current password is incorrect." }

  const hashedNew = await bcrypt.hash(data.new, 10)

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedNew }
  })

  await prisma.userSession.deleteMany({ where: { userId: user.id } })

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "CHANGE_PASSWORD",
      module: "AUTHENTICATION",
    }
  })

  return { success: true, requireReauth: true }
}

export async function getUserSessions() {
    await requirePermission("Users", "View");
  const session = await getSessionUser()
  const sessions = await prisma.userSession.findMany({
    where: { userId: session.user.id },
    orderBy: { lastActive: "desc" }
  })
  
  return { 
    sessions,
    // @ts-ignore
    currentJti: session.jti as string 
  }
}

export async function logoutDevice(jti: string) {
    await requirePermission("Users", "Manage");
  const session = await getSessionUser()
  await prisma.userSession.deleteMany({
    where: { jti, userId: session.user.id }
  })
  revalidatePath("/profile/devices")
  return { success: true }
}

export async function logoutOtherDevices() {
    await requirePermission("Users", "Manage");
  const session = await getSessionUser()
  // @ts-ignore
  const currentJti = session.jti as string

  await prisma.userSession.deleteMany({
    where: { 
      userId: session.user.id,
      jti: { not: currentJti }
    }
  })
  revalidatePath("/profile/devices")
  return { success: true }
}

export async function logoutAllDevices() {
    await requirePermission("Users", "Manage");
  const session = await getSessionUser()
  await prisma.userSession.deleteMany({
    where: { userId: session.user.id }
  })
  return { success: true, requireReauth: true }
}
