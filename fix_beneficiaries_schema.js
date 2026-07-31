const fs = require('fs');

let schemaPath = 'src/features/beneficiaries/schema.ts';
let content = fs.readFileSync(schemaPath, 'utf8');

// Replace hardcoded message with translation key
content = content.replace(/"পূর্ণ নাম আবশ্যক"/g, '"beneficiaries.validation.full_name_required"');

fs.writeFileSync(schemaPath, content);

// Update dictionaries
const enPath = 'src/i18n/dictionaries/en/beneficiaries.json';
const bnPath = 'src/i18n/dictionaries/bn/beneficiaries.json';

let en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
let bn = JSON.parse(fs.readFileSync(bnPath, 'utf8'));

if (!en.validation) en.validation = {};
if (!bn.validation) bn.validation = {};

en.validation.full_name_required = "Full name is required";
bn.validation.full_name_required = "পূর্ণ নাম আবশ্যক";

fs.writeFileSync(enPath, JSON.stringify(en, null, 2));
fs.writeFileSync(bnPath, JSON.stringify(bn, null, 2));
