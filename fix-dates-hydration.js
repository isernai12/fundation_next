const fs = require('fs');
const glob = require('glob');
const path = require('path');

// 1. Update src/lib/date.ts
const dateTsPath = path.join(__dirname, 'src/lib/date.ts');
let dateTs = fs.readFileSync(dateTsPath, 'utf8');

const newFunctions = `
/**
 * Formats date and time like toLocaleString('bn-BD')
 */
export function formatDateTimeBanglaLocal(date: Date | string | number): string {
  const dhakaDate = toDhakaTime(date);
  const timeStr = formatTz(dhakaDate, 'd/M/yyyy, h:mm:ss a', { timeZone: TIMEZONE });
  return toBanglaDigits(timeStr);
}

/**
 * Formats date like toLocaleDateString('bn-BD')
 */
export function formatDateBanglaLocal(date: Date | string | number): string {
  const dhakaDate = toDhakaTime(date);
  const timeStr = formatTz(dhakaDate, 'd/M/yyyy', { timeZone: TIMEZONE });
  return toBanglaDigits(timeStr);
}

/**
 * Formats date as YYYY-MM-DD for HTML inputs
 */
export function formatDateInput(date: Date | string | number): string {
  const dhakaDate = toDhakaTime(date);
  return formatTz(dhakaDate, 'yyyy-MM-dd', { timeZone: TIMEZONE });
}
`;

if (!dateTs.includes('formatDateTimeBanglaLocal')) {
  dateTs += '\n' + newFunctions;
  fs.writeFileSync(dateTsPath, dateTs);
  console.log('Updated src/lib/date.ts');
}

// 2. Replace occurrences in src/**/*.tsx and src/**/*.ts
glob('src/**/*.{ts,tsx}', (err, files) => {
  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // .toLocaleDateString('en-CA') -> formatDateInput(...)
    content = content.replace(/(?:new Date\(([^)]+)\)|([a-zA-Z0-9_.]+?(?:\[\d+\])?(?:\.date|\.paymentDate|\.dateApproved|\.createdAt|\.lastActive|getNow\(\)|day\.date)?))\.toLocaleDateString\('en-CA'\)/g, (match, p1, p2) => {
      const arg = p1 || p2;
      return `formatDateInput(${arg})`;
    });

    // .toLocaleString('bn-BD') -> formatDateTimeBanglaLocal(...)
    content = content.replace(/(?:new Date\(([^)]+)\)|([a-zA-Z0-9_.]+?(?:\[\d+\])?(?:\.date|\.paymentDate|\.dateApproved|\.createdAt|\.lastActive|getNow\(\)|day\.date)?))\.toLocaleString\('bn-BD'\)/g, (match, p1, p2) => {
      const arg = p1 || p2;
      return `formatDateTimeBanglaLocal(${arg})`;
    });

    // .toLocaleDateString('bn-BD') -> formatDateBanglaLocal(...)
    content = content.replace(/(?:new Date\(([^)]+)\)|([a-zA-Z0-9_.]+?(?:\[\d+\])?(?:\.date|\.paymentDate|\.dateApproved|\.createdAt|\.lastActive|getNow\(\)|day\.date)?))\.toLocaleDateString\('bn-BD'\)/g, (match, p1, p2) => {
      const arg = p1 || p2;
      return `formatDateBanglaLocal(${arg})`;
    });

    // .toLocaleDateString() (no args, usually in calendar) -> formatDateInput(...)
    // Actually, day.date.toLocaleDateString() -> formatDateInput(day.date)
    content = content.replace(/([a-zA-Z0-9_.]+)\.toLocaleDateString\(\)/g, (match, p1) => {
      if (p1.includes('date') || p1.includes('day')) {
         return `formatDateInput(${p1})`;
      }
      return match;
    });

    // calendar.tsx month formatting: date.toLocaleString("default", { month: "short" }) -> formatShortMonth(date.getMonth())
    if (content.includes('.toLocaleString("default", { month: "short" })')) {
      content = content.replace(/([a-zA-Z0-9_.]+)\.toLocaleString\("default", \{ month: "short" \}\)/g, 'formatShortMonth($1.getMonth())');
    }

    if (content !== original) {
      // add imports if needed
      const imports = [];
      if (content.includes('formatDateInput') && !content.includes('formatDateInput(') === false) imports.push('formatDateInput');
      if (content.includes('formatDateTimeBanglaLocal')) imports.push('formatDateTimeBanglaLocal');
      if (content.includes('formatDateBanglaLocal')) imports.push('formatDateBanglaLocal');
      
      if (imports.length > 0 && !content.includes(`import { ${imports[0]}`)) {
         // This is a naive import addition, we might need to be careful if importing from @/lib/date already exists
         if (content.includes('@/lib/date')) {
            content = content.replace(/import\s+\{([^}]+)\}\s+from\s+['"]@\/lib\/date['"]/, (match, p1) => {
               let newImports = p1;
               imports.forEach(imp => {
                 if (!newImports.includes(imp)) newImports += `, ${imp}`;
               });
               return `import {${newImports}} from "@/lib/date"`;
            });
         } else if (content.includes('../lib/date') || content.includes('../../lib/date')) {
             // skip naive replace, just do standard
             content = `import { ${imports.join(', ')} } from "@/lib/date";\n` + content;
         } else {
            content = `import { ${imports.join(', ')} } from "@/lib/date";\n` + content;
         }
      }

      if (content.includes('formatShortMonth(') && !content.includes('formatShortMonth')) {
          if (content.includes('@/lib/format')) {
              content = content.replace(/import\s+\{([^}]+)\}\s+from\s+['"]@\/lib\/format['"]/, (match, p1) => {
                  let newImports = p1;
                  if (!newImports.includes('formatShortMonth')) newImports += `, formatShortMonth`;
                  return `import {${newImports}} from "@/lib/format"`;
              });
          } else {
             content = `import { formatShortMonth } from "@/lib/format";\n` + content;
          }
      }

      fs.writeFileSync(file, content);
      console.log('Fixed', file);
    }
  });
});
