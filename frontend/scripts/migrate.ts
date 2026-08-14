import { createClient } from "@libsql/client";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const tursoUrl = process.env.TURSO_DATABASE_URL?.trim();
  const tursoToken = process.env.TURSO_AUTH_TOKEN?.trim();

  if (!tursoUrl || tursoUrl.startsWith("file:") || tursoUrl.startsWith("sqlite:")) {
    console.log("Skipping Turso migration - valid TURSO_DATABASE_URL not found.");
    return;
  }

  const client = createClient({
    url: tursoUrl,
    authToken: tursoToken,
  });

  console.log("Running safe database migrations for Turso...");

  const migrations = [
    {
      table: "Group",
      column: "isFoundationGroup",
      sql: `ALTER TABLE "Group" ADD COLUMN "isFoundationGroup" BOOLEAN NOT NULL DEFAULT 0;`,
    },
    {
      table: "Group",
      column: "memberSignupEnabled",
      sql: `ALTER TABLE "Group" ADD COLUMN "memberSignupEnabled" BOOLEAN NOT NULL DEFAULT 1;`,
    },
    {
      table: "LedgerTransaction",
      column: "memberId",
      sql: `ALTER TABLE "LedgerTransaction" ADD COLUMN "memberId" TEXT;`,
    },
    {
      table: "LedgerTransaction",
      column: "donorId",
      sql: `ALTER TABLE "LedgerTransaction" ADD COLUMN "donorId" TEXT;`,
    }
  ];

  for (const step of migrations) {
    try {
      // Check if column exists
      const tableInfo = await client.execute(`PRAGMA table_info("${step.table}");`);
      const columnExists = tableInfo.rows.some(
        (row) => (row.name as string).toLowerCase() === step.column.toLowerCase()
      );

      if (columnExists) {
        console.log(`[OK] Column ${step.table}.${step.column} already exists.`);
      } else {
        console.log(`[MIGRATE] Adding column ${step.table}.${step.column}...`);
        await client.execute(step.sql);
        console.log(`[SUCCESS] Added ${step.table}.${step.column}.`);
      }
    } catch (error) {
      console.error(`[ERROR] Failed to migrate ${step.table}.${step.column}:`, error);
    }
  }
  
  console.log("Migration check completed.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
