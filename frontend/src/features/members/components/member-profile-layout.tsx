import { formatDate } from "@/lib/format"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"
import { Trans } from "@/components/shared/trans";

const DocumentCard = ({ title, url }: { title: React.ReactNode, url?: string | null }) => (
  <div className="border rounded-md p-3">
    <p className="font-semibold text-sm mb-2 text-center border-b pb-2">{title}</p>
    {url ? (
      <a href={url} target="_blank" rel="noopener noreferrer" className="block relative h-40 w-full overflow-hidden hover:opacity-90">
        {url.endsWith('.pdf') ? (
          <div className="flex h-full items-center justify-center bg-muted/10 text-primary underline"><Trans tKey="members.actions.pdf" /></div>
        ) : (
          <img src={url} alt="Document" className="object-contain w-full h-full bg-muted/10" />
        )}
      </a>
    ) : (
      <div className="h-40 flex items-center justify-center text-sm text-muted-foreground italic">
        <Trans tKey="members.documents.no_documents" />
      </div>
    )}
  </div>
);

export interface MemberProfileData {
  fullName?: string | null
  fatherName?: string | null
  motherName?: string | null
  dob?: Date | string | null
  nationalId?: string | null
  occupation?: string | null
  education?: string | null
  bloodGroup?: string | null
  maritalStatus?: string | null
  presentAddress?: string | null
  permanentAddress?: string | null
  mobile?: string | null
  email?: string | null
  
  emergencyContactName?: string | null
  emergencyContactRelation?: string | null
  emergencyContactMobile?: string | null
  
  referenceName?: string | null
  referenceRelation?: string | null
  referenceMobile?: string | null

  groupName?: string | null
  groupCode?: string | null
  
  joinDate?: Date | string | null
  status?: string | null
  
  idDocumentType?: string | null
  
  memberId?: string | null
  applicationNumber?: string | null
  
  statusHistory?: any[]
  
  documents?: any[]
  position?: string | null
  reasonForJoining?: string | null
  voluntaryDonations?: { id: string; date: string; voucherNo: string; groupName: string; amount: number; remarks: string }[]
}

export function MemberProfileLayout({
  data,
  titleNode,
  backHref,
  topActionNode,
  bottomActionNode,
  statusNode,
}: {
  data: MemberProfileData
  titleNode: React.ReactNode
  backHref: string
  topActionNode?: React.ReactNode
  bottomActionNode?: React.ReactNode
  statusNode?: React.ReactNode
}) {
  const getDoc = (title: string) => data.documents?.find(d => d.title === title)?.secureUrl;
  
  const photoDoc = getDoc("Member Photo") || getDoc("Photo");
  const signatureDoc = getDoc("Signature");
  const nidFrontDoc = getDoc("NID Front") || getDoc("National ID"); 
  const nidBackDoc = getDoc("NID Back");
  const bcDoc = getDoc("Birth Certificate");

  return (
    <div className="max-w-5xl mx-auto space-y-8 print:m-0 print:p-0 bg-background text-foreground p-6 rounded-md shadow-sm border print:border-none print:shadow-none">
      {/* Top Navigation & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b print:hidden gap-4">
        <div className="flex items-center gap-4">
          <Link href={backHref} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-bold">{titleNode}</h1>
        </div>
        <div className="flex items-center gap-4 ml-auto">
          {statusNode}
          {topActionNode}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* LEFT COLUMN */}
        <div className="flex-1 space-y-6">
          
          {/* SECTION 1 */}
          <section>
            <h2 className="text-lg font-bold bg-muted/30 px-3 py-1.5 border-l-4 border-primary mb-3"><Trans tKey="members.view.personal_info" /></h2>
            <table className="w-full text-sm border-collapse">
              <tbody>
                <tr className="border-b"><td className="py-2 w-1/3 text-muted-foreground font-medium"><Trans tKey="members.form.full_name" /></td><td className="py-2 font-medium">{data.fullName || ''} </td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium"><Trans tKey="members.form.father_name" /></td><td className="py-2">{data.fatherName || '-'}</td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium"><Trans tKey="members.form.mother_name" /></td><td className="py-2">{data.motherName || '-'}</td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium"><Trans tKey="members.form.dob" /></td><td className="py-2">{data.dob ? formatDate(data.dob) : '-'}</td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium"><Trans tKey="members.form.nid" /></td><td className="py-2">{data.nationalId || '-'}</td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium"><Trans tKey="members.form.occupation" /></td><td className="py-2">{data.occupation || '-'}</td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium"><Trans tKey="members.form.education" /></td><td className="py-2">{data.education || '-'}</td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium"><Trans tKey="members.form.blood_group" /></td><td className="py-2">{data.bloodGroup || '-'}</td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium"><Trans tKey="members.form.marital_status" /></td><td className="py-2">{data.maritalStatus || '-'}</td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium"><Trans tKey="members.form.present_address" /></td><td className="py-2">{data.presentAddress || '-'}</td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium"><Trans tKey="members.form.permanent_address" /></td><td className="py-2">{data.permanentAddress || '-'}</td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium"><Trans tKey="members.form.mobile" /></td><td className="py-2">{data.mobile || '-'}</td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium"><Trans tKey="members.form.email" /></td><td className="py-2">{data.email || '-'}</td></tr>
              </tbody>
            </table>
          </section>

          {/* SECTION 2 */}
          <section>
            <h2 className="text-lg font-bold bg-muted/30 px-3 py-1.5 border-l-4 border-primary mb-3 mt-6"><Trans tKey="members.view.emergency_contact" /></h2>
            <table className="w-full text-sm border-collapse">
              <tbody>
                <tr className="border-b"><td className="py-2 w-1/3 text-muted-foreground font-medium"><Trans tKey="members.form.name" /></td><td className="py-2">{data.emergencyContactName || '-'}</td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium"><Trans tKey="members.form.relation" /></td><td className="py-2">{data.emergencyContactRelation || '-'}</td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium"><Trans tKey="members.form.mobile" /></td><td className="py-2">{data.emergencyContactMobile || '-'}</td></tr>
              </tbody>
            </table>
          </section>

          {/* SECTION 3 */}
          <section>
            <h2 className="text-lg font-bold bg-muted/30 px-3 py-1.5 border-l-4 border-primary mb-3 mt-6"><Trans tKey="members.view.reference" /></h2>
            <table className="w-full text-sm border-collapse">
              <tbody>
                <tr className="border-b"><td className="py-2 w-1/3 text-muted-foreground font-medium"><Trans tKey="members.form.name" /></td><td className="py-2">{data.referenceName || '-'}</td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium"><Trans tKey="members.form.relation" /></td><td className="py-2">{data.referenceRelation || '-'}</td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium"><Trans tKey="members.form.mobile" /></td><td className="py-2">{data.referenceMobile || '-'}</td></tr>
              </tbody>
            </table>
          </section>

          {/* SECTION 4 */}
          <section>
            <h2 className="text-lg font-bold bg-muted/30 px-3 py-1.5 border-l-4 border-primary mb-3 mt-6"><Trans tKey="members.view.membership_info" /></h2>
            <table className="w-full text-sm border-collapse">
              <tbody>
                <tr className="border-b"><td className="py-2 w-1/3 text-muted-foreground font-medium"><Trans tKey="members.form.group" /></td><td className="py-2">{data.groupName || '-'}</td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium"><Trans tKey="members.view.group_code" /></td><td className="py-2">{data.groupCode || '-'}</td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium"><Trans tKey="members.view.join_date" /></td><td className="py-2">{data.joinDate ? formatDate(data.joinDate) : '-'}</td></tr>
                <tr className="border-b"><td className="py-2 text-muted-foreground font-medium"><Trans tKey="members.position" /></td><td className="py-2">{data.position ? <Trans tKey={`members.positions.${data.position}`} /> : '-'}</td></tr>
              </tbody>
            </table>
          </section>

          {data.reasonForJoining && (
            <section>
              <h2 className="text-lg font-bold bg-muted/30 px-3 py-1.5 border-l-4 border-primary mb-3 mt-6">
                <Trans tKey="member-requests.public.form.reasonForJoining" />
              </h2>
              <div className="border rounded-md p-4 bg-muted/10 text-sm whitespace-pre-wrap">
                {data.reasonForJoining}
              </div>
            </section>
          )}

          {(!data.reasonForJoining && data.applicationNumber) && (
            <section>
              <h2 className="text-lg font-bold bg-muted/30 px-3 py-1.5 border-l-4 border-primary mb-3 mt-6">
                <Trans tKey="member-requests.public.form.reasonForJoining" />
              </h2>
              <div className="border rounded-md p-4 bg-muted/10 text-sm whitespace-pre-wrap text-muted-foreground italic">
                Not provided
              </div>
            </section>
          )}
          
          {/* SECTION 5 */}
          <section className="print:break-before-page">
            <h2 className="text-lg font-bold bg-muted/30 px-3 py-1.5 border-l-4 border-primary mb-3 mt-6"><Trans tKey="members.view.documents" /></h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DocumentCard title={<Trans tKey="members.documents.member_photo" />} url={photoDoc} />
              <DocumentCard title={<Trans tKey="members.documents.signature" />} url={signatureDoc} />
              
              {data.idDocumentType === "NID" ? (
                <>
                  <DocumentCard title={<Trans tKey="members.documents.nid_front" />} url={nidFrontDoc} />
                  <DocumentCard title={<Trans tKey="members.documents.nid_back" />} url={nidBackDoc} />
                </>
              ) : (
                <DocumentCard title={<Trans tKey="members.documents.birth_certificate" />} url={bcDoc} />
              )}
            </div>
          </section>

          {/* Voluntary Donations Section */}
          {data.voluntaryDonations && data.voluntaryDonations.length > 0 && (
            <section className="print:break-before-page">
              <div className="flex items-center justify-between bg-muted/30 px-3 py-1.5 border-l-4 border-emerald-600 mb-3 mt-6">
                <h2 className="text-lg font-bold">Voluntary Donations (ঐচ্ছিক সদকা / অনুদান)</h2>
                <span className="text-sm font-bold text-emerald-600 font-mono">
                  Total: ৳{data.voluntaryDonations.reduce((acc, d) => acc + d.amount, 0).toLocaleString()}
                </span>
              </div>
              <div className="border rounded-md overflow-hidden">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-muted/50 font-semibold border-b">
                    <tr>
                      <th className="p-2"><Trans tKey="donors.k_3e10c2" /></th>
                      <th className="p-2"><Trans tKey="donors.k_390ea9" /></th>
                      <th className="p-2"><Trans tKey="donors.group_d4d811" /></th>
                      <th className="p-2"><Trans tKey="donors.k_e147d5" /></th>
                      <th className="p-2 text-right"><Trans tKey="donors.amount_261c82" /></th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.voluntaryDonations.map((d) => (
                      <tr key={d.id} className="border-b hover:bg-muted/20">
                        <td className="p-2">{formatDate(d.date)}</td>
                        <td className="p-2 font-mono text-primary font-medium">{d.voucherNo}</td>
                        <td className="p-2">{d.groupName}</td>
                        <td className="p-2 text-muted-foreground">{d.remarks || '-'}</td>
                        <td className="p-2 text-right font-bold text-emerald-600 font-mono">৳{d.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* SECTION 6 (Audit) */}
          {data.statusHistory && data.statusHistory.length > 0 && (
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
                    {data.statusHistory.map((h: any, idx: number) => (
                      <tr key={h.id || idx} className="border-b hover:bg-muted/20">
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

          {bottomActionNode && (
            <section className="mt-8">
              {bottomActionNode}
            </section>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div className="w-full md:w-64 shrink-0 flex flex-col items-center pt-2 print:pt-10">
          <div className="border border-border p-2 bg-muted/10 w-full max-w-[200px]">
            <div className="relative w-full aspect-[4/5] bg-muted flex flex-col items-center justify-center border border-dashed border-muted-foreground/30">
              {photoDoc ? (
                <img src={photoDoc} alt="Photo" className="object-cover w-full h-full absolute inset-0" />
              ) : (
                <span className="text-sm text-muted-foreground"><Trans tKey="members.view.no_photo" /></span>
              )}
            </div>
          </div>
          
          <div className="mt-6 w-full max-w-[200px] text-center border p-4 bg-muted/5 space-y-3">
            {data.memberId && (
              <div>
                <p className="text-xs text-muted-foreground"><Trans tKey="members.view.member_id" /></p>
                <p className="font-bold text-lg">{data.memberId}</p>
              </div>
            )}
            {data.applicationNumber && (
              <div>
                <p className="text-xs text-muted-foreground"><Trans tKey="member-requests.status.application_number" /></p>
                <p className="font-bold text-lg">{data.applicationNumber}</p>
              </div>
            )}
            <div className="border-t pt-2">
              <p className="text-xs text-muted-foreground"><Trans tKey="members.view.group_code" /></p>
              <p className="font-semibold">{data.groupCode || '-'}</p>
            </div>
            {data.joinDate && (
              <div className="border-t pt-2">
                <p className="text-xs text-muted-foreground"><Trans tKey="members.view.join_date" /></p>
                <p className="font-semibold">{formatDate(data.joinDate)}</p>
              </div>
            )}
            <div className="border-t pt-2">
              <p className="text-xs text-muted-foreground"><Trans tKey="members.table.status" /></p>
              <p className={`font-semibold ${data.status === "ACTIVE" || data.status === "APPROVED" ? "text-green-600" : data.status === "REJECTED" ? "text-red-600" : "text-amber-600"}`}>
                {data.status === "ACTIVE" ? <Trans tKey="members.status.active" /> 
                : data.status === "INACTIVE" ? <Trans tKey="members.status.inactive" />
                : data.status}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
