const fs = require('fs');
let content = fs.readFileSync('README.md', 'utf8');

content = content.replace('Supabase PostgreSQL', 'Turso (libSQL)');
content = content.replace('Supabase PostgreSQL', 'Turso (libSQL)');

content = content.replace(
  'DATABASE_URL="postgresql://postgres.xxx:password@aws-0-xx.pooler.supabase.com:5432/postgres"\nDIRECT_URL="postgresql://postgres.xxx:password@aws-0-xx.pooler.supabase.com:5432/postgres"',
  'TURSO_DATABASE_URL="libsql://your-database-name.turso.io"\nTURSO_AUTH_TOKEN="your-turso-auth-token"\nDATABASE_URL="file:./dev.db"'
);

content = content.replace(
  '- **`DATABASE_URL`**: The connection pool string for your Supabase PostgreSQL database. Used by Prisma for standard queries.\n- **`DIRECT_URL`**: The direct connection string for Supabase PostgreSQL. Used by Prisma specifically for running schema migrations.',
  '- **`TURSO_DATABASE_URL`**: The connection string for your Turso database.\n- **`TURSO_AUTH_TOKEN`**: The authentication token for your Turso database.\n- **`DATABASE_URL`**: Set this to "file:./dev.db" to pass Prisma validation.'
);

const supabaseSetupRegex = /## 5\. Supabase Setup[\s\S]*?## 6\. Default Admin Account/m;
const tursoSetup = `## 5. Turso Setup
To configure the libSQL database from scratch:

1. Log in to [Turso](https://turso.tech/) and create a new database.
2. Copy the database URL and create an auth token using the Turso CLI: \`turso db tokens create <db-name>\`.
3. Paste the URL into \`TURSO_DATABASE_URL\` and the token into \`TURSO_AUTH_TOKEN\` in your \`.env\` file.
4. Set \`DATABASE_URL="file:./dev.db"\` in your \`.env\` file.
5. Generate the migration SQL: \`npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > prisma/schema.sql\`
6. Apply the schema to Turso: You can write a small Node script using \`@libsql/client\` to execute the SQL, or use the Turso CLI: \`turso db shell <db-name> < prisma/schema.sql\`.
7. Run \`npx prisma generate\` to update your local Prisma Client.

## 6. Default Admin Account`;
content = content.replace(supabaseSetupRegex, tursoSetup);

content = content.replace(
  '- `DATABASE_URL`\n   - `DIRECT_URL`',
  '- `TURSO_DATABASE_URL`\n   - `TURSO_AUTH_TOKEN`\n   - `DATABASE_URL="file:./dev.db"`'
);

content = content.replace(
  'To ensure the production Supabase database matches your schema',
  'To ensure the production Turso database matches your schema'
);

content = content.replace(
  '- **Supabase connection problems**: \n  - *Cause*: Connection pool limits reached. \n  - *Fix*: Ensure you are using the pooled connection string (port `5432` or `6543` depending on Supabase configuration) for `DATABASE_URL`, and the direct string for `DIRECT_URL`.',
  '- **Turso connection problems**: \n  - *Cause*: Invalid URL or expired auth token. \n  - *Fix*: Ensure your `TURSO_DATABASE_URL` starts with `libsql://` or `https://` and the `TURSO_AUTH_TOKEN` is correct and not expired.'
);

content = content.replace(
  'The safest way to backup is directly via the Supabase Dashboard. Navigate to **Database** -> **Backups** to trigger manual snapshots or download a `.sql` logical dump using pg_dump:\n  ```bash\n  pg_dump -h aws-0-xx.pooler.supabase.com -U postgres -d postgres > backup.sql\n  ```',
  'The safest way to backup is using the Turso CLI to dump the database:\n  ```bash\n  turso db shell <db-name> .dump > backup.sql\n  ```'
);

content = content.replace(
  'use `psql` to execute the dump against a fresh Supabase instance',
  'use `turso db shell` to execute the dump against a fresh Turso instance'
);

content = content.replace(
  'Supabase Dashboard',
  'Turso Dashboard'
);

fs.writeFileSync('README.md', content);
console.log("README.md updated for Turso");
