const { createClient } = require("@libsql/client");
const dotenv = require("dotenv");
const fs = require("fs");
const { execSync } = require("child_process");

dotenv.config({ path: ".env" });

async function main() {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;

  if (fs.existsSync("test-backup.db")) {
    fs.unlinkSync("test-backup.db");
  }

  const client = createClient({
    url: "file:test-backup.db",
    syncUrl: tursoUrl,
    authToken: tursoAuthToken,
  });

  console.log("Syncing...");
  await client.sync();
  client.close();
  
  console.log("Dumping SQL...");
  execSync("sqlite3 test-backup.db .dump > backup.sql");
  console.log("Dumped! Lines:", execSync("wc -l backup.sql").toString());
}

main();
