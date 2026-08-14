"use client"

import * as React from "react"
import { hasPermission } from "@/lib/rbac-client"

type RbacContextType = {
  permissions: string[]
  can: (module: string, action: string) => boolean
}

const RbacContext = React.createContext<RbacContextType | undefined>(undefined)

export function RbacProvider({
  children,
  permissions,
}: {
  children: React.ReactNode
  permissions: string[]
}) {
  const can = React.useCallback(
    (module: string, action: string) => hasPermission(permissions, module, action),
    [permissions]
  )

  return (
    <RbacContext.Provider value={{ permissions, can }}>
      {children}
    </RbacContext.Provider>
  )
}

export function useRbac() {
  const context = React.useContext(RbacContext)
  if (context === undefined) {
    throw new Error("useRbac must be used within a RbacProvider")
  }
  return context
}
