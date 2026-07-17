/*
  Warnings:

  - You are about to drop the column `generatedFilename` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `Document` table. All the data in the column will be lost.
  - Added the required column `cloudinaryPublicId` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `secureUrl` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Group" ADD COLUMN "groupLeader" TEXT;
ALTER TABLE "Group" ADD COLUMN "remarks" TEXT;
ALTER TABLE "Group" ADD COLUMN "shortName" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Document" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "documentNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "categoryId" TEXT,
    "type" TEXT NOT NULL,
    "cloudinaryPublicId" TEXT NOT NULL,
    "secureUrl" TEXT NOT NULL,
    "originalFilename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "resourceType" TEXT NOT NULL DEFAULT 'auto',
    "targetType" TEXT NOT NULL,
    "entityId" TEXT,
    "description" TEXT,
    "remarks" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "foundationId" TEXT,
    "groupId" TEXT,
    "memberId" TEXT,
    "beneficiaryId" TEXT,
    "loanId" TEXT,
    "grantId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    CONSTRAINT "Document_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "DocumentCategory" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Document_foundationId_fkey" FOREIGN KEY ("foundationId") REFERENCES "Foundation" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Document_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Document_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Document_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "Beneficiary" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Document_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loan" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Document_grantId_fkey" FOREIGN KEY ("grantId") REFERENCES "Grant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Document" ("beneficiaryId", "categoryId", "createdAt", "createdBy", "description", "documentNumber", "entityId", "foundationId", "grantId", "groupId", "id", "loanId", "memberId", "mimeType", "originalFilename", "remarks", "sizeBytes", "status", "targetType", "title", "type", "updatedAt", "updatedBy") SELECT "beneficiaryId", "categoryId", "createdAt", "createdBy", "description", "documentNumber", "entityId", "foundationId", "grantId", "groupId", "id", "loanId", "memberId", "mimeType", "originalFilename", "remarks", "sizeBytes", "status", "targetType", "title", "type", "updatedAt", "updatedBy" FROM "Document";
DROP TABLE "Document";
ALTER TABLE "new_Document" RENAME TO "Document";
CREATE UNIQUE INDEX "Document_documentNumber_key" ON "Document"("documentNumber");
CREATE INDEX "Document_foundationId_idx" ON "Document"("foundationId");
CREATE INDEX "Document_groupId_idx" ON "Document"("groupId");
CREATE INDEX "Document_memberId_idx" ON "Document"("memberId");
CREATE INDEX "Document_beneficiaryId_idx" ON "Document"("beneficiaryId");
CREATE INDEX "Document_loanId_idx" ON "Document"("loanId");
CREATE INDEX "Document_grantId_idx" ON "Document"("grantId");
CREATE INDEX "Document_targetType_idx" ON "Document"("targetType");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
