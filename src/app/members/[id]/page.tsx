import { formatDate } from "@/lib/format"
import { getMember } from "@/features/members/actions"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"
import { MemberProfileActions } from "@/features/members/components/member-profile-actions"
import { Trans } from "@/components/shared/trans";

const DocumentCard = ({ title, url }: { title: React.ReactNode, url?: string | null }) => (
  <div className="border rounded-md p-3">
    <p className="font-semibold text-sm mb-2 text-center border-b pb-2">{title}</p>
    {url ? (
      <a href={url} target="_blank" rel="noopener noreferrer" className="block relative h-40 w-full overflow-hidden hover:opacity-90">
        {url.endsWith('.pdf') ? (
          <div className="flex h-full items-center justify-center bg-muted/10 text-primary underline"><Trans tKey="members.actions.pdf" /></div>
        ) : (
          <Image src={url} alt="Document" fill className="object-contain bg-muted/10" />
        )}
      </a>
    ) : (
      <div className="h-40 flex items-center justify-center text-sm text-muted-foreground italic">
        <Trans tKey="members.documents.no_documents" /></div>
    )}
  </div>
);

export default async function MemberProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const member = await getMember(resolvedParams.id)

  if (!member) return notFound()

  let reference = { name: "", mobile: "", relation: "" };
  try {
    if (member.reference) reference = JSON.parse(member.reference);
  } catch(e) {}

  const getDoc = (title: string) => member.documents?.find(d => d.title === title)?.secureUrl;
  
  const photoDoc = getDoc("Member Photo");
  const signatureDoc = getDoc("Signature");
  const nidFrontDoc = getDoc("NID Front") || getDoc("National ID"); 
  const nidBackDoc = getDoc("NID Back");
  const bcDoc = getDoc("Birth Certificate");

  return (
    <div className="max-w-5xl mx-auto space-y-8 print:m-0 print:p-0 bg-background text-foreground p-6 rounded-md shadow-sm border print:border-none print:shadow-none">
      {/* Top Navigation & Actions */}
      <div className="flex items-center justify-between pb-4 border-b print:hidden">
        <div className="flex items-center gap-4">
          <Link href="/members/manage" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-bold"><Trans tKey="members.view.title" /></h1>
        </div>
        <MemberProfileActions memberId={member.id} />
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* LEFT COLUMN */}
        <div className="flex-1 space-y-6">
          
          {/* SECTION 1 */}
          <section>
            <h2 className="text-lg font-bold bg-muted/30 px-3 py-1.5 border-l-4 border-primary mb-3"><Trans tKey="members.view.personal_info" /></h2>
            <table className="w-full text-sm border-collapse">
              <tbody>
                <tr className="border-b"><td className="py-2 w-1/3 text-muted-foreground font-medium"><Trans tKey="members.form.full_name" /></td><td className="py-2 font-medium">{member.fullName || ''} </td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium"><Trans tKey="members.form.father_name" /></td><td className="py-2">{member.fatherName || '-'}</td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium"><Trans tKey="members.form.mother_name" /></td><td className="py-2">{member.motherName || '-'}</td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium"><Trans tKey="members.form.dob" /></td><td className="py-2">{member.dob ? formatDate(member.dob) : '-'}</td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium"><Trans tKey="members.form.nid" /></td><td className="py-2">{member.nationalId || '-'}</td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium"><Trans tKey="members.form.occupation" /></td><td className="py-2">{member.occupation || '-'}</td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium"><Trans tKey="members.form.education" /></td><td className="py-2">{member.education || '-'}</td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium"><Trans tKey="members.form.blood_group" /></td><td className="py-2">{member.bloodGroup || '-'}</td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium"><Trans tKey="members.form.present_address" /></td><td className="py-2">{member.presentAddress || '-'}</td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium"><Trans tKey="members.form.permanent_address" /></td><td className="py-2">{member.permanentAddress || '-'}</td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium"><Trans tKey="members.form.mobile" /></td><td className="py-2">{member.mobile || '-'}</td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium"><Trans tKey="members.form.email" /></td><td className="py-2">{member.email || '-'}</td></tr>
              </tbody>
            </table>
          </section>

          {/* SECTION 2 */}
          <section>
            <h2 className="text-lg font-bold bg-muted/30 px-3 py-1.5 border-l-4 border-primary mb-3 mt-6"><Trans tKey="members.view.emergency_contact" /></h2>
            <table className="w-full text-sm border-collapse">
              <tbody>
                <tr className="border-b"><td className="py-2 w-1/3 text-muted-foreground font-medium"><Trans tKey="members.form.name" /></td><td className="py-2">{member.emergencyContactName || '-'}</td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium"><Trans tKey="members.form.relation" /></td><td className="py-2">{member.emergencyContactRelation || '-'}</td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium"><Trans tKey="members.form.mobile" /></td><td className="py-2">{member.emergencyContactMobile || '-'}</td></tr>
              </tbody>
            </table>
          </section>

          {/* SECTION 3 */}
          <section>
            <h2 className="text-lg font-bold bg-muted/30 px-3 py-1.5 border-l-4 border-primary mb-3 mt-6"><Trans tKey="members.view.reference" /></h2>
            <table className="w-full text-sm border-collapse">
              <tbody>
                <tr className="border-b"><td className="py-2 w-1/3 text-muted-foreground font-medium"><Trans tKey="members.form.name" /></td><td className="py-2">{reference.name || '-'}</td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium"><Trans tKey="members.form.relation" /></td><td className="py-2">{reference.relation || '-'}</td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium"><Trans tKey="members.form.mobile" /></td><td className="py-2">{reference.mobile || '-'}</td></tr>
              </tbody>
            </table>
          </section>

          {/* SECTION 4 */}
          <section>
            <h2 className="text-lg font-bold bg-muted/30 px-3 py-1.5 border-l-4 border-primary mb-3 mt-6"><Trans tKey="members.view.membership_info" /></h2>
            <table className="w-full text-sm border-collapse">
              <tbody>
                <tr className="border-b"><td className="py-2 w-1/3 text-muted-foreground font-medium"><Trans tKey="members.form.group" /></td><td className="py-2">{member.group?.name || '-'}</td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium"><Trans tKey="members.view.group_code" /></td><td className="py-2">{member.group?.code || '-'}</td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium"><Trans tKey="members.view.join_date" /></td><td className="py-2">{member.joinDate ? formatDate(member.joinDate) : '-'}</td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium"><Trans tKey="members.table.status" /></td><td className="py-2">{member.status === "ACTIVE" ? <Trans tKey="members.status.active" /> : <Trans tKey="members.status.inactive" />}</td></tr>
              </tbody>
            </table>
          </section>
          
          {/* SECTION 5 */}
          <section className="print:break-before-page">
            <h2 className="text-lg font-bold bg-muted/30 px-3 py-1.5 border-l-4 border-primary mb-3 mt-6"><Trans tKey="members.view.documents" /></h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DocumentCard title={<Trans tKey="members.documents.member_photo" />} url={photoDoc} />
              <DocumentCard title={<Trans tKey="members.documents.signature" />} url={signatureDoc} />
              
              {member.idDocumentType === "NID" ? (
                <>
                  <DocumentCard title={<Trans tKey="members.documents.nid_front" />} url={nidFrontDoc} />
                  <DocumentCard title={<Trans tKey="members.documents.nid_back" />} url={nidBackDoc} />
                </>
              ) : (
                <DocumentCard title={<Trans tKey="members.documents.birth_certificate" />} url={bcDoc} />
              )}
            </div>
          </section>

          {/* SECTION 6 */}
          {(member as any).statusHistory && (member as any).statusHistory.length > 0 && (
            <section className="print:break-before-page">
              <h2 className="text-lg font-bold bg-muted/30 px-3 py-1.5 border-l-4 border-primary mb-3 mt-6"><Trans tKey="members.view.audit_history" /></h2>
              <div className="border rounded-md overflow-hidden">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-muted/50 font-semibold border-b">
                    <tr>
                      <th className="p-2"><Trans tKey="members.view.date" /></th>
                      <th className="p-2"><Trans tKey="members.view.from" /></th>
                      <th className="p-2"><Trans tKey="members.view.to" /></th>
                      <th className="p-2"><Trans tKey="members.view.reason" /></th>
                      <th className="p-2"><Trans tKey="members.view.by" /></th>
                    </tr>
                  </thead>
                  <tbody>
                    {(member as any).statusHistory.map((h: any) => (
                      <tr key={h.id} className="border-b hover:bg-muted/20">
                        <td className="p-2">{formatDate(h.changedAt)}</td>
                        <td className="p-2 font-mono">{h.fromStatus}</td>
                        <td className="p-2 font-mono font-semibold">{h.toStatus}</td>
                        <td className="p-2">{h.reason || h.notes || '-'}</td>
                        <td className="p-2 font-medium">{h.changedBy || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div className="w-full md:w-64 shrink-0 flex flex-col items-center pt-2 print:pt-10">
          <div className="border border-border p-2 bg-muted/10 w-full max-w-[200px]">
            <div className="relative w-full aspect-[4/5] bg-muted flex flex-col items-center justify-center border border-dashed border-muted-foreground/30">
              {photoDoc ? (
                <Image src={photoDoc} alt="Photo" fill className="object-cover" />
              ) : (
                <span className="text-sm text-muted-foreground"><Trans tKey="members.view.no_photo" /></span>
              )}
            </div>
          </div>
          
          <div className="mt-6 w-full max-w-[200px] text-center border p-4 bg-muted/5 space-y-3">
            <div>
              <p className="text-xs text-muted-foreground"><Trans tKey="members.view.member_id" /></p>
              <p className="font-bold text-lg">{member.memberId}</p>
            </div>
            <div className="border-t pt-2">
              <p className="text-xs text-muted-foreground"><Trans tKey="members.view.group_code" /></p>
              <p className="font-semibold">{member.group?.code || '-'}</p>
            </div>
            <div className="border-t pt-2">
              <p className="text-xs text-muted-foreground"><Trans tKey="members.view.join_date" /></p>
              <p className="font-semibold">{member.joinDate ? formatDate(member.joinDate) : '-'}</p>
            </div>
            <div className="border-t pt-2">
              <p className="text-xs text-muted-foreground"><Trans tKey="members.table.status" /></p>
              <p className={`font-semibold ${member.status === "ACTIVE" ? "text-green-600" : "text-red-600"}`}>
                {member.status === "ACTIVE" ? <Trans tKey="members.status.active" /> : <Trans tKey="members.status.inactive" />}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
