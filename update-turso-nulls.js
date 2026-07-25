import { createClient } from "@libsql/client";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
  console.log("Connecting to Turso...");
  
  const stmts = [
    "UPDATE LoanRepayment SET paymentMethod = 'CASH' WHERE paymentMethod IS NULL;",
    "UPDATE Loan SET installmentType = 'MONTHLY' WHERE installmentType IS NULL;"
  ];

  for (const stmt of stmts) {
    try {
      await client.execute(stmt);
      console.log("Executed:", stmt);
    } catch (e) {
      console.error("Error executing:", stmt);
      console.error(e.message);
    }
  }
}

main().catch(console.error);
