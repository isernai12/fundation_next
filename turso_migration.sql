-- AlterTable
ALTER TABLE "Member" ADD COLUMN "paidUntilMonth" INTEGER;
ALTER TABLE "Member" ADD COLUMN "paidUntilYear" INTEGER;

-- CreateTable
CREATE TABLE "BeneficiaryPayment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campaignId" TEXT NOT NULL,
    "beneficiaryId" TEXT NOT NULL,
    "ledgerTransactionId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "reason" TEXT NOT NULL,
    "referenceNumber" TEXT,
    "comments" TEXT,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    CONSTRAINT "BeneficiaryPayment_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BeneficiaryPayment_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "Beneficiary" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BeneficiaryPayment_ledgerTransactionId_fkey" FOREIGN KEY ("ledgerTransactionId") REFERENCES "LedgerTransaction" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
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
    "donorId" TEXT,
    "campaignId" TEXT,
    "beneficiaryPaymentId" TEXT,
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
    CONSTRAINT "Document_grantId_fkey" FOREIGN KEY ("grantId") REFERENCES "Grant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Document_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "Donor" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Document_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Document_beneficiaryPaymentId_fkey" FOREIGN KEY ("beneficiaryPaymentId") REFERENCES "BeneficiaryPayment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Document" ("beneficiaryId", "campaignId", "categoryId", "cloudinaryPublicId", "createdAt", "createdBy", "description", "documentNumber", "donorId", "entityId", "foundationId", "grantId", "groupId", "id", "loanId", "memberId", "mimeType", "originalFilename", "remarks", "resourceType", "secureUrl", "sizeBytes", "status", "targetType", "title", "type", "updatedAt", "updatedBy") SELECT "beneficiaryId", "campaignId", "categoryId", "cloudinaryPublicId", "createdAt", "createdBy", "description", "documentNumber", "donorId", "entityId", "foundationId", "grantId", "groupId", "id", "loanId", "memberId", "mimeType", "originalFilename", "remarks", "resourceType", "secureUrl", "sizeBytes", "status", "targetType", "title", "type", "updatedAt", "updatedBy" FROM "Document";
DROP TABLE "Document";
ALTER TABLE "new_Document" RENAME TO "Document";
CREATE UNIQUE INDEX "Document_documentNumber_key" ON "Document"("documentNumber");
CREATE INDEX "Document_foundationId_idx" ON "Document"("foundationId");
CREATE INDEX "Document_groupId_idx" ON "Document"("groupId");
CREATE INDEX "Document_memberId_idx" ON "Document"("memberId");
CREATE INDEX "Document_beneficiaryId_idx" ON "Document"("beneficiaryId");
CREATE INDEX "Document_loanId_idx" ON "Document"("loanId");
CREATE INDEX "Document_grantId_idx" ON "Document"("grantId");
CREATE INDEX "Document_donorId_idx" ON "Document"("donorId");
CREATE INDEX "Document_campaignId_idx" ON "Document"("campaignId");
CREATE INDEX "Document_beneficiaryPaymentId_idx" ON "Document"("beneficiaryPaymentId");
CREATE INDEX "Document_targetType_idx" ON "Document"("targetType");
CREATE TABLE "new_Loan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "loanNumber" TEXT NOT NULL,
    "memberId" TEXT,
    "beneficiaryId" TEXT,
    "amount" INTEGER NOT NULL,
    "loanType" TEXT NOT NULL DEFAULT 'OTHER',
    "businessType" TEXT,
    "purpose" TEXT NOT NULL,
    "requestedDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "disbursedDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "installmentType" TEXT,
    "installmentAmount" INTEGER,
    "totalInstallments" INTEGER,
    "firstInstallmentDate" DATETIME,
    "nextDueDate" DATETIME,
    "totalPaidAmount" INTEGER NOT NULL DEFAULT 0,
    "remainingBalance" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    CONSTRAINT "Loan_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Loan_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "Beneficiary" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Loan" ("amount", "beneficiaryId", "businessType", "createdAt", "createdBy", "disbursedDate", "firstInstallmentDate", "id", "installmentAmount", "installmentType", "loanNumber", "loanType", "memberId", "nextDueDate", "notes", "purpose", "remainingBalance", "requestedDate", "status", "totalInstallments", "totalPaidAmount", "updatedAt", "updatedBy") SELECT "amount", "beneficiaryId", "businessType", "createdAt", "createdBy", "disbursedDate", "firstInstallmentDate", "id", "installmentAmount", "installmentType", "loanNumber", "loanType", "memberId", "nextDueDate", "notes", "purpose", "remainingBalance", "requestedDate", "status", "totalInstallments", "totalPaidAmount", "updatedAt", "updatedBy" FROM "Loan";
DROP TABLE "Loan";
ALTER TABLE "new_Loan" RENAME TO "Loan";
CREATE UNIQUE INDEX "Loan_loanNumber_key" ON "Loan"("loanNumber");
CREATE INDEX "Loan_memberId_idx" ON "Loan"("memberId");
CREATE INDEX "Loan_beneficiaryId_idx" ON "Loan"("beneficiaryId");
CREATE TABLE "new_LoanRepayment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "loanId" TEXT NOT NULL,
    "ledgerTransactionId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "installmentNo" INTEGER,
    "paymentMethod" TEXT NOT NULL DEFAULT 'CASH',
    "referenceNumber" TEXT,
    "notes" TEXT,
    "collectedBy" TEXT,
    "receiptUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    CONSTRAINT "LoanRepayment_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LoanRepayment_ledgerTransactionId_fkey" FOREIGN KEY ("ledgerTransactionId") REFERENCES "LedgerTransaction" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_LoanRepayment" ("amount", "collectedBy", "createdAt", "createdBy", "date", "id", "installmentNo", "ledgerTransactionId", "loanId", "notes", "paymentMethod", "receiptUrl", "referenceNumber", "status", "updatedAt", "updatedBy") SELECT "amount", "collectedBy", "createdAt", "createdBy", "date", "id", "installmentNo", "ledgerTransactionId", "loanId", "notes", coalesce("paymentMethod", 'CASH') AS "paymentMethod", "receiptUrl", "referenceNumber", "status", "updatedAt", "updatedBy" FROM "LoanRepayment";
DROP TABLE "LoanRepayment";
ALTER TABLE "new_LoanRepayment" RENAME TO "LoanRepayment";
CREATE UNIQUE INDEX "LoanRepayment_ledgerTransactionId_key" ON "LoanRepayment"("ledgerTransactionId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "BeneficiaryPayment_ledgerTransactionId_key" ON "BeneficiaryPayment"("ledgerTransactionId");

-- CreateIndex
CREATE INDEX "BeneficiaryPayment_campaignId_idx" ON "BeneficiaryPayment"("campaignId");

-- CreateIndex
CREATE INDEX "BeneficiaryPayment_beneficiaryId_idx" ON "BeneficiaryPayment"("beneficiaryId");

