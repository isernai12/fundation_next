const fs = require('fs');
const glob = require('glob');

glob('src/**/*.{ts,tsx}', (err, files) => {
  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Fix en-CA
    content = content.replace(/getNow\(\)\.toLocaleDateString\(['"]en-CA['"]\)/g, "formatDateInput(getNow())");
    
    // Fix bn-BD for new Date(x)
    content = content.replace(/new Date\(([^)]+)\)\.toLocaleDateString\(['"]bn-BD['"]\)/g, "formatDateBanglaLocal($1)");
    
    // Fix bn-BD for new Date(x) - toLocaleString
    content = content.replace(/new Date\(([^)]+)\)\.toLocaleString\(['"]bn-BD['"]\)/g, "formatDateTimeBanglaLocal($1)");
    
    // Fix en-CA for other patterns if any like new Date(...).toLocaleDateString('en-CA')
    content = content.replace(/new Date\(([^)]+)\)\.toLocaleDateString\(['"]en-CA['"]\)/g, "formatDateInput($1)");

    if (content !== original) {
      const imports = [];
      if (content.includes('formatDateInput') && !original.includes('formatDateInput')) imports.push('formatDateInput');
      if (content.includes('formatDateBanglaLocal') && !original.includes('formatDateBanglaLocal')) imports.push('formatDateBanglaLocal');
      if (content.includes('formatDateTimeBanglaLocal') && !original.includes('formatDateTimeBanglaLocal')) imports.push('formatDateTimeBanglaLocal');

      if (imports.length > 0) {
        if (content.includes('@/lib/date')) {
          content = content.replace(/import\s+\{([^}]+)\}\s+from\s+['"]@\/lib\/date['"]/, (match, p1) => {
             let newImports = p1;
             imports.forEach(imp => {
               if (!newImports.includes(imp)) newImports += `, ${imp}`;
             });
             return `import {${newImports}} from "@/lib/date"`;
          });
        } else {
          content = `import { ${imports.join(', ')} } from "@/lib/date";\n` + content;
        }
      }
      fs.writeFileSync(file, content);
      console.log('Fixed', file);
    }
  });
});
