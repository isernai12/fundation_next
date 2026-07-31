const fs = require('fs');

let file = 'src/app/beneficiaries/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace app.text tags sequentially
const appTextReplacements = [
  "form.personal_info",
  "form.full_name",
  "form.father_husband_name",
  "form.nid",
  "form.mobile",
  "form.present_address",
  "form.permanent_address",
  "form.emergency_contact",
  "form.contact_name",
  "form.relation",
  "form.mobile",
  "form.documents",
  "form.no_photo",
  "form.beneficiary_id",
  "table.status"
];

let idx = 0;
content = content.replace(/<Trans tKey="app\.text" \/>/g, (match) => {
  if (idx < appTextReplacements.length) {
    return `<Trans tKey="beneficiaries.${appTextReplacements[idx++]}" />`;
  }
  return match;
});

// Fix titles for document cards
content = content.replace(/title="সুবিধাভোগীর ছবি"/g, 'title={<Trans tKey="beneficiaries.form.photo" />}');
content = content.replace(/title="স্বাক্ষর"/g, 'title={<Trans tKey="beneficiaries.form.signature" />}');
content = content.replace(/title="জাতীয় পরিচয়পত্র \(সামনের অংশ\)"/g, 'title={<Trans tKey="beneficiaries.form.nid_front" />}');
content = content.replace(/title="জাতীয় পরিচয়পত্র \(পেছনের অংশ\)"/g, 'title={<Trans tKey="beneficiaries.form.nid_back" />}');
content = content.replace(/title="জন্ম নিবন্ধন"/g, 'title={<Trans tKey="beneficiaries.form.id_birth_cert" />}');

// Fix text strings
content = content.replace(/beneficiary\.fullName \|\| 'নাম পাওয়া যায়নি'/g, 'beneficiary.fullName || beneficiary.beneficiaryId');
content = content.replace(/\{beneficiary\.status === "ACTIVE" \? "সক্রিয়" : "নিষ্ক্রিয়"\}/g, '{beneficiary.status === "ACTIVE" ? <Trans tKey="beneficiaries.status.active" /> : <Trans tKey="beneficiaries.status.inactive" />}');

fs.writeFileSync(file, content);

// Add missing keys to dictionary
const enPath = 'src/i18n/dictionaries/en/beneficiaries.json';
const bnPath = 'src/i18n/dictionaries/bn/beneficiaries.json';

let en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
let bn = JSON.parse(fs.readFileSync(bnPath, 'utf8'));

if (!en.status) en.status = {};
if (!bn.status) bn.status = {};
en.status.active = "Active";
bn.status.active = "সক্রিয়";
en.status.inactive = "Inactive";
bn.status.inactive = "নিষ্ক্রিয়";

en.form.no_photo = "No Photo";
bn.form.no_photo = "ছবি নেই";

en.table.status = "Status";
bn.table.status = "অবস্থা";

fs.writeFileSync(enPath, JSON.stringify(en, null, 2));
fs.writeFileSync(bnPath, JSON.stringify(bn, null, 2));
