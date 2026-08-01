import fs from 'fs';
import path from 'path';

function replaceInString(str, lang) {
  if (lang === 'en') {
    // English replacements
    let newStr = str;
    newStr = newStr.replace(/\bLoans\b/g, "Qard Hasan");
    newStr = newStr.replace(/\bloans\b/g, "Qard Hasan");
    newStr = newStr.replace(/\bLoan\b/g, "Qard Hasan");
    newStr = newStr.replace(/\bloan\b/g, "Qard Hasan");
    
    newStr = newStr.replace(/\bGrants\b/g, "Sadakah");
    newStr = newStr.replace(/\bgrants\b/g, "Sadakah");
    newStr = newStr.replace(/\bGrant\b/g, "Sadakah");
    newStr = newStr.replace(/\bgrant\b/g, "Sadakah");
    return newStr;
  } else if (lang === 'bn') {
    // Bengali replacements
    let newStr = str;
    newStr = newStr.replace(/ঋণ/g, "কর্জে হাসানা");
    newStr = newStr.replace(/অনুদান/g, "সাদাকা");
    return newStr;
  }
  return str;
}

function traverseAndReplace(obj, lang) {
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      obj[key] = replaceInString(obj[key], lang);
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      traverseAndReplace(obj[key], lang);
    }
  }
}

function processDir(dirPath, lang) {
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    if (file.endsWith('.json')) {
      const filePath = path.join(dirPath, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      traverseAndReplace(data, lang);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
      console.log(`Updated ${filePath}`);
    }
  }
}

processDir('./src/i18n/dictionaries/en', 'en');
processDir('./src/i18n/dictionaries/bn', 'bn');

console.log("Translation files updated.");
