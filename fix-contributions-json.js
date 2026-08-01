const fs = require('fs');

const en = JSON.parse(fs.readFileSync('src/i18n/dictionaries/en/contributions.json', 'utf8'));
const bn = JSON.parse(fs.readFileSync('src/i18n/dictionaries/bn/contributions.json', 'utf8'));

en.due = {
  pageTitle: "Outstanding Dues",
  subtitle: "Members with unpaid dues for",
  breadcrumb: {
    home: "Contributions",
    due: "Outstanding Dues"
  },
  columns: {
    member: "Member",
    group: "Group",
    status: "Status",
    period: "Period",
    actions: "Actions"
  },
  unpaid: "Unpaid",
  receiveAction: "Receive Payment",
  empty: "No outstanding dues found."
};

en.ledger = {
  pageTitle: "Dues Ledger",
  subtitle: "Comprehensive ledger for member contributions",
  breadcrumb: {
    home: "Contributions",
    ledger: "Dues Ledger"
  },
  comingSoon: "Ledger Coming Soon",
  comingSoonDesc: "The detailed ledger view is currently under development."
};

bn.due = {
  pageTitle: "বকেয়া চাঁদা",
  subtitle: "বকেয়া চাঁদা সহ সদস্যবৃন্দ -",
  breadcrumb: {
    home: "চাঁদা",
    due: "বকেয়া চাঁদা"
  },
  columns: {
    member: "সদস্য",
    group: "গ্রুপ",
    status: "স্ট্যাটাস",
    period: "সময়কাল",
    actions: "অ্যাকশন"
  },
  unpaid: "অপরিশোধিত",
  receiveAction: "চাঁদা গ্রহণ করুন",
  empty: "কোনো বকেয়া চাঁদা পাওয়া যায়নি।"
};

bn.ledger = {
  pageTitle: "চাঁদা লেজার",
  subtitle: "সদস্যদের চাঁদার বিস্তারিত লেজার",
  breadcrumb: {
    home: "চাঁদা",
    ledger: "চাঁদা লেজার"
  },
  comingSoon: "লেজার শীঘ্রই আসছে",
  comingSoonDesc: "বিস্তারিত লেজার ভিউ বর্তমানে প্রক্রিয়াধীন রয়েছে।"
};

fs.writeFileSync('src/i18n/dictionaries/en/contributions.json', JSON.stringify(en, null, 2));
fs.writeFileSync('src/i18n/dictionaries/bn/contributions.json', JSON.stringify(bn, null, 2));
console.log('Dictionaries updated with due and ledger!');
