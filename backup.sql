PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "Foundation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT
);
INSERT INTO Foundation VALUES('default-foundation','Global Foundation','Main Foundation ERP instance','2026-07-25T11:53:42.798+00:00','2026-07-25T11:53:42.798+00:00',NULL,NULL);
CREATE TABLE IF NOT EXISTS "Group" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "foundationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "shortName" TEXT,
    "description" TEXT,
    "remarks" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    CONSTRAINT "Group_foundationId_fkey" FOREIGN KEY ("foundationId") REFERENCES "Foundation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "Group" VALUES('04f84468-1c4d-4453-b777-921d65124460','default-foundation','Beta Group','G-BETA',NULL,'Second Division',NULL,'ACTIVE','2026-07-25T11:53:43.075+00:00','2026-07-25T11:53:43.075+00:00',NULL,NULL);
INSERT INTO "Group" VALUES('63e58969-86d3-4d92-b409-ea7e2d8c3b3b','default-foundation','দুর্গা প্রসাদ','G-4445','','','','ACTIVE','2026-07-25T12:26:05.614+00:00','2026-07-25T12:26:05.614+00:00',NULL,NULL);
CREATE TABLE IF NOT EXISTS "Member" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "memberId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "fullName" TEXT,
    "fatherName" TEXT,
    "motherName" TEXT,
    "gender" TEXT,
    "dob" DATETIME,
    "nationalId" TEXT,
    "idDocumentType" TEXT DEFAULT 'NID',
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
INSERT INTO Member VALUES('a7c5157f-b9af-4c2f-abaf-93ff950bdbff','MBR-2026-0001','04f84468-1c4d-4453-b777-921d65124460','ভাই ভাই ইলেক্ট্রনিক্স',NULL,NULL,NULL,NULL,NULL,'BIRTH_CERTIFICATE',NULL,NULL,NULL,NULL,NULL,'bhaibhaielectronics2026@gmail.com',NULL,NULL,NULL,NULL,NULL,NULL,'2026-07-25T12:16:13.158+00:00','ACTIVE',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'REGULAR','2026-07-25T12:16:13.159+00:00','2026-07-25T12:16:13.159+00:00',NULL,NULL);
INSERT INTO Member VALUES('4d640f50-dd02-468a-9fcc-8c7aea6eed4c','MBR-2026-0002','63e58969-86d3-4d92-b409-ea7e2d8c3b3b','ভাই ভাই ইলেক্ট্রনিক্স',NULL,NULL,NULL,NULL,NULL,'BIRTH_CERTIFICATE',NULL,NULL,NULL,NULL,NULL,'bhaibhaiel1111ectronics2026@gmail.com',NULL,NULL,NULL,NULL,NULL,NULL,'2026-07-25T12:26:35.871+00:00','ACTIVE',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'REGULAR','2026-07-25T12:26:35.872+00:00','2026-07-25T12:26:35.872+00:00',NULL,NULL);
INSERT INTO Member VALUES('7f1aa3a8-73e0-436a-ad58-23b69292b79e','MBR-2026-0003','63e58969-86d3-4d92-b409-ea7e2d8c3b3b','Rafiqul Islam',NULL,NULL,NULL,NULL,NULL,'NID',NULL,NULL,NULL,NULL,NULL,'rafiqalislam1990@gmail.com',NULL,NULL,NULL,NULL,NULL,NULL,'2026-07-26T02:42:17.854+00:00','ACTIVE',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'REGULAR','2026-07-26T02:42:17.855+00:00','2026-07-26T02:42:17.855+00:00',NULL,NULL);
CREATE TABLE IF NOT EXISTS "Beneficiary" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "beneficiaryId" TEXT NOT NULL,
    "memberId" TEXT,
    "fullName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "mobile" TEXT,
    "address" TEXT,
    "presentAddress" TEXT,
    "permanentAddress" TEXT,
    "nationalId" TEXT,
    "idDocumentType" TEXT DEFAULT 'NID',
    "fatherOrHusbandName" TEXT,
    "beneficiaryPhoto" TEXT,
    "nidOrBirthCertificate" TEXT,
    "occupation" TEXT,
    "remarks" TEXT,
    "relationToMember" TEXT,
    "assistanceType" TEXT,
    "assistanceReason" TEXT,
    "loanReason" TEXT,
    "businessType" TEXT,
    "loanPurpose" TEXT,
    "loanAmount" INTEGER,
    "emergencyContactName" TEXT,
    "emergencyContactRelation" TEXT,
    "emergencyContactMobile" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    CONSTRAINT "Beneficiary_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO Beneficiary VALUES('ca63f867-b1e7-4639-8980-dc9c23aefb29','BEN-2026-0001',NULL,'test',NULL,NULL,'','','','',NULL,'BIRTH_CERTIFICATE','',NULL,'https://res.cloudinary.com/diwp8ug1r/image/upload/v1784982634/foundation/beneficiaries/ids/vf1cp6vk5gntymmhj0xy.png',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'','','','ACTIVE','2026-07-25T12:30:30.678+00:00','2026-07-25T12:30:35.025+00:00',NULL,NULL);
CREATE TABLE IF NOT EXISTS "Donor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "donorId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "address" TEXT,
    "nationalId" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT
);
INSERT INTO Donor VALUES('0b2ab7ca-348f-4d83-bb3d-0ea359a2d1ab','DNR-0001','ewe','gs','',NULL,NULL,'ACTIVE','2026-07-25T12:28:55.502+00:00','2026-07-25T12:28:55.502+00:00',NULL,NULL);
INSERT INTO Donor VALUES('fd05e66f-ec44-4fd2-9ff6-8c6fec93d61e','DNR-0002','ভাই ভাই ','dfgdf',NULL,NULL,NULL,'ACTIVE','2026-07-25T12:29:22.881+00:00','2026-07-25T12:29:22.881+00:00','3925a03f-e627-49bc-b40d-a588e38da103',NULL);
CREATE TABLE IF NOT EXISTS "Fund" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "groupId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    CONSTRAINT "Fund_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO Fund VALUES('8e32daf7-1b89-446c-97ef-be9ea4dd15f9',NULL,'General Fund','Main foundation unrestricted fund','2026-07-25T11:53:43.228+00:00','2026-07-25T11:53:43.228+00:00',NULL,NULL);
INSERT INTO Fund VALUES('ffa0b538-cd4b-43a6-99e6-4b82db43f2e6','63e58969-86d3-4d92-b409-ea7e2d8c3b3b','দুর্গা প্রসাদ Fund','Auto-generated fund for দুর্গা প্রসাদ','2026-07-25T12:27:13.955+00:00','2026-07-25T12:27:13.955+00:00',NULL,NULL);
INSERT INTO Fund VALUES('7295a200-4269-4a29-a56f-a736ba2552cd','04f84468-1c4d-4453-b777-921d65124460','Beta Group Fund','Auto-generated fund for Beta Group','2026-07-25T12:27:30.654+00:00','2026-07-25T12:27:30.654+00:00',NULL,NULL);
INSERT INTO Fund VALUES('a51bba61-6425-44f5-86ed-25264dfdaf6c',NULL,'Campaign: test','Fund for test','2026-07-25T12:28:55.242+00:00','2026-07-25T12:28:55.242+00:00',NULL,NULL);
CREATE TABLE IF NOT EXISTS "MonthlyContribution" (
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
INSERT INTO MonthlyContribution VALUES('34383ae2-2281-4688-ac86-a258526d5c25','4d640f50-dd02-468a-9fcc-8c7aea6eed4c',7,2026,100,0,'PAID','2026-07-25T12:27:13.693+00:00','2026-07-25T12:27:13.693+00:00',NULL,NULL);
INSERT INTO MonthlyContribution VALUES('bc10756f-ea22-47aa-81a0-32c3c2f1ea86','a7c5157f-b9af-4c2f-abaf-93ff950bdbff',7,2026,100,0,'PAID','2026-07-25T12:27:30.393+00:00','2026-07-25T12:27:30.393+00:00',NULL,NULL);
INSERT INTO MonthlyContribution VALUES('c1caa727-1c4d-426f-8cd5-62e2fea5de8e','7f1aa3a8-73e0-436a-ad58-23b69292b79e',7,2026,100,0,'PENDING','2026-07-26T04:08:28.226+00:00','2026-07-26T04:08:28.226+00:00',NULL,NULL);
CREATE TABLE IF NOT EXISTS "ContributionPayment" (
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
INSERT INTO ContributionPayment VALUES('569af159-8398-4aeb-90f2-dcf8b07e83d9','34383ae2-2281-4688-ac86-a258526d5c25','2a4ce086-b9e4-491e-b990-717e05ab3911',100,'2026-07-25T00:00:00.000+00:00','CASH','','','2026-07-25T12:27:14.411+00:00','2026-07-25T12:27:14.411+00:00',NULL,NULL);
INSERT INTO ContributionPayment VALUES('3523cebd-fbff-4460-8a58-64a08037d0c0','bc10756f-ea22-47aa-81a0-32c3c2f1ea86','98a4fb5a-1fa0-45b3-af93-9d23f1066d97',100,'2026-07-25T00:00:00.000+00:00','CASH','','','2026-07-25T12:27:31.102+00:00','2026-07-25T12:27:31.102+00:00',NULL,NULL);
CREATE TABLE IF NOT EXISTS "LedgerTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "type" TEXT NOT NULL,
    "referenceId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT
);
INSERT INTO LedgerTransaction VALUES('2a4ce086-b9e4-491e-b990-717e05ab3911','2026-07-25T00:00:00.000+00:00','CONTRIBUTION','','COMPLETED','','2026-07-25T12:27:14.149+00:00','2026-07-25T12:27:14.149+00:00',NULL,NULL);
INSERT INTO LedgerTransaction VALUES('98a4fb5a-1fa0-45b3-af93-9d23f1066d97','2026-07-25T00:00:00.000+00:00','CONTRIBUTION','','COMPLETED','','2026-07-25T12:27:30.846+00:00','2026-07-25T12:27:30.846+00:00',NULL,NULL);
INSERT INTO LedgerTransaction VALUES('879a9603-291a-4bbf-b692-37ea87043b0d','2026-07-25T00:00:00.000+00:00','CAMPAIGN','0b2ab7ca-348f-4d83-bb3d-0ea359a2d1ab','COMPLETED','Contribution to test','2026-07-25T12:28:55.633+00:00','2026-07-25T12:28:55.633+00:00',NULL,NULL);
INSERT INTO LedgerTransaction VALUES('42fb0089-1b7c-4c2d-a550-2b55b31d3478','2026-07-25T00:00:00.000+00:00','DONATION','fd05e66f-ec44-4fd2-9ff6-8c6fec93d61e','COMPLETED','Group Donation','2026-07-25T12:29:34.421+00:00','2026-07-25T12:29:34.421+00:00',NULL,NULL);
INSERT INTO LedgerTransaction VALUES('61e0c519-0611-40ac-9660-3f34409f2a05','2026-07-25T12:31:03.247+00:00','LOAN','L-2026-0001','COMPLETED','Loan Disbursed: L-2026-0001','2026-07-25T12:31:03.376+00:00','2026-07-25T12:31:03.376+00:00',NULL,NULL);
INSERT INTO LedgerTransaction VALUES('dc2983ca-5ef1-4c81-a585-b1297af7197c','2026-07-25T12:32:46.317+00:00','REPAYMENT','L-2026-0001','COMPLETED','Repayment for Loan L-2026-0001','2026-07-25T12:32:46.448+00:00','2026-07-25T12:32:46.448+00:00',NULL,NULL);
INSERT INTO LedgerTransaction VALUES('059743fa-50ab-44d7-8f1c-fde1c16e892a','2026-07-25T17:11:06.673+00:00','LOAN','L-2026-0002','COMPLETED','Loan Disbursed: L-2026-0002','2026-07-25T17:11:06.700+00:00','2026-07-25T17:11:06.700+00:00',NULL,NULL);
INSERT INTO LedgerTransaction VALUES('2ae3c7d4-3e98-495f-af05-5b1a6f4a5047','2026-07-25T17:16:11.375+00:00','REPAYMENT','L-2026-0002','COMPLETED','Repayment for Loan L-2026-0002','2026-07-25T17:16:48.599+00:00','2026-07-25T17:16:48.599+00:00',NULL,NULL);
INSERT INTO LedgerTransaction VALUES('e7e8f1a8-9400-45c9-8da1-702c3dca766e','2026-07-25T17:34:03.337+00:00','REPAYMENT','L-2026-0001','COMPLETED','Repayment for Loan L-2026-0001','2026-07-25T17:34:07.742+00:00','2026-07-25T17:34:07.742+00:00',NULL,NULL);
INSERT INTO LedgerTransaction VALUES('c35f29b7-8d5f-46d7-a5c9-0e2467d5d169','2026-07-26T10:20:09.481+00:00','LOAN','L-2026-0003','COMPLETED','Loan Disbursed: L-2026-0003','2026-07-26T10:20:09.511+00:00','2026-07-26T10:20:09.511+00:00',NULL,NULL);
CREATE TABLE IF NOT EXISTS "LedgerEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "transactionId" TEXT NOT NULL,
    "fundId" TEXT NOT NULL,
    "isCredit" BOOLEAN NOT NULL,
    "amount" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "groupId" TEXT,
    "groupCode" TEXT,
    "groupName" TEXT,
    CONSTRAINT "LedgerEntry_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "LedgerTransaction" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LedgerEntry_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "Fund" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO LedgerEntry VALUES('89e38dec-bac4-4f9c-997c-fba9582f5e9a','2a4ce086-b9e4-491e-b990-717e05ab3911','8e32daf7-1b89-446c-97ef-be9ea4dd15f9',0,100,'2026-07-25T12:27:14.149+00:00','2026-07-25T12:27:14.149+00:00',NULL,NULL,NULL,NULL,NULL);
INSERT INTO LedgerEntry VALUES('9d162584-79f5-4b91-bf3d-2d9e825722ea','2a4ce086-b9e4-491e-b990-717e05ab3911','ffa0b538-cd4b-43a6-99e6-4b82db43f2e6',1,100,'2026-07-25T12:27:14.149+00:00','2026-07-25T12:27:14.149+00:00',NULL,NULL,'63e58969-86d3-4d92-b409-ea7e2d8c3b3b','G-4445','দুর্গা প্রসাদ');
INSERT INTO LedgerEntry VALUES('7b59371b-e416-41a4-9aba-54763e452107','98a4fb5a-1fa0-45b3-af93-9d23f1066d97','8e32daf7-1b89-446c-97ef-be9ea4dd15f9',0,100,'2026-07-25T12:27:30.846+00:00','2026-07-25T12:27:30.846+00:00',NULL,NULL,NULL,NULL,NULL);
INSERT INTO LedgerEntry VALUES('e5c87586-2c4d-4dd5-839e-7c430a06f3b1','98a4fb5a-1fa0-45b3-af93-9d23f1066d97','7295a200-4269-4a29-a56f-a736ba2552cd',1,100,'2026-07-25T12:27:30.846+00:00','2026-07-25T12:27:30.846+00:00',NULL,NULL,'04f84468-1c4d-4453-b777-921d65124460','G-BETA','Beta Group');
INSERT INTO LedgerEntry VALUES('13a8ff5d-89be-4f6e-996a-4cad49fdc2e0','879a9603-291a-4bbf-b692-37ea87043b0d','8e32daf7-1b89-446c-97ef-be9ea4dd15f9',0,500,'2026-07-25T12:28:55.633+00:00','2026-07-25T12:28:55.633+00:00',NULL,NULL,NULL,NULL,NULL);
INSERT INTO LedgerEntry VALUES('e912ccad-287e-4ce7-b92a-1dce503b0636','879a9603-291a-4bbf-b692-37ea87043b0d','a51bba61-6425-44f5-86ed-25264dfdaf6c',1,500,'2026-07-25T12:28:55.633+00:00','2026-07-25T12:28:55.633+00:00',NULL,NULL,NULL,NULL,NULL);
INSERT INTO LedgerEntry VALUES('c9fd1838-638b-48b3-9ac1-249558c676ce','42fb0089-1b7c-4c2d-a550-2b55b31d3478','8e32daf7-1b89-446c-97ef-be9ea4dd15f9',0,5000,'2026-07-25T12:29:34.421+00:00','2026-07-25T12:29:34.421+00:00',NULL,NULL,NULL,NULL,NULL);
INSERT INTO LedgerEntry VALUES('ec2767d2-bd54-469e-b6a6-710e5b0b06b4','42fb0089-1b7c-4c2d-a550-2b55b31d3478','ffa0b538-cd4b-43a6-99e6-4b82db43f2e6',1,5000,'2026-07-25T12:29:34.421+00:00','2026-07-25T12:29:34.421+00:00',NULL,NULL,'63e58969-86d3-4d92-b409-ea7e2d8c3b3b','G-4445','দুর্গা প্রসাদ');
INSERT INTO LedgerEntry VALUES('ba341ac4-4e3d-47c4-8099-a617035bdc8a','61e0c519-0611-40ac-9660-3f34409f2a05','8e32daf7-1b89-446c-97ef-be9ea4dd15f9',1,5000,'2026-07-25T12:31:03.376+00:00','2026-07-25T12:31:03.376+00:00',NULL,NULL,NULL,NULL,NULL);
INSERT INTO LedgerEntry VALUES('4457a1ca-9d7b-468b-aa0a-388dba8b351a','61e0c519-0611-40ac-9660-3f34409f2a05','ffa0b538-cd4b-43a6-99e6-4b82db43f2e6',0,2500,'2026-07-25T12:31:03.376+00:00','2026-07-25T12:31:03.376+00:00',NULL,NULL,'63e58969-86d3-4d92-b409-ea7e2d8c3b3b','G-4445','দুর্গা প্রসাদ');
INSERT INTO LedgerEntry VALUES('ebb294c9-087e-4c3d-b391-0ee467c5800f','61e0c519-0611-40ac-9660-3f34409f2a05','7295a200-4269-4a29-a56f-a736ba2552cd',0,2500,'2026-07-25T12:31:03.376+00:00','2026-07-25T12:31:03.376+00:00',NULL,NULL,'04f84468-1c4d-4453-b777-921d65124460','G-BETA','Beta Group');
INSERT INTO LedgerEntry VALUES('7b086cfa-59b4-4131-8220-c83313de0698','dc2983ca-5ef1-4c81-a585-b1297af7197c','8e32daf7-1b89-446c-97ef-be9ea4dd15f9',0,1000,'2026-07-25T12:32:46.448+00:00','2026-07-25T12:32:46.448+00:00',NULL,NULL,NULL,NULL,NULL);
INSERT INTO LedgerEntry VALUES('8b4aeba8-eef2-45d1-8cd7-56cd285496a9','dc2983ca-5ef1-4c81-a585-b1297af7197c','ffa0b538-cd4b-43a6-99e6-4b82db43f2e6',1,500,'2026-07-25T12:32:46.448+00:00','2026-07-25T12:32:46.448+00:00',NULL,NULL,'63e58969-86d3-4d92-b409-ea7e2d8c3b3b','G-4445','দুর্গা প্রসাদ');
INSERT INTO LedgerEntry VALUES('f8c414c6-70e8-41ad-832f-9b81148534a5','dc2983ca-5ef1-4c81-a585-b1297af7197c','7295a200-4269-4a29-a56f-a736ba2552cd',1,500,'2026-07-25T12:32:46.448+00:00','2026-07-25T12:32:46.448+00:00',NULL,NULL,'04f84468-1c4d-4453-b777-921d65124460','G-BETA','Beta Group');
INSERT INTO LedgerEntry VALUES('b09bbec6-ccab-448d-8cab-48d62e61e005','059743fa-50ab-44d7-8f1c-fde1c16e892a','8e32daf7-1b89-446c-97ef-be9ea4dd15f9',1,500,'2026-07-25T17:11:06.700+00:00','2026-07-25T17:11:06.700+00:00',NULL,NULL,NULL,NULL,NULL);
INSERT INTO LedgerEntry VALUES('144a38df-8800-4129-b71f-fb04748b179f','059743fa-50ab-44d7-8f1c-fde1c16e892a','ffa0b538-cd4b-43a6-99e6-4b82db43f2e6',0,250,'2026-07-25T17:11:06.700+00:00','2026-07-25T17:11:06.700+00:00',NULL,NULL,'63e58969-86d3-4d92-b409-ea7e2d8c3b3b','G-4445','দুর্গা প্রসাদ');
INSERT INTO LedgerEntry VALUES('cbd1956e-c845-4521-a11c-5a2895179615','059743fa-50ab-44d7-8f1c-fde1c16e892a','7295a200-4269-4a29-a56f-a736ba2552cd',0,250,'2026-07-25T17:11:06.700+00:00','2026-07-25T17:11:06.700+00:00',NULL,NULL,'04f84468-1c4d-4453-b777-921d65124460','G-BETA','Beta Group');
INSERT INTO LedgerEntry VALUES('2eddb57e-a933-4f27-b1b7-7182acf65542','2ae3c7d4-3e98-495f-af05-5b1a6f4a5047','8e32daf7-1b89-446c-97ef-be9ea4dd15f9',0,500,'2026-07-25T17:16:48.599+00:00','2026-07-25T17:16:48.599+00:00',NULL,NULL,NULL,NULL,NULL);
INSERT INTO LedgerEntry VALUES('97dd06ca-a095-4118-887e-9817709ecdb9','2ae3c7d4-3e98-495f-af05-5b1a6f4a5047','ffa0b538-cd4b-43a6-99e6-4b82db43f2e6',1,250,'2026-07-25T17:16:48.599+00:00','2026-07-25T17:16:48.599+00:00',NULL,NULL,'63e58969-86d3-4d92-b409-ea7e2d8c3b3b','G-4445','দুর্গা প্রসাদ');
INSERT INTO LedgerEntry VALUES('2c7bfc68-49e3-451c-a4c1-3256747d6d5c','2ae3c7d4-3e98-495f-af05-5b1a6f4a5047','7295a200-4269-4a29-a56f-a736ba2552cd',1,250,'2026-07-25T17:16:48.599+00:00','2026-07-25T17:16:48.599+00:00',NULL,NULL,'04f84468-1c4d-4453-b777-921d65124460','G-BETA','Beta Group');
INSERT INTO LedgerEntry VALUES('127f6db0-7338-405a-bab4-9e87bc510a4d','e7e8f1a8-9400-45c9-8da1-702c3dca766e','8e32daf7-1b89-446c-97ef-be9ea4dd15f9',0,4000,'2026-07-25T17:34:07.742+00:00','2026-07-25T17:34:07.742+00:00',NULL,NULL,NULL,NULL,NULL);
INSERT INTO LedgerEntry VALUES('0c87b69b-dcca-4cf0-a5e6-88a15ec02a6e','e7e8f1a8-9400-45c9-8da1-702c3dca766e','ffa0b538-cd4b-43a6-99e6-4b82db43f2e6',1,2000,'2026-07-25T17:34:07.742+00:00','2026-07-25T17:34:07.742+00:00',NULL,NULL,'63e58969-86d3-4d92-b409-ea7e2d8c3b3b','G-4445','দুর্গা প্রসাদ');
INSERT INTO LedgerEntry VALUES('4adcab50-62b7-4c99-875f-051662c3197a','e7e8f1a8-9400-45c9-8da1-702c3dca766e','7295a200-4269-4a29-a56f-a736ba2552cd',1,2000,'2026-07-25T17:34:07.742+00:00','2026-07-25T17:34:07.742+00:00',NULL,NULL,'04f84468-1c4d-4453-b777-921d65124460','G-BETA','Beta Group');
INSERT INTO LedgerEntry VALUES('f3ead847-79e4-4984-8c20-753957cf900d','c35f29b7-8d5f-46d7-a5c9-0e2467d5d169','8e32daf7-1b89-446c-97ef-be9ea4dd15f9',1,100,'2026-07-26T10:20:09.511+00:00','2026-07-26T10:20:09.511+00:00',NULL,NULL,NULL,NULL,NULL);
INSERT INTO LedgerEntry VALUES('537a9cdf-0a20-482a-bbb6-00c943b6094d','c35f29b7-8d5f-46d7-a5c9-0e2467d5d169','ffa0b538-cd4b-43a6-99e6-4b82db43f2e6',0,100,'2026-07-26T10:20:09.511+00:00','2026-07-26T10:20:09.511+00:00',NULL,NULL,'63e58969-86d3-4d92-b409-ea7e2d8c3b3b','G-4445','দুর্গা প্রসাদ');
CREATE TABLE IF NOT EXISTS "Loan" (
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT, installmentType TEXT, installmentAmount REAL, totalInstallments INTEGER, firstInstallmentDate DATETIME, nextDueDate DATETIME, remainingBalance REAL NOT NULL DEFAULT 0, totalPaidAmount REAL NOT NULL DEFAULT 0,
    CONSTRAINT "Loan_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Loan_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "Beneficiary" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO Loan VALUES('c7d638dc-e30e-4d46-83cf-e54cfcb92caa','L-2026-0001',NULL,'ca63f867-b1e7-4639-8980-dc9c23aefb29',5000,'BUSINESS','test','test','2026-07-25T12:31:03.057+00:00','2026-07-25T12:31:03.056+00:00','COMPLETED','','2026-07-25T12:31:03.057+00:00','2026-07-25T17:34:08.086+00:00',NULL,NULL,'MONTHLY',NULL,NULL,NULL,NULL,0.0,5000.0);
INSERT INTO Loan VALUES('3fd7fdec-00c3-493b-b7c3-3bb0e8a396ba','L-2026-0002',NULL,'ca63f867-b1e7-4639-8980-dc9c23aefb29',500,'BUSINESS','Ggs','Ysh','2026-07-25T17:11:06.634+00:00','2026-07-25T17:11:06.632+00:00','COMPLETED','','2026-07-25T17:11:06.634+00:00','2026-07-25T17:16:48.664+00:00',NULL,NULL,'DAILY',0.0,0,'2026-07-24T00:00:00.000+00:00',NULL,0.0,500.0);
INSERT INTO Loan VALUES('2f690bea-2354-43b0-9431-49f7564ed6bb','L-2026-0003',NULL,'ca63f867-b1e7-4639-8980-dc9c23aefb29',100,'OTHER',NULL,'test','2026-07-26T10:20:09.395+00:00','2026-07-26T10:20:09.393+00:00','ACTIVE','','2026-07-26T10:20:09.395+00:00','2026-07-26T10:20:09.395+00:00',NULL,NULL,'MONTHLY',0.0,0,'2026-07-26T10:19:41.076+00:00','2026-07-26T10:19:41.076+00:00',100.0,0.0);
CREATE TABLE IF NOT EXISTS "LoanRepayment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "loanId" TEXT NOT NULL,
    "ledgerTransactionId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT, installmentNo INTEGER, paymentMethod TEXT, referenceNumber TEXT, collectedBy TEXT, notes TEXT, receiptUrl TEXT,
    CONSTRAINT "LoanRepayment_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LoanRepayment_ledgerTransactionId_fkey" FOREIGN KEY ("ledgerTransactionId") REFERENCES "LedgerTransaction" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO LoanRepayment VALUES('8076e47f-1dbb-4c1f-88c0-9b9d783ee506','c7d638dc-e30e-4d46-83cf-e54cfcb92caa','dc2983ca-5ef1-4c81-a585-b1297af7197c',1000,'2026-07-25T12:32:46.708+00:00','COMPLETED','2026-07-25T12:32:46.710+00:00','2026-07-25T12:32:46.710+00:00',NULL,NULL,NULL,'CASH',NULL,NULL,NULL,NULL);
INSERT INTO LoanRepayment VALUES('ddde03ca-0440-4bd6-9113-9da4bb78a59f','3fd7fdec-00c3-493b-b7c3-3bb0e8a396ba','2ae3c7d4-3e98-495f-af05-5b1a6f4a5047',500,'2026-07-25T17:16:11.375+00:00','COMPLETED','2026-07-25T17:16:48.647+00:00','2026-07-25T17:16:48.647+00:00',NULL,NULL,1,'CASH','','','','');
INSERT INTO LoanRepayment VALUES('d2ac620c-71db-4615-8b76-6183f5a234bc','c7d638dc-e30e-4d46-83cf-e54cfcb92caa','e7e8f1a8-9400-45c9-8da1-702c3dca766e',4000,'2026-07-25T17:34:03.337+00:00','COMPLETED','2026-07-25T17:34:08.017+00:00','2026-07-25T17:34:08.017+00:00',NULL,NULL,2,'CASH','','','','');
CREATE TABLE IF NOT EXISTS "Grant" (
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
CREATE TABLE IF NOT EXISTS "FundAllocation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fundId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "loanId" TEXT,
    "grantId" TEXT,
    "amount" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    CONSTRAINT "FundAllocation_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "Fund" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FundAllocation_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loan" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FundAllocation_grantId_fkey" FOREIGN KEY ("grantId") REFERENCES "Grant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO FundAllocation VALUES('6c2d9a89-981b-4244-9575-e9ed09fa0a65','ffa0b538-cd4b-43a6-99e6-4b82db43f2e6','LOAN','c7d638dc-e30e-4d46-83cf-e54cfcb92caa',NULL,2500,'2026-07-25T12:31:03.662+00:00','2026-07-25T12:31:03.662+00:00',NULL,NULL);
INSERT INTO FundAllocation VALUES('4aa158a6-a092-42e6-94a4-f8a83fd4b5b3','7295a200-4269-4a29-a56f-a736ba2552cd','LOAN','c7d638dc-e30e-4d46-83cf-e54cfcb92caa',NULL,2500,'2026-07-25T12:31:03.662+00:00','2026-07-25T12:31:03.662+00:00',NULL,NULL);
INSERT INTO FundAllocation VALUES('92d8c233-80dc-4ef6-bf0e-7ec42e611468','ffa0b538-cd4b-43a6-99e6-4b82db43f2e6','LOAN','3fd7fdec-00c3-493b-b7c3-3bb0e8a396ba',NULL,250,'2026-07-25T17:11:06.752+00:00','2026-07-25T17:11:06.752+00:00',NULL,NULL);
INSERT INTO FundAllocation VALUES('200af3b4-15ed-44ab-bffb-61e29e77894f','7295a200-4269-4a29-a56f-a736ba2552cd','LOAN','3fd7fdec-00c3-493b-b7c3-3bb0e8a396ba',NULL,250,'2026-07-25T17:11:06.752+00:00','2026-07-25T17:11:06.752+00:00',NULL,NULL);
INSERT INTO FundAllocation VALUES('9a8bf38d-bd3b-44c3-b63c-69da0d8c8df9','ffa0b538-cd4b-43a6-99e6-4b82db43f2e6','LOAN','2f690bea-2354-43b0-9431-49f7564ed6bb',NULL,100,'2026-07-26T10:20:09.568+00:00','2026-07-26T10:20:09.568+00:00',NULL,NULL);
CREATE TABLE IF NOT EXISTS "DocumentCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
CREATE TABLE IF NOT EXISTS "Document" (
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
    CONSTRAINT "Document_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO Document VALUES('2b6128f6-55d7-429d-9716-e702b6367a91','DOC-1784981776450-SIG','Signature',NULL,'IMAGE','foundation/members/signatures/xblggrqczli9h9jox7yq','https://res.cloudinary.com/diwp8ug1r/image/upload/v1784981775/foundation/members/signatures/xblggrqczli9h9jox7yq.png','signature.jpg','image/jpeg',219764,'auto','MEMBER',NULL,NULL,NULL,'ACTIVE',NULL,NULL,'a7c5157f-b9af-4c2f-abaf-93ff950bdbff',NULL,NULL,NULL,NULL,NULL,'2026-07-25T12:16:16.451+00:00','2026-07-25T12:16:16.451+00:00',NULL,NULL);
INSERT INTO Document VALUES('7c9b1bb3-7c37-4f58-98a7-696d67bf6e08','DOC-1784981778059-BC','Birth Certificate',NULL,'IMAGE','foundation/members/ids/bjzlatkneganrfewrr9k','https://res.cloudinary.com/diwp8ug1r/image/upload/v1784981777/foundation/members/ids/bjzlatkneganrfewrr9k.png','birth_certificate.jpg','image/jpeg',219764,'auto','MEMBER',NULL,NULL,NULL,'ACTIVE',NULL,NULL,'a7c5157f-b9af-4c2f-abaf-93ff950bdbff',NULL,NULL,NULL,NULL,NULL,'2026-07-25T12:16:18.060+00:00','2026-07-25T12:16:18.060+00:00',NULL,NULL);
INSERT INTO Document VALUES('8419f19a-4b93-44f8-97ef-0bf6a4d617b7','DOC-1784982398440-SIG','Signature',NULL,'IMAGE','foundation/members/signatures/sctn7ujmwnd4avnc5nll','https://res.cloudinary.com/diwp8ug1r/image/upload/v1784982397/foundation/members/signatures/sctn7ujmwnd4avnc5nll.png','signature.jpg','image/jpeg',219764,'auto','MEMBER',NULL,NULL,NULL,'ACTIVE',NULL,NULL,'4d640f50-dd02-468a-9fcc-8c7aea6eed4c',NULL,NULL,NULL,NULL,NULL,'2026-07-25T12:26:38.441+00:00','2026-07-25T12:26:38.441+00:00',NULL,NULL);
INSERT INTO Document VALUES('5508347a-80f4-4e86-a16f-21924827b3cf','DOC-1784982400093-BC','Birth Certificate',NULL,'IMAGE','foundation/members/ids/brw9k63qczsw7wcafvtg','https://res.cloudinary.com/diwp8ug1r/image/upload/v1784982399/foundation/members/ids/brw9k63qczsw7wcafvtg.png','birth_certificate.jpg','image/jpeg',219764,'auto','MEMBER',NULL,NULL,NULL,'ACTIVE',NULL,NULL,'4d640f50-dd02-468a-9fcc-8c7aea6eed4c',NULL,NULL,NULL,NULL,NULL,'2026-07-25T12:26:40.094+00:00','2026-07-25T12:26:40.094+00:00',NULL,NULL);
INSERT INTO Document VALUES('7a628871-3fc8-49a8-bff4-f80515c95ef9','DOC-1784982633086-SIG','Signature',NULL,'IMAGE','foundation/beneficiaries/signatures/yrjflfl1ofa17nhm6scm','https://res.cloudinary.com/diwp8ug1r/image/upload/v1784982632/foundation/beneficiaries/signatures/yrjflfl1ofa17nhm6scm.png','signature.jpg','image/jpeg',219764,'auto','BENEFICIARY',NULL,NULL,NULL,'ACTIVE',NULL,NULL,NULL,'ca63f867-b1e7-4639-8980-dc9c23aefb29',NULL,NULL,NULL,NULL,'2026-07-25T12:30:33.087+00:00','2026-07-25T12:30:33.087+00:00',NULL,NULL);
INSERT INTO Document VALUES('4a9e1f1d-63ec-4a6c-8a1a-97add861a998','DOC-1784982634737-BC','Birth Certificate',NULL,'IMAGE','foundation/beneficiaries/ids/vf1cp6vk5gntymmhj0xy','https://res.cloudinary.com/diwp8ug1r/image/upload/v1784982634/foundation/beneficiaries/ids/vf1cp6vk5gntymmhj0xy.png','birth_certificate.jpg','image/jpeg',219764,'auto','BENEFICIARY',NULL,NULL,NULL,'ACTIVE',NULL,NULL,NULL,'ca63f867-b1e7-4639-8980-dc9c23aefb29',NULL,NULL,NULL,NULL,'2026-07-25T12:30:34.738+00:00','2026-07-25T12:30:34.738+00:00',NULL,NULL);
INSERT INTO Document VALUES('da544d9d-e2d3-4610-8aa4-c635172981b5','DOC-1785033740451-SIG','Signature',NULL,'IMAGE','foundation/members/signatures/jhnuytbmslm4rpfjwmln','https://res.cloudinary.com/diwp8ug1r/image/upload/v1785033739/foundation/members/signatures/jhnuytbmslm4rpfjwmln.png','signature.jpg','image/jpeg',219764,'auto','MEMBER',NULL,NULL,NULL,'ACTIVE',NULL,NULL,'7f1aa3a8-73e0-436a-ad58-23b69292b79e',NULL,NULL,NULL,NULL,NULL,'2026-07-26T02:42:20.453+00:00','2026-07-26T02:42:20.453+00:00',NULL,NULL);
INSERT INTO Document VALUES('78c30eb0-47c6-4b7b-9609-411d0bed3a5d','DOC-1785033741980-NIDF','NID Front',NULL,'IMAGE','foundation/members/ids/up0n4m2njcglg5o3twhg','https://res.cloudinary.com/diwp8ug1r/image/upload/v1785033741/foundation/members/ids/up0n4m2njcglg5o3twhg.png','nid_front.jpg','image/jpeg',219764,'auto','MEMBER',NULL,NULL,NULL,'ACTIVE',NULL,NULL,'7f1aa3a8-73e0-436a-ad58-23b69292b79e',NULL,NULL,NULL,NULL,NULL,'2026-07-26T02:42:21.981+00:00','2026-07-26T02:42:21.981+00:00',NULL,NULL);
INSERT INTO Document VALUES('0e29535f-a237-4fde-8965-3236b42f6e9a','DOC-1785033743709-NIDB','NID Back',NULL,'IMAGE','foundation/members/ids/biwej7cvzq8pol8bwloi','https://res.cloudinary.com/diwp8ug1r/image/upload/v1785033742/foundation/members/ids/biwej7cvzq8pol8bwloi.png','nid_back.jpg','image/jpeg',219764,'auto','MEMBER',NULL,NULL,NULL,'ACTIVE',NULL,NULL,'7f1aa3a8-73e0-436a-ad58-23b69292b79e',NULL,NULL,NULL,NULL,NULL,'2026-07-26T02:42:23.710+00:00','2026-07-26T02:42:23.710+00:00',NULL,NULL);
CREATE TABLE IF NOT EXISTS "Campaign" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campaignId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "description" TEXT,
    "targetAmount" INTEGER,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "remarks" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT
);
INSERT INTO Campaign VALUES('eaf6449d-f510-4926-b735-efa92cac1c61','CMP-0001','test','test','',NULL,'2026-07-25T00:00:00.000+00:00',NULL,'ACTIVE','','2026-07-25T12:28:13.111+00:00','2026-07-25T12:28:13.111+00:00',NULL,NULL);
CREATE TABLE IF NOT EXISTS "CampaignContribution" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campaignId" TEXT NOT NULL,
    "memberId" TEXT,
    "donorId" TEXT,
    "ledgerTransactionId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "remarks" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    CONSTRAINT "CampaignContribution_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CampaignContribution_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "CampaignContribution_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "Donor" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "CampaignContribution_ledgerTransactionId_fkey" FOREIGN KEY ("ledgerTransactionId") REFERENCES "LedgerTransaction" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO CampaignContribution VALUES('b78be9ce-bc17-4624-984f-86990083139e','eaf6449d-f510-4926-b735-efa92cac1c61',NULL,'0b2ab7ca-348f-4d83-bb3d-0ea359a2d1ab','879a9603-291a-4bbf-b692-37ea87043b0d',500,'2026-07-25T00:00:00.000+00:00','','2026-07-25T12:28:55.886+00:00','2026-07-25T12:28:55.886+00:00',NULL,NULL);
CREATE TABLE IF NOT EXISTS "Settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT
);
INSERT INTO Settings VALUES('82868a8b-94b4-441d-ade5-fd8c1dc0d198','SYSTEM_CURRENCY','USD','Default system currency','2026-07-25T11:53:43.260+00:00','2026-07-25T11:53:43.260+00:00',NULL,NULL);
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT,
    "mobile" TEXT,
    "password" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "lastLogin" DATETIME,
    "photo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL, "preferences" TEXT,
    CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO User VALUES('3925a03f-e627-49bc-b40d-a588e38da103','System Administrator','admin','admin@foundation.local',NULL,'$2b$10$3Ety8VN47LTQtZBqMpteAefJ5RykK9zMTnmzKNAY3mF/x7s3Xzipy','23211d45-3d04-468a-a87d-274bfb89ec84','ACTIVE','2026-07-30T06:27:53.203+00:00','/uploads/profiles/0d96746f26de40d81b7a44343492c3a2.jpg','2026-07-25T11:53:43.545+00:00','2026-07-30T06:27:53.204+00:00','{"language":"bn","theme":"system","dateFormatOverride":"","timeFormat":"12h","tableDensity":"comfortable","defaultDashboard":"overview","itemsPerPage":"10"}');
CREATE TABLE IF NOT EXISTS "UserSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "jti" TEXT NOT NULL,
    "device" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "ipAddress" TEXT,
    "lastActive" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO UserSession VALUES('19cbfcaa-7a83-4ca6-82fa-e677f3b7849f','3925a03f-e627-49bc-b40d-a588e38da103','7aca2200-47f0-4c85-a303-dcaafefe1e14','Desktop','Chrome','Windows','103.145.133.245','2026-07-30T05:17:07.626+00:00','2026-07-31T05:00:41.959+00:00','2026-07-30T05:00:41.961+00:00');
INSERT INTO UserSession VALUES('64254559-8da1-4a18-b1aa-9ae1e7fd706c','3925a03f-e627-49bc-b40d-a588e38da103','704125c2-ec73-40fd-8a52-5a8ffa5939ea','Mobile','Chrome','Android','103.145.133.245','2026-07-30T05:36:26.079+00:00','2026-07-31T05:36:26.077+00:00','2026-07-30T05:36:26.079+00:00');
INSERT INTO UserSession VALUES('a717c307-0a5d-45ac-a345-1b4ce060cbbb','3925a03f-e627-49bc-b40d-a588e38da103','b2dc8d37-d625-46c4-aed8-0949ed0d8164','Mobile','Chrome','Android','103.145.133.245','2026-07-30T05:42:03.011+00:00','2026-07-31T05:42:03.010+00:00','2026-07-30T05:42:03.011+00:00');
INSERT INTO UserSession VALUES('fc7460c1-ce2e-4b28-83ff-932dde7a8a53','3925a03f-e627-49bc-b40d-a588e38da103','35c0a307-6886-4b05-80bb-08cb33ebd234','Desktop','Chrome','Windows','103.145.133.245','2026-07-30T06:02:12.108+00:00','2026-07-31T06:02:12.106+00:00','2026-07-30T06:02:12.108+00:00');
INSERT INTO UserSession VALUES('7a4cccab-9652-4dfa-bb92-5bdaad254d80','3925a03f-e627-49bc-b40d-a588e38da103','afd58f2f-3425-4766-9914-294b582e49b6','Desktop','Chrome','Windows','103.145.133.245','2026-07-30T06:08:49.410+00:00','2026-07-31T06:08:49.409+00:00','2026-07-30T06:08:49.410+00:00');
INSERT INTO UserSession VALUES('a35a5f80-1ae4-4545-b816-8957ecf69cc2','3925a03f-e627-49bc-b40d-a588e38da103','137d2750-6295-427b-8eb4-e7b953b6d94e','Desktop','Chrome','Windows','103.145.133.245','2026-07-30T06:19:18.170+00:00','2026-07-31T06:12:31.148+00:00','2026-07-30T06:12:31.149+00:00');
INSERT INTO UserSession VALUES('775355be-f60d-456a-9bb3-edfed4f1d970','3925a03f-e627-49bc-b40d-a588e38da103','13c9f9da-563c-4379-9afc-b7e085a53c27','Desktop','Chrome','Windows','103.145.133.245','2026-07-30T06:24:58.024+00:00','2026-07-31T06:24:58.023+00:00','2026-07-30T06:24:58.024+00:00');
INSERT INTO UserSession VALUES('e107abfe-eb72-4936-a63f-8011b5801159','3925a03f-e627-49bc-b40d-a588e38da103','5462688f-e62f-4101-8711-cc784635ebe0','Desktop','Chrome','Windows','103.145.133.245','2026-07-30T06:27:53.284+00:00','2026-07-31T06:27:53.283+00:00','2026-07-30T06:27:53.284+00:00');
CREATE TABLE IF NOT EXISTS "Role" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO Role VALUES('82ed43b0-3739-45a4-91f9-6f1be47d8460','SUPER_ADMIN','Super Administrator with full access','2026-07-25T11:53:43.353+00:00','2026-07-25T11:53:43.353+00:00');
INSERT INTO Role VALUES('23211d45-3d04-468a-a87d-274bfb89ec84','Super Admin',NULL,'2026-07-30T05:40:26.772+00:00','2026-07-30T05:40:26.772+00:00');
INSERT INTO Role VALUES('647111ce-6e71-4663-b9f3-bb8339bc8b59','Admin',NULL,'2026-07-30T05:40:27.027+00:00','2026-07-30T05:40:27.027+00:00');
INSERT INTO Role VALUES('1d500227-b381-4e80-bcf0-6e5ba73d80f4','Manager',NULL,'2026-07-30T05:40:27.283+00:00','2026-07-30T05:40:27.283+00:00');
INSERT INTO Role VALUES('32755bfb-e16b-4088-bffd-49226112760c','Cashier',NULL,'2026-07-30T05:40:27.543+00:00','2026-07-30T05:40:27.543+00:00');
INSERT INTO Role VALUES('4de0da2c-5f36-45de-8b5c-399246259458','Employee',NULL,'2026-07-30T05:40:27.822+00:00','2026-07-30T05:40:27.822+00:00');
CREATE TABLE IF NOT EXISTS "Permission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "module" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT
);
INSERT INTO Permission VALUES('e6a41b90-5da7-4aa0-9659-35634e79fe24','Dashboard','View Dashboard',NULL);
INSERT INTO Permission VALUES('efb6d5c2-ebee-4158-a4f3-62d030def7c9','Dashboard','View Financial Cards',NULL);
INSERT INTO Permission VALUES('5d59dfd5-e5b3-4dd8-821f-08ea60eccc26','Dashboard','View Loan Summary',NULL);
INSERT INTO Permission VALUES('8b532358-3cdc-4818-8897-bd6070e0cb01','Dashboard','View Donation Summary',NULL);
INSERT INTO Permission VALUES('46e617ef-a016-4778-a636-ce2b0b202303','Dashboard','View Reports',NULL);
INSERT INTO Permission VALUES('4cc8c201-2d72-4d38-a6f3-73b30a53852b','Dashboard','View Charts',NULL);
INSERT INTO Permission VALUES('e7642fbc-4965-4c72-be44-6b514f62ab51','Members','View',NULL);
INSERT INTO Permission VALUES('9fda5a56-75bc-4247-b029-e9e196e491a3','Members','Add',NULL);
INSERT INTO Permission VALUES('16c4b1d7-0468-4dab-ac72-f8e579afda0b','Members','Edit',NULL);
INSERT INTO Permission VALUES('0608e171-5069-4854-a253-f092eeb34f95','Members','Delete',NULL);
INSERT INTO Permission VALUES('d832d1d9-5fca-4375-a568-2089707f5638','Beneficiaries','View',NULL);
INSERT INTO Permission VALUES('4b40d1cf-a8d7-425e-b3cb-b26e106a0042','Beneficiaries','Add',NULL);
INSERT INTO Permission VALUES('cc0bb0ad-cf2b-4e20-b936-c0e1652fc9f5','Beneficiaries','Edit',NULL);
INSERT INTO Permission VALUES('0bf13f0d-4100-4aac-9405-8f257cda87cb','Beneficiaries','Delete',NULL);
INSERT INTO Permission VALUES('ad54b434-6654-4586-b5e5-ea282aed3ad4','Donors','View',NULL);
INSERT INTO Permission VALUES('5d88ebdd-1072-4661-bf71-2194125cf2b0','Donors','Add',NULL);
INSERT INTO Permission VALUES('02cdd6dd-9039-4f1a-9b2e-4d179ba8f903','Donors','Edit',NULL);
INSERT INTO Permission VALUES('c35edda8-deae-4c08-a3bc-eeffc6c4ba13','Donors','Delete',NULL);
INSERT INTO Permission VALUES('49caf2b3-72f9-4dbf-a091-21bc3a174617','Fund Collection','View',NULL);
INSERT INTO Permission VALUES('1be5d73c-9dd8-4453-9127-d926c1f1fa77','Fund Collection','Add',NULL);
INSERT INTO Permission VALUES('ce3a70b3-d96a-45a8-b954-ef1f87541020','Fund Collection','Edit',NULL);
INSERT INTO Permission VALUES('5a391d94-12d8-4ab4-bcbc-0db41431a6d7','Fund Collection','Delete',NULL);
INSERT INTO Permission VALUES('9b7bb272-7aee-4e19-94ab-514b3415d576','Financial Support','View',NULL);
INSERT INTO Permission VALUES('96f34658-4ecd-4f51-8a93-ccba3bd74fe1','Financial Support','Add',NULL);
INSERT INTO Permission VALUES('bf188890-339c-4e61-bbb6-657c502e6b69','Financial Support','Edit',NULL);
INSERT INTO Permission VALUES('d9f4df7b-733e-45f9-a3e0-8ef74a7d8acd','Financial Support','Delete',NULL);
INSERT INTO Permission VALUES('ed800e55-fbc3-4cad-9605-41ece12032d6','Loans','View',NULL);
INSERT INTO Permission VALUES('1532fc7d-5d67-4ef9-906d-e050cd6aa014','Loans','Create',NULL);
INSERT INTO Permission VALUES('7c0134fb-a062-4be3-b407-216fb587d40d','Loans','Edit',NULL);
INSERT INTO Permission VALUES('4161715d-cfbf-4d24-be51-761abbc3683a','Loans','Delete',NULL);
INSERT INTO Permission VALUES('292ba8c3-343d-4a1e-acd3-a47f674d30d8','Loans','Approve',NULL);
INSERT INTO Permission VALUES('d891d824-939e-41a6-a0a2-9aee2cd57478','Loans','Receive Installment',NULL);
INSERT INTO Permission VALUES('d70e449e-117a-4f25-ad60-3d6de445be58','Grants','View',NULL);
INSERT INTO Permission VALUES('300fdd22-b894-49e4-8469-dd5cb0718389','Grants','Create',NULL);
INSERT INTO Permission VALUES('c98f1090-edca-4e82-9b55-dc8874428c1e','Grants','Edit',NULL);
INSERT INTO Permission VALUES('a31761a8-0858-4b2a-9f40-930142989313','Grants','Delete',NULL);
INSERT INTO Permission VALUES('ae6b52ef-0223-4e3e-a6a7-9c1482f9b8c3','Grants','Approve',NULL);
INSERT INTO Permission VALUES('708c8d5a-192f-4d56-b701-ac0855e00588','Groups','View',NULL);
INSERT INTO Permission VALUES('3a86d1d0-9c0a-453c-9033-e3a2c885799a','Groups','Create',NULL);
INSERT INTO Permission VALUES('783193a3-ad50-44b2-8367-4e305c94ca9a','Groups','Edit',NULL);
INSERT INTO Permission VALUES('5d9a7231-c726-4ba6-8dc7-441dea5a85f0','Groups','Delete',NULL);
INSERT INTO Permission VALUES('d1a76b48-c755-427b-9e67-a06097543d54','Reports','View',NULL);
INSERT INTO Permission VALUES('d3fafc83-fbe2-4c83-805b-498f1e5c5013','Settings','View',NULL);
INSERT INTO Permission VALUES('acd3ab69-3cae-4a83-b69b-6ee5fa4cdbfb','Settings','Edit',NULL);
INSERT INTO Permission VALUES('8fbb2e5a-6a57-4e76-91c0-00f8c6817247','Users','View',NULL);
INSERT INTO Permission VALUES('09e7bb90-5a10-4875-b8cc-400fcd79aaac','Users','Create',NULL);
INSERT INTO Permission VALUES('1df2114e-1e14-449a-8103-52ef53c0b9d0','Users','Edit',NULL);
INSERT INTO Permission VALUES('9b82e448-df73-4729-b26f-42d412a99bab','Users','Delete',NULL);
INSERT INTO Permission VALUES('307ddd94-576f-475c-a77c-4afb26724c3a','Roles & Permissions','View',NULL);
INSERT INTO Permission VALUES('06653730-8857-4662-8e25-998f27982245','Roles & Permissions','Manage',NULL);
CREATE TABLE IF NOT EXISTS "RolePermission" (
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,

    PRIMARY KEY ("roleId", "permissionId"),
    CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "referenceId" TEXT,
    "oldValue" TEXT,
    "newValue" TEXT,
    "ipAddress" TEXT,
    "device" TEXT,
    "browser" TEXT,
    "remarks" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO AuditLog VALUES('ad9d0d12-1920-408b-90c7-f68b9e0c240d','3925a03f-e627-49bc-b40d-a588e38da103','LOGIN','AUTHENTICATION',NULL,NULL,NULL,'103.145.133.244, 152.233.68.98','Desktop','Chrome',NULL,'2026-07-25T12:07:44.467+00:00');
INSERT INTO AuditLog VALUES('369369e6-2aec-4a77-b70f-4905f61f7a4f','3925a03f-e627-49bc-b40d-a588e38da103','LOGIN','AUTHENTICATION',NULL,NULL,NULL,'103.145.133.244, 152.233.68.97','Mobile','Chrome',NULL,'2026-07-25T12:36:26.424+00:00');
INSERT INTO AuditLog VALUES('d1f1bb45-120b-4fad-b056-742dac381e3d','3925a03f-e627-49bc-b40d-a588e38da103','LOGIN','AUTHENTICATION',NULL,NULL,NULL,'103.145.133.245','Mobile','Chrome',NULL,'2026-07-25T13:20:07.352+00:00');
INSERT INTO AuditLog VALUES('40fbdf81-9436-4822-b997-e74944192d95','3925a03f-e627-49bc-b40d-a588e38da103','LOGIN','AUTHENTICATION',NULL,NULL,NULL,'103.145.133.245','Desktop','Chrome',NULL,'2026-07-25T13:23:16.348+00:00');
INSERT INTO AuditLog VALUES('c3bafc48-9591-45bf-86c3-d87babe527c0','3925a03f-e627-49bc-b40d-a588e38da103','LOGIN','AUTHENTICATION',NULL,NULL,NULL,'103.145.133.247','Desktop','Chrome',NULL,'2026-07-25T17:09:52.753+00:00');
INSERT INTO AuditLog VALUES('50694054-c265-4389-8b1a-1a7aa3632633','3925a03f-e627-49bc-b40d-a588e38da103','LOGIN','AUTHENTICATION',NULL,NULL,NULL,'103.145.133.246, 152.233.68.98','Desktop','Chrome',NULL,'2026-07-25T17:33:36.185+00:00');
INSERT INTO AuditLog VALUES('e2577375-89fc-4a76-9bd5-c53978c55718','3925a03f-e627-49bc-b40d-a588e38da103','LOGIN','AUTHENTICATION',NULL,NULL,NULL,'103.145.133.244, 152.233.68.97','Desktop','Chrome',NULL,'2026-07-26T02:41:04.815+00:00');
INSERT INTO AuditLog VALUES('6a411093-ca1e-4cf7-aa18-4c23dd54fe94','3925a03f-e627-49bc-b40d-a588e38da103','LOGIN','AUTHENTICATION',NULL,NULL,NULL,'103.145.133.247','Mobile','Chrome',NULL,'2026-07-26T03:42:44.061+00:00');
INSERT INTO AuditLog VALUES('7670ea37-6017-493b-bf69-76356fe16db8','3925a03f-e627-49bc-b40d-a588e38da103','LOGIN','AUTHENTICATION',NULL,NULL,NULL,'103.145.133.245','Desktop','Chrome',NULL,'2026-07-26T04:04:53.916+00:00');
INSERT INTO AuditLog VALUES('342e6100-983c-4eee-b799-28f23138b8d1','3925a03f-e627-49bc-b40d-a588e38da103','LOGIN','AUTHENTICATION',NULL,NULL,NULL,'103.145.133.245','Desktop','Chrome',NULL,'2026-07-26T04:11:31.259+00:00');
INSERT INTO AuditLog VALUES('2176b1e7-80f3-4c41-8257-1d722ab8fba4','3925a03f-e627-49bc-b40d-a588e38da103','LOGIN','AUTHENTICATION',NULL,NULL,NULL,'103.145.133.245','Mobile','Chrome',NULL,'2026-07-26T04:16:09.679+00:00');
INSERT INTO AuditLog VALUES('17ac0c01-bb63-4768-95f2-14e473c926dc','3925a03f-e627-49bc-b40d-a588e38da103','LOGIN','AUTHENTICATION',NULL,NULL,NULL,'103.145.133.245','Desktop','Chrome',NULL,'2026-07-26T06:01:08.582+00:00');
INSERT INTO AuditLog VALUES('b55192f2-385c-4c55-811c-94165d7696c8','3925a03f-e627-49bc-b40d-a588e38da103','LOGIN','AUTHENTICATION',NULL,NULL,NULL,'103.145.133.245','Mobile','Chrome',NULL,'2026-07-26T06:02:13.184+00:00');
INSERT INTO AuditLog VALUES('acf72b61-841b-45e4-b063-96ee09dd78b6','3925a03f-e627-49bc-b40d-a588e38da103','LOGIN','AUTHENTICATION',NULL,NULL,NULL,'103.145.133.245','Desktop','Chrome',NULL,'2026-07-26T06:08:37.244+00:00');
INSERT INTO AuditLog VALUES('07eebbf0-d445-4a46-bf50-89f6d945199d','3925a03f-e627-49bc-b40d-a588e38da103','LOGIN','AUTHENTICATION',NULL,NULL,NULL,'103.145.133.245','Desktop','Chrome',NULL,'2026-07-26T06:26:52.070+00:00');
INSERT INTO AuditLog VALUES('80ab8d2a-3ed9-46d7-943a-bcc8f4c934d2','3925a03f-e627-49bc-b40d-a588e38da103','LOGIN','AUTHENTICATION',NULL,NULL,NULL,'103.145.133.245','Mobile','Chrome',NULL,'2026-07-26T08:26:03.978+00:00');
INSERT INTO AuditLog VALUES('e5627fe5-f383-4e3d-b8de-de365910b71e','3925a03f-e627-49bc-b40d-a588e38da103','LOGIN','AUTHENTICATION',NULL,NULL,NULL,'103.145.133.244, 152.233.68.98','Desktop','Chrome',NULL,'2026-07-26T09:24:57.812+00:00');
INSERT INTO AuditLog VALUES('54cd8c9d-4ab4-4a31-b460-e3b5244379d5','3925a03f-e627-49bc-b40d-a588e38da103','LOGIN','AUTHENTICATION',NULL,NULL,NULL,'103.145.133.245','Mobile','Chrome',NULL,'2026-07-26T09:33:01.721+00:00');
INSERT INTO AuditLog VALUES('f215ed34-8f76-4966-b7e9-03ce816fc6c3','3925a03f-e627-49bc-b40d-a588e38da103','LOGIN','AUTHENTICATION',NULL,NULL,NULL,'103.145.133.245','Mobile','Chrome',NULL,'2026-07-26T09:45:02.038+00:00');
INSERT INTO AuditLog VALUES('5aab75d7-0b62-4c04-acd1-c3fbb0e71422','3925a03f-e627-49bc-b40d-a588e38da103','LOGIN','AUTHENTICATION',NULL,NULL,NULL,'103.145.133.245','Desktop','Chrome',NULL,'2026-07-26T10:19:00.817+00:00');
INSERT INTO AuditLog VALUES('9c57ced3-3844-41b9-8afb-262d9837355c','3925a03f-e627-49bc-b40d-a588e38da103','LOGIN','AUTHENTICATION',NULL,NULL,NULL,'103.145.133.245','Mobile','Chrome',NULL,'2026-07-26T10:42:37.188+00:00');
INSERT INTO AuditLog VALUES('92e26ab6-b1f6-45f1-8a83-be1e39ec7f0b','3925a03f-e627-49bc-b40d-a588e38da103','LOGIN','AUTHENTICATION',NULL,NULL,NULL,'103.145.133.245','Desktop','Chrome',NULL,'2026-07-26T10:44:13.789+00:00');
INSERT INTO AuditLog VALUES('e06bb1e7-2590-4b8d-99ba-d00093acbdb1','3925a03f-e627-49bc-b40d-a588e38da103','LOGIN','AUTHENTICATION',NULL,NULL,NULL,'203.76.223.125, 152.233.68.98','Desktop','Edge',NULL,'2026-07-30T03:57:53.588+00:00');
INSERT INTO AuditLog VALUES('eef605ea-2ae6-4be8-9242-dc770262620f','3925a03f-e627-49bc-b40d-a588e38da103','LOGIN','AUTHENTICATION',NULL,NULL,NULL,'103.145.133.244, 152.233.15.120','Desktop','Chrome',NULL,'2026-07-30T04:25:44.536+00:00');
INSERT INTO AuditLog VALUES('85e18076-0c1b-407b-a4c7-5f2d93675bbe','3925a03f-e627-49bc-b40d-a588e38da103','LOGIN','AUTHENTICATION',NULL,NULL,NULL,'103.145.133.245','Desktop','Chrome',NULL,'2026-07-30T04:50:39.313+00:00');
INSERT INTO AuditLog VALUES('3eedc86c-db08-472e-8d53-f523ae9d8b5a','3925a03f-e627-49bc-b40d-a588e38da103','LOGIN','AUTHENTICATION',NULL,NULL,NULL,'2404:1c40:16e:9eb9:18c6:dcd9:adb0:9256','Mobile','Chrome',NULL,'2026-07-30T04:51:51.703+00:00');
INSERT INTO AuditLog VALUES('423f82d3-9685-4b2f-bdf5-ed281b6c9f9a','3925a03f-e627-49bc-b40d-a588e38da103','LOGIN','AUTHENTICATION',NULL,NULL,NULL,'103.145.133.245','Desktop','Chrome',NULL,'2026-07-30T05:00:41.743+00:00');
INSERT INTO AuditLog VALUES('11c63735-e489-4a80-8cf8-dabd782d1411','3925a03f-e627-49bc-b40d-a588e38da103','LOGIN','AUTHENTICATION',NULL,NULL,NULL,'103.145.133.245','Mobile','Chrome',NULL,'2026-07-30T05:36:25.888+00:00');
INSERT INTO AuditLog VALUES('258dbbcf-e78d-4659-8ca2-926cfadd3057','3925a03f-e627-49bc-b40d-a588e38da103','LOGIN','AUTHENTICATION',NULL,NULL,NULL,'103.145.133.245','Mobile','Chrome',NULL,'2026-07-30T05:42:02.851+00:00');
INSERT INTO AuditLog VALUES('46e5578f-63d1-41fe-a9f5-2b1c3c76bb07',NULL,'UPDATE','SETTINGS','FoundationProfile',NULL,NULL,NULL,NULL,NULL,'Updated Foundation Profile','2026-07-30T05:43:38.868+00:00');
INSERT INTO AuditLog VALUES('2a459b26-fbfc-4a59-9329-e6628fcc4d4e','3925a03f-e627-49bc-b40d-a588e38da103','LOGIN','AUTHENTICATION',NULL,NULL,NULL,'103.145.133.245','Desktop','Chrome',NULL,'2026-07-30T06:02:11.896+00:00');
INSERT INTO AuditLog VALUES('279d1818-70de-41b4-aad5-5a1478d3c16a',NULL,'UPDATE','SETTINGS','SystemSettings',NULL,NULL,NULL,NULL,NULL,'Updated System Settings','2026-07-30T06:02:50.861+00:00');
INSERT INTO AuditLog VALUES('6b0be987-c67b-472d-b354-ca3021369f68',NULL,'UPDATE','SETTINGS','SystemSettings',NULL,NULL,NULL,NULL,NULL,'Updated System Settings','2026-07-30T06:03:57.693+00:00');
INSERT INTO AuditLog VALUES('1e331f82-8aa3-4e62-bbc6-bc5b5b6424ac',NULL,'UPDATE','SETTINGS','SystemSettings',NULL,NULL,NULL,NULL,NULL,'Updated System Settings','2026-07-30T06:05:31.961+00:00');
INSERT INTO AuditLog VALUES('4b41551a-0abb-466f-a137-b94320bc6435','3925a03f-e627-49bc-b40d-a588e38da103','LOGIN','AUTHENTICATION',NULL,NULL,NULL,'103.145.133.245','Desktop','Chrome',NULL,'2026-07-30T06:08:49.227+00:00');
INSERT INTO AuditLog VALUES('7b98000b-b654-40b1-ac40-83261b1924f9',NULL,'UPDATE','SETTINGS','SystemSettings',NULL,NULL,NULL,NULL,NULL,'Updated System Settings','2026-07-30T06:09:16.297+00:00');
INSERT INTO AuditLog VALUES('8d6c6482-46f1-48f9-822e-a8dbc287edee','3925a03f-e627-49bc-b40d-a588e38da103','LOGIN','AUTHENTICATION',NULL,NULL,NULL,'103.145.133.245','Desktop','Chrome',NULL,'2026-07-30T06:12:30.971+00:00');
INSERT INTO AuditLog VALUES('e9cd5ae3-3c0b-45e1-abdf-7e1015d7ac47',NULL,'UPDATE','SETTINGS','SystemSettings',NULL,NULL,NULL,NULL,NULL,'Updated System Settings','2026-07-30T06:13:21.591+00:00');
INSERT INTO AuditLog VALUES('70201982-db01-4e80-8919-1f227f6aeea3','3925a03f-e627-49bc-b40d-a588e38da103','LOGIN','AUTHENTICATION',NULL,NULL,NULL,'103.145.133.245','Desktop','Chrome',NULL,'2026-07-30T06:24:57.847+00:00');
INSERT INTO AuditLog VALUES('c4bbf1e4-fe12-4b23-a0e4-bf7e838e6e10',NULL,'UPDATE','SETTINGS','SystemSettings',NULL,NULL,NULL,NULL,NULL,'Updated System Settings','2026-07-30T06:25:14.849+00:00');
INSERT INTO AuditLog VALUES('7fc3022f-42b0-409f-9724-1524ee80d364',NULL,'UPDATE','SETTINGS','SystemSettings',NULL,NULL,NULL,NULL,NULL,'Updated System Settings','2026-07-30T06:25:44.285+00:00');
INSERT INTO AuditLog VALUES('f17ec3d4-a849-4e45-a634-b9677bd413e8',NULL,'UPDATE','USER','3925a03f-e627-49bc-b40d-a588e38da103',NULL,NULL,NULL,NULL,NULL,'Updated User Preferences','2026-07-30T06:25:56.856+00:00');
INSERT INTO AuditLog VALUES('0c2ba697-3122-4b6e-a76a-094d27582213',NULL,'UPDATE','USER','3925a03f-e627-49bc-b40d-a588e38da103',NULL,NULL,NULL,NULL,NULL,'Updated User Preferences','2026-07-30T06:26:04.032+00:00');
INSERT INTO AuditLog VALUES('d1005cf1-8a40-48ed-9602-5abc2f943544',NULL,'UPDATE','USER','3925a03f-e627-49bc-b40d-a588e38da103',NULL,NULL,NULL,NULL,NULL,'Updated User Preferences','2026-07-30T06:26:12.684+00:00');
INSERT INTO AuditLog VALUES('3ccaf5db-f9cf-4b36-a73c-0c7f74441b1b',NULL,'UPDATE','USER','3925a03f-e627-49bc-b40d-a588e38da103',NULL,NULL,NULL,NULL,NULL,'Updated User Preferences','2026-07-30T06:26:24.428+00:00');
INSERT INTO AuditLog VALUES('988f0359-c9c5-4245-9471-a4d66200ee63',NULL,'EXPORT','SYSTEM',NULL,NULL,NULL,NULL,NULL,NULL,'Triggered Database Backup','2026-07-30T06:26:34.983+00:00');
INSERT INTO AuditLog VALUES('db51ae57-0932-47fb-9d27-1c2cd4b7845d','3925a03f-e627-49bc-b40d-a588e38da103','LOGIN','AUTHENTICATION',NULL,NULL,NULL,'103.145.133.245','Desktop','Chrome',NULL,'2026-07-30T06:27:53.123+00:00');
INSERT INTO AuditLog VALUES('eb9aba26-5428-4397-b8a2-765e9c28b550',NULL,'UPDATE','SETTINGS','SystemSettings',NULL,NULL,NULL,NULL,NULL,'Updated System Settings','2026-07-30T06:28:53.359+00:00');
INSERT INTO AuditLog VALUES('24ffadd1-742e-49da-a263-f21fe178d41e',NULL,'UPDATE','SETTINGS','SystemSettings',NULL,NULL,NULL,NULL,NULL,'Updated System Settings','2026-07-30T06:30:26.146+00:00');
CREATE TABLE IF NOT EXISTS "SystemSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "group" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    "updatedBy" TEXT
);
INSERT INTO SystemSettings VALUES('cc7b01fe-a343-4e9a-b2d1-92e390a2b91e','BRANDING_FOUNDATION_NAME','ভ্রাতৃত্ব ফাউন্ডেশন','Branding','2026-07-30T06:30:25.569+00:00',NULL);
INSERT INTO SystemSettings VALUES('4966fa23-1d70-41a5-ad52-58fbf214994e','BRANDING_SHORT_NAME','','Branding','2026-07-30T06:30:25.669+00:00',NULL);
INSERT INTO SystemSettings VALUES('648b5e25-79bf-4e06-acfb-27b473b34516','BRANDING_LOGO','https://res.cloudinary.com/diwp8ug1r/image/upload/v1785391746/branding/uleyudp5z8gvhtsqxexv.png','Branding','2026-07-30T06:30:25.750+00:00',NULL);
INSERT INTO SystemSettings VALUES('f6633780-e631-492a-9c04-9a4c9c7aa514','BRANDING_FAVICON','https://res.cloudinary.com/diwp8ug1r/image/upload/v1785392913/branding/ztsh6kbhdcbenzdtetju.png','Branding','2026-07-30T06:30:25.832+00:00',NULL);
INSERT INTO SystemSettings VALUES('c915a7b7-182b-4281-bf31-fc8b305b4547','BRANDING_LOGIN_LOGO','https://res.cloudinary.com/diwp8ug1r/image/upload/v1785393014/branding/o4r9o3gjgfkulrgm4bzu.png','Branding','2026-07-30T06:30:25.909+00:00',NULL);
INSERT INTO SystemSettings VALUES('a2fcf019-7cb5-4805-bb1c-a07a2019dfb5','BRANDING_SIDEBAR_LOGO','https://res.cloudinary.com/diwp8ug1r/image/upload/v1785393022/branding/ivddjrudcemitnh9wn2i.png','Branding','2026-07-30T06:30:25.990+00:00',NULL);
INSERT INTO SystemSettings VALUES('63807c0e-eeb6-41d5-bb8b-19eb698f4ae7','BRANDING_HEADER_LOGO','https://res.cloudinary.com/diwp8ug1r/image/upload/v1785392923/branding/pwifhyskod4ak72xmfxo.png','Branding','2026-07-30T06:30:26.067+00:00',NULL);
INSERT INTO SystemSettings VALUES('4953c637-fb57-4a57-9b70-7253c6056807','appName','Foundation ERP','General','2026-07-30T06:13:21.259+00:00',NULL);
INSERT INTO SystemSettings VALUES('5dd34455-65f5-4669-b891-2a3a52c8e67e','dateFormat','MM/DD/YYYY','General','2026-07-30T06:13:21.340+00:00',NULL);
INSERT INTO SystemSettings VALUES('6ad6e215-c323-499c-9dfc-f304d132fc3a','paginationSize','25','General','2026-07-30T06:13:21.421+00:00',NULL);
INSERT INTO SystemSettings VALUES('c25d240a-caf4-4385-8026-5a2b1acd2b95','theme','system','General','2026-07-30T06:13:21.504+00:00',NULL);
INSERT INTO SystemSettings VALUES('bdff798e-7196-4562-aeee-5585adea733f','APP_TIMEZONE','Asia/Dhaka','General','2026-07-30T06:25:14.602+00:00',NULL);
INSERT INTO SystemSettings VALUES('538d2d94-d078-4e21-9464-0eb63b359443','APP_DATE_FORMAT','DD/MM/YYYY','General','2026-07-30T06:25:14.686+00:00',NULL);
INSERT INTO SystemSettings VALUES('e0d90cc1-f545-4e8f-bac2-e44785dc7e1a','APP_THEME','system','General','2026-07-30T06:25:14.767+00:00',NULL);
INSERT INTO SystemSettings VALUES('c802cda2-b148-4240-8fb5-598dcc42ec1d','FIN_CURRENCY','BDT','Financial','2026-07-30T06:25:43.590+00:00',NULL);
INSERT INTO SystemSettings VALUES('1e723d61-e947-4cd2-b2e6-7ad60950b304','FIN_CURRENCY_SYMBOL','৳','Financial','2026-07-30T06:25:43.673+00:00',NULL);
INSERT INTO SystemSettings VALUES('393cdcde-809c-4877-909c-a5011da67648','FIN_DECIMAL_PLACES','2','Financial','2026-07-30T06:25:43.753+00:00',NULL);
INSERT INTO SystemSettings VALUES('24513acd-7e97-456a-a7ca-c01d9047ec66','FIN_NUMBER_FORMAT','1,00,000.00','Financial','2026-07-30T06:25:43.845+00:00',NULL);
INSERT INTO SystemSettings VALUES('f4451382-e637-4615-9a3a-cf3b5aed4e99','FIN_YEAR_START','July','Financial','2026-07-30T06:25:43.926+00:00',NULL);
INSERT INTO SystemSettings VALUES('d4372210-4f63-4b10-89cb-25adc3638e25','FIN_YEAR_END','June','Financial','2026-07-30T06:25:44.006+00:00',NULL);
INSERT INTO SystemSettings VALUES('22c0afcc-7402-46ec-b01a-a41ac7a2ff74','FIN_NEGATIVE_STYLE','-100','Financial','2026-07-30T06:25:44.085+00:00',NULL);
INSERT INTO SystemSettings VALUES('0e323497-df50-41c0-b57b-580fe572223b','FIN_ROUNDING_METHOD','Math.round','Financial','2026-07-30T06:25:44.202+00:00',NULL);
CREATE TABLE IF NOT EXISTS "FoundationProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "logo" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "registrationNumber" TEXT,
    "description" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "language" TEXT NOT NULL DEFAULT 'en',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "updatedAt" DATETIME NOT NULL,
    "updatedBy" TEXT
);
INSERT INTO FoundationProfile VALUES('ab5d47fb-b226-4eab-b92b-d5f07d1e740a','Bhartritya Foundation',NULL,'','','','',NULL,NULL,'BDT','UTC','en','ACTIVE','2026-07-30T05:43:38.771+00:00',NULL);
CREATE TABLE IF NOT EXISTS "UserPermission" (
        "userId" TEXT NOT NULL,
        "permissionId" TEXT NOT NULL,
        PRIMARY KEY ("userId", "permissionId"),
        CONSTRAINT "UserPermission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "UserPermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    );
CREATE UNIQUE INDEX "Group_code_key" ON "Group"("code");
CREATE UNIQUE INDEX "Member_memberId_key" ON "Member"("memberId");
CREATE UNIQUE INDEX "Member_nationalId_key" ON "Member"("nationalId");
CREATE UNIQUE INDEX "Member_mobile_key" ON "Member"("mobile");
CREATE UNIQUE INDEX "Member_email_key" ON "Member"("email");
CREATE UNIQUE INDEX "Beneficiary_beneficiaryId_key" ON "Beneficiary"("beneficiaryId");
CREATE UNIQUE INDEX "Beneficiary_nationalId_key" ON "Beneficiary"("nationalId");
CREATE UNIQUE INDEX "Donor_donorId_key" ON "Donor"("donorId");
CREATE UNIQUE INDEX "Donor_mobile_key" ON "Donor"("mobile");
CREATE UNIQUE INDEX "Donor_nationalId_key" ON "Donor"("nationalId");
CREATE UNIQUE INDEX "MonthlyContribution_memberId_month_year_isAdditional_key" ON "MonthlyContribution"("memberId", "month", "year", "isAdditional");
CREATE UNIQUE INDEX "ContributionPayment_ledgerTransactionId_key" ON "ContributionPayment"("ledgerTransactionId");
CREATE INDEX "LedgerEntry_fundId_idx" ON "LedgerEntry"("fundId");
CREATE INDEX "LedgerEntry_transactionId_idx" ON "LedgerEntry"("transactionId");
CREATE UNIQUE INDEX "Loan_loanNumber_key" ON "Loan"("loanNumber");
CREATE INDEX "Loan_memberId_idx" ON "Loan"("memberId");
CREATE INDEX "Loan_beneficiaryId_idx" ON "Loan"("beneficiaryId");
CREATE UNIQUE INDEX "LoanRepayment_ledgerTransactionId_key" ON "LoanRepayment"("ledgerTransactionId");
CREATE UNIQUE INDEX "Grant_grantNumber_key" ON "Grant"("grantNumber");
CREATE INDEX "FundAllocation_fundId_idx" ON "FundAllocation"("fundId");
CREATE INDEX "FundAllocation_loanId_idx" ON "FundAllocation"("loanId");
CREATE INDEX "FundAllocation_grantId_idx" ON "FundAllocation"("grantId");
CREATE UNIQUE INDEX "DocumentCategory_name_key" ON "DocumentCategory"("name");
CREATE UNIQUE INDEX "Document_documentNumber_key" ON "Document"("documentNumber");
CREATE INDEX "Document_foundationId_idx" ON "Document"("foundationId");
CREATE INDEX "Document_groupId_idx" ON "Document"("groupId");
CREATE INDEX "Document_memberId_idx" ON "Document"("memberId");
CREATE INDEX "Document_beneficiaryId_idx" ON "Document"("beneficiaryId");
CREATE INDEX "Document_loanId_idx" ON "Document"("loanId");
CREATE INDEX "Document_grantId_idx" ON "Document"("grantId");
CREATE INDEX "Document_donorId_idx" ON "Document"("donorId");
CREATE INDEX "Document_campaignId_idx" ON "Document"("campaignId");
CREATE INDEX "Document_targetType_idx" ON "Document"("targetType");
CREATE UNIQUE INDEX "Campaign_campaignId_key" ON "Campaign"("campaignId");
CREATE UNIQUE INDEX "CampaignContribution_ledgerTransactionId_key" ON "CampaignContribution"("ledgerTransactionId");
CREATE INDEX "CampaignContribution_campaignId_idx" ON "CampaignContribution"("campaignId");
CREATE INDEX "CampaignContribution_memberId_idx" ON "CampaignContribution"("memberId");
CREATE INDEX "CampaignContribution_donorId_idx" ON "CampaignContribution"("donorId");
CREATE UNIQUE INDEX "Settings_key_key" ON "Settings"("key");
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_mobile_key" ON "User"("mobile");
CREATE UNIQUE INDEX "UserSession_jti_key" ON "UserSession"("jti");
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");
CREATE UNIQUE INDEX "Permission_module_action_key" ON "Permission"("module", "action");
CREATE UNIQUE INDEX "SystemSettings_key_key" ON "SystemSettings"("key");
COMMIT;
