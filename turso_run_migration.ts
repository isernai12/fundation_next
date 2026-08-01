import { createClient } from "@libsql/client";
import * as dotenv from 'dotenv';
dotenv.config();

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function run() {
  try {
    const sql = `
CREATE TABLE IF NOT EXISTS "MemberRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "applicationNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "fullName" TEXT NOT NULL,
    "fatherName" TEXT,
    "motherName" TEXT,
    "gender" TEXT,
    "dob" TEXT,
    "nationalId" TEXT,
    "idDocumentType" TEXT DEFAULT 'NID',
    "occupation" TEXT,
    "monthlyIncome" INTEGER,
    "bloodGroup" TEXT,
    "education" TEXT,
    "maritalStatus" TEXT,
    "mobile" TEXT,
    "altMobile" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "presentAddress" TEXT,
    "permanentAddress" TEXT,
    "emergencyContactName" TEXT,
    "emergencyContactMobile" TEXT,
    "emergencyContactRelation" TEXT,
    "referenceName" TEXT,
    "referenceMobile" TEXT,
    "referenceRelation" TEXT,
    "groupId" TEXT,
    "reasonForJoining" TEXT,
    "documents" TEXT,
    "rejectionReason" TEXT,
    "adminMessage" TEXT,
    "approvedAt" DATETIME,
    "approvedBy" TEXT,
    "createdMemberId" TEXT,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "MemberRequest_applicationNumber_key" ON "MemberRequest"("applicationNumber");
CREATE INDEX IF NOT EXISTS "MemberRequest_status_idx" ON "MemberRequest"("status");
CREATE INDEX IF NOT EXISTS "MemberRequest_applicationNumber_idx" ON "MemberRequest"("applicationNumber");
`;
    console.log("Creating MemberRequest table on Turso...");
    await client.executeMultiple(sql);
    console.log("MemberRequest table created successfully!");
  } catch (e) {
    console.error("Migration failed:", e);
  }
}

run();
