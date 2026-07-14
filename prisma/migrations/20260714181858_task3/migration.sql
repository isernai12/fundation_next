/*
  Warnings:

  - Added the required column `code` to the `Group` table without a default value. This is not possible if the table is not empty.
  - Added the required column `memberId` to the `Member` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Group" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "foundationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    CONSTRAINT "Group_foundationId_fkey" FOREIGN KEY ("foundationId") REFERENCES "Foundation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Group" ("createdAt", "createdBy", "description", "foundationId", "id", "name", "status", "updatedAt", "updatedBy") SELECT "createdAt", "createdBy", "description", "foundationId", "id", "name", "status", "updatedAt", "updatedBy" FROM "Group";
DROP TABLE "Group";
ALTER TABLE "new_Group" RENAME TO "Group";
CREATE UNIQUE INDEX "Group_code_key" ON "Group"("code");
CREATE TABLE "new_Member" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "memberId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "fatherName" TEXT,
    "motherName" TEXT,
    "gender" TEXT,
    "dob" DATETIME,
    "nationalId" TEXT,
    "occupation" TEXT,
    "monthlyIncome" INTEGER,
    "bloodGroup" TEXT,
    "mobile" TEXT,
    "altMobile" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "presentAddress" TEXT,
    "permanentAddress" TEXT,
    "emergencyContactName" TEXT,
    "emergencyContactMobile" TEXT,
    "emergencyContactRelation" TEXT,
    "joinDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "remarks" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    CONSTRAINT "Member_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Member" ("createdAt", "createdBy", "email", "firstName", "groupId", "id", "lastName", "phone", "status", "updatedAt", "updatedBy") SELECT "createdAt", "createdBy", "email", "firstName", "groupId", "id", "lastName", "phone", "status", "updatedAt", "updatedBy" FROM "Member";
DROP TABLE "Member";
ALTER TABLE "new_Member" RENAME TO "Member";
CREATE UNIQUE INDEX "Member_memberId_key" ON "Member"("memberId");
CREATE UNIQUE INDEX "Member_nationalId_key" ON "Member"("nationalId");
CREATE UNIQUE INDEX "Member_mobile_key" ON "Member"("mobile");
CREATE UNIQUE INDEX "Member_email_key" ON "Member"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
