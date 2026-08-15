"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { GroupCombobox, type ComboboxGroup } from "@/components/group-combobox"
import { getGroups } from "../actions"
import { useLanguage } from "@/i18n/LanguageProvider";

export function GroupSelector() {
  const { t } = useLanguage();
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentGroupId = searchParams.get("groupId") || ""
  
  const [groups, setGroups] = useState<ComboboxGroup[]>([])
  
  useEffect(() => {
    getGroups().then(data => setGroups(data.map(g => ({
      id: g.id,
      name: g.name,
      code: g.code,
      isFoundationGroup: g.isFoundationGroup,
      memberSignupEnabled: g.memberSignupEnabled,
    }))))
  }, [])

  const handleValueChange = (value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value && value !== "all") {
      params.set("groupId", value)
    } else {
      params.delete("groupId")
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm font-medium whitespace-nowrap">{t("groups.selector.label")}</span>
      <div className="w-[260px] sm:w-[300px]">
        <GroupCombobox
          groups={groups}
          value={currentGroupId}
          onChange={handleValueChange}
          placeholder={t("groups.selector.placeholder")}
        />
      </div>
    </div>
  )
}
