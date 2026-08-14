require('dotenv').config();
const { createClient } = require('@libsql/client');
const fs = require('fs');

async function run() {
  const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN
  });

  console.log("Reading schema.sql...");
  const sql = fs.readFileSync('prisma/schema.sql', 'utf8');

  console.log("Executing schema...");
  await db.executeMultiple(sql);
  
  console.log("Schema deployed successfully!");
}

run().catch(console.error);
