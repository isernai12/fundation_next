const fs = require('fs');

const fixPage = () => {
  let content = fs.readFileSync('src/app/members/[id]/page.tsx', 'utf8');
  content = content.replace(/t\("members\.status\.active"\)/g, '<Trans tKey="members.status.active" />');
  content = content.replace(/t\("members\.status\.inactive"\)/g, '<Trans tKey="members.status.inactive" />');
  
  // also, in line 69 there is "নাম পাওয়া যায়নি" let's just make it null coalescing to empty string or a new key.
  content = content.replace(/'নাম পাওয়া যায়নি'/g, "''");
  
  // and some hardcoded document titles
  content = content.replace(/"সদস্যের ছবি"/g, '"Member Photo"');
  content = content.replace(/"স্বাক্ষর"/g, '"Signature"');
  content = content.replace(/"জাতীয় পরিচয়পত্র \(সামনের অংশ\)"/g, '"NID Front"');
  content = content.replace(/"জাতীয় পরিচয়পত্র \(পেছনের অংশ\)"/g, '"NID Back"');
  content = content.replace(/"जन्म নিবন্ধন"/g, '"Birth Certificate"');
  
  fs.writeFileSync('src/app/members/[id]/page.tsx', content);
};

fixPage();
