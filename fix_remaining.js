const fs = require('fs');

// Fix members-table.tsx
let table = fs.readFileSync('src/features/members/components/members-table.tsx', 'utf8');
table = table.replace(/"স্ট্যাটাস পরিবর্তন করতে ব্যর্থ হয়েছে"/g, 't("members.messages.status_change_error")');
table = table.replace(/"সদস্য মুছে ফেলা সম্ভব নয়"/g, 't("members.messages.delete_error")');
table = table.replace(/"পুনঃস্থাপন ব্যর্থ হয়েছে"/g, 't("members.messages.restore_error")');
table = table.replace(/'নাম পাওয়া যায়নি'/g, "''");
table = table.replace(/t\("members\.k_b88864"\)/g, 't("members.messages.warning")');
table = table.replace(/t\("members\.k_c7ecd5"\)/g, 't("members.messages.soft_delete_warning")');
fs.writeFileSync('src/features/members/components/members-table.tsx', table);

// Fix app edit page
let editPage = fs.readFileSync('src/app/members/[id]/edit/page.tsx', 'utf8');
editPage = editPage.replace(/'নাম পাওয়া যায়নি'/g, "''");
fs.writeFileSync('src/app/members/[id]/edit/page.tsx', editPage);

// Add the warning strings to JSON
const en = JSON.parse(fs.readFileSync('src/i18n/dictionaries/en/members.json'));
en.messages.warning = "Warning:";
en.messages.soft_delete_warning = "This action will soft-delete the member. They will no longer appear in normal views.";
fs.writeFileSync('src/i18n/dictionaries/en/members.json', JSON.stringify(en, null, 2));

const bn = JSON.parse(fs.readFileSync('src/i18n/dictionaries/bn/members.json'));
bn.messages.warning = "সতর্কতা:";
bn.messages.soft_delete_warning = "এই পদক্ষেপ সদস্যকে সফট-ডিলিট করবে। তারা আর সাধারণ ভিউতে দেখা যাবে না।";
fs.writeFileSync('src/i18n/dictionaries/bn/members.json', JSON.stringify(bn, null, 2));

