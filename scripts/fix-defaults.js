const fs = require('fs');

let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

// Fix unquoted string defaults
const unquoted = ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING', 'COMPLETED', 'CANCELLED'];
for (const val of unquoted) {
  const regex = new RegExp(`@default\\(${val}\\)`, 'g');
  schema = schema.replace(regex, `@default("${val}")`);
}

fs.writeFileSync('prisma/schema.prisma', schema);
console.log("Schema defaults fixed.");
