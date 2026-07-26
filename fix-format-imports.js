const fs = require('fs');
const glob = require('glob');

glob('src/**/*.{ts,tsx}', (err, files) => {
  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf-8');
    let modified = false;

    // Remove the whole `import { formatDate } from "@/lib/date";` if the file also imports it from `@/lib/format`
    if (content.includes('import { formatDate } from "@/lib/date";') && content.match(/import\s+\{[^}]*formatDate[^}]*\}\s+from\s+["']@\/lib\/format["']/)) {
        content = content.replace(/import \{ formatDate \} from "@\/lib\/date";\n?/, '');
        modified = true;
    }
    
    // What if it was injected as `import { getNow, formatDate } from "@/lib/date";`?
    if (content.includes('import { getNow, formatDate } from "@/lib/date";') && content.match(/import\s+\{[^}]*formatDate[^}]*\}\s+from\s+["']@\/lib\/format["']/)) {
        content = content.replace(/import \{ getNow, formatDate \} from "@\/lib\/date";\n?/, 'import { getNow } from "@/lib/date";\n');
        modified = true;
    }

    if (modified) {
      fs.writeFileSync(file, content, 'utf-8');
      console.log('Fixed format imports for', file);
    }
  });
});
