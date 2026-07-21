import { getBeneficiary } from "@/features/beneficiaries/actions"
import { getMembers } from "@/features/members/actions"
import { BeneficiaryForm } from "@/features/beneficiaries/components/beneficiary-form"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export default async function EditBeneficiaryPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  // @ts-ignore
  const userRole = session?.user?.role;
  const isManage = userRole === "ADMIN" || userRole === "MANAGER" || userRole === "SUPER_ADMIN";

  if (!isManage) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <h1 className="text-2xl font-bold">Unauthorized</h1>
        <p className="text-muted-foreground">You do not have permission to edit beneficiaries.</p>
        <Button asChild><Link href="/beneficiaries/manage">Go Back</Link></Button>
      </div>
    )
  }

  const resolvedParams = await params;
  const beneficiary = await getBeneficiary(resolvedParams.id)
  
  if (!beneficiary) return notFound()

  const members = await getMembers()

  const initialData = {
    fullName: beneficiary.fullName || "",
    fatherOrHusbandName: beneficiary.fatherOrHusbandName || "",
    nationalId: beneficiary.nationalId || "",
    mobile: beneficiary.mobile || "",
    presentAddress: beneficiary.presentAddress || "",
    permanentAddress: beneficiary.permanentAddress || "",
    
    emergencyContactName: beneficiary.emergencyContactName || "",
    emergencyContactRelation: beneficiary.emergencyContactRelation || "",
    emergencyContactMobile: beneficiary.emergencyContactMobile || "",
    
    status: beneficiary.status || "ACTIVE",
    
    beneficiaryPhoto: beneficiary.beneficiaryPhoto || "",
    nidOrBirthCertificate: beneficiary.nidOrBirthCertificate || "",
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/beneficiaries/manage">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">সুবিধাভোগীর তথ্য হালনাগাদ</h1>
          <p className="text-muted-foreground">{beneficiary.fullName || 'নাম পাওয়া যায়নি'} এর তথ্য হালনাগাদ করুন।</p>
        </div>
      </div>
      
      <BeneficiaryForm 
        members={members} 
        mode="edit" 
        beneficiaryId={beneficiary.id} 
        initialData={initialData as any} 
        beneficiary={beneficiary} 
      />
    </div>
  )
}
