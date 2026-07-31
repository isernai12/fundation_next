const fs = require('fs');

let content = fs.readFileSync('src/features/members/actions.ts', 'utf8');

const replacements = {
  '"ফর্মের তথ্য সঠিক নয়"': '"members.validation.invalid_form"',
  '"এই জাতীয় পরিচয়পত্র নম্বরটি ইতোমধ্যে ব্যবহৃত হয়েছে"': '"members.validation.nid_exists"',
  '"এই মোবাইল নম্বরটি ইতোমধ্যে ব্যবহৃত হয়েছে"': '"members.validation.mobile_exists"',
  '"এই ইমেইলটি ইতোমধ্যে ব্যবহৃত হয়েছে"': '"members.validation.email_exists"',
  '"সদস্য তৈরি করতে ব্যর্থ হয়েছে"': '"members.messages.add_error"',
  '"সদস্য আপডেট করতে ব্যর্থ হয়েছে"': '"members.messages.update_error"',
  '"সদস্য পাওয়া যায়নি"': '"members.messages.not_found"',
  '"সদস্য স্ট্যাটাস পরিবর্তন করতে ব্যর্থ হয়েছে"': '"members.messages.status_change_error"',
  '"কেবলমাত্র সুপার এডমিন মুছে ফেলা সদস্য পুনঃস্থাপন করতে পারেন।"': '"members.messages.super_admin_restore_only"',
  '"সদস্য পুনঃস্থাপন করতে ব্যর্থ হয়েছে"': '"members.messages.restore_error"',
  '"এই সদস্যের সাথে আর্থিক লেনদেন (চাঁদা/ঋণ/ক্যাম্পেইন) যুক্ত রয়েছে। আর্থিক তথ্যের সুরক্ষার জন্য সদস্যটিকে মোছা যাবে না। আপনি সদস্যকে \'নিষ্ক্রিয় (Inactive)\' করতে পারেন।"': '"members.messages.delete_prevented_financial"',
  '"সদস্য মুছে ফেলতে ব্যর্থ হয়েছে"': '"members.messages.delete_error"'
};

for (const [bnStr, enKey] of Object.entries(replacements)) {
  content = content.replaceAll(bnStr, enKey);
}

fs.writeFileSync('src/features/members/actions.ts', content);

let dueActions = fs.readFileSync('src/features/members/due-actions.ts', 'utf8');
dueActions = dueActions.replaceAll("'নাম পাওয়া যায়নি'", "''"); 
// Actually for due-actions line 154: `${member.fullName || 'নাম পাওয়া যায়নি'}`. 
// We should return the member.fullName directly and the UI can handle the fallback. Or just use the key.
fs.writeFileSync('src/features/members/due-actions.ts', dueActions);
