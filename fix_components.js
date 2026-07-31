const fs = require('fs');

const fixTable = () => {
  let content = fs.readFileSync('src/features/members/components/members-table.tsx', 'utf8');
  content = content.replace(/"সদস্যকে সফলভাবে পুনরায় সক্রিয় করা হয়েছে"/g, 't("members.messages.activated_success")');
  content = content.replace(/"সদস্যকে সফলভাবে নিষ্ক্রিয় করা হয়েছে"/g, 't("members.messages.deactivated_success")');
  content = content.replace(/"সদস্য আইডি"/g, 't("members.table.member_id")');
  content = content.replace(/"নাম"/g, 't("members.table.name")');
  content = content.replace(/"গ্রুপ"/g, 't("members.table.group")');
  content = content.replace(/"মোবাইল"/g, 't("members.table.mobile")');
  content = content.replace(/"অবস্থা"/g, 't("members.table.status")');
  content = content.replace(/"যোগদানের তারিখ"/g, 't("members.table.join_date")');
  content = content.replace(/"প্রসেসিং..."/g, 't("members.actions.processing")');
  content = content.replace(/"নিষ্ক্রিয় করুন"/g, 't("members.actions.deactivate")');
  content = content.replace(/"সক্রিয় করুন"/g, 't("members.actions.activate")');
  content = content.replace(/"হ্যাঁ, সফট-ডিলিট করুন"/g, 't("members.actions.soft_delete_confirm")');
  content = content.replace(/"পুনঃস্থাপন করুন"/g, 't("members.actions.restore")');
  fs.writeFileSync('src/features/members/components/members-table.tsx', content);
};

const fixDialog = () => {
  let content = fs.readFileSync('src/features/members/components/member-form-dialog.tsx', 'utf8');
  content = content.replace(/"সদস্য আপডেট করা হয়েছে"/g, 't("members.messages.update_success")');
  content = content.replace(/"সদস্য যুক্ত করা হয়েছে"/g, 't("members.messages.add_success")');
  fs.writeFileSync('src/features/members/components/member-form-dialog.tsx', content);
};

const fixPage = () => {
  let content = fs.readFileSync('src/app/members/[id]/page.tsx', 'utf8');
  content = content.replace(/"সক্রিয়"/g, 't("members.status.active")');
  content = content.replace(/"নিষ্ক্রিয়"/g, 't("members.status.inactive")');
  // I need to add useLanguage hook to this page if it doesn't have it, but wait!
  // It's a page! Is it a client component? Let me check.
  fs.writeFileSync('src/app/members/[id]/page.tsx', content);
};

fixTable();
fixDialog();
fixPage();
