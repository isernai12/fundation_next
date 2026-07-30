const fs = require('fs');

const files = [
  'src/features/campaigns/components/campaign-contributions-table.tsx',
  'src/features/donors/components/donations-table.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('formatDateBanglaLocal') && !content.includes('import { formatDateBanglaLocal')) {
    if (content.includes('import { formatDate')) {
      content = content.replace(/import\s+\{([^}]+)\}\s+from\s+['"]@\/lib\/date['"]/, (match, p1) => {
        let newImports = p1;
        if (!newImports.includes('formatDateBanglaLocal')) {
          newImports += ', formatDateBanglaLocal';
        }
        return `import {${newImports}} from "@/lib/date"`;
      });
    } else {
      content = 'import { formatDateBanglaLocal } from "@/lib/date";\n' + content;
    }
    fs.writeFileSync(file, content);
  }
});
