"use client"

import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/i18n/LanguageProvider";

export function MemberProfileActions({ memberId }: { memberId: string }) {
    const { t } = useLanguage();
  return (
    <div className="flex items-center gap-2 print:hidden">
      <Button variant="outline" size="sm" asChild>
        <Link href={`/members/${memberId}/edit`}>
          <Edit className="h-4 w-4 mr-2" />
          {t("members.actions.edit")}</Link>
      </Button>
    </div>
  )
}

