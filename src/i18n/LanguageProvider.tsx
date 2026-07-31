"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react"
import en from "./locales/en.json"
import bn from "./locales/bn.json"

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

  useEffect(() => {
    // Read from local storage on mount
    const saved = localStorage.getItem(STORAGE_KEY) as Language
    if (saved && (saved === "en" || saved === "bn")) {
      setLanguageState(saved)
    }
    setMounted(true)
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem(STORAGE_KEY, lang)
  }

  // Fallback translation resolver
  const t = (path: string): string => {
    const keys = path.split(".")
    let current: any = translations[language]
    
    for (const key of keys) {
      if (current[key] === undefined) {
        console.warn(`Translation missing for key: ${path}`)
        return path // Fallback to key path if missing
      }
      current = current[key]
    }
    
    return current as string
  }

  // Prevent hydration mismatch by rendering invisible or fallback until mounted
  // but to maintain SEO and performance, we'll render with the default state,
  // acknowledging there might be a brief flash if the user's stored language differs.
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
