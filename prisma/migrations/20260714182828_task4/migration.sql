/*
  Warnings:

  - You are about to drop the column `date` on the `ContributionPayment` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `ContributionPayment` table. All the data in the column will be lost.
  - You are about to drop the column `amount` on the `MonthlyContribution` table. All the data in the column will be lost.
  - You are about to drop the column `endDate` on the `MonthlyContribution` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `MonthlyContribution` table. All the data in the column will be lost.
  - Added the required column `paymentDate` to the `ContributionPayment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentMethod` to the `ContributionPayment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expectedAmount` to the `MonthlyContribution` table without a default value. This is not possible if the table is not empty.
  - Added the required column `month` to the `MonthlyContribution` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `MonthlyContribution` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ContributionPayment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "monthlyContributionId" TEXT NOT NULL,
    "ledgerTransactionId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "paymentDate" DATETIME NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "referenceNumber" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    CONSTRAINT "ContributionPayment_monthlyContributionId_fkey" FOREIGN KEY ("monthlyContributionId") REFERENCES "MonthlyContribution" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ContributionPayment_ledgerTransactionId_fkey" FOREIGN KEY ("ledgerTransactionId") REFERENCES "LedgerTransaction" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ContributionPayment" ("amount", "createdAt", "createdBy", "id", "ledgerTransactionId", "monthlyContributionId", "updatedAt", "updatedBy") SELECT "amount", "createdAt", "createdBy", "id", "ledgerTransactionId", "monthlyContributionId", "updatedAt", "updatedBy" FROM "ContributionPayment";
DROP TABLE "ContributionPayment";
ALTER TABLE "new_ContributionPayment" RENAME TO "ContributionPayment";
CREATE UNIQUE INDEX "ContributionPayment_ledgerTransactionId_key" ON "ContributionPayment"("ledgerTransactionId");
CREATE TABLE "new_MonthlyContribution" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "memberId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "expectedAmount" INTEGER NOT NULL,
    "isAdditional" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    CONSTRAINT "MonthlyContribution_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_MonthlyContribution" ("createdAt", "createdBy", "id", "memberId", "status", "updatedAt", "updatedBy") SELECT "createdAt", "createdBy", "id", "memberId", "status", "updatedAt", "updatedBy" FROM "MonthlyContribution";
DROP TABLE "MonthlyContribution";
ALTER TABLE "new_MonthlyContribution" RENAME TO "MonthlyContribution";
CREATE UNIQUE INDEX "MonthlyContribution_memberId_month_year_isAdditional_key" ON "MonthlyContribution"("memberId", "month", "year", "isAdditional");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
