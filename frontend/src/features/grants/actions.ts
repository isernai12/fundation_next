"use server";

import { grantSchema, type GrantFormValues } from "./schema";
import { revalidatePath } from "next/cache";
import { requirePermission, checkPermission } from "@/lib/rbac";

export async function createGrant(data: GrantFormValues) {
  await requirePermission("Grants", "Add");
  const parsed = grantSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "Invalid data" };
  
  revalidatePath("/grants");
  return { success: true };
}

export async function updateGrant(id: string, data: GrantFormValues) {
  await requirePermission("Grants", "Edit");
  const parsed = grantSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "Invalid data" };

  revalidatePath(`/grants/${id}`);
  revalidatePath("/grants");
  return { success: true };
}

export async function getGrants(): Promise<any[]> {
  if (!(await checkPermission("Grants", "View"))) return [];
  return [];
}

export async function getGrant(id: string): Promise<any> {
  if (!(await checkPermission("Grants", "View"))) return null;
  return null;
}

export async function deleteGrant(id: string): Promise<{ success: boolean; error?: string }> {
  await requirePermission("Grants", "Delete");
  return { success: false, error: "লেজার এন্ট্রি থাকায় অনুদান মুছা সম্ভব নয়। অনুগ্রহ করে রিভার্সাল অ্যাডজাস্টমেন্ট ব্যবহার করুন।" };
}

export async function deleteGrantDocument(grantId: string, title: string): Promise<{ success: boolean; error?: string }> {
  await requirePermission("Grants", "Delete");
  revalidatePath(`/grants/${grantId}`);
  revalidatePath(`/grants/${grantId}/edit`);
  return { success: true, error: undefined };
}
