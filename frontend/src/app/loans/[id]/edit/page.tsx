import { LoanForm } from "@/features/loans/components/loan-form";
import { notFound } from "next/navigation";
import { getGroups } from "@/features/groups/actions";
import { getBeneficiaries } from "@/features/beneficiaries/actions";
import { getLoan } from "@/features/loans/actions";
import { Trans } from "@/components/shared/trans";

export const dynamic = "force-dynamic";

export default async function EditLoanPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  const [loan, rawBeneficiaries, groups] = await Promise.all([
    getLoan(resolvedParams.id),
    getBeneficiaries(),
    getGroups(),
  ]);

  if (!loan) {
    notFound();
  }

  const beneficiaries = rawBeneficiaries.map((b) => ({
    id: b.id,
    beneficiaryId: b.beneficiaryId,
    fullName: b.name,
    mobile: b.mobile,
    address: b.address,
    category: b.category,
    status: b.status,
    memberId: b.memberId,
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
    fatherOrHusbandName: b.fatherOrHusbandName,
    motherName: b.motherName,
    nationalId: b.nationalId,
    occupation: b.occupation,
    monthlyIncome: b.monthlyIncome,
    beneficiaryPhoto: null,
    nidOrBirthCertificate: null,
  }));

  const initialData = {
    id: loan.id,
    beneficiaryId: loan.beneficiary?.id || "",
    loanType: "BUSINESS" as "BUSINESS" | "OTHER",
    businessType: "",
    purpose: loan.purpose,
    amount: loan.amount,
    notes: loan.notes || "",
    installmentType: (loan.installmentType as "DAILY" | "WEEKLY" | "MONTHLY" | "CUSTOM") || undefined,
    installmentAmount: loan.installmentAmount || undefined,
    totalInstallments: undefined,
    firstInstallmentDate: undefined,
    isMultiGroup: false,
    fundAllocations: [{ groupId: "", amount: loan.amount }],
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight"><Trans tKey="loans.table.actions.edit" /></h1>
            <p className="text-muted-foreground">
              <Trans tKey="loans.table.actions.edit" /></p>
          </div>
          <LoanForm beneficiaries={beneficiaries as any} groups={groups} initialData={initialData} initialDocuments={[]} />
        </div>
      </div>
    </div>
  );
}
