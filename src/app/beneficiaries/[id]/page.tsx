import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"
import { BeneficiaryProfileActions } from "@/features/beneficiaries/components/beneficiary-profile-actions"

export default async function BeneficiaryDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const beneficiary = await prisma.beneficiary.findUnique({
    where: { id: resolvedParams.id },
    include: { member: true, documents: true }
  })

  if (!beneficiary) return notFound()

  const getDoc = (title: string) => beneficiary.documents?.find(d => d.title === title)?.secureUrl;
  
  const photoDoc = getDoc("Beneficiary Photo") || beneficiary.beneficiaryPhoto;
  const signatureDoc = getDoc("Signature");
  const nidFrontDoc = getDoc("NID Front") || beneficiary.nidOrBirthCertificate; // Fallback to legacy string if needed
  const nidBackDoc = getDoc("NID Back");
  const bcDoc = getDoc("Birth Certificate") || beneficiary.nidOrBirthCertificate; // Fallback to legacy string if needed

  const DocumentCard = ({ title, url }: { title: string, url?: string | null }) => (
    <div className="border rounded-md p-3">
      <p className="font-semibold text-sm mb-2 text-center border-b pb-2">{title}</p>
      {url ? (
        <a href={url} target="_blank" rel="noopener noreferrer" className="block relative h-40 w-full overflow-hidden hover:opacity-90">
          {url.endsWith('.pdf') ? (
            <div className="flex h-full items-center justify-center bg-muted/10 text-primary underline">PDF দেখুন</div>
          ) : (
            <Image src={url} alt={title} fill className="object-contain bg-muted/10" />
          )}
        </a>
      ) : (
        <div className="h-40 flex items-center justify-center text-sm text-muted-foreground italic">
          ডকুমেন্ট আপলোড করা হয়নি
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 print:m-0 print:p-0 bg-white text-black p-6 rounded-md shadow-sm border print:border-none print:shadow-none">
      {/* Top Navigation & Actions */}
      <div className="flex items-center justify-between pb-4 border-b print:hidden">
        <div className="flex items-center gap-4">
          <Link href="/beneficiaries/manage" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-bold">সুবিধাভোগী প্রোফাইল</h1>
        </div>
        <BeneficiaryProfileActions id={beneficiary.id} />
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* LEFT COLUMN */}
        <div className="flex-1 space-y-6">
          
          {/* SECTION 1 */}
          <section>
            <h2 className="text-lg font-bold bg-muted/30 px-3 py-1.5 border-l-4 border-primary mb-3">১. ব্যক্তিগত তথ্য</h2>
            <table className="w-full text-sm border-collapse">
              <tbody>
                <tr className="border-b"><td className="py-2 w-1/3 text-muted-foreground font-medium">পূর্ণ নাম</td><td className="py-2 font-medium">{beneficiary.fullName || 'নাম পাওয়া যায়নি'} </td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium">পিতা / স্বামীর নাম</td><td className="py-2">{beneficiary.fatherOrHusbandName || '-'}</td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium">জাতীয় পরিচয়পত্র / জন্ম নিবন্ধন নম্বর</td><td className="py-2">{beneficiary.nationalId || '-'}</td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium">মোবাইল নম্বর</td><td className="py-2">{beneficiary.mobile || '-'}</td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium">বর্তমান ঠিকানা</td><td className="py-2">{beneficiary.presentAddress || beneficiary.address || '-'}</td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium">স্থায়ী ঠিকানা</td><td className="py-2">{beneficiary.permanentAddress || '-'}</td></tr>
              </tbody>
            </table>
          </section>

          {/* SECTION 2 */}
          <section>
            <h2 className="text-lg font-bold bg-muted/30 px-3 py-1.5 border-l-4 border-primary mb-3 mt-6">২. জরুরি যোগাযোগ</h2>
            <table className="w-full text-sm border-collapse">
              <tbody>
                <tr className="border-b"><td className="py-2 w-1/3 text-muted-foreground font-medium">নাম</td><td className="py-2">{beneficiary.emergencyContactName || '-'}</td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium">সম্পর্ক</td><td className="py-2">{beneficiary.emergencyContactRelation || '-'}</td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium">মোবাইল নম্বর</td><td className="py-2">{beneficiary.emergencyContactMobile || '-'}</td></tr>
              </tbody>
            </table>
          </section>

          {/* SECTION 3 */}
          <section className="print:break-before-page">
            <h2 className="text-lg font-bold bg-muted/30 px-3 py-1.5 border-l-4 border-primary mb-3 mt-6">৩. ডকুমেন্টসমূহ</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DocumentCard title="সুবিধাভোগীর ছবি" url={photoDoc} />
              <DocumentCard title="স্বাক্ষর" url={signatureDoc} />
              
              {beneficiary.idDocumentType === "NID" ? (
                <>
                  <DocumentCard title="জাতীয় পরিচয়পত্র (সামনের অংশ)" url={nidFrontDoc} />
                  <DocumentCard title="জাতীয় পরিচয়পত্র (পেছনের অংশ)" url={nidBackDoc} />
                </>
              ) : (
                <DocumentCard title="জন্ম নিবন্ধন" url={bcDoc} />
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
                <span className="text-sm text-muted-foreground">ছবি</span>
              )}
            </div>
          </div>
          
          <div className="mt-6 w-full max-w-[200px] text-center border p-4 bg-muted/5 space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">সুবিধাভোগী আইডি</p>
              <p className="font-bold text-lg">{beneficiary.beneficiaryId}</p>
            </div>
            <div className="border-t pt-2">
              <p className="text-xs text-muted-foreground">স্ট্যাটাস</p>
              <p className={`font-semibold ${beneficiary.status === "ACTIVE" ? "text-green-600" : "text-red-600"}`}>
                {beneficiary.status === "ACTIVE" ? "সক্রিয়" : "নিষ্ক্রিয়"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
