"use client"

import { useLanguage } from "./LanguageProvider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="tooltip-container p-2 text-surface-500 hover:text-surface-700 hover:bg-surface-100 rounded-lg transition-all flex items-center gap-1">
          <span className="text-[14px] font-medium hidden sm:inline-block">
            {language === "bn" ? "🇧🇩 বাংলা" : "🇺🇸 English"}
          </span>
          <Globe className="w-5 h-5 sm:hidden" />
          <span className="tooltip-custom">Language</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[120px]">
        <DropdownMenuItem 
          onClick={() => setLanguage("bn")}
          className={`cursor-pointer ${language === "bn" ? "bg-surface-100 font-semibold" : ""}`}
        >
          🇧🇩 বাংলা
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setLanguage("en")}
          className={`cursor-pointer ${language === "en" ? "bg-surface-100 font-semibold" : ""}`}
        >
          🇺🇸 English
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
