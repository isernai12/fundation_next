const { createClient } = require("@libsql/client");
const dotenv = require("dotenv");

dotenv.config({ path: ".env" });

async function main() {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;

  if (!tursoUrl || !tursoAuthToken) {
    console.error("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN in environment.");
    process.exit(1);
  }

  const client = createClient({
    url: tursoUrl,
    authToken: tursoAuthToken,
  });

  try {
    console.log("Adding preferences column to User table...");
    await client.execute(`ALTER TABLE "User" ADD COLUMN "preferences" TEXT;`);
    console.log("Column added successfully!");
  } catch (error) {
    if (error.message && error.message.includes("duplicate column name")) {
      console.log("Column 'preferences' already exists.");
    } else {
      console.error("Error executing query:", error);
    }
  }
}

main();
