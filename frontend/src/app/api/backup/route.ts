import { NextResponse } from 'next/server';
import AdmZip from 'adm-zip';
import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';

const modelNames = [
  "foundationProfile",
  "systemSettings",
  "settings",
  "documentCategory",
  "donor",
  "campaign",
  "foundation",
  "role",
  "permission",
  "rolePermission",
  "user",
  "userSession",
  "auditLog",
  "userPermission",
  "group",
  "member",
  "beneficiary",
  "fund",
  "monthlyContribution",
  "ledgerTransaction",
  "ledgerEntry",
  "contributionPayment",
  "loan",
  "loanRepayment",
  "grant",
  "fundAllocation",
  "campaignContribution",
  "document"
] as const;

const isIsoDate = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;

export async function GET() {
  try {
    const data: Record<string, any> = {};

    for (const model of modelNames) {
      // @ts-ignore
      data[model] = await prisma[model].findMany();
    }

    await prisma.auditLog.create({
      data: {
        action: "EXPORT",
        module: "SYSTEM",
        remarks: "Full database backup generated",
      }
    });

    const jsonString = JSON.stringify(data);
    const zip = new AdmZip();
    zip.addFile("data.json", Buffer.from(jsonString, "utf8"));

    const zipBuffer = zip.toBuffer();

    const dateStr = format(new Date(), "yyyy-MM-dd-HH-mm");
    const filename = `foundation-backup-${dateStr}.zip`;

    return new NextResponse(zipBuffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error("Backup Error:", error);
    return NextResponse.json({ error: "Failed to generate backup" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const zip = new AdmZip(buffer);
    const zipEntry = zip.getEntry("data.json");
    if (!zipEntry) {
      return NextResponse.json({ error: "Invalid backup file: data.json not found" }, { status: 400 });
    }

    const jsonString = zipEntry.getData().toString("utf8");
    
    // Parse JSON and revive ISO string dates to Date objects
    const data = JSON.parse(jsonString, (key, value) => {
      if (typeof value === 'string' && isIsoDate.test(value)) {
        return new Date(value);
      }
      return value;
    });

    const reverseModels = [...modelNames].reverse();

    await prisma.$transaction(async (tx) => {
      // 1. Delete all records in reverse order to respect foreign key constraints
      for (const model of reverseModels) {
        // @ts-ignore
        await tx[model].deleteMany({});
      }

      // 2. Insert records in the correct order
      for (const model of modelNames) {
        if (data[model] && data[model].length > 0) {
          // @ts-ignore
          await tx[model].createMany({
            data: data[model],
          });
        }
      }

      await tx.auditLog.create({
        data: {
          action: "IMPORT",
          module: "SYSTEM",
          remarks: "Database restored from backup",
        }
      });
    });

    return NextResponse.json({ success: true, message: "Database restored successfully" });
  } catch (error) {
    console.error("Restore Error:", error);
    return NextResponse.json({ error: "Failed to restore backup" }, { status: 500 });
  }
}
