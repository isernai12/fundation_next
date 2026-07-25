import { CampaignForm } from "@/features/campaigns/components/campaign-form"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

export default function NewCampaignPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/campaigns/manage" className="hover:text-primary transition-colors">
          তহবিল কার্যক্রম
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground">নতুন তহবিল কার্যক্রম</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">নতুন তহবিল কার্যক্রম</h1>
          <p className="text-muted-foreground">তহবিল সংগ্রহের জন্য একটি নতুন কার্যক্রম বা ক্যাম্পেইন তৈরি করুন।</p>
        </div>
      </div>

      <CampaignForm />
    </div>
  )
}
