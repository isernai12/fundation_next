const { createClient } = require("@libsql/client");
const dotenv = require("dotenv");
const fs = require("fs");

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
  console.log("Synced! File size:", fs.statSync("test-backup.db").size);
  client.close();
}

main();
