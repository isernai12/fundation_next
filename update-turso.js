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
    "ALTER TABLE Loan ADD COLUMN installmentType TEXT;",
    "ALTER TABLE Loan ADD COLUMN installmentAmount REAL;",
    "ALTER TABLE Loan ADD COLUMN totalInstallments INTEGER;",
    "ALTER TABLE Loan ADD COLUMN firstInstallmentDate DATETIME;",
    "ALTER TABLE Loan ADD COLUMN nextDueDate DATETIME;",
    "ALTER TABLE Loan ADD COLUMN remainingBalance REAL NOT NULL DEFAULT 0;",
    "ALTER TABLE Loan ADD COLUMN totalPaidAmount REAL NOT NULL DEFAULT 0;",
    
    "ALTER TABLE LoanRepayment ADD COLUMN installmentNo INTEGER;",
    "ALTER TABLE LoanRepayment ADD COLUMN paymentMethod TEXT;",
    "ALTER TABLE LoanRepayment ADD COLUMN referenceNumber TEXT;",
    "ALTER TABLE LoanRepayment ADD COLUMN collectedBy TEXT;",
  ];

  for (const stmt of stmts) {
    try {
      await client.execute(stmt);
      console.log("Executed:", stmt);
    } catch (e) {
      if (e.message.includes("duplicate column name")) {
        console.log("Skipped (already exists):", stmt);
      } else {
        console.error("Error executing:", stmt);
        console.error(e.message);
      }
    }
  }

  // Update remainingBalance and totalPaidAmount for existing loans
  console.log("Updating existing loans balances...");
  const loans = await client.execute("SELECT id, amount FROM Loan;");
  for (const row of loans.rows) {
    const loanId = row.id;
    const amount = row.amount;
    const rep = await client.execute({
      sql: "SELECT SUM(amount) as total FROM LoanRepayment WHERE loanId = ?",
      args: [loanId]
    });
    const totalRepaid = rep.rows[0].total || 0;
    const remaining = amount - totalRepaid;
    
    await client.execute({
      sql: "UPDATE Loan SET totalPaidAmount = ?, remainingBalance = ? WHERE id = ?",
      args: [totalRepaid, remaining, loanId]
    });
  }

  console.log("Migration complete.");
}

main().catch(console.error);
