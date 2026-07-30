const fs = require('fs');
const glob = require('glob');

glob('src/**/*.{ts,tsx}', (err, files) => {
  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Find "use client" or 'use client'
    const useClientRegex = /^[ \t]*["']use client["'][ \t]*;?[ \t]*\n?/gm;
    let matchCount = 0;
    
    // We only want to process if it has "use client"
    if (useClientRegex.test(content)) {
      // Remove all occurrences
      let newContent = content.replace(useClientRegex, '');
      // Add exactly one at the very top
      newContent = '"use client"\n\n' + newContent.trimStart();
      
      if (newContent !== content) {
        fs.writeFileSync(file, newContent);
        console.log('Fixed use client in', file);
      }
    }
  });
});
