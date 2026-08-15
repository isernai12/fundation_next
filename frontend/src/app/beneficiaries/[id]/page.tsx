import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { getBeneficiary } from "@/features/beneficiaries/actions";
import { BeneficiaryProfileActions } from "@/features/beneficiaries/components/beneficiary-profile-actions";
import { Trans } from "@/components/shared/trans";

const DocumentCard = ({ title, url }: { title: React.ReactNode; url?: string | null }) => (
  <div className="border rounded-md p-3">
    <p className="font-semibold text-sm mb-2 text-center border-b pb-2">{title}</p>
    {url ? (
      <a href={url} target="_blank" rel="noopener noreferrer" className="block relative h-40 w-full overflow-hidden hover:opacity-90">
        {url.endsWith(".pdf") ? (
          <div className="flex h-full items-center justify-center bg-muted/10 text-primary underline"><Trans tKey="app.pdf" /></div>
        ) : (
          <Image src={url} alt="Document" fill className="object-contain bg-muted/10" />
        )}
      </a>
    ) : (
      <div className="h-40 flex items-center justify-center text-sm text-muted-foreground italic">
        <Trans tKey="beneficiaries.form.personal_info" />
      </div>
    )}
  </div>
);

export default async function BeneficiaryDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const beneficiary = await getBeneficiary(resolvedParams.id);

  if (!beneficiary) return notFound();

  const getDoc = (title: string) => beneficiary.documents?.find((d: any) => d.title === title)?.secureUrl || beneficiary.documents?.find((d: any) => d.title === title)?.fileUrl;

  const photoDoc = getDoc("Beneficiary Photo") || beneficiary.beneficiaryPhoto;
  const signatureDoc = getDoc("Signature");
  const nidFrontDoc = getDoc("NID Front") || beneficiary.nidOrBirthCertificate;
  const nidBackDoc = getDoc("NID Back");
  const bcDoc = getDoc("Birth Certificate") || beneficiary.nidOrBirthCertificate;

  return (
    <div className="max-w-5xl mx-auto space-y-8 print:m-0 print:p-0 bg-background text-foreground p-6 rounded-md shadow-sm border print:border-none print:shadow-none">
      {/* Top Navigation & Actions */}
      <div className="flex items-center justify-between pb-4 border-b print:hidden">
        <div className="flex items-center gap-4">
          <Link href="/beneficiaries/manage" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-bold"><Trans tKey="beneficiaries.form.full_name" /></h1>
        </div>
        <BeneficiaryProfileActions id={beneficiary.id} />
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* LEFT COLUMN */}
        <div className="flex-1 space-y-6">
          
          {/* SECTION 1 */}
          <section>
            <h2 className="text-lg font-bold bg-muted/30 px-3 py-1.5 border-l-4 border-primary mb-3"><Trans tKey="beneficiaries.form.father_husband_name" /></h2>
            <table className="w-full text-sm border-collapse">
              <tbody>
                <tr className="border-b"><td className="py-2 w-1/3 text-muted-foreground font-medium"><Trans tKey="beneficiaries.form.nid" /></td><td className="py-2 font-medium">{beneficiary.fullName || beneficiary.beneficiaryId} </td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium"><Trans tKey="beneficiaries.form.mobile" /></td><td className="py-2">{beneficiary.fatherOrHusbandName || '-'}</td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium"><Trans tKey="beneficiaries.form.present_address" /></td><td className="py-2">{beneficiary.nationalId || '-'}</td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium"><Trans tKey="beneficiaries.form.permanent_address" /></td><td className="py-2">{beneficiary.mobile || '-'}</td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium"><Trans tKey="beneficiaries.form.emergency_contact" /></td><td className="py-2">{beneficiary.presentAddress || beneficiary.address || '-'}</td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium"><Trans tKey="beneficiaries.form.contact_name" /></td><td className="py-2">{beneficiary.permanentAddress || '-'}</td></tr>
              </tbody>
            </table>
          </section>

          {/* SECTION 2 */}
          <section>
            <h2 className="text-lg font-bold bg-muted/30 px-3 py-1.5 border-l-4 border-primary mb-3 mt-6"><Trans tKey="beneficiaries.form.relation" /></h2>
            <table className="w-full text-sm border-collapse">
              <tbody>
                <tr className="border-b"><td className="py-2 w-1/3 text-muted-foreground font-medium"><Trans tKey="beneficiaries.form.mobile" /></td><td className="py-2">{beneficiary.emergencyContactName || '-'}</td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium"><Trans tKey="beneficiaries.form.documents" /></td><td className="py-2">{beneficiary.emergencyContactRelation || '-'}</td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium"><Trans tKey="beneficiaries.form.no_photo" /></td><td className="py-2">{beneficiary.emergencyContactMobile || '-'}</td></tr>
              </tbody>
            </table>
          </section>

          {/* SECTION 3 */}
          <section className="print:break-before-page">
            <h2 className="text-lg font-bold bg-muted/30 px-3 py-1.5 border-l-4 border-primary mb-3 mt-6"><Trans tKey="beneficiaries.form.beneficiary_id" /></h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DocumentCard title={<Trans tKey="beneficiaries.form.photo" />} url={photoDoc} />
              <DocumentCard title={<Trans tKey="beneficiaries.form.signature" />} url={signatureDoc} />
              
              {beneficiary.category === "NID" ? (
                <>
                  <DocumentCard title={<Trans tKey="beneficiaries.form.nid_front" />} url={nidFrontDoc} />
                  <DocumentCard title={<Trans tKey="beneficiaries.form.nid_back" />} url={nidBackDoc} />
                </>
              ) : (
                <DocumentCard title={<Trans tKey="beneficiaries.form.id_birth_cert" />} url={bcDoc} />
              )}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN */}
        <div className="w-full md:w-64 shrink-0 flex flex-col items-center pt-2 print:pt-10">
          <div className="border border-border p-2 bg-muted/10 w-full max-w-[200px]">
            <div className="relative w-full aspect-[4/5] bg-muted flex flex-col items-center justify-center border border-dashed border-muted-foreground/30">
              {photoDoc ? (
                <Image src={photoDoc} alt="Photo" fill className="object-cover" />
              ) : (
                <span className="text-sm text-muted-foreground"><Trans tKey="beneficiaries.table.status" /></span>
              )}
            </div>
          </div>
          
          <div className="mt-6 w-full max-w-[200px] text-center border p-4 bg-muted/5 space-y-3">
            <div>
              <p className="text-xs text-muted-foreground"><Trans tKey="beneficiaries.form.beneficiary_id" /></p>
              <p className="font-bold text-lg">{beneficiary.beneficiaryId}</p>
            </div>
            <div className="border-t pt-2">
              <p className="text-xs text-muted-foreground"><Trans tKey="beneficiaries.table.status" /></p>
              <p className={`font-semibold ${beneficiary.status === "ACTIVE" ? "text-green-600" : "text-red-600"}`}>
                {beneficiary.status === "ACTIVE" ? <Trans tKey="beneficiaries.status.active" /> : <Trans tKey="beneficiaries.status.inactive" />}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
