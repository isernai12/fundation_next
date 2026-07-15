"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  Building,
  CreditCard,
  PiggyBank,
  Gift,
  BookOpen,
  PieChart,
  Settings,
  FolderOpen,
  ChevronDown,
} from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

type SubMenuItem = {
  name: string
  href: string
}

type MenuItem = {
  name: string
  href: string
  icon: any
  submenu?: SubMenuItem[]
}

const sidebarItems: MenuItem[] = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { 
    name: "Members", 
    href: "/members", 
    icon: Users,
    submenu: [
      { name: "Add Member", href: "/members/new" },
      { name: "All Members", href: "/members" },
      { name: "Manage Members", href: "/members/manage" },
      { name: "Member Ledger", href: "/members/ledger" },
      { name: "Member Due List", href: "/members/dues" },
      { name: "Member Documents", href: "/members/documents" },
    ]
  },
  { name: "Beneficiaries", href: "/beneficiaries", icon: Users },
  { name: "Groups", href: "/groups", icon: Building },
  { name: "Contributions", href: "/contributions", icon: CreditCard },
  { name: "Loans", href: "/loans", icon: PiggyBank },
  { name: "Grants", href: "/grants", icon: Gift },
  { name: "Ledger", href: "/ledger", icon: BookOpen },
  { name: "Documents", href: "/documents", icon: FolderOpen },
  { name: "Reports", href: "/reports", icon: PieChart },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  const [openItems, setOpenItems] = React.useState<Record<string, boolean>>(() => {
    const initialState: Record<string, boolean> = {}
    sidebarItems.forEach(item => {
      if (item.submenu) {
        initialState[item.name] = pathname.startsWith(item.href)
      }
    })
    return initialState
  })

  React.useEffect(() => {
    setOpenItems(prev => {
      const next = { ...prev }
      let changed = false
      sidebarItems.forEach(item => {
        if (item.submenu && pathname.startsWith(item.href)) {
          if (!next[item.name]) {
            next[item.name] = true
            changed = true
          }
        }
      })
      return changed ? next : prev
    })
  }, [pathname])

  const toggleItem = (name: string) => {
    setOpenItems(prev => ({
      ...prev,
      [name]: !prev[name]
    }))
  }

  return (
    <aside className="w-64 border-r bg-card flex flex-col h-full">
      <div className="h-14 border-b flex items-center px-6">
        <h2 className="font-semibold text-lg tracking-tight">Foundation ERP</h2>
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className="space-y-1 px-3">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href

            if (item.submenu) {
              const isOpen = openItems[item.name]
              const isChildActive = item.submenu.some(sub => pathname === sub.href)

              return (
                <Collapsible
                  key={item.name}
                  open={isOpen}
                  onOpenChange={() => toggleItem(item.name)}
                >
                  <CollapsibleTrigger
                    className={cn(
                      "flex w-full items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      isChildActive || isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <div className="flex items-center">
                      <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                      {item.name}
                    </div>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        isOpen ? "rotate-180" : ""
                      )}
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                    <div className="pt-1 pb-1">
                      {item.submenu.map((sub) => {
                        const isSubActive = pathname === sub.href
                        return (
                          <Link
                            key={sub.name}
                            href={sub.href}
                            className={cn(
                              "flex items-center pl-11 pr-3 py-2 text-sm font-medium rounded-md transition-colors",
                              isSubActive
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            )}
                          >
                            {sub.name}
                          </Link>
                        )
                      })}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
