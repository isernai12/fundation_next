import { getDonor } from "@/features/donors/actions"
import { DonorForm } from "@/features/donors/components/donor-form"
import { notFound } from "next/navigation"
import { Trans } from "@/components/shared/trans";

export const metadata = {
  title: "Edit Donor | Foundation ERP",
}

export default async function EditDonorPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  if (!resolvedParams.id) {
    notFound()
  }
  const donor = await getDonor(resolvedParams.id)
  
  if (!donor) {
    notFound()
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight"><Trans tKey="donors.edit_page.title" /></h1>
        <p className="text-muted-foreground">
          {donor.fullName} - <Trans tKey="donors.edit_page.subtitle" /></p>
      </div>

      <DonorForm mode="edit" donor={donor} />
    </div>
  )
}
