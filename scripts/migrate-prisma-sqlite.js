const fs = require('fs');

let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

// Change provider to sqlite
schema = schema.replace('provider = "postgresql"', 'provider = "sqlite"');

// Add previewFeatures = ["driverAdapters"] to client
schema = schema.replace(
  'provider = "prisma-client-js"',
  'provider = "prisma-client-js"\n  previewFeatures = ["driverAdapters"]'
);

// Remove enum definitions
schema = schema.replace(/enum \w+ \{[\s\S]*?\}/g, '');

// Replace enum usages with String
const enums = [
  'MemberStatus', 'BeneficiaryStatus', 'GroupStatus', 
  'ContributionStatus', 'LoanStatus', 'GrantStatus', 
  'LedgerType', 'DocumentType', 'TargetType'
];

for (const e of enums) {
  // Regex to replace field types
  const regex = new RegExp(`\\b${e}\\b`, 'g');
  schema = schema.replace(regex, 'String');
}

fs.writeFileSync('prisma/schema.prisma', schema);
console.log("Schema updated for SQLite.");
