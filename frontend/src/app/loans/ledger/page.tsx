import { Trans } from "@/components/shared/trans";
import { LoanLedgerTable } from "@/features/loans/components/loan-ledger-table";
import { getLoans, getLoan } from "@/features/loans/actions";

export default async function LoanLedgerPage({ searchParams }: { searchParams: Promise<{ loanId?: string }> }) {
  const resolvedParams = await searchParams;
  const loanId = resolvedParams?.loanId;

  let specificLoan = null;
  if (loanId) {
    specificLoan = await getLoan(loanId);
  }

  const loans = await getLoans();

  const enhancedTransactions = loans.map((l, idx) => ({
    id: l.id,
    date: l.disbursementDate,
    referenceId: l.loanId,
    type: "LOAN",
    beneficiaryName: l.beneficiary?.name || "Beneficiary",
    debit: l.amount,
    credit: l.totalRepaid,
    balance: l.balance,
  }));

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                <Trans tKey="loans.ledger.pageTitle" />
                {specificLoan ? ` - ${specificLoan.loanId}` : ""}
              </h1>
              <p className="text-muted-foreground">
                {specificLoan
                  ? `Ledger for ${specificLoan.beneficiary?.name}. Total Loan: ৳${specificLoan.amount}, Remaining: ৳${specificLoan.balance}`
                  : <Trans tKey="loans.ledger.subtitle" />}
              </p>
            </div>
          </div>
          <LoanLedgerTable transactions={enhancedTransactions as any} />
        </div>
      </div>
    </div>
  );
}
