import fs from 'fs';
import path from 'path';

function walk(dir: string, callback: (filepath: string) => void) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(dirPath);
  });
}

walk('./src', (filepath) => {
  if (filepath.endsWith('.tsx') || filepath.endsWith('.ts')) {
    let content = fs.readFileSync(filepath, 'utf8');
    let changed = false;

    // Matches $${ -> ৳${
    if (content.includes('$${')) {
      content = content.replace(/\$\$\{/g, '৳${');
      changed = true;
    }
    
    // Matches >$ -> >৳
    if (content.match(/>\$/)) {
      content = content.replace(/>\$/g, '>৳');
      changed = true;
    }
    
    // Matches "$ -> "৳
    if (content.match(/"\$/)) {
      content = content.replace(/"\$/g, '"৳');
      changed = true;
    }

    // Matches '$ -> '৳
    if (content.match(/'\$/)) {
      content = content.replace(/'\$/g, "'৳");
      changed = true;
    }

    // Matches USD -> BDT
    if (content.match(/\bUSD\b/)) {
      content = content.replace(/\bUSD\b/g, 'BDT');
      changed = true;
    }

    // Matches Dollar (but not DollarSign) -> Taka
    if (content.match(/\bDollar(?!(Sign))\b/i)) {
      content = content.replace(/\bDollar(?!(Sign))\b/ig, 'Taka');
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(filepath, content, 'utf8');
      console.log(`Updated ${filepath}`);
    }
  }
});
