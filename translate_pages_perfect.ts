import { Project, SyntaxKind } from 'ts-morph';
import * as fs from 'fs';
import * as crypto from 'crypto';

const project = new Project();
project.addSourceFilesAtPaths("src/app/**/page.tsx");

const enPath = "src/i18n/locales/en.json";
const bnPath = "src/i18n/locales/bn.json";

const enJson = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const bnJson = JSON.parse(fs.readFileSync(bnPath, 'utf8'));

if (!enJson.app) enJson.app = {};
if (!bnJson.app) bnJson.app = {};

const bnToEnMap: Record<string, string> = {
  "প্রধান মেনু": "Main Menu",
  "ড্যাশবোর্ড": "Dashboard",
  "সদস্য": "Members",
  "নতুন সদস্য": "New Member",
  "সদস্য ব্যবস্থাপনা": "Manage Members",
  "সদস্য লেজার": "Member Ledger",
  "বকেয়া চাঁদা": "Due Dues",
  "সুবিধাভোগী": "Beneficiaries",
  "নতুন সুবিধাভোগী": "New Beneficiary",
  "সুবিধাভোগী ব্যবস্থাপনা": "Manage Beneficiaries",
  "সুবিধাভোগী লেজার": "Beneficiary Ledger",
  "সহায়তার ইতিহাস": "Assistance History",
  "ঋণের ইতিহাস": "Loan History",
  "আর্থিক কার্যক্রম": "Financial Activities",
  "অনুদানদাতা": "Donors",
  "নতুন অনুদানদাতা": "New Donor",
  "অনুদানদাতা ব্যবস্থাপনা": "Manage Donors",
  "অনুদান গ্রহণ": "Receive Donation",
  "অনুদান লেজার": "Donor Ledger",
  "তহবিল / চাঁদা": "Fund / Dues",
  "নতুন তহবিল": "New Fund",
  "তহবিল ব্যবস্থাপনা": "Manage Funds",
  "তহবিলে অর্থ গ্রহণ": "Receive Fund Contribution",
  "তহবিল লেজার": "Fund Ledger",
  "তহবিল গ্রহণ": "Receive Fund",
  "মাসিক চাঁদা": "Monthly Dues",
  "চাঁদা ব্যবস্থাপনা": "Manage Dues",
  "চাঁদা লেজার": "Dues Ledger",
  "ঋণ": "Loans",
  "নতুন ঋণ": "New Loan",
  "ঋণ ব্যবস্থাপনা": "Manage Loans",
  "ঋণ পরিশোধ": "Repay Loan",
  "ঋণ লেজার": "Loan Ledger",
  "অনুদান": "Grants",
  "নতুন অনুদান": "New Grant",
  "অনুদান ব্যবস্থাপনা": "Manage Grants",
  "সংগঠন": "Organization",
  "গ্রুপ": "Groups",
  "নতুন গ্রুপ": "New Group",
  "গ্রুপ ব্যবস্থাপনা": "Manage Groups",
  "গ্রুপের সদস্য": "Group Members",
  "গ্রুপ ফান্ড": "Group Fund",
  "গ্রুপ লেজার": "Group Ledger",
  "সেটিংস": "Settings",
  "সংরক্ষণ করুন": "Save",
  "সংরক্ষণ করা হচ্ছে...": "Saving...",
  "বাতিল": "Cancel",
  "সম্পাদনা": "Edit",
  "মুছে ফেলুন": "Delete",
  "খুঁজুন": "Search",
  "ফিল্টার": "Filter",
  "রিসেট": "Reset",
  "কর্মকাণ্ড": "Actions",
  "অবস্থা": "Status",
  "সক্রিয়": "Active",
  "নিষ্ক্রিয়": "Inactive",
  "বিবরণ": "Description",
  "তারিখ": "Date",
  "পরিমাণ": "Amount",
  "নাম": "Name",
  "পূর্ণ নাম": "Full Name",
  "পিতার নাম": "Father's Name",
  "মাতার নাম": "Mother's Name",
  "পিতা/স্বামীর নাম": "Father/Husband's Name",
  "জরুরি যোগাযোগ": "Emergency Contact",
  "সম্পর্ক": "Relation",
  "মোবাইল": "Mobile",
  "মোবাইল নম্বর": "Mobile Number",
  "ইমেইল": "Email",
  "ঠিকানা": "Address",
  "বর্তমান ঠিকানা": "Present Address",
  "স্থায়ী ঠিকানা": "Permanent Address",
  "জাতীয় পরিচয়পত্র": "National ID",
  "এনআইডি": "NID",
  "জন্ম নিবন্ধন": "Birth Certificate",
  "ছবি": "Photo",
  "ছবি আপলোড করুন": "Upload Photo",
  "স্বাক্ষর": "Signature",
  "ডকুমেন্টস": "Documents",
  "ব্যক্তিগত তথ্য": "Personal Information",
  "তথ্য": "Information",
  "প্রাকদর্শন": "Preview",
  "পরিবর্তন করুন": "Replace",
  "আপলোড করা হয়েছে": "Uploaded on",
  "টগল করুন": "Toggle",
  "নির্বাহী ড্যাশবোর্ড": "Executive Dashboard",
  "প্রতিষ্ঠানের সদস্যদের ব্যবস্থাপনা করুন।": "Manage foundation members.",
  "নতুন সদস্য নিবন্ধন করুন।": "Register a new member.",
  "নতুন সুবিধাভোগী যোগ করুন।": "Add a new beneficiary.",
  "প্রতিষ্ঠানের সুবিধাভোগীদের তালিকা ও বিবরণী।": "List and details of foundation beneficiaries.",
  "নতুন অনুদানদাতা যোগ করুন।": "Add a new donor.",
  "অনুদানদাতাদের তালিকা ও বিবরণী।": "List and details of donors.",
  "নতুন আর্থিক কার্যক্রম শুরু করুন।": "Start a new financial campaign.",
  "নতুন ঋণ প্রদান করুন।": "Disburse a new loan.",
  "নতুন অনুদান প্রদান করুন।": "Disburse a new grant.",
  "নতুন গ্রুপ তৈরি করুন।": "Create a new group."
};

function getUniqueKey(text: string): string {
  const hash = crypto.createHash('md5').update(text).digest('hex').substring(0, 6);
  const clean = text.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').substring(0, 20);
  if (clean.length > 2 && clean !== "text") {
    return `${clean}_${hash}`;
  }
  return `k_${hash}`;
}

function isValidText(text: string) {
  const trimmed = text.trim();
  if (trimmed.length <= 1) return false;
  if (!/[\u0980-\u09FF]/.test(trimmed)) return false; 
  return true;
}

let totalReplaced = 0;

for (const sourceFile of project.getSourceFiles()) {
  let changed = false;

  sourceFile.getDescendantsOfKind(SyntaxKind.JsxText).forEach(jsxText => {
    if (jsxText.wasForgotten()) return;
    const text = jsxText.getLiteralText().trim();
    if (isValidText(text)) {
       const key = getUniqueKey(text);
       
       bnJson.app[key] = text;
       enJson.app[key] = bnToEnMap[text] || text;
       
       const fullKey = `app.${key}`;
       jsxText.replaceWithText(`<Trans tKey="${fullKey}" />`);
       changed = true;
    }
  });

  if (changed) {
    const importDecs = sourceFile.getImportDeclarations();
    const hasImport = importDecs.some(i => i.getModuleSpecifierValue() === "@/components/shared/trans");
    if (!hasImport) {
      sourceFile.addImportDeclaration({
        namedImports: ["Trans"],
        moduleSpecifier: "@/components/shared/trans"
      });
    }
    sourceFile.saveSync();
    totalReplaced++;
  }
}

fs.writeFileSync(enPath, JSON.stringify(enJson, null, 2));
fs.writeFileSync(bnPath, JSON.stringify(bnJson, null, 2));
console.log(`Done! Replaced hardcoded strings in ${totalReplaced} page files with unique MD5 keys.`);
