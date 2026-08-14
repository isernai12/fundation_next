"use server"
import { getNow } from "@/lib/date";

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import crypto from "crypto"
import { requirePermission, checkPermission } from "@/lib/rbac";

// Document Categories
export async function getDocumentCategories() {
  if (!await checkPermission("Settings", "View")) return [];
  return prisma.documentCategory.findMany({ orderBy: { name: "asc" } })
}

export async function createDocumentCategory(name: string, description?: string) {
    await requirePermission("Settings", "Add");
  try {
    const category = await prisma.documentCategory.create({
      data: { name, description }
    })
    revalidatePath("/documents")
    return { success: true, data: category }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create category" }
  }
}

// Document Upload
async function generateDocumentNumber() {
  const count = await prisma.document.count()
  const year = getNow().getFullYear()
  return `DOC-${year}-${(count + 1).toString().padStart(5, '0')}`
}

export async function uploadDocument(formData: FormData) {
    await requirePermission("Settings", "Manage");
  const file = formData.get("file") as File | null
  const title = formData.get("title") as string
  const categoryId = formData.get("categoryId") as string
  const targetType = formData.get("targetType") as any // 'MEMBER', 'BENEFICIARY', 'LOAN', 'GRANT', 'FOUNDATION'
  const entityId = formData.get("entityId") as string
  const description = formData.get("description") as string
  const remarks = formData.get("remarks") as string

  if (!file) return { success: false, error: "No file provided" }
  if (!title || !targetType || !entityId) return { success: false, error: "Missing required fields" }

  // Validate File
  const allowedMimeTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"]
  if (!allowedMimeTypes.includes(file.type)) return { success: false, error: "Unsupported file type" }

  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) return { success: false, error: "File exceeds 5MB limit" }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const originalFilename = file.name
  const ext = originalFilename.split('.').pop()
  const generatedFilename = `${crypto.randomBytes(16).toString("hex")}.${ext}`
  const uploadDir = join(process.cwd(), "public", "uploads")
  
  // Ensure directory exists
  try {
    await mkdir(uploadDir, { recursive: true })
  } catch (e) { }

  const path = join(uploadDir, generatedFilename)
  
  try {
    await writeFile(path, buffer)
  } catch (e: any) {
    return { success: false, error: "Failed to save file physically: " + e.message }
  }

  const documentNumber = await generateDocumentNumber()

  const data: any = {
    documentNumber,
    title,
    categoryId: categoryId || null,
    type: file.type.startsWith('image/') ? "IMAGE" : "PDF",
    secureUrl: `/uploads/${generatedFilename}`,
    originalFilename,
    cloudinaryPublicId: generatedFilename,
    mimeType: file.type,
    sizeBytes: file.size,
    targetType,
    entityId,
    description,
    remarks,
  }

  // Bind strict entity relations
  if (targetType === "MEMBER") data.memberId = entityId
  else if (targetType === "BENEFICIARY") data.beneficiaryId = entityId
  else if (targetType === "LOAN") data.loanId = entityId
  else if (targetType === "GRANT") data.grantId = entityId
  else if (targetType === "FOUNDATION") data.foundationId = entityId

  try {
    const doc = await prisma.document.create({ data })
    revalidatePath("/documents")
    revalidatePath(`/${targetType.toLowerCase()}s/${entityId}`)
    return { success: true, data: doc }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to save document metadata" }
  }
}

export async function getDocumentsByEntity(targetType: any, entityId: string) {
  if (!await checkPermission("Settings", "View")) return [];
  return prisma.document.findMany({
    where: { targetType, entityId },
    include: { category: true },
    orderBy: { createdAt: "desc" }
  })
}

export async function getAllDocuments() {
  if (!await checkPermission("Settings", "View")) return [];
  return prisma.document.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" }
  })
}

export async function deleteDocumentById(id: string) {
    await requirePermission("Settings", "Delete");
  try {
    await prisma.document.delete({ where: { id } })
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
