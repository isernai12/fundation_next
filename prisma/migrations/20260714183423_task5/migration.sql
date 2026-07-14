/*
  Warnings:

  - Added the required column `beneficiaryId` to the `Beneficiary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `grantNumber` to the `Grant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `installmentAmount` to the `Loan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `installmentCount` to the `Loan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `loanNumber` to the `Loan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `purpose` to the `Loan` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Beneficiary" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "beneficiaryId" TEXT NOT NULL,
    "memberId" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "mobile" TEXT,
    "address" TEXT,
    "nationalId" TEXT,
    "occupation" TEXT,
    "remarks" TEXT,
    "relationToMember" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    CONSTRAINT "Beneficiary_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Beneficiary" ("createdAt", "createdBy", "email", "firstName", "id", "lastName", "memberId", "phone", "relationToMember", "updatedAt", "updatedBy") SELECT "createdAt", "createdBy", "email", "firstName", "id", "lastName", "memberId", "phone", "relationToMember", "updatedAt", "updatedBy" FROM "Beneficiary";
DROP TABLE "Beneficiary";
ALTER TABLE "new_Beneficiary" RENAME TO "Beneficiary";
CREATE UNIQUE INDEX "Beneficiary_beneficiaryId_key" ON "Beneficiary"("beneficiaryId");
CREATE UNIQUE INDEX "Beneficiary_nationalId_key" ON "Beneficiary"("nationalId");
CREATE TABLE "new_Grant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "grantNumber" TEXT NOT NULL,
    "beneficiaryId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "purpose" TEXT NOT NULL,
    "dateApproved" DATETIME,
    "disbursedDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    CONSTRAINT "Grant_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "Beneficiary" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Grant" ("amount", "beneficiaryId", "createdAt", "createdBy", "dateApproved", "id", "notes", "purpose", "status", "updatedAt", "updatedBy") SELECT "amount", "beneficiaryId", "createdAt", "createdBy", "dateApproved", "id", "notes", "purpose", "status", "updatedAt", "updatedBy" FROM "Grant";
DROP TABLE "Grant";
ALTER TABLE "new_Grant" RENAME TO "Grant";
CREATE UNIQUE INDEX "Grant_grantNumber_key" ON "Grant"("grantNumber");
CREATE TABLE "new_Loan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "loanNumber" TEXT NOT NULL,
    "memberId" TEXT,
    "beneficiaryId" TEXT,
    "amount" INTEGER NOT NULL,
    "purpose" TEXT NOT NULL,
    "requestedDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateApproved" DATETIME,
    "disbursedDate" DATETIME,
    "installmentCount" INTEGER NOT NULL,
    "installmentAmount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    CONSTRAINT "Loan_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Loan_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "Beneficiary" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Loan" ("amount", "beneficiaryId", "createdAt", "createdBy", "dateApproved", "id", "memberId", "notes", "status", "updatedAt", "updatedBy") SELECT "amount", "beneficiaryId", "createdAt", "createdBy", "dateApproved", "id", "memberId", "notes", "status", "updatedAt", "updatedBy" FROM "Loan";
DROP TABLE "Loan";
ALTER TABLE "new_Loan" RENAME TO "Loan";
CREATE UNIQUE INDEX "Loan_loanNumber_key" ON "Loan"("loanNumber");
CREATE INDEX "Loan_memberId_idx" ON "Loan"("memberId");
CREATE INDEX "Loan_beneficiaryId_idx" ON "Loan"("beneficiaryId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
