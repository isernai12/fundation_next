require('dotenv').config();
const { createClient } = require('@libsql/client');

console.log("URL is:", process.env.TURSO_DATABASE_URL);

const libsql = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});
console.log("Client created");

libsql.execute("SELECT 1").then(console.log).catch(console.error);
