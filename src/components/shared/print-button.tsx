"use client"

import { Button, ButtonProps } from "@/components/ui/button"
import { Printer } from "lucide-react"
import { useLanguage } from "@/i18n/LanguageProvider";

export function PrintButton({ className, ...props }: ButtonProps) {
    const { t } = useLanguage();
  return (
    <Button variant="outline" size="sm" onClick={() => {
        return (window.print());
      }} className={className} {...props}>
      <Printer className="w-4 h-4 mr-2" />
      {t("shared.print_9865ef")}</Button>
  )
}
