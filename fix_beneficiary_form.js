const fs = require('fs');
const path = require('path');

const mappings = {
  "toggle_a8875b": ["form.toggle", "Toggle", "টগল করুন"],
  "k_a6be3c": ["messages.error_general", "An error occurred.", "একটি ত্রুটি ঘটেছে।"],
  "k_5a603e": ["messages.doc_deleted", "Document deleted successfully", "ডকুমেন্ট সফলভাবে মুছে ফেলা হয়েছে"],
  "k_55c70d": ["form.upload_click", "Click to upload", "আপলোড করতে ক্লিক করুন"],
  "preview_31fde7": ["form.preview", "Preview", "প্রিভিউ"],
  "replace_0ebe6d": ["form.replace", "Replace", "পরিবর্তন করুন"],
  "delete_f2a6c4": ["form.delete", "Delete", "মুছে ফেলুন"],
  "uploaded_on_8301c6": ["form.uploaded_on", "Uploaded on: ", "আপলোড করা হয়েছে: "],
  "k_99903c": ["form.beneficiary_id", "Beneficiary ID", "সুবিধাভোগী আইডি"],
  "k_ec2310": ["form.created_at", "Created At", "তৈরি করা হয়েছে"],
  "k_4042ae": ["form.personal_info", "Personal Information", "ব্যক্তিগত তথ্য"],
  "k_4b63f5": ["form.full_name", "Full Name", "পুরো নাম"],
  "k_604d6d": ["form.full_name_placeholder", "Enter full name", "পুরো নাম লিখুন"],
  "k_3a149b": ["form.father_husband_name", "Father/Husband's Name", "পিতা/স্বামীর নাম"],
  "k_dc7f4c": ["form.father_husband_name_placeholder", "Enter father/husband's name", "পিতা/স্বামীর নাম লিখুন"],
  "k_0d54e7": ["form.nid", "National ID", "জাতীয় পরিচয়পত্র (NID)"],
  "k_0628a2": ["form.nid_placeholder", "Enter National ID", "জাতীয় পরিচয়পত্র নম্বর লিখুন"],
  "k_aebece": ["form.mobile", "Mobile", "মোবাইল নম্বর"],
  "k_855db0": ["form.mobile_placeholder", "Enter mobile number", "মোবাইল নম্বর লিখুন"],
  "k_8c4d12": ["form.present_address", "Present Address", "বর্তমান ঠিকানা"],
  "k_7c53ee": ["form.present_address_placeholder", "Enter present address", "বর্তমান ঠিকানা লিখুন"],
  "k_ae2bcf": ["form.permanent_address", "Permanent Address", "স্থায়ী ঠিকানা"],
  "k_4f9240": ["form.permanent_address_placeholder", "Enter permanent address", "স্থায়ী ঠিকানা লিখুন"],
  "k_abcb6d": ["form.emergency_contact", "Emergency Contact", "জরুরি যোগাযোগ"],
  "k_eb9b5c": ["form.contact_name", "Name", "নাম"],
  "k_409066": ["form.contact_name_placeholder", "Enter contact name", "যোগাযোগের ব্যক্তির নাম লিখুন"],
  "k_78b83d": ["form.relation", "Relation", "সম্পর্ক"],
  "k_603dd2": ["form.relation_placeholder", "Enter relation", "সম্পর্ক লিখুন"],
  "k_d99d39": ["form.documents", "Documents", "ডকুমেন্টস"],
  "k_7d751b": ["form.photo", "Beneficiary Photo", "সুবিধাভোগীর ছবি"],
  "k_a00a65": ["form.signature", "Signature", "স্বাক্ষর"],
  "k_104386": ["form.id_doc_type", "ID Document Type", "আইডি ডকুমেন্টের ধরন"],
  "nid_227d13": ["form.id_nid", "NID", "এনআইডি (NID)"],
  "k_5c49da": ["form.id_birth_cert", "Birth Certificate", "জন্ম নিবন্ধন"],
  "k_764aac": ["form.nid_front", "NID Front", "এনআইডির সামনের অংশ"],
  "k_ff69d9": ["form.nid_back", "NID Back", "এনআইডির পিছনের অংশ"],
  "k_de9b04": ["form.cancel", "Cancel", "বাতিল"],

  // Extras found in beneficiary-form.tsx as hardcoded Bengali
  "update_success": ["messages.update_success", "Beneficiary updated successfully", "সুবিধাভোগী আপডেট করা হয়েছে"],
  "create_success": ["messages.create_success", "Beneficiary created successfully", "সুবিধাভোগী যুক্ত করা হয়েছে"],
  "save_error": ["messages.save_error", "Failed to save beneficiary", "সুবিধাভোগী সংরক্ষণ করতে ব্যর্থ হয়েছে"],
  "confirm_delete_doc": ["messages.confirm_delete_doc", "Are you sure you want to delete this document?", "আপনি কি নিশ্চিত যে আপনি এই ডকুমেন্টটি মুছে ফেলতে চান?"],
  "delete_doc_error": ["messages.delete_doc_error", "Failed to delete document", "ডকুমেন্ট মুছে ফেলতে ব্যর্থ হয়েছে"],
  "file_subtext": ["form.file_subtext", "JPEG, PNG or JPG", "JPEG, PNG বা JPG"],
  "saving": ["form.saving", "Saving...", "সংরক্ষণ করা হচ্ছে..."],
  "save": ["form.save", "Save", "সংরক্ষণ করুন"]
};

let formFile = 'src/features/beneficiaries/components/beneficiary-form.tsx';
let content = fs.readFileSync(formFile, 'utf8');

for (const [oldKey, val] of Object.entries(mappings)) {
  if (oldKey.includes('_')) {
    content = content.replace(new RegExp(`"beneficiaries\\.${oldKey}"`, 'g'), `"beneficiaries.${val[0]}"`);
  }
}

// Replace hardcoded strings
content = content.replace(/"সুবিধাভোগী আপডেট করা হয়েছে"/g, 't("beneficiaries.messages.update_success")');
content = content.replace(/"সুবিধাভোগী যুক্ত করা হয়েছে"/g, 't("beneficiaries.messages.create_success")');
content = content.replace(/"সুবিধাভোগী সংরক্ষণ করতে ব্যর্থ হয়েছে"/g, 't("beneficiaries.messages.save_error")');
content = content.replace(/"আপনি কি নিশ্চিত যে আপনি এই ডকুমেন্টটি মুছে ফেলতে চান\?"/g, 't("beneficiaries.messages.confirm_delete_doc")');
content = content.replace(/"ডকুমেন্ট মুছে ফেলতে ব্যর্থ হয়েছে"/g, 't("beneficiaries.messages.delete_doc_error")');
content = content.replace(/"JPEG, PNG বা JPG"/g, 't("beneficiaries.form.file_subtext")');
content = content.replace(/"সংরক্ষণ করা হচ্ছে\.\.\."/g, 't("beneficiaries.form.saving")');
content = content.replace(/"সংরক্ষণ করুন"/g, 't("beneficiaries.form.save")');

fs.writeFileSync(formFile, content);

const enPath = 'src/i18n/dictionaries/en/beneficiaries.json';
const bnPath = 'src/i18n/dictionaries/bn/beneficiaries.json';

// mkdir if not exists
fs.mkdirSync('src/i18n/dictionaries/en', { recursive: true });
fs.mkdirSync('src/i18n/dictionaries/bn', { recursive: true });

let en = {};
let bn = {};
if (fs.existsSync(enPath)) en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
if (fs.existsSync(bnPath)) bn = JSON.parse(fs.readFileSync(bnPath, 'utf8'));

for (const [oldKey, val] of Object.entries(mappings)) {
  const [newKey, enVal, bnVal] = val;
  const parts = newKey.split('.');
  
  let currEn = en;
  let currBn = bn;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!currEn[parts[i]]) currEn[parts[i]] = {};
    if (!currBn[parts[i]]) currBn[parts[i]] = {};
    currEn = currEn[parts[i]];
    currBn = currBn[parts[i]];
  }
  
  currEn[parts[parts.length - 1]] = enVal;
  currBn[parts[parts.length - 1]] = bnVal;
}

fs.writeFileSync(enPath, JSON.stringify(en, null, 2));
fs.writeFileSync(bnPath, JSON.stringify(bn, null, 2));

