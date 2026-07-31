import { createClient } from "@libsql/client";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
  console.log("Connecting to Turso to create MemberStatusHistory table...");
  
  const stmts = [
    `CREATE TABLE IF NOT EXISTS "MemberStatusHistory" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "memberId" TEXT NOT NULL,
        "fromStatus" TEXT NOT NULL,
        "toStatus" TEXT NOT NULL,
        "reason" TEXT,
        "notes" TEXT,
        "changedBy" TEXT,
        "changedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "MemberStatusHistory_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    );`,
    `CREATE INDEX IF NOT EXISTS "MemberStatusHistory_memberId_idx" ON "MemberStatusHistory"("memberId");`
  ];

  for (const stmt of stmts) {
    try {
      await client.execute(stmt);
      console.log("Executed successfully:", stmt.substring(0, 60) + "...");
    } catch (e) {
      console.error("Error executing:", e.message);
    }
  }

  console.log("Turso schema update complete.");
}

main().catch(console.error);
