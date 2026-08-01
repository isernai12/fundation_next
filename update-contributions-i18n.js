const fs = require('fs');

const en = {
  manage: {
    pageTitle: "Manage Contributions",
    subtitle: "View and manage all member contributions",
    breadcrumb: {
      home: "Contributions",
      manage: "Manage Contributions"
    },
    newContribution: "New Contribution"
  },
  monthly: {
    pageTitle: "Monthly Contributions",
    subtitle: "Contributions for",
    breadcrumb: {
      home: "Contributions",
      monthly: "Monthly Contributions"
    }
  },
  receive: {
    pageTitle: "Receive Contribution",
    subtitle: "Record a new member contribution",
    breadcrumb: {
      home: "Contributions",
      receive: "Receive Contribution"
    }
  },
  form: {
    title: "New Contribution",
    description: "Record a new monthly or additional contribution",
    member: "Select Member *",
    month: "Month *",
    monthPlaceholder: "Select Month",
    year: "Year *",
    amount: "Amount *",
    paymentDate: "Payment Date *",
    paymentMethod: "Payment Method *",
    paymentMethodPlaceholder: "Select method",
    methods: {
      cash: "Cash",
      bank: "Bank Transfer",
      mobile: "Mobile Money (bKash/Nagad)"
    },
    reference: "Reference / Receipt No (Optional)",
    referencePlaceholder: "e.g. TrxID or Receipt #",
    status: "Status *",
    statusPlaceholder: "Select status",
    statuses: {
      paid: "Paid",
      pending: "Pending",
      cancelled: "Cancelled"
    },
    notes: "Remarks / Notes",
    notesPlaceholder: "Any additional notes",
    isAdditional: "Additional Payment",
    isAdditionalDescription: "Check this if this is an extra payment, not a regular monthly due",
    cancel: "Cancel",
    save: "Save Contribution",
    saving: "Saving...",
    successMessage: "Contribution successfully saved",
    errorMessage: "Failed to save contribution"
  },
  table: {
    filterPlaceholder: "Filter members...",
    print: "Print Selected",
    exportPdf: "Export PDF",
    columns: {
      member: "Member",
      group: "Group",
      period: "Period",
      amount: "Amount",
      status: "Status",
      type: "Type",
      actions: "Actions"
    },
    types: {
      standard: "Standard",
      additional: "Additional"
    },
    statuses: {
      paid: "Paid",
      pending: "Pending"
    },
    actions: {
      menu: "Actions",
      view: "View Details",
      edit: "Edit Contribution",
      markPaid: "Mark as Paid",
      markPending: "Mark as Pending",
      printReceipt: "Print Receipt",
      downloadPdf: "Download PDF",
      viewMember: "View Member Profile",
      viewLedger: "View Ledger Entry",
      delete: "Delete Contribution",
      deleteConfirm: "Are you sure you want to delete this contribution? This will permanently remove the record and reverse all associated ledger entries. This action cannot be undone."
    },
    empty: "No contributions found.",
    pagination: {
      selected: "selected",
      of: "of",
      rows: "rows",
      previous: "Previous",
      next: "Next"
    },
    messages: {
      deletedSuccess: "Contribution successfully deleted",
      deletedError: "Failed to delete contribution",
      missingDetails: "Missing payment details. Please edit to add amount and date.",
      statusUpdated: "Status successfully updated",
      ledgerFound: "Ledger entry found",
      ledgerNotFound: "No ledger entry found for unpaid contribution"
    }
  },
  edit: {
    title: "Edit Contribution",
    description: "Update contribution and payment details",
    success: "Contribution updated successfully"
  },
  view: {
    title: "Contribution Details",
    description: "Detailed information about this contribution",
    member: "Member",
    group: "Group",
    period: "Period",
    type: "Type",
    types: {
      standard: "Monthly Standard",
      additional: "Additional Payment"
    },
    expectedAmount: "Expected Amount",
    status: "Status",
    paymentAmount: "Payment Amount",
    paymentDate: "Payment Date",
    paymentMethod: "Payment Method",
    reference: "Reference / TrxID",
    notes: "Notes / Remarks",
    noNotes: "No notes provided.",
    ledgerTransactionId: "Ledger Transaction ID",
    noPayments: "No payments recorded for this contribution."
  },
  months: [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]
};

const bn = {
  manage: {
    pageTitle: "চাঁদা ব্যবস্থাপনা",
    subtitle: "সদস্যদের সকল চাঁদা দেখুন এবং পরিচালনা করুন",
    breadcrumb: {
      home: "চাঁদা",
      manage: "চাঁদা ব্যবস্থাপনা"
    },
    newContribution: "নতুন চাঁদা"
  },
  monthly: {
    pageTitle: "মাসিক চাঁদা",
    subtitle: "চাঁদা সমূহ -",
    breadcrumb: {
      home: "চাঁদা",
      monthly: "মাসিক চাঁদা"
    }
  },
  receive: {
    pageTitle: "চাঁদা গ্রহণ",
    subtitle: "সদস্যের নতুন চাঁদা রেকর্ড করুন",
    breadcrumb: {
      home: "চাঁদা",
      receive: "চাঁদা গ্রহণ"
    }
  },
  form: {
    title: "নতুন চাঁদা",
    description: "নতুন মাসিক বা অতিরিক্ত চাঁদা রেকর্ড করুন",
    member: "সদস্য নির্বাচন করুন *",
    month: "মাস *",
    monthPlaceholder: "মাস নির্বাচন করুন",
    year: "বছর *",
    amount: "পরিমাণ *",
    paymentDate: "প্রদানের তারিখ *",
    paymentMethod: "প্রদানের মাধ্যম *",
    paymentMethodPlaceholder: "মাধ্যম নির্বাচন করুন",
    methods: {
      cash: "নগদ",
      bank: "ব্যাংক ট্রান্সফার",
      mobile: "মোবাইল ব্যাংকিং (বিকাশ/নগদ)"
    },
    reference: "রেফারেন্স / রশিদ নং (ঐচ্ছিক)",
    referencePlaceholder: "উদা: TrxID বা রশিদ #",
    status: "স্ট্যাটাস *",
    statusPlaceholder: "স্ট্যাটাস নির্বাচন করুন",
    statuses: {
      paid: "পরিশোধিত",
      pending: "অপেক্ষমান",
      cancelled: "বাতিল"
    },
    notes: "মন্তব্য",
    notesPlaceholder: "যেকোনো অতিরিক্ত মন্তব্য",
    isAdditional: "অতিরিক্ত চাঁদা",
    isAdditionalDescription: "এটি মাসিক চাঁদার বাইরে অতিরিক্ত চাঁদা হলে টিক দিন",
    cancel: "বাতিল করুন",
    save: "সংরক্ষণ করুন",
    saving: "সংরক্ষণ করা হচ্ছে...",
    successMessage: "চাঁদা সফলভাবে সংরক্ষিত হয়েছে",
    errorMessage: "চাঁদা সংরক্ষণ করতে ব্যর্থ হয়েছে"
  },
  table: {
    filterPlaceholder: "সদস্য খুঁজুন...",
    print: "নির্বাচিতগুলো প্রিন্ট করুন",
    exportPdf: "পিডিএফ ডাউনলোড",
    columns: {
      member: "সদস্য",
      group: "গ্রুপ",
      period: "সময়কাল",
      amount: "পরিমাণ",
      status: "স্ট্যাটাস",
      type: "ধরন",
      actions: "অ্যাকশন"
    },
    types: {
      standard: "নিয়মিত",
      additional: "অতিরিক্ত"
    },
    statuses: {
      paid: "পরিশোধিত",
      pending: "অপেক্ষমান"
    },
    actions: {
      menu: "অ্যাকশন",
      view: "বিস্তারিত দেখুন",
      edit: "চাঁদা সম্পাদনা",
      markPaid: "পরিশোধিত হিসেবে চিহ্নিত করুন",
      markPending: "অপেক্ষমান হিসেবে চিহ্নিত করুন",
      printReceipt: "রশিদ প্রিন্ট করুন",
      downloadPdf: "পিডিএফ ডাউনলোড",
      viewMember: "সদস্যের প্রোফাইল দেখুন",
      viewLedger: "লেজার এন্ট্রি দেখুন",
      delete: "চাঁদা মুছুন",
      deleteConfirm: "আপনি কি নিশ্চিত যে এই চাঁদাটি মুছে ফেলতে চান? এটি রেকর্ড মুছে ফেলবে এবং লেজার এন্ট্রি রিভার্স করবে। এটি আর ফেরত আনা যাবে না।"
    },
    empty: "কোনো চাঁদা পাওয়া যায়নি।",
    pagination: {
      selected: "নির্বাচিত",
      of: "এর মধ্যে",
      rows: "সারি",
      previous: "পূর্ববর্তী",
      next: "পরবর্তী"
    },
    messages: {
      deletedSuccess: "সফলভাবে চাঁদা মুছে ফেলা হয়েছে",
      deletedError: "চাঁদা মুছতে ব্যর্থ হয়েছে",
      missingDetails: "পেমেন্টের বিবরণ নেই। পরিমাণ এবং তারিখ যুক্ত করতে সম্পাদনা করুন।",
      statusUpdated: "স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে",
      ledgerFound: "লেজার এন্ট্রি পাওয়া গেছে",
      ledgerNotFound: "অপরিশোধিত চাঁদার জন্য কোনো লেজার এন্ট্রি নেই"
    }
  },
  edit: {
    title: "চাঁদা সম্পাদনা",
    description: "চাঁদা এবং পেমেন্টের বিবরণ আপডেট করুন",
    success: "চাঁদা সফলভাবে আপডেট করা হয়েছে"
  },
  view: {
    title: "চাঁদার বিস্তারিত",
    description: "এই চাঁদা সম্পর্কে বিস্তারিত তথ্য",
    member: "সদস্য",
    group: "গ্রুপ",
    period: "সময়কাল",
    type: "ধরন",
    types: {
      standard: "মাসিক নিয়মিত",
      additional: "অতিরিক্ত চাঁদা"
    },
    expectedAmount: "প্রত্যাশিত পরিমাণ",
    status: "স্ট্যাটাস",
    paymentAmount: "প্রদত্ত পরিমাণ",
    paymentDate: "প্রদানের তারিখ",
    paymentMethod: "প্রদানের মাধ্যম",
    reference: "রেফারেন্স / TrxID",
    notes: "মন্তব্য",
    noNotes: "কোনো মন্তব্য নেই।",
    ledgerTransactionId: "লেজার লেনদেন আইডি",
    noPayments: "এই চাঁদার জন্য কোনো পেমেন্ট রেকর্ড করা হয়নি।"
  },
  months: [
    "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
    "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"
  ]
};

fs.writeFileSync('src/i18n/dictionaries/en/contributions.json', JSON.stringify(en, null, 2));
fs.writeFileSync('src/i18n/dictionaries/bn/contributions.json', JSON.stringify(bn, null, 2));
console.log('Dictionaries created!');
