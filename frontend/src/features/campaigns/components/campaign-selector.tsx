"use client"

import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLanguage } from "@/i18n/LanguageProvider";

interface CampaignSelectorProps {
  campaigns: { id: string; name: string }[]
  selectedCampaignId?: string
}

export function CampaignSelector({ campaigns, selectedCampaignId }: CampaignSelectorProps) {
    const { t } = useLanguage();
  const router = useRouter()

  return (
    <Select
      value={selectedCampaignId || ""}
      onValueChange={(value) => {
        router.push(`/campaigns/ledger?campaignId=${value}`)
      }}
    >
      <SelectTrigger className="w-[300px]">
        <SelectValue placeholder={t("campaigns.k_f1c840")} />
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
