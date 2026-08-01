"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { usePathname } from "next/navigation"

// Suppress the React 19 "Encountered a script tag" warning
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  const orig = console.error;
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === "string" && args[0].includes("Encountered a script tag")) {
      return;
    }
    orig.apply(console, args);
  };
}

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  const pathname = usePathname()
  
  // Public pages use a separate theme storage key to completely isolate their theme from the dashboard
  const isPublic = pathname === '/' || pathname === '/member-request' || pathname === '/member-request/status'

  return (
    <NextThemesProvider 
      key={isPublic ? "public-theme" : "dashboard-theme"}
      storageKey={isPublic ? "public-theme" : "theme"}
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}
