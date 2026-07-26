const fs = require('fs');
const glob = require('glob');
const path = require('path');

// Basic AST-like regex replacements:
// 1. new Date().getFullYear() -> getNow().getFullYear()
// 2. new Date().getMonth() -> getNow().getMonth()
// 3. new Date().toISOString().split('T')[0] -> getNow().toISOString().split('T')[0] 
// (wait, getNow().toISOString() gives UTC string of the shifted time, which happens to have the exact Dhaka year-month-day in the UTC position! But it's safer to use date-fns format). Let's use `format(getNow(), 'yyyy-MM-dd')`.
// Actually, `getNow()` returns a date where UTC methods (or local methods) might be misleading. Wait, `toZonedTime` shifts the internal timestamp so that LOCAL methods return the Zoned time. 
// Example: dhaka = toZonedTime(new Date(), 'Asia/Dhaka'). dhaka.getFullYear() -> returns Dhaka year. 
// dhaka.toISOString() is NOT Dhaka time string, it's shifted UTC string. But dhaka.toLocaleDateString() or dhaka.getFullYear() is correct!

glob('src/**/*.{ts,tsx}', (err, files) => {
  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf-8');
    let original = content;

    // Check if file uses new Date() in ways we want to replace
    let modified = false;

    if (content.includes('new Date().getFullYear()')) {
      content = content.replace(/new Date\(\)\.getFullYear\(\)/g, 'getNow().getFullYear()');
      modified = true;
    }
    if (content.includes('new Date().getMonth()')) {
      content = content.replace(/new Date\(\)\.getMonth\(\)/g, 'getNow().getMonth()');
      modified = true;
    }
    if (content.includes('new Date().getUTCMonth()')) {
      content = content.replace(/new Date\(\)\.getUTCMonth\(\)/g, 'getNow().getMonth()'); // change to local since it's zoned
      modified = true;
    }
    
    // Replace const today = new Date() 
    if (content.match(/const today = new Date\(\)/)) {
      content = content.replace(/const today = new Date\(\)/g, 'const today = getNow()');
      modified = true;
    }

    if (content.includes("new Date().toISOString().split('T')[0]") || content.includes('new Date().toISOString().split("T")[0]')) {
      // getNow() shifted date's ISO string has the right date in the local part if we use format, but toISOString() on a zoned date actually outputs the wrong day if we just split('T')[0] because it's in UTC. Wait, toZonedTime makes local methods correct. So toISOString() uses UTC methods, meaning it will be shifted. 
      // It's better to just use format(getNow(), 'yyyy-MM-dd')
      content = content.replace(/new Date\(\)\.toISOString\(\)\.split\(['"]T['"]\)\[0\]/g, 'formatDate(getNow(), "yyyy-MM-dd")');
      // add import for format from date-fns if needed, but wait! We can just use getNow().toLocaleDateString('en-CA') which outputs yyyy-MM-dd in local time.
      content = content.replace(/formatDate\(getNow\(\), "yyyy-MM-dd"\)/g, "getNow().toLocaleDateString('en-CA')");
      modified = true;
    }
    
    // Some places do: const now = new Date();
    if (content.match(/const now = new Date\(\);?/)) {
      content = content.replace(/const now = new Date\(\);?/g, 'const now = getNow();');
      modified = true;
    }

    // toLocaleDateString('bn-BD')
    if (content.includes(".toLocaleDateString('bn-BD')")) {
      content = content.replace(/new Date\(\)\.toLocaleDateString\('bn-BD'\)/g, 'formatDate(getNow())');
      modified = true;
    }

    if (modified) {
      // Inject import if not present
      if (!content.includes('getNow')) {
        if (!content.includes('import { getNow')) {
           // check if we already have date imports
           content = 'import { getNow, formatDate } from "@/lib/date";\n' + content;
        }
      }
      fs.writeFileSync(file, content, 'utf-8');
      console.log('Updated', file);
    }
  });
});
