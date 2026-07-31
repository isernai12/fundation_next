const fs = require('fs');

function hasBengali(str) {
  return /[\u0980-\u09FF]/.test(str);
}

function formatKeyToEnglish(key) {
  // Convert something like "new_member" to "New Member"
  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function replaceBengaliWithKeyName(obj, prefix = '') {
  let changed = false;
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      if (replaceBengaliWithKeyName(obj[key], key)) {
        changed = true;
      }
    } else if (typeof obj[key] === 'string' && hasBengali(obj[key])) {
      // Check if it has something in parentheses like "প্রিন্ট (Print)"
      const match = obj[key].match(/\(([^)]+)\)/);
      if (match && /^[A-Za-z0-9\s_-]+$/.test(match[1])) {
        obj[key] = match[1].trim();
      } else {
        obj[key] = formatKeyToEnglish(key);
      }
      changed = true;
      console.log(`Replaced: ${key} -> ${obj[key]}`);
    }
  }
  return changed;
}

const file = 'src/i18n/locales/en.json';
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

if (replaceBengaliWithKeyName(data)) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
  console.log('Done replacing Bengali strings with english approximations in en.json.');
} else {
  console.log('No Bengali strings found in en.json.');
}
