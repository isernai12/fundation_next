import { createClient } from "@libsql/client";
import * as dotenv from 'dotenv';
dotenv.config();

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function run() {
  try {
    const res = await client.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
    for (const row of res.rows) {
      if (row.sql) console.log(row.sql + ";");
    }
    const idxRes = await client.execute("SELECT sql FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%'");
    for (const row of idxRes.rows) {
      if (row.sql) console.log(row.sql + ";");
    }
  } catch (e) {
    console.error(e);
  }
}

run();
