const fs = require('fs');

const file = 'src/features/members/components/member-dues-table.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/if \(status === t\("members\.table\.paid"\) \|\| status === t\("members\.table\.advance"\)\) variant = "default"/g, 
  'if (status === "Paid" || status === "Advance") variant = "default"');
content = content.replace(/if \(status === t\("members\.table\.due"\)\) variant = "destructive"/g, 
  'if (status === "Due") variant = "destructive"');
content = content.replace(/<SelectItem value=t\("members\.table\.paid"\)>/g, 
  '<SelectItem value="Paid">');
content = content.replace(/<SelectItem value=t\("members\.table\.due"\)>/g, 
  '<SelectItem value="Due">');
content = content.replace(/<SelectItem value=t\("members\.table\.advance"\)>/g, 
  '<SelectItem value="Advance">');

fs.writeFileSync(file, content);
