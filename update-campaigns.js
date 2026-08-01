const fs = require('fs');

const en = JSON.parse(fs.readFileSync('src/i18n/dictionaries/en/campaigns.json', 'utf8'));
const bn = JSON.parse(fs.readFileSync('src/i18n/dictionaries/bn/campaigns.json', 'utf8'));

en.manage = {
    pageTitle: "Manage Financial Activities",
    subtitle: "View and manage all funding activities",
    breadcrumb: {
      home: "Home",
      manage: "Manage Activities"
    },
    newActivity: "New Activity",
    table: {
      name: "Activity Name",
      purpose: "Purpose",
      targetAmount: "Target Amount",
      collectedAmount: "Collected",
      status: "Status",
      actions: "Actions",
      notSet: "Not Set",
      empty: "No activities found"
    },
    status: {
      active: "Active",
      completed: "Completed",
      cancelled: "Cancelled"
    },
    actions: {
      menu: "Actions",
      view: "View Details",
      edit: "Edit Activity",
      ledger: "Fund Ledger",
      transactions: "Transactions",
      print: "Print Report",
      complete: "Mark as Completed",
      delete: "Delete Activity"
    }
};

bn.manage = {
    pageTitle: "আর্থিক কার্যক্রম পরিচালনা",
    subtitle: "সকল আর্থিক কার্যক্রম দেখুন এবং পরিচালনা করুন",
    breadcrumb: {
      home: "হোম",
      manage: "কার্যক্রম পরিচালনা"
    },
    newActivity: "নতুন কার্যক্রম",
    table: {
      name: "কার্যক্রমের নাম",
      purpose: "উদ্দেশ্য",
      targetAmount: "লক্ষ্যমাত্রা",
      collectedAmount: "সংগৃহীত",
      status: "স্ট্যাটাস",
      actions: "অ্যাকশন",
      notSet: "অনির্ধারিত",
      empty: "কোনো কার্যক্রম পাওয়া যায়নি"
    },
    status: {
      active: "চলমান",
      completed: "সম্পন্ন",
      cancelled: "বাতিল"
    },
    actions: {
      menu: "অ্যাকশন",
      view: "বিস্তারিত দেখুন",
      edit: "কার্যক্রম এডিট করুন",
      ledger: "তহবিল লেজার",
      transactions: "লেনদেন",
      print: "রিপোর্ট প্রিন্ট করুন",
      complete: "সম্পন্ন হিসেবে চিহ্নিত করুন",
      delete: "কার্যক্রম মুছুন"
    }
};

en.contribute = {
    pageTitle: "Receive Contribution",
    subtitle: "Add a new contribution to an activity",
    breadcrumb: {
      manage: "Financial Activities",
      contribute: "Receive Contribution"
    },
    form: {
      title: "Contribution Form",
      description: "Enter contribution details below",
      activity: "Select Activity *",
      activityPlaceholder: "Choose an activity",
      contributorType: "Contributor Type *",
      contributorTypePlaceholder: "Select type",
      typeMember: "Member",
      typeDonor: "Non-member / Donor",
      member: "Select Member *",
      memberPlaceholder: "Choose a member",
      nonMemberDetails: "Donor Details",
      donorName: "Name *",
      donorNamePlaceholder: "Enter full name",
      donorMobile: "Mobile Number",
      donorMobilePlaceholder: "e.g. 01XXXXXXXXX",
      donorAddress: "Address",
      donorAddressPlaceholder: "Enter address",
      amount: "Amount (Tk) *",
      date: "Date *",
      remarks: "Remarks",
      remarksPlaceholder: "Any remarks",
      cancel: "Cancel",
      save: "Save Contribution",
      successMessage: "Contribution successfully saved"
    }
};

bn.contribute = {
    pageTitle: "তহবিলে জমা নিন",
    subtitle: "কার্যক্রমে নতুন জমা যুক্ত করুন",
    breadcrumb: {
      manage: "আর্থিক কার্যক্রম",
      contribute: "জমা নিন"
    },
    form: {
      title: "জমা ফর্ম",
      description: "নিচে জমার বিবরণ দিন",
      activity: "কার্যক্রম নির্বাচন করুন *",
      activityPlaceholder: "একটি কার্যক্রম বেছে নিন",
      contributorType: "জমা প্রদানকারীর ধরন *",
      contributorTypePlaceholder: "ধরন নির্বাচন করুন",
      typeMember: "সদস্য",
      typeDonor: "অসদস্য / ডোনার",
      member: "সদস্য নির্বাচন করুন *",
      memberPlaceholder: "একজন সদস্য বেছে নিন",
      nonMemberDetails: "ডোনারের বিস্তারিত",
      donorName: "নাম *",
      donorNamePlaceholder: "পুরো নাম লিখুন",
      donorMobile: "মোবাইল নম্বর",
      donorMobilePlaceholder: "উদা: 01XXXXXXXXX",
      donorAddress: "ঠিকানা",
      donorAddressPlaceholder: "ঠিকানা লিখুন",
      amount: "পরিমাণ (টাকা) *",
      date: "তারিখ *",
      remarks: "মন্তব্য",
      remarksPlaceholder: "যেকোনো মন্তব্য",
      cancel: "বাতিল করুন",
      save: "জমা সংরক্ষণ করুন",
      successMessage: "সফলভাবে জমা সংরক্ষিত হয়েছে"
    }
};

en.ledger = {
    pageTitle: "Fund Ledger",
    subtitle: "View detailed ledger for financial activities",
    breadcrumb: {
      manage: "Financial Activities",
      ledger: "Fund Ledger"
    },
    print: "Print",
    download: "Download CSV",
    selectActivity: "Select Activity to view Ledger",
    emptyTitle: "No Activity Selected",
    emptySubtitle: "Please select a fund or activity from the dropdown above to view its ledger.",
    summary: {
      totalCollection: "Total Collection",
      target: "Target: ",
      memberContribution: "Member Contribution",
      donorContribution: "Donor Contribution",
      transactions: "Transactions",
      count: "Count: "
    },
    table: {
      title: "Ledger Transactions",
      date: "Date",
      trxId: "Trx ID",
      contributor: "Contributor",
      type: "Type",
      remarks: "Remarks",
      debit: "Debit (-)",
      credit: "Credit (+)",
      balance: "Balance",
      unknown: "Unknown",
      deposit: "Fund Deposit",
      member: "Member",
      donor: "Donor",
      empty: "No transactions found for this activity."
    }
};

bn.ledger = {
    pageTitle: "তহবিল লেজার",
    subtitle: "আর্থিক কার্যক্রমের বিস্তারিত লেজার দেখুন",
    breadcrumb: {
      manage: "আর্থিক কার্যক্রম",
      ledger: "তহবিল লেজার"
    },
    print: "প্রিন্ট",
    download: "ডাউনলোড (CSV)",
    selectActivity: "লেজার দেখতে কার্যক্রম নির্বাচন করুন",
    emptyTitle: "কোনো কার্যক্রম নির্বাচিত হয়নি",
    emptySubtitle: "লেজার দেখতে উপরের ড্রপডাউন থেকে একটি তহবিল বা কার্যক্রম নির্বাচন করুন।",
    summary: {
      totalCollection: "মোট সংগ্রহ",
      target: "লক্ষ্যমাত্রা: ",
      memberContribution: "সদস্যদের অবদান",
      donorContribution: "ডোনারদের অবদান",
      transactions: "লেনদেন সংখ্যা",
      count: "সংখ্যা: "
    },
    table: {
      title: "লেজার লেনদেন",
      date: "তারিখ",
      trxId: "লেনদেন আইডি",
      contributor: "জমা প্রদানকারী",
      type: "ধরন",
      remarks: "মন্তব্য",
      debit: "খরচ (-)",
      credit: "জমা (+)",
      balance: "উদ্বৃত্ত",
      unknown: "অজানা",
      deposit: "তহবিলে জমা",
      member: "সদস্য",
      donor: "ডোনার",
      empty: "এই কার্যক্রমের কোনো লেনদেন পাওয়া যায়নি।"
    }
};

fs.writeFileSync('src/i18n/dictionaries/en/campaigns.json', JSON.stringify(en, null, 2));
fs.writeFileSync('src/i18n/dictionaries/bn/campaigns.json', JSON.stringify(bn, null, 2));
console.log('Dictionaries updated!');
