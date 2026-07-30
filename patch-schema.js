const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

if (!schema.includes('model UserPermission')) {
  schema = schema.replace(
    '  sessions  UserSession[]',
    '  sessions  UserSession[]\n  userPermissions UserPermission[]'
  );

  schema += `

model UserPermission {
  userId       String
  permissionId String

  user       User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  permission Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)

  @@id([userId, permissionId])
}
`;
  fs.writeFileSync('prisma/schema.prisma', schema);
  console.log("Schema patched");
} else {
  console.log("Schema already patched");
}
