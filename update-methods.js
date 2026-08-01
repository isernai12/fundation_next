const fs = require('fs');

const en = JSON.parse(fs.readFileSync('src/i18n/dictionaries/en/contributions.json', 'utf8'));
const bn = JSON.parse(fs.readFileSync('src/i18n/dictionaries/bn/contributions.json', 'utf8'));

en.form.methods.bkash = "bKash";
en.form.methods.nagad = "Nagad";

bn.form.methods.bkash = "বিকাশ";
bn.form.methods.nagad = "নগদ";

fs.writeFileSync('src/i18n/dictionaries/en/contributions.json', JSON.stringify(en, null, 2));
fs.writeFileSync('src/i18n/dictionaries/bn/contributions.json', JSON.stringify(bn, null, 2));
console.log('Dictionaries updated!');
