const fs = require('fs');

const mappings = {
  "k_8cdd29": ["actions.edit", "Edit", "সম্পাদনা করুন"],
  "k_d26d50": ["actions.print", "Print", "প্রিন্ট করুন"]
};

let file = 'src/features/beneficiaries/components/beneficiary-profile-actions.tsx';
let content = fs.readFileSync(file, 'utf8');

for (const [oldKey, val] of Object.entries(mappings)) {
  content = content.replace(new RegExp(`"beneficiaries\\.${oldKey}"`, 'g'), `"beneficiaries.${val[0]}"`);
}
fs.writeFileSync(file, content);

const enPath = 'src/i18n/dictionaries/en/beneficiaries.json';
const bnPath = 'src/i18n/dictionaries/bn/beneficiaries.json';

let en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
let bn = JSON.parse(fs.readFileSync(bnPath, 'utf8'));

if (!en.actions) en.actions = {};
if (!bn.actions) bn.actions = {};

en.actions.edit = "Edit";
bn.actions.edit = "সম্পাদনা করুন";
en.actions.print = "Print";
bn.actions.print = "প্রিন্ট করুন";

fs.writeFileSync(enPath, JSON.stringify(en, null, 2));
fs.writeFileSync(bnPath, JSON.stringify(bn, null, 2));
