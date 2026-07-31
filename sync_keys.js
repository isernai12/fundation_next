const fs = require('fs');

function loadJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    return {};
  }
}

function syncKeys(obj1, obj2) {
  let changed = false;
  
  for (const key in obj1) {
    if (!(key in obj2)) {
      obj2[key] = obj1[key];
      changed = true;
    } else if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object') {
      if (syncKeys(obj1[key], obj2[key])) {
        changed = true;
      }
    }
  }
  
  for (const key in obj2) {
    if (!(key in obj1)) {
      obj1[key] = obj2[key];
      changed = true;
    } else if (typeof obj2[key] === 'object' && typeof obj1[key] === 'object') {
      if (syncKeys(obj2[key], obj1[key])) {
        changed = true;
      }
    }
  }
  
  return changed;
}

const enFile = 'src/i18n/locales/en.json';
const bnFile = 'src/i18n/locales/bn.json';

const en = loadJson(enFile);
const bn = loadJson(bnFile);

if (syncKeys(en, bn)) {
  fs.writeFileSync(enFile, JSON.stringify(en, null, 2));
  fs.writeFileSync(bnFile, JSON.stringify(bn, null, 2));
  console.log('Synchronized keys between en.json and bn.json');
} else {
  console.log('Keys are already synchronized.');
}
