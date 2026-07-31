"use client"
import { useLanguage } from "@/i18n/LanguageProvider"

export function Trans({ tKey }: { tKey: string }) {
  const { t } = useLanguage()
  return <>{t(tKey)}</>
}
