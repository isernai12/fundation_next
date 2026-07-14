/*
  Warnings:

  - You are about to drop the column `name` on the `Document` table. All the data in the column will be lost.
  - Added the required column `documentNumber` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `generatedFilename` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mimeType` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originalFilename` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sizeBytes` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "DocumentCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Document" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "documentNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "categoryId" TEXT,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "originalFilename" TEXT NOT NULL,
    "generatedFilename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "targetType" TEXT NOT NULL,
    "entityId" TEXT,
    "description" TEXT,
    "remarks" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "foundationId" TEXT,
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
    CONSTRAINT "Document_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Document_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "Beneficiary" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Document_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loan" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Document_grantId_fkey" FOREIGN KEY ("grantId") REFERENCES "Grant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Document" ("beneficiaryId", "createdAt", "createdBy", "foundationId", "grantId", "id", "loanId", "memberId", "targetType", "type", "updatedAt", "updatedBy", "url") SELECT "beneficiaryId", "createdAt", "createdBy", "foundationId", "grantId", "id", "loanId", "memberId", "targetType", "type", "updatedAt", "updatedBy", "url" FROM "Document";
DROP TABLE "Document";
ALTER TABLE "new_Document" RENAME TO "Document";
CREATE UNIQUE INDEX "Document_documentNumber_key" ON "Document"("documentNumber");
CREATE INDEX "Document_foundationId_idx" ON "Document"("foundationId");
CREATE INDEX "Document_memberId_idx" ON "Document"("memberId");
CREATE INDEX "Document_beneficiaryId_idx" ON "Document"("beneficiaryId");
CREATE INDEX "Document_loanId_idx" ON "Document"("loanId");
CREATE INDEX "Document_grantId_idx" ON "Document"("grantId");
CREATE INDEX "Document_targetType_idx" ON "Document"("targetType");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "DocumentCategory_name_key" ON "DocumentCategory"("name");
