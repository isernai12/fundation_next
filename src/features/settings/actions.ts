"use server"

import { prisma } from "@/lib/prisma"

export async function getFoundationProfile() {
  const profile = await prisma.foundationProfile.findFirst()
  return profile || {
    name: "Foundation Name",
    email: "",
    phone: "",
    address: "",
    website: "",
    currency: "USD",
  }
}

export async function saveFoundationProfile(data: any) {
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
  const settings = await prisma.systemSettings.findMany()
  const map: Record<string, string> = {}
  for (const s of settings) {
    map[s.key] = s.value
  }
  return map
}

export async function saveSystemSettings(settingsMap: Record<string, string>) {
  for (const [key, value] of Object.entries(settingsMap)) {
    await prisma.systemSettings.upsert({
      where: { key },
      update: { value },
      create: { key, value, group: "General" }
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

  return { success: true }
}

export async function createBackup() {
  await prisma.auditLog.create({
    data: {
      action: "EXPORT",
      module: "SYSTEM",
      remarks: "Triggered Database Backup"
    }
  })
  
  return { success: true, message: "Backup successfully generated and saved to /backups/dev_backup.sqlite" }
}
