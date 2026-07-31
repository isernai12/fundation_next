"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { useRouter } from "next/navigation"
import legacyEn from "./locales/en.json"
import legacyBn from "./locales/bn.json"
import { enDictionaries, bnDictionaries } from "./dictionaries"

const en = { ...legacyEn, ...enDictionaries }
const bn = { ...legacyBn, ...bnDictionaries }

type Language = "en" | "bn"
type Translations = typeof en

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const translations: Record<Language, Translations> = { en, bn }

const STORAGE_KEY = "foundation-language"

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("bn")
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Read from local storage or cookie on mount
    const saved = localStorage.getItem(STORAGE_KEY) as Language
    if (saved && (saved === "en" || saved === "bn")) {
      setLanguageState(saved)
      document.cookie = `${STORAGE_KEY}=${saved}; path=/; max-age=31536000`
    }
    setMounted(true)
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem(STORAGE_KEY, lang)
    document.cookie = `${STORAGE_KEY}=${lang}; path=/; max-age=31536000`
    router.refresh()
  }

  // Fallback translation resolver
  const t = (path: string): string => {
    if (!path) return ""
    const keys = path.split(".")
    let current: any = translations[language]
    
    for (const key of keys) {
      if (current === undefined || current[key] === undefined) {
        // Fallback to English dictionary if missing in Bengali
        let enFallback: any = translations["en"]
        for (const k of keys) {
          if (enFallback === undefined || enFallback[k] === undefined) {
            const lastSegment = keys[keys.length - 1]
            return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace(/_/g, ' ')
          }
          enFallback = enFallback[k]
        }
        if (typeof enFallback === "string") {
          return enFallback
        }
        const lastSegment = keys[keys.length - 1]
        return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace(/_/g, ' ')
      }
      current = current[key]
    }
    
    if (typeof current === "string") {
      return current
    }
    const lastSegment = keys[keys.length - 1]
    return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace(/_/g, ' ')
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      <div suppressHydrationWarning style={{ visibility: mounted ? "visible" : "hidden", display: "contents" }}>
        {children}
      </div>
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
