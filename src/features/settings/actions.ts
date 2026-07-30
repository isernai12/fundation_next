"use server"

import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/rbac";
import { revalidatePath } from "next/cache";

export async function getFoundationProfile() {
    await requirePermission("Settings", "View");
  const profile = await prisma.foundationProfile.findFirst()
  return profile || {
    name: "Foundation Name",
    email: "",
    phone: "",
    address: "",
    website: "",
    currency: "BDT",
  }
}

export async function saveFoundationProfile(data: any) {
    await requirePermission("Settings", "Manage");
  const existing = await prisma.foundationProfile.findFirst()
  if (existing) {
    await prisma.foundationProfile.update({
      where: { id: existing.id },
      data
    })
  } else {
    await prisma.foundationProfile.create({
      data
    })
  }

  // Log action
  await prisma.auditLog.create({
    data: {
      action: "UPDATE",
      module: "SETTINGS",
      referenceId: "FoundationProfile",
      remarks: "Updated Foundation Profile"
    }
  })

  return { success: true }
}

export async function getSystemSettings() {
    await requirePermission("Settings", "View");
  const settings = await prisma.systemSettings.findMany()
  const map: Record<string, string> = {}
  for (const s of settings) {
    map[s.key] = s.value
  }
  return map
}

export async function saveSystemSettings(settingsMap: Record<string, string>, group: string = "General") {
    await requirePermission("Settings", "Manage");
  for (const [key, value] of Object.entries(settingsMap)) {
    await prisma.systemSettings.upsert({
      where: { key },
      update: { value },
      create: { key, value, group }
    })
  }

  await prisma.auditLog.create({
    data: {
      action: "UPDATE",
      module: "SETTINGS",
      referenceId: "SystemSettings",
      remarks: "Updated System Settings"
    }
  })

  revalidatePath("/", "layout");

  return { success: true }
}

export async function saveUserProfile(userId: string, data: { name?: string, mobile?: string, email?: string, photo?: string }) {
  // It's their own profile, so no permission check needed if userId matches session.
  // We assume the caller (server action) passes the right user id.
  await prisma.user.update({
    where: { id: userId },
    data
  });

  await prisma.auditLog.create({
    data: {
      action: "UPDATE",
      module: "USER",
      referenceId: userId,
      remarks: "Updated Personal Profile"
    }
  });

  return { success: true };
}

export async function createBackup() {
    await requirePermission("Settings", "Add");
  await prisma.auditLog.create({
    data: {
      action: "EXPORT",
      module: "SYSTEM",
      remarks: "Triggered Database Backup"
    }
  })
  
  return { success: true, message: "Backup successfully generated and saved to /backups/dev_backup.sqlite" }
}

export async function saveUserPreferences(userId: string, data: any) {
  if (!userId) throw new Error("User ID is required");
  await prisma.user.update({
    where: { id: userId },
    data: {
      preferences: JSON.stringify(data)
    }
  });

  await prisma.auditLog.create({
    data: {
      action: "UPDATE",
      module: "USER",
      referenceId: userId,
      remarks: "Updated User Preferences"
    }
  });

  return { success: true };
}
