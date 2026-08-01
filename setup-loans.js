const fs = require('fs');

const en = {
  new: {
    pageTitle: "New Loan",
    subtitle: "Create and configure a new loan application",
    breadcrumb: {
      home: "Loans",
      new: "New Loan"
    }
  },
  manage: {
    pageTitle: "Manage Loans",
    subtitle: "View and manage all organization loans",
    breadcrumb: {
      home: "Loans",
      manage: "Manage Loans"
    },
    newBtn: "New Loan"
  },
  repay: {
    pageTitle: "Repay Loan",
    subtitle: "Select a loan to view details and securely record a new repayment.",
    breadcrumb: {
      home: "Loans",
      repay: "Receive Repayment"
    }
  },
  ledger: {
    pageTitle: "Loan Ledger",
    subtitle: "View all loan disbursement and repayment ledger transactions.",
    subtitleSpecific: "Ledger for {name}. Total Loan: ৳{amount}, Remaining: ৳{remaining}",
    breadcrumb: {
      home: "Loans",
      ledger: "Loan Ledger"
    }
  },
  form: {
    steps: {
      step1: "Step 1",
      beneficiarySelection: "Beneficiary Selection",
      step2: "Step 2",
      loanInfo: "Loan Information",
      step3: "Step 3",
      repaymentInfo: "Repayment Information",
      step4: "Step 4",
      review: "Review & Submit"
    },
    beneficiary: "Beneficiary",
    selectBeneficiary: "Select Beneficiary",
    fundingSource: "Funding Source",
    selectFundingSource: "Select funding source",
    group: "Group",
    availableBalance: "Available Balance",
    remainingAfterLoan: "Remaining after loan",
    purpose: "Loan Purpose",
    selectPurpose: "Select Purpose",
    purposes: {
      business: "Business",
      education: "Education",
      medical: "Medical",
      agriculture: "Agriculture",
      housing: "Housing",
      other: "Other"
    },
    reason: "Reason",
    reasonPlaceholder: "Please specify the reason",
    amount: "Loan Amount",
    installmentType: "Installment Type",
    types: {
      monthly: "Monthly",
      weekly: "Weekly",
      custom: "Custom"
    },
    installmentAmount: "Installment Amount",
    numberOfInstallments: "Number of Installments",
    firstInstallmentDate: "First Installment Date",
    remarks: "Remarks",
    remarksPlaceholder: "Any additional notes",
    guarantors: "Guarantors",
    guarantorsDesc: "Information about loan guarantors",
    guarantorName: "Guarantor Name",
    guarantorPhone: "Guarantor Phone",
    guarantorAddress: "Guarantor Address",
    guarantorRelation: "Relation",
    addGuarantor: "Add Guarantor",
    removeGuarantor: "Remove Guarantor",
    documents: "Documents",
    documentsDesc: "Upload supporting documents",
    documentType: "Document Type",
    uploadDocument: "Upload Document",
    uploading: "Uploading...",
    removeDocument: "Remove Document",
    summary: "Summary",
    summaryDesc: "Please review the information before submitting",
    disbursementDate: "Disbursement Date",
    cancel: "Cancel",
    save: "Submit Loan",
    saving: "Submitting...",
    success: "Loan created successfully",
    error: "Failed to save loan",
    updateSuccess: "Loan updated successfully"
  },
  repaymentForm: {
    loanSelector: "Select Loan",
    beneficiarySelector: "Select Beneficiary",
    amount: "Payment Amount",
    date: "Payment Date",
    receipt: "Receipt Number",
    receiptPlaceholder: "Enter receipt number",
    remarks: "Remarks",
    cancel: "Cancel",
    save: "Record Repayment",
    saving: "Saving...",
    success: "Repayment recorded successfully",
    error: "Failed to record repayment",
    confirmTitle: "Confirm Repayment",
    confirmDesc: "Are you sure you want to record this repayment?"
  },
  table: {
    search: "Search loans...",
    columns: {
      beneficiary: "Beneficiary",
      loanNo: "Loan No",
      amount: "Amount",
      balance: "Remaining Balance",
      status: "Status",
      due: "Due Status",
      actions: "Actions",
      date: "Date",
      type: "Type",
      debit: "Debit",
      credit: "Credit",
      description: "Description"
    },
    status: {
      pending: "Pending",
      active: "Active",
      completed: "Completed",
      defaulted: "Defaulted",
      rejected: "Rejected"
    },
    dueStatus: {
      noDue: "No Due",
      completed: "Completed",
      overdue: "Overdue",
      dueToday: "Due Today",
      upcomingDue: "Upcoming Due"
    },
    actions: {
      menu: "Actions",
      view: "View Details",
      edit: "Edit Loan",
      repay: "Receive Repayment",
      ledger: "View Ledger",
      delete: "Delete Loan"
    },
    pagination: {
      selected: "selected",
      of: "of",
      rows: "rows",
      previous: "Previous",
      next: "Next"
    },
    empty: "No loans found."
  }
};

const bn = {
  new: {
    pageTitle: "নতুন ঋণ",
    subtitle: "একটি নতুন ঋণের আবেদন তৈরি এবং কনফিগার করুন",
    breadcrumb: {
      home: "ঋণ",
      new: "নতুন ঋণ"
    }
  },
  manage: {
    pageTitle: "ঋণ ব্যবস্থাপনা",
    subtitle: "সংস্থার সকল ঋণ দেখুন এবং পরিচালনা করুন",
    breadcrumb: {
      home: "ঋণ",
      manage: "ঋণ ব্যবস্থাপনা"
    },
    newBtn: "নতুন ঋণ"
  },
  repay: {
    pageTitle: "ঋণ পরিশোধ",
    subtitle: "বিস্তারিত দেখতে এবং নতুন পরিশোধ রেকর্ড করতে একটি ঋণ নির্বাচন করুন।",
    breadcrumb: {
      home: "ঋণ",
      repay: "কিস্তি গ্রহণ"
    }
  },
  ledger: {
    pageTitle: "ঋণ লেজার",
    subtitle: "সকল ঋণ প্রদান এবং পরিশোধের লেজার লেনদেন দেখুন।",
    subtitleSpecific: "{name} এর লেজার। মোট ঋণ: ৳{amount}, অবশিষ্ট: ৳{remaining}",
    breadcrumb: {
      home: "ঋণ",
      ledger: "ঋণ লেজার"
    }
  },
  form: {
    steps: {
      step1: "ধাপ ১",
      beneficiarySelection: "সুবিধাভোগী নির্বাচন",
      step2: "ধাপ ২",
      loanInfo: "ঋণের তথ্য",
      step3: "ধাপ ৩",
      repaymentInfo: "পরিশোধের তথ্য",
      step4: "ধাপ ৪",
      review: "পর্যালোচনা ও জমা"
    },
    beneficiary: "সুবিধাভোগী",
    selectBeneficiary: "সুবিধাভোগী নির্বাচন করুন",
    fundingSource: "তহবিলের উৎস",
    selectFundingSource: "তহবিলের উৎস নির্বাচন করুন",
    group: "গ্রুপ",
    availableBalance: "বিদ্যমান ব্যালেন্স",
    remainingAfterLoan: "ঋণের পর অবশিষ্ট",
    purpose: "ঋণের উদ্দেশ্য",
    selectPurpose: "উদ্দেশ্য নির্বাচন করুন",
    purposes: {
      business: "ব্যবসা",
      education: "শিক্ষা",
      medical: "চিকিৎসা",
      agriculture: "কৃষি",
      housing: "বাসস্থান",
      other: "অন্যান্য"
    },
    reason: "কারণ",
    reasonPlaceholder: "অনুগ্রহ করে কারণ উল্লেখ করুন",
    amount: "ঋণের পরিমাণ",
    installmentType: "কিস্তির ধরন",
    types: {
      monthly: "মাসিক",
      weekly: "সাপ্তাহিক",
      custom: "কাস্টম"
    },
    installmentAmount: "কিস্তির পরিমাণ",
    numberOfInstallments: "কিস্তির সংখ্যা",
    firstInstallmentDate: "প্রথম কিস্তির তারিখ",
    remarks: "মন্তব্য",
    remarksPlaceholder: "যেকোনো অতিরিক্ত মন্তব্য",
    guarantors: "গ্যারান্টর",
    guarantorsDesc: "ঋণের গ্যারান্টর সম্পর্কে তথ্য",
    guarantorName: "গ্যারান্টরের নাম",
    guarantorPhone: "গ্যারান্টরের ফোন",
    guarantorAddress: "গ্যারান্টরের ঠিকানা",
    guarantorRelation: "সম্পর্ক",
    addGuarantor: "গ্যারান্টর যোগ করুন",
    removeGuarantor: "গ্যারান্টর মুছুন",
    documents: "নথিপত্র",
    documentsDesc: "প্রয়োজনীয় নথিপত্র আপলোড করুন",
    documentType: "নথির ধরন",
    uploadDocument: "নথি আপলোড",
    uploading: "আপলোড হচ্ছে...",
    removeDocument: "নথি মুছুন",
    summary: "সারসংক্ষেপ",
    summaryDesc: "জমা দেওয়ার আগে অনুগ্রহ করে তথ্য পর্যালোচনা করুন",
    disbursementDate: "প্রদানের তারিখ",
    cancel: "বাতিল",
    save: "ঋণ জমা দিন",
    saving: "জমা দেওয়া হচ্ছে...",
    success: "ঋণ সফলভাবে তৈরি হয়েছে",
    error: "ঋণ সংরক্ষণ করতে ব্যর্থ হয়েছে",
    updateSuccess: "ঋণ সফলভাবে আপডেট করা হয়েছে"
  },
  repaymentForm: {
    loanSelector: "ঋণ নির্বাচন করুন",
    beneficiarySelector: "সুবিধাভোগী নির্বাচন করুন",
    amount: "পরিশোধের পরিমাণ",
    date: "পরিশোধের তারিখ",
    receipt: "রশিদ নম্বর",
    receiptPlaceholder: "রশিদ নম্বর লিখুন",
    remarks: "মন্তব্য",
    cancel: "বাতিল",
    save: "কিস্তি জমা দিন",
    saving: "সংরক্ষণ করা হচ্ছে...",
    success: "কিস্তি সফলভাবে রেকর্ড করা হয়েছে",
    error: "কিস্তি রেকর্ড করতে ব্যর্থ হয়েছে",
    confirmTitle: "কিস্তি নিশ্চিত করুন",
    confirmDesc: "আপনি কি নিশ্চিত যে এই কিস্তি রেকর্ড করতে চান?"
  },
  table: {
    search: "ঋণ খুঁজুন...",
    columns: {
      beneficiary: "সুবিধাভোগী",
      loanNo: "ঋণ নং",
      amount: "পরিমাণ",
      balance: "অবশিষ্ট ব্যালেন্স",
      status: "স্ট্যাটাস",
      due: "বকেয়ার অবস্থা",
      actions: "অ্যাকশন",
      date: "তারিখ",
      type: "ধরন",
      debit: "ডেবিট",
      credit: "ক্রেডিট",
      description: "বিবরণ"
    },
    status: {
      pending: "অপেক্ষমান",
      active: "সক্রিয়",
      completed: "সম্পন্ন",
      defaulted: "খেলাপি",
      rejected: "বাতিল"
    },
    dueStatus: {
      noDue: "কোনো বকেয়া নেই",
      completed: "সম্পন্ন",
      overdue: "মেয়াদোত্তীর্ণ",
      dueToday: "আজ নির্ধারিত",
      upcomingDue: "আসন্ন বকেয়া"
    },
    actions: {
      menu: "অ্যাকশন",
      view: "বিস্তারিত দেখুন",
      edit: "ঋণ সম্পাদনা",
      repay: "কিস্তি গ্রহণ",
      ledger: "লেজার দেখুন",
      delete: "ঋণ মুছুন"
    },
    pagination: {
      selected: "নির্বাচিত",
      of: "এর মধ্যে",
      rows: "সারি",
      previous: "পূর্ববর্তী",
      next: "পরবর্তী"
    },
    empty: "কোনো ঋণ পাওয়া যায়নি।"
  }
};

fs.writeFileSync('src/i18n/dictionaries/en/loans.json', JSON.stringify(en, null, 2));
fs.writeFileSync('src/i18n/dictionaries/bn/loans.json', JSON.stringify(bn, null, 2));

let indexContent = fs.readFileSync('src/i18n/dictionaries/index.ts', 'utf8');
indexContent = indexContent.replace(/import enContributions from '\.\/en\/contributions\.json';/g, "import enContributions from './en/contributions.json';\nimport enLoans from './en/loans.json';");
indexContent = indexContent.replace(/import bnContributions from '\.\/bn\/contributions\.json';/g, "import bnContributions from './bn/contributions.json';\nimport bnLoans from './bn/loans.json';");
indexContent = indexContent.replace(/contributions: enContributions,/g, "contributions: enContributions,\n  loans: enLoans,");
indexContent = indexContent.replace(/contributions: bnContributions,/g, "contributions: bnContributions,\n  loans: bnLoans,");
fs.writeFileSync('src/i18n/dictionaries/index.ts', indexContent);

console.log('Loans dictionaries setup complete');
