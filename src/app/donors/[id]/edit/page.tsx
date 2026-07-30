import { getDonor } from "@/features/donors/actions"
import { DonorForm } from "@/features/donors/components/donor-form"
import { notFound } from "next/navigation"

export const metadata = {
  title: "অনুদানদাতা সম্পাদনা | Foundation ERP",
}

export default async function EditDonorPage({ params }: { params: { id: string } }) {
  const donor = await getDonor(params.id)
  
  if (!donor) {
    notFound()
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">অনুদানদাতা সম্পাদনা</h1>
        <p className="text-muted-foreground">
          {donor.fullName} এর তথ্য আপডেট করুন।
        </p>
      </div>

      <DonorForm mode="edit" donor={donor} />
    </div>
  )
}
