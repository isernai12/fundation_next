import { DonorForm } from "@/features/donors/components/donor-form"
import { Trans } from "@/components/shared/trans";

export const metadata = {
  title: "New Donor | Foundation ERP",
  description: "Add a new donor",
}

export default function NewDonorPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight"><Trans tKey="donors.new_page.title" /></h1>
        <p className="text-muted-foreground">
          <Trans tKey="donors.new_page.subtitle" /></p>
      </div>

      <DonorForm mode="create" />
    </div>
  )
}
