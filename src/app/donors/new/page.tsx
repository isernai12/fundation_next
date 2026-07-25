import { DonorForm } from "@/features/donors/components/donor-form"

export const metadata = {
  title: "নতুন অনুদানদাতা | Foundation ERP",
  description: "Add a new donor",
}

export default function NewDonorPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">নতুন অনুদানদাতা নিবন্ধন</h1>
        <p className="text-muted-foreground">
          নতুন অনুদানদাতার তথ্য ফর্মে পূরণ করুন।
        </p>
      </div>

      <DonorForm mode="create" />
    </div>
  )
}
