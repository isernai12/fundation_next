"use client"

import React, { createContext, useContext } from "react"

export type BrandingType = {
  foundationName: string
  shortName: string
  logo: string | null
  favicon: string | null
  loginLogo: string | null
  sidebarLogo: string | null
  headerLogo: string | null
}

const BrandingContext = createContext<BrandingType | null>(null)

export function BrandingProvider({
  branding,
  children
}: {
  branding: BrandingType
  children: React.ReactNode
}) {
  return (
    <BrandingContext.Provider value={branding}>
      {children}
    </BrandingContext.Provider>
  )
}

export function useBranding() {
  const context = useContext(BrandingContext)
  if (!context) {
    throw new Error("useBranding must be used within a BrandingProvider")
  }
  return context
}
