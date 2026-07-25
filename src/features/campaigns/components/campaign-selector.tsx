"use client"

import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CampaignSelectorProps {
  campaigns: { id: string; name: string }[]
  selectedCampaignId?: string
}

export function CampaignSelector({ campaigns, selectedCampaignId }: CampaignSelectorProps) {
  const router = useRouter()

  return (
    <Select
      value={selectedCampaignId || ""}
      onValueChange={(value) => {
        router.push(`/campaigns/ledger?campaignId=${value}`)
      }}
    >
      <SelectTrigger className="w-[300px]">
        <SelectValue placeholder="তহবিল নির্বাচন করুন" />
      </SelectTrigger>
      <SelectContent>
        {campaigns.map((c) => (
          <SelectItem key={c.id} value={c.id}>
            {c.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
