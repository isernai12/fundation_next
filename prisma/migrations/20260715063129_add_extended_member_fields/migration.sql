-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Member" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "memberId" TEXT NOT NULL,
    "groupId" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
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
    "maritalStatus" TEXT,
    "education" TEXT,
    "workplace" TEXT,
    "designation" TEXT,
    "skills" TEXT,
    "reference" TEXT,
    "reasonForJoining" TEXT,
    "participation" TEXT,
    "declarationAccepted" BOOLEAN NOT NULL DEFAULT true,
    "memberType" TEXT DEFAULT 'REGULAR',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    CONSTRAINT "Member_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Member" ("altMobile", "bloodGroup", "createdAt", "createdBy", "dob", "email", "emergencyContactMobile", "emergencyContactName", "emergencyContactRelation", "fatherName", "firstName", "gender", "groupId", "id", "joinDate", "lastName", "memberId", "mobile", "monthlyIncome", "motherName", "nationalId", "occupation", "permanentAddress", "phone", "presentAddress", "remarks", "status", "updatedAt", "updatedBy") SELECT "altMobile", "bloodGroup", "createdAt", "createdBy", "dob", "email", "emergencyContactMobile", "emergencyContactName", "emergencyContactRelation", "fatherName", "firstName", "gender", "groupId", "id", "joinDate", "lastName", "memberId", "mobile", "monthlyIncome", "motherName", "nationalId", "occupation", "permanentAddress", "phone", "presentAddress", "remarks", "status", "updatedAt", "updatedBy" FROM "Member";
DROP TABLE "Member";
ALTER TABLE "new_Member" RENAME TO "Member";
CREATE UNIQUE INDEX "Member_memberId_key" ON "Member"("memberId");
CREATE UNIQUE INDEX "Member_nationalId_key" ON "Member"("nationalId");
CREATE UNIQUE INDEX "Member_mobile_key" ON "Member"("mobile");
CREATE UNIQUE INDEX "Member_email_key" ON "Member"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
