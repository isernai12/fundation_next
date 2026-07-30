import { createClient } from "@libsql/client";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
  console.log("Connecting to Turso...");
  
  const stmts = [
    `CREATE TABLE IF NOT EXISTS "Role" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL
    );`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "Role_name_key" ON "Role"("name");`,
    
    `CREATE TABLE IF NOT EXISTS "Permission" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "module" TEXT NOT NULL,
        "action" TEXT NOT NULL,
        "description" TEXT
    );`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "Permission_module_action_key" ON "Permission"("module", "action");`,
    
    `CREATE TABLE IF NOT EXISTS "RolePermission" (
        "roleId" TEXT NOT NULL,
        "permissionId" TEXT NOT NULL,
        PRIMARY KEY ("roleId", "permissionId"),
        CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    );`,
    
    `CREATE TABLE IF NOT EXISTS "UserPermission" (
        "userId" TEXT NOT NULL,
        "permissionId" TEXT NOT NULL,
        PRIMARY KEY ("userId", "permissionId"),
        CONSTRAINT "UserPermission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "UserPermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    );`
  ];

  for (const stmt of stmts) {
    try {
      await client.execute(stmt);
      console.log("Executed successfully:", stmt.substring(0, 50) + "...");
    } catch (e) {
      console.error("Error executing:", stmt.substring(0, 50) + "...");
      console.error(e.message);
    }
  }

  console.log("Migration complete.");
}

main().catch(console.error);
