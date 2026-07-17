"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { writeFile, mkdir, unlink } from "fs/promises"
import { join } from "path"
import crypto from "crypto"

export async function replaceDocument(documentId: string, formData: FormData) {
  const file = formData.get("file") as File | null
  
  if (!file) return { success: false, error: "No file provided" }

  const doc = await prisma.document.findUnique({ where: { id: documentId } })
  if (!doc) return { success: false, error: "Document not found" }

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

  // Delete old file if exists
  if (doc.secureUrl && doc.secureUrl.startsWith("/uploads/")) {
    const oldPath = join(process.cwd(), "public", doc.secureUrl)
    try {
      await unlink(oldPath)
    } catch (e) {
      // ignore
    }
  }

  const updatedDoc = await prisma.document.update({
    where: { id: documentId },
    data: {
      type: file.type.startsWith('image/') ? "IMAGE" : "PDF",
      secureUrl: `/uploads/${generatedFilename}`,
      originalFilename,
      cloudinaryPublicId: generatedFilename,
      mimeType: file.type,
      sizeBytes: file.size,
    }
  })

  revalidatePath("/documents")
  revalidatePath(`/${doc.targetType.toLowerCase()}s/${doc.entityId}`)
  
  return { success: true, data: updatedDoc }
}
