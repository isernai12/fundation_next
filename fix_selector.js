const fs = require('fs');

let file = 'src/features/beneficiaries/components/beneficiary-selector.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/'নাম পাওয়া যায়নি'/g, 't("beneficiaries.table.name_not_found")');
fs.writeFileSync(file, content);
