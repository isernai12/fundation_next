"use server";

import { revalidatePath } from "next/cache";
import { requirePermission, checkPermission } from "@/lib/rbac";
import { uploadApi } from "@/lib/api/upload";
import { getAuthSession } from "@/lib/auth";

export async function getDocumentCategories() {
  if (!(await checkPermission("Settings", "View"))) return [];
  return [];
}

export async function createDocumentCategory(name: string, description?: string) {
  await requirePermission("Settings", "Add");
  return { success: true, data: { id: "cat-1", name, description } };
}

export async function uploadDocument(formData: FormData) {
  await requirePermission("Settings", "Manage");
  const file = formData.get("file") as File | null;
  const title = formData.get("title") as string;
  const targetType = formData.get("targetType") as any;
  const entityId = formData.get("entityId") as string;

  if (!file) return { success: false, error: "No file provided" };
  if (!title || !targetType || !entityId) return { success: false, error: "Missing required fields" };

  try {
    const session = await getAuthSession();
    const token = (session as any)?.accessToken;
    const res = await uploadApi.uploadFile(file, `foundation/documents/${targetType.toLowerCase()}`, file.name, token);

    revalidatePath("/documents");
    return {
      success: true,
      data: {
        id: res.public_id,
        title,
        secureUrl: res.secure_url,
        fileUrl: res.secure_url,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to upload document" };
  }
}

export async function getDocumentsByEntity(targetType: any, entityId: string) {
  if (!(await checkPermission("Settings", "View"))) return [];
  return [];
}

export async function getAllDocuments() {
  if (!(await checkPermission("Settings", "View"))) return [];
  return [];
}

export async function deleteDocumentById(id: string): Promise<{ success: boolean; error?: string }> {
  await requirePermission("Settings", "Delete");
  return { success: true, error: undefined };
}
