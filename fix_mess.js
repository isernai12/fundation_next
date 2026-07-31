const fs = require('fs');

const mappings = {
  // Toast messages
  "k_691075": ["messages.delete_success", "Member deleted successfully", "সদস্যকে সফলভাবে মুছে ফেলা হয়েছে"],
  "k_29705e": ["messages.restore_success", "Member restored successfully", "সদস্যকে সফলভাবে পুনঃস্থাপন করা হয়েছে"],
  
  // Table headers & actions
  "k_7c6fd8": ["table.actions", "Actions", "পদক্ষেপ"],
  "k_d7611a": ["table.actions_label", "Actions", "পদক্ষেপ"],
  "k_f61612": ["actions.view_profile", "View Profile", "প্রোফাইল দেখুন"],
  "k_bc999c": ["actions.edit_member", "Edit Member", "সদস্য সম্পাদনা করুন"],
  "k_985aa7": ["actions.ledger", "Ledger", "লেজার"],
  "k_af635f": ["actions.deactivate_menu", "Deactivate", "নিষ্ক্রিয় করুন"],
  "k_4a40fa": ["actions.activate_menu", "Activate", "সক্রিয় করুন"],
  "k_fca83c": ["actions.restore_menu", "Restore", "পুনঃস্থাপন করুন"],
  "k_bfb977": ["actions.delete_menu", "Delete", "মুছে ফেলুন"],
  
  // Search & Filter
  "k_8434ad": ["table.search_placeholder", "Search by name...", "নাম দিয়ে খুঁজুন..."],
  "k_2d822b": ["table.status_placeholder", "Status", "অবস্থা"],
  "k_9cf414": ["table.all_status", "All Status", "সকল অবস্থা"],
  "k_0a6de1": ["table.group_placeholder", "Group", "গ্রুপ"],
  "k_a3853a": ["table.all_groups", "All Groups", "সকল গ্রুপ"],
  "k_392dbe": ["table.no_results", "No results found.", "কোন ফলাফল পাওয়া যায়নি।"],
  "k_8347d9": ["table.previous", "Previous", "পূর্ববর্তী"],
  "k_30ffb9": ["table.next", "Next", "পরবর্তী"],
  
  // Status Dialog
  "k_355f14": ["dialog.deactivate_title", "Deactivate Member", "সদস্য নিষ্ক্রিয় করুন"],
  "k_10e804": ["dialog.activate_title", "Activate Member", "সদস্য সক্রিয় করুন"],
  "k_9dbf58": ["dialog.status_confirm_prefix", "Are you sure you want to change the status of ", "আপনি কি নিশ্চিত যে আপনি "],
  "k_2dc794": ["dialog.status_confirm_mid1", ") to ", ") এর স্ট্যাটাস "],
  "inactive_6adfe8": ["dialog.inactive_strong", "Inactive", "নিষ্ক্রিয়"],
  "k_185d4a": ["dialog.status_confirm_suffix", "?", " করতে চান?"],
  "k_0c2d81": ["dialog.deactivate_warning", "They will no longer be able to log in or receive notifications.", "তারা আর লগ ইন করতে বা নোটিফিকেশন পেতে সক্ষম হবে না।"],
  "k_a75ffc": ["dialog.status_confirm_mid2", ") to ", ") এর স্ট্যাটাস "],
  "active_389b18": ["dialog.active_strong", "Active", "সক্রিয়"],
  "k_da29f2": ["dialog.activate_warning", "They will regain access to the platform.", "তারা প্ল্যাটফর্মে পুনরায় অ্যাক্সেস পাবে।"],
  "k_a6de61": ["dialog.select_reason", "Select reason", "কারণ নির্বাচন করুন"],
  
  // Reasons
  "k_b37add": ["reasons.left", "Left the foundation", "ফাউন্ডেশন ছেড়েছেন"],
  "k_5c63c5": ["reasons.transferred", "Transferred", "স্থানান্তরিত"],
  "k_388d5d": ["reasons.deceased", "Deceased", "মৃত"],
  "k_6ef150": ["reasons.temp_inactive", "Temporary inactive", "সাময়িক নিষ্ক্রিয়"],
  "k_87838c": ["reasons.other", "Other", "অন্যান্য"],
  "reason_54f3bf": ["dialog.reason_label", "Reason for deactivation", "নিষ্ক্রিয় করার কারণ"],
  "optional_b23cc5": ["dialog.custom_note_label", "Custom Note (Optional)", "কাস্টম নোট (ঐচ্ছিক)"],
  "k_cf93cf": ["dialog.custom_note_placeholder", "Enter details...", "বিস্তারিত লিখুন..."],
  
  // Actions
  "k_c94621": ["actions.cancel", "Cancel", "বাতিল"],
  
  // Delete Dialog
  "k_9053ed": ["dialog.delete_title", "Delete Member", "সদস্য মুছে ফেলুন"],
  "k_e0cef9": ["dialog.delete_confirm_prefix", "Are you sure you want to delete ", "আপনি কি নিশ্চিত যে আপনি "],
  "k_b056f8": ["dialog.delete_confirm_suffix", "?", " কে মুছে ফেলতে চান?"],
  
  // Restore Dialog
  "k_f4f0e7": ["dialog.restore_title", "Restore Member", "সদস্য পুনঃস্থাপন করুন"],
  "k_65d2cc": ["dialog.restore_confirm_prefix", "Are you sure you want to restore ", "আপনি কি নিশ্চিত যে আপনি "],
  "k_f98ef8": ["dialog.restore_confirm_suffix", "?", " কে পুনঃস্থাপন করতে চান?"],
  
  // Generic
  "open_menu_64d2cc": ["actions.open_menu", "Open menu", "মেনু খুলুন"],
  "active_d8a75d": ["status.active_caps", "ACTIVE", "সক্রিয়"],
  "inactive_77aaa6": ["status.inactive_caps", "INACTIVE", "নিষ্ক্রিয়"],
  "active_dd3230": ["status.active", "Active", "সক্রিয়"],
  "inactive_8297e2": ["status.inactive", "Inactive", "নিষ্ক্রিয়"],
  "deleted_191181": ["status.deleted", "Deleted", "মুছে ফেলা হয়েছে"],
  "k_8cdd29": ["actions.edit", "Edit", "সম্পাদনা"],
  "k_a0b40f": ["actions.print", "Print", "প্রিন্ট"]
};

const doReplace = (filepath) => {
  if (!fs.existsSync(filepath)) return;
  let content = fs.readFileSync(filepath, 'utf8');
  for (const [oldKey, val] of Object.entries(mappings)) {
    content = content.replace(new RegExp(`"members\\.${oldKey}"`, 'g'), `"members.${val[0]}"`);
  }
  fs.writeFileSync(filepath, content);
};

doReplace('src/features/members/components/members-table.tsx');
doReplace('src/features/members/components/member-profile-actions.tsx');
doReplace('src/app/members/[id]/edit/page.tsx');

// Add to JSON
const en = JSON.parse(fs.readFileSync('src/i18n/dictionaries/en/members.json'));
const bn = JSON.parse(fs.readFileSync('src/i18n/dictionaries/bn/members.json'));

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

fs.writeFileSync('src/i18n/dictionaries/en/members.json', JSON.stringify(en, null, 2));
fs.writeFileSync('src/i18n/dictionaries/bn/members.json', JSON.stringify(bn, null, 2));

