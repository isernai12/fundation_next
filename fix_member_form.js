const fs = require('fs');
let content = fs.readFileSync('src/features/members/components/member-form.tsx', 'utf8');

// Fix syntax errors with subtext
content = content.replace(/subtext=t\("members\.documents\.format_helper"\)/g, 'subtext={t("members.documents.format_helper")}');

// Fix "সংরক্ষণ"
content = content.replace(/: "সংরক্ষণ"/, ': t("members.actions.save")');

// Fix the mangled section (Line 582-585)
const badSection = `                                <FormControl>
                                  <Input placeholder={t("members.emergency_contact.mobile")}"}</FormLabel>
                                <FormControl>
                                  <Input placeholder={t("members.personal_info.mobile")} {...field} />`;

const goodSection = `                                <FormControl>
                                  <Input placeholder={t("members.emergency_contact.mobile")} {...field} />`;

content = content.replace(badSection, goodSection);

fs.writeFileSync('src/features/members/components/member-form.tsx', content);
