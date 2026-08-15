"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/rbac";
import { uploadApi } from "@/lib/api/upload";
import { getAuthSession } from "@/lib/auth";

export async function replaceDocument(documentId: string, formData: FormData) {
  await requirePermission("Settings", "Manage");
  const file = formData.get("file") as File | null;
  
  if (!file) return { success: false, error: "No file provided" };

  try {
    const session = await getAuthSession();
    const token = (session as any)?.accessToken;
    const res = await uploadApi.uploadFile(file, "foundation/documents", file.name, token);

    revalidatePath("/documents");
    return {
      success: true,
      data: {
        id: documentId,
        secureUrl: res.secure_url,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to replace document" };
  }
}
