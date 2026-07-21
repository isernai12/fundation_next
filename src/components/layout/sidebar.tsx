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
  X,
} from "lucide-react"

import { useSidebar } from "@/components/layout/sidebar-provider"

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
      { name: "Manage Members", href: "/members/manage" },
      { name: "Member Ledger", href: "/members/ledger" },
      { name: "Member Due List", href: "/members/dues" },
    ]
  },
  { 
    name: "Beneficiaries", 
    href: "/beneficiaries", 
    icon: Users,
    submenu: [
      { name: "Add Beneficiary", href: "/beneficiaries/new" },
      { name: "Manage Beneficiaries", href: "/beneficiaries/manage" },
      { name: "Beneficiary Ledger", href: "/beneficiaries/ledger" },
      { name: "Beneficiary Assistance History", href: "/beneficiaries/assistance-history" },
      { name: "Beneficiary Loan History", href: "/beneficiaries/loan-history" },
      { name: "Beneficiary Reports", href: "/beneficiaries/reports" },
    ]
  },
  { 
    name: "Groups", 
    href: "/groups", 
    icon: Building,
    submenu: [
      { name: "Add Group", href: "/groups/new" },
      { name: "Manage Groups", href: "/groups/manage" },
      { name: "Group Members", href: "/groups/members" },
      { name: "Group Fund", href: "/groups/fund" },
      { name: "Group Ledger", href: "/groups/ledger" },
      { name: "Group Transactions", href: "/groups/transactions" },
      { name: "Group Reports", href: "/groups/reports" },
    ]
  },
  { 
    name: "Contributions", 
    href: "/contributions", 
    icon: CreditCard,
    submenu: [
      { name: "Add Contribution", href: "/contributions/new" },
      { name: "Monthly Contributions", href: "/contributions/monthly" },
      { name: "Manage Contributions", href: "/contributions" },
      { name: "Due Contributions", href: "/contributions/due" },
      { name: "Contribution Ledger", href: "/contributions/ledger" },
      { name: "Contribution Reports", href: "/contributions/reports" },
    ]
  },
  { 
    name: "Loans", 
    href: "/loans", 
    icon: PiggyBank,
    submenu: [
      { name: "নতুন ঋণ", href: "/loans/new" },
      { name: "ঋণ ব্যবস্থাপনা", href: "/loans" },
      { name: "Loan Repayments", href: "/loans/repayments" },
      { name: "Loan Installments", href: "/loans/installments" },
      { name: "Loan Ledger", href: "/loans/ledger" },
      { name: "Loan Reports", href: "/loans/reports" },
    ]
  },
  { 
    name: "Grants", 
    href: "/grants", 
    icon: Gift,
    submenu: [
      { name: "Add Grant", href: "/grants/new" },
      { name: "Manage Grants", href: "/grants/manage" },
      { name: "Grant Ledger", href: "/grants/ledger" },
      { name: "Grant Reports", href: "/grants/reports" },
    ]
  },
  { 
    name: "Ledger", 
    href: "/ledger", 
    icon: BookOpen,
    submenu: [
      { name: "General Ledger", href: "/ledger" },
      { name: "Group Ledger", href: "/ledger/group" },
      { name: "Member Ledger", href: "/ledger/member" },
      { name: "Beneficiary Ledger", href: "/ledger/beneficiary" },
      { name: "Transaction Register", href: "/ledger/transactions" },
      { name: "Fund Allocation Ledger", href: "/ledger/allocations" },
      { name: "Ledger Reports", href: "/ledger/reports" },
    ]
  },
  { name: "Documents", href: "/documents", icon: FolderOpen },
  { name: "Reports", href: "/reports", icon: PieChart },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { isOpen, setIsOpen } = useSidebar()

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
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-40 md:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}
      <aside 
        className={cn(
          "fixed md:static inset-y-0 left-0 z-50 flex flex-col h-full bg-card border-r transition-transform duration-300 ease-in-out w-[80%] max-w-[320px] md:w-64 md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-14 border-b flex items-center justify-between px-6">
          <h2 className="font-semibold text-lg tracking-tight">Foundation ERP</h2>
          <button 
            className="md:hidden flex items-center justify-center h-11 w-11 -mr-3 text-muted-foreground hover:text-foreground rounded-md"
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
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
                      "flex w-full items-center justify-between px-3 py-3 text-sm font-medium rounded-md transition-colors",
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
                            onClick={() => setIsOpen(false)}
                            className={cn(
                              "flex items-center pl-11 pr-3 py-3 text-sm font-medium rounded-md transition-colors",
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
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors",
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
    </>
  )
}
