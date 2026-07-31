const fs = require('fs');

const mappings = {
  // member-documents-list.tsx
  "member_documents_b8d427": ["documents.title", "Member Documents", "সদস্যের ডকুমেন্টস"],
  "no_documents_uploade_c962ce": ["documents.no_documents", "No documents uploaded.", "কোনো ডকুমেন্ট আপলোড করা হয়নি।"],
  "view_4351cf": ["documents.view", "View", "দেখুন"],
  
  // member-form-dialog.tsx
  "create_member_7d6b17": ["dialog.create_member", "Create Member", "সদস্য যোগ করুন"],
  "group_039371": ["form.group", "Group", "গ্রুপ"],
  "select_a_group_c599b5": ["form.select_group", "Select a group", "একটি গ্রুপ নির্বাচন করুন"],
  "personal_information_61f166": ["form.personal_info", "Personal Information", "ব্যক্তিগত তথ্য"],
  "full_name_630058": ["form.full_name", "Full Name", "পুরো নাম"],
  "father_s_name_3fd969": ["form.father_name", "Father's Name", "পিতার নাম"],
  "mother_s_name_c55fbf": ["form.mother_name", "Mother's Name", "মাতার নাম"],
  "date_of_birth_10803b": ["form.dob", "Date of Birth", "জন্ম তারিখ"],
  "national_id_075b6d": ["form.nid", "National ID", "জাতীয় পরিচয়পত্র (NID)"],
  "blood_group_0bf1e3": ["form.blood_group", "Blood Group", "রক্তের গ্রুপ"],
  "occupation_752a9c": ["form.occupation", "Occupation", "পেশা"],
  "education_de7a22": ["form.education", "Education", "শিক্ষাগত যোগ্যতা"],
  "contact_information_c00c8e": ["form.contact_info", "Contact Information", "যোগাযোগের তথ্য"],
  "mobile_87d17f": ["form.mobile", "Mobile", "মোবাইল নম্বর"],
  "email_ce8ae9": ["form.email", "Email", "ইমেইল"],
  "present_address_7d30c2": ["form.present_address", "Present Address", "বর্তমান ঠিকানা"],
  "permanent_address_4d06ca": ["form.permanent_address", "Permanent Address", "স্থায়ী ঠিকানা"],
  "emergency_contact_469414": ["form.emergency_contact", "Emergency Contact", "জরুরি যোগাযোগ"],
  "name_49ee30": ["form.name", "Name", "নাম"],
  "relation_671dec": ["form.relation", "Relation", "সম্পর্ক"],
  "cancel_ea4788": ["form.cancel", "Cancel", "বাতিল"],
  "save_c9cc8c": ["form.save", "Save", "সংরক্ষণ করুন"],
  
  // member-profile-actions.tsx
  "pdf_5dbe87": ["actions.pdf", "PDF", "পিডিএফ"]
};

const doReplace = (filepath) => {
  if (!fs.existsSync(filepath)) return;
  let content = fs.readFileSync(filepath, 'utf8');
  for (const [oldKey, val] of Object.entries(mappings)) {
    content = content.replace(new RegExp(`"members\\.${oldKey}"`, 'g'), `"members.${val[0]}"`);
  }
  fs.writeFileSync(filepath, content);
};

doReplace('src/features/members/components/member-documents-list.tsx');
doReplace('src/features/members/components/member-form-dialog.tsx');
doReplace('src/features/members/components/member-profile-actions.tsx');

const en = JSON.parse(fs.readFileSync('src/i18n/dictionaries/en/members.json'));
const bn = JSON.parse(fs.readFileSync('src/i18n/dictionaries/bn/members.json'));

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

fs.writeFileSync('src/i18n/dictionaries/en/members.json', JSON.stringify(en, null, 2));
fs.writeFileSync('src/i18n/dictionaries/bn/members.json', JSON.stringify(bn, null, 2));

