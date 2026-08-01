const fs = require('fs');

const en = JSON.parse(fs.readFileSync('src/i18n/dictionaries/en/layout.json', 'utf8'));
const bn = JSON.parse(fs.readFileSync('src/i18n/dictionaries/bn/layout.json', 'utf8'));

en.sidebar.fund_dues = "Fund / Dues";
en.sidebar.receive_fund = "Receive Contribution";
en.sidebar.monthly_dues = "Monthly Dues";
en.sidebar.manage_dues = "Manage Dues";
en.sidebar.due_dues = "Outstanding Dues";
en.sidebar.dues_ledger = "Dues Ledger";

bn.sidebar.fund_dues = "তহবিল / চাঁদা";
bn.sidebar.receive_fund = "চাঁদা গ্রহণ";
bn.sidebar.monthly_dues = "মাসিক চাঁদা";
bn.sidebar.manage_dues = "চাঁদা ব্যবস্থাপনা";
bn.sidebar.due_dues = "বকেয়া চাঁদা";
bn.sidebar.dues_ledger = "চাঁদা লেজার";

fs.writeFileSync('src/i18n/dictionaries/en/layout.json', JSON.stringify(en, null, 2));
fs.writeFileSync('src/i18n/dictionaries/bn/layout.json', JSON.stringify(bn, null, 2));
console.log('Layout dictionaries updated');
