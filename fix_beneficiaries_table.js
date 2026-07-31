const fs = require('fs');

const mappings = {
  "actions_06df33": ["table.actions", "Actions", "অ্যাকশন"],
  "activate_a13367": ["table.activate", "Activate", "সক্রিয় করুন"],
  "beneficiary_activate_3ac93b": ["messages.activate_success", "Beneficiary activated successfully", "সুবিধাভোগী সক্রিয় করা হয়েছে"],
  "beneficiary_deactiva_ee817d": ["messages.deactivate_success", "Beneficiary deactivated successfully", "সুবিধাভোগী নিষ্ক্রিয় করা হয়েছে"],
  "beneficiary_deleted_17d527": ["messages.delete_success", "Beneficiary deleted successfully", "সুবিধাভোগী মুছে ফেলা হয়েছে"],
  "beneficiary_id_d18cf9": ["table.beneficiary_id", "Beneficiary ID", "সুবিধাভোগী আইডি"],
  "deactivate_109fec": ["table.deactivate", "Deactivate", "নিষ্ক্রিয় করুন"],
  "delete_f2a6c4": ["table.delete", "Delete", "মুছে ফেলুন"],
  "edit_beneficiary_5eede3": ["table.edit", "Edit", "সম্পাদনা করুন"],
  "name_49ee30": ["table.name", "Name", "নাম"],
  "next_10ac3d": ["table.next", "Next", "পরবর্তী"],
  "no_beneficiaries_fou_0df021": ["table.no_results", "No beneficiaries found.", "কোন সুবিধাভোগী পাওয়া যায়নি।"],
  "open_menu_64d2cc": ["table.open_menu", "Open menu", "মেনু খুলুন"],
  "previous_dd1f77": ["table.previous", "Previous", "পূর্ববর্তী"],
  "search_by_first_name_db8f3a": ["table.search_placeholder", "Search by name, ID or mobile...", "নাম, আইডি বা মোবাইল দিয়ে খুঁজুন..."],
  "view_details_5d5cd2": ["table.view_details", "View Details", "বিস্তারিত দেখুন"]
};

let tableFile = 'src/features/beneficiaries/components/beneficiaries-table.tsx';
let content = fs.readFileSync(tableFile, 'utf8');

for (const [oldKey, val] of Object.entries(mappings)) {
  content = content.replace(new RegExp(`"beneficiaries\\.${oldKey}"`, 'g'), `"beneficiaries.${val[0]}"`);
}

// Additional hardcoded Bengali strings found in previous grep
content = content.replace(/`\$\{row\.original\.fullName \|\| 'নাম পাওয়া যায়নি'\}`/g, '`${row.original.fullName || t("beneficiaries.table.name_not_found")}`');
content = content.replace(/'নাম পাওয়া যায়নি'/g, 't("beneficiaries.table.name_not_found")'); // In case it's bare

fs.writeFileSync(tableFile, content);

const enPath = 'src/i18n/dictionaries/en/beneficiaries.json';
const bnPath = 'src/i18n/dictionaries/bn/beneficiaries.json';

let en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
let bn = JSON.parse(fs.readFileSync(bnPath, 'utf8'));

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

// Add name_not_found
if (!en.table) en.table = {};
if (!bn.table) bn.table = {};
en.table.name_not_found = "Name not found";
bn.table.name_not_found = "নাম পাওয়া যায়নি";

fs.writeFileSync(enPath, JSON.stringify(en, null, 2));
fs.writeFileSync(bnPath, JSON.stringify(bn, null, 2));
