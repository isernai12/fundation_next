"use client"

import Link from "next/link"
import { LanguageSwitcher } from "@/i18n/LanguageSwitcher"
import { ThemeToggle } from "@/components/theme-toggle"

export function PublicHeader() {
  return (
    <header className="absolute top-0 left-0 w-full z-50 p-4 sm:p-6 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2 sm:gap-3 group hover:opacity-80 transition-opacity">
        <div className="w-10 h-10 sm:w-12 sm:h-12 drop-shadow-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="https://res.cloudinary.com/diwp8ug1r/image/upload/v1785393014/branding/o4r9o3gjgfkulrgm4bzu.png?v=1785394871157" 
            alt="Foundation Logo"
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex flex-col">
          <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight tracking-tight">
            ভ্রাতৃত্ব ফাউন্ডেশন
          </span>
          <span className="text-xs sm:text-sm font-semibold text-teal-700 dark:text-teal-400 leading-tight">
            Bhratritya Foundation
          </span>
        </div>
      </Link>

      <div className="flex items-center gap-2 sm:gap-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md p-1.5 rounded-full border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
    </header>
  )
}
