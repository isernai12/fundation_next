const fs = require('fs');

const updateKeys = (lang) => {
  const file = `src/i18n/dictionaries/${lang}/members.json`;
  const data = JSON.parse(fs.readFileSync(file));

  if (!data.table) data.table = {};
  if (!data.actions) data.actions = {};

  if (lang === 'en') {
    data.messages.activated_success = 'Member activated successfully';
    data.messages.deactivated_success = 'Member deactivated successfully';
    
    data.table.member_id = 'Member ID';
    data.table.name = 'Name';
    data.table.group = 'Group';
    data.table.mobile = 'Mobile';
    data.table.status = 'Status';
    data.table.join_date = 'Join Date';
    
    data.actions.deactivate = 'Deactivate';
    data.actions.activate = 'Activate';
    data.actions.soft_delete_confirm = 'Yes, Soft Delete';
    data.actions.restore = 'Restore';
    data.actions.processing = 'Processing...';
  } else {
    data.messages.activated_success = 'সদস্যকে সফলভাবে পুনরায় সক্রিয় করা হয়েছে';
    data.messages.deactivated_success = 'সদস্যকে সফলভাবে নিষ্ক্রিয় করা হয়েছে';
    
    data.table.member_id = 'সদস্য আইডি';
    data.table.name = 'নাম';
    data.table.group = 'গ্রুপ';
    data.table.mobile = 'মোবাইল';
    data.table.status = 'অবস্থা';
    data.table.join_date = 'যোগদানের তারিখ';
    
    data.actions.deactivate = 'নিষ্ক্রিয় করুন';
    data.actions.activate = 'সক্রিয় করুন';
    data.actions.soft_delete_confirm = 'হ্যাঁ, সফট-ডিলিট করুন';
    data.actions.restore = 'পুনঃস্থাপন করুন';
    data.actions.processing = 'প্রসেসিং...';
  }

  fs.writeFileSync(file, JSON.stringify(data, null, 2));
};

updateKeys('en');
updateKeys('bn');
