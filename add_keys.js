const fs = require('fs');

const addKeys = (lang) => {
  const file = `src/i18n/dictionaries/${lang}/members.json`;
  const data = JSON.parse(fs.readFileSync(file));

  if (!data.validation) data.validation = {};
  if (!data.messages) data.messages = {};

  if (lang === 'en') {
    data.validation.invalid_form = 'Invalid form data';
    data.validation.nid_exists = 'This NID is already in use';
    data.validation.mobile_exists = 'This mobile number is already in use';
    data.validation.email_exists = 'This email is already in use';
    
    data.messages.add_error = 'Failed to create member';
    data.messages.update_error = 'Failed to update member';
    data.messages.not_found = 'Member not found';
    data.messages.status_change_error = 'Failed to change member status';
    data.messages.super_admin_restore_only = 'Only Super Admin can restore deleted members.';
    data.messages.restore_error = 'Failed to restore member';
    data.messages.delete_prevented_financial = 'This member has financial transactions (contributions/loans/campaigns) associated with them. To protect financial data, the member cannot be deleted. You can set the member to Inactive instead.';
    data.messages.delete_error = 'Failed to delete member';
    data.messages.no_name = 'Name not found';
    
    data.status = {
      active: 'Active',
      inactive: 'Inactive',
      deleted: 'Deleted'
    };
  } else {
    data.validation.invalid_form = 'ফর্মের তথ্য সঠিক নয়';
    data.validation.nid_exists = 'এই জাতীয় পরিচয়পত্র নম্বরটি ইতোমধ্যে ব্যবহৃত হয়েছে';
    data.validation.mobile_exists = 'এই মোবাইল নম্বরটি ইতোমধ্যে ব্যবহৃত হয়েছে';
    data.validation.email_exists = 'এই ইমেইলটি ইতোমধ্যে ব্যবহৃত হয়েছে';
    
    data.messages.add_error = 'সদস্য তৈরি করতে ব্যর্থ হয়েছে';
    data.messages.update_error = 'সদস্য আপডেট করতে ব্যর্থ হয়েছে';
    data.messages.not_found = 'সদস্য পাওয়া যায়নি';
    data.messages.status_change_error = 'সদস্য স্ট্যাটাস পরিবর্তন করতে ব্যর্থ হয়েছে';
    data.messages.super_admin_restore_only = 'কেবলমাত্র সুপার এডমিন মুছে ফেলা সদস্য পুনঃস্থাপন করতে পারেন।';
    data.messages.restore_error = 'সদস্য পুনঃস্থাপন করতে ব্যর্থ হয়েছে';
    data.messages.delete_prevented_financial = "এই সদস্যের সাথে আর্থিক লেনদেন (চাঁদা/ঋণ/ক্যাম্পেইন) যুক্ত রয়েছে। আর্থিক তথ্যের সুরক্ষার জন্য সদস্যটিকে মোছা যাবে না। আপনি সদস্যকে 'নিষ্ক্রিয় (Inactive)' করতে পারেন।";
    data.messages.delete_error = 'সদস্য মুছে ফেলতে ব্যর্থ হয়েছে';
    data.messages.no_name = 'নাম পাওয়া যায়নি';
    
    data.status = {
      active: 'সক্রিয়',
      inactive: 'নিষ্ক্রিয়',
      deleted: 'মুছে ফেলা হয়েছে'
    };
  }

  fs.writeFileSync(file, JSON.stringify(data, null, 2));
};

addKeys('en');
addKeys('bn');
