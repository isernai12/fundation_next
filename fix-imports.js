const fs = require('fs');
const glob = require('glob');

glob('src/**/*.{ts,tsx}', (err, files) => {
  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf-8');
    let modified = false;

    if (content.includes('getNow') && !content.includes('import { getNow')) {
      // Find the last import statement, or just add it after the 'use client'/'use server' if present, or at the top.
      if (content.startsWith('"use client"') || content.startsWith("'use client'") || content.startsWith('"use server"') || content.startsWith("'use server'")) {
        const lines = content.split('\n');
        lines.splice(1, 0, 'import { getNow } from "@/lib/date";');
        content = lines.join('\n');
      } else {
        content = 'import { getNow } from "@/lib/date";\n' + content;
      }
      modified = true;
    }

    if (content.includes('formatDate(') && !content.includes('import { formatDate')) {
        // Need to add formatDate.
        if (content.includes('import { getNow } from "@/lib/date";')) {
            content = content.replace('import { getNow } from "@/lib/date";', 'import { getNow, formatDate } from "@/lib/date";');
        } else {
            // Might already have an import for format from something else, but we use formatDate.
            if (content.startsWith('"use client"') || content.startsWith("'use client'") || content.startsWith('"use server"') || content.startsWith("'use server'")) {
                const lines = content.split('\n');
                lines.splice(1, 0, 'import { formatDate } from "@/lib/date";');
                content = lines.join('\n');
            } else {
                content = 'import { formatDate } from "@/lib/date";\n' + content;
            }
        }
        modified = true;
    }

    if (modified) {
      fs.writeFileSync(file, content, 'utf-8');
      console.log('Fixed imports for', file);
    }
  });
});
