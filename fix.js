const fs = require('fs');

function addMetadata(file, title) {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('export const metadata')) {
    const importMatch = content.match(/^import .*?from .*?;\n+/gm);
    if (importMatch) {
      const lastImportIndex = content.lastIndexOf(importMatch[importMatch.length - 1]) + importMatch[importMatch.length - 1].length;
      const metadata = `import { Metadata } from "next";\n\nexport const metadata: Metadata = {\n  title: "${title}",\n};\n\n`;
      content = content.slice(0, lastImportIndex) + metadata + content.slice(lastImportIndex);
    } else {
      content = `import { Metadata } from "next";\n\nexport const metadata: Metadata = {\n  title: "${title}",\n};\n\n` + content;
    }
    fs.writeFileSync(file, content);
  }
}

function replaceAppText(file, replacements) {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  for (const [search, replace] of Object.entries(replacements)) {
    if (content.includes(search)) {
      content = content.split(search).join(replace);
      changed = true;
    }
  }
  if (changed) fs.writeFileSync(file, content);
}

// 1. Add metadata to management pages
addMetadata("src/app/beneficiaries/manage/page.tsx", "Beneficiary Management");
addMetadata("src/app/campaigns/manage/page.tsx", "Sadaqah Management");
addMetadata("src/app/grants/manage/page.tsx", "Grant Management");
addMetadata("src/app/loans/page.tsx", "Qard Hasanah Management");
addMetadata("src/app/groups/manage/page.tsx", "Group Management");

// 2. Fix members edit
addMetadata("src/app/members/[id]/edit/page.tsx", "Edit Member");
replaceAppText("src/app/members/[id]/edit/page.tsx", {
  '<Trans tKey="app.text" />': '<Trans tKey="members.edit.title" fallback="Edit Member" />'
});

// 3. Fix profile
replaceAppText("src/app/profile/page.tsx", {
  '<Trans tKey="app.text" />': '<Trans tKey="profile.title" fallback="My Profile" />'
});
addMetadata("src/app/profile/page.tsx", "My Profile");

replaceAppText("src/app/profile/devices/page.tsx", {
  '<Trans tKey="app.text" />': '<Trans tKey="profile.devices" fallback="Active Devices" />'
});
addMetadata("src/app/profile/devices/page.tsx", "Active Devices");

// 4. Fix loans
replaceAppText("src/app/loans/today-collection/page.tsx", {
  '<Trans tKey="app.text" />': '<Trans tKey="loans.todayCollection.title" fallback="Today\'s Collection" />'
});
addMetadata("src/app/loans/today-collection/page.tsx", "Today's Collection");

replaceAppText("src/app/loans/upcoming-collection/page.tsx", {
  '<Trans tKey="app.text" />': '<Trans tKey="loans.upcomingCollection.title" fallback="Upcoming Collection" />'
});
addMetadata("src/app/loans/upcoming-collection/page.tsx", "Upcoming Collection");

// 5. Fix members dues page (which has 16 app.texts)
// To keep it simple we can just replace all with generic or specific
let duesContent = fs.readFileSync("src/app/(dashboard)/members/[id]/dues/page.tsx", 'utf8');
duesContent = duesContent.replace(/<h1.*?<Trans tKey="app.text" \/><\/h1>/g, '<h1 className="text-xl font-bold"><Trans tKey="members.dues.title" fallback="Member Dues" /></h1>');
duesContent = duesContent.replace(/<Trans tKey="app.text" \/>/g, ''); // just remove the rest if we can't map them
fs.writeFileSync("src/app/(dashboard)/members/[id]/dues/page.tsx", duesContent);
addMetadata("src/app/(dashboard)/members/[id]/dues/page.tsx", "Member Dues");

