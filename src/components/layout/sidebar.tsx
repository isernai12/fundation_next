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
  { name: "ড্যাশবোর্ড", href: "/", icon: LayoutDashboard },
  { 
    name: "সদস্য", 
    href: "/members", 
    icon: Users,
    submenu: [
      { name: "নতুন সদস্য", href: "/members/new" },
      { name: "সদস্য ব্যবস্থাপনা", href: "/members/manage" },
      { name: "সদস্য লেজার", href: "/members/ledger" },
      { name: "সদস্য চাঁদা বকেয়া তালিকা", href: "/members/dues" },
    ]
  },
  { 
    name: "সুবিধাভোগী", 
    href: "/beneficiaries", 
    icon: Users,
    submenu: [
      { name: "নতুন সুবিধাভোগী", href: "/beneficiaries/new" },
      { name: "সুবিধাভোগী ব্যবস্থাপনা", href: "/beneficiaries/manage" },
      { name: "সুবিধাভোগী লেজার", href: "/beneficiaries/ledger" },
      { name: "সহায়তার ইতিহাস", href: "/beneficiaries/assistance-history" },
      { name: "ঋণের ইতিহাস", href: "/beneficiaries/loan-history" },
      { name: "সুবিধাভোগী রিপোর্ট", href: "/beneficiaries/reports" },
    ]
  },
  { 
    name: "অনুদানদাতা", 
    href: "/donors", 
    icon: Users,
    submenu: [
      { name: "নতুন অনুদানদাতা", href: "/donors/new" },
      { name: "অনুদানদাতা ব্যবস্থাপনা", href: "/donors/manage" },
      { name: "অনুদান গ্রহণ", href: "/donors/receive" },
      { name: "অনুদান গ্রহণ ব্যবস্থাপনা", href: "/donors/donations" },
      { name: "অনুদানদাতার লেজার", href: "/donors/ledger" },
    ]
  },
  { 
    name: "তহবিল কার্যক্রম", 
    href: "/campaigns", 
    icon: Building,
    submenu: [
      { name: "নতুন তহবিল", href: "/campaigns/new" },
      { name: "তহবিল ব্যবস্থাপনা", href: "/campaigns/manage" },
      { name: "তহবিলে অর্থ গ্রহণ", href: "/campaigns/contribute" },
      { name: "তহবিল গ্রহণ ব্যবস্থাপনা", href: "/campaigns/contributions" },
      { name: "তহবিল লেজার", href: "/campaigns/ledger" },
    ]
  },
  { 
    name: "গ্রুপ", 
    href: "/groups", 
    icon: Building,
    submenu: [
      { name: "নতুন গ্রুপ", href: "/groups/new" },
      { name: "গ্রুপ ব্যবস্থাপনা", href: "/groups/manage" },
      { name: "গ্রুপের সদস্য", href: "/groups/members" },
      { name: "গ্রুপ ফান্ড", href: "/groups/fund" },
      { name: "গ্রুপ লেজার", href: "/groups/ledger" },
      { name: "গ্রুপ লেনদেন", href: "/groups/transactions" },
      { name: "গ্রুপ রিপোর্ট", href: "/groups/reports" },
    ]
  },
  { 
    name: "তহবিল / চাঁদা", 
    href: "/contributions", 
    icon: CreditCard,
    submenu: [
      { name: "তহবিল গ্রহণ", href: "/contributions/new" },
      { name: "মাসিক চাঁদা", href: "/contributions/monthly" },
      { name: "চাঁদা ব্যবস্থাপনা", href: "/contributions" },
      { name: "বকেয়া চাঁদা", href: "/contributions/due" },
      { name: "চাঁদা লেজার", href: "/contributions/ledger" },
      { name: "চাঁদা রিপোর্ট", href: "/contributions/reports" },
    ]
  },
  { 
    name: "ঋণ", 
    href: "/loans", 
    icon: PiggyBank,
    submenu: [
      { name: "নতুন ঋণ", href: "/loans/new" },
      { name: "ঋণ ব্যবস্থাপনা", href: "/loans" },
      { name: "ঋণ পরিশোধ", href: "/loans/repayments" },
      { name: "ঋণ লেজার", href: "/loans/ledger" },
      { name: "ঋণ রিপোর্ট", href: "/loans/reports" },
    ]
  },
  { 
    name: "অনুদান", 
    href: "/grants", 
    icon: Gift,
    submenu: [
      { name: "নতুন অনুদান", href: "/grants/new" },
      { name: "অনুদান ব্যবস্থাপনা", href: "/grants/manage" },
      { name: "অনুদান লেজার", href: "/grants/ledger" },
      { name: "অনুদান রিপোর্ট", href: "/grants/reports" },
    ]
  },
  { 
    name: "খতিয়ান (Ledger)", 
    href: "/ledger", 
    icon: BookOpen,
    submenu: [
      { name: "সাধারণ খতিয়ান", href: "/ledger" },
      { name: "গ্রুপ খতিয়ান", href: "/ledger/group" },
      { name: "সদস্য লেজার", href: "/ledger/member" },
      { name: "সুবিধাভোগী খতিয়ান", href: "/ledger/beneficiary" },
      { name: "লেনদেন রেজিস্টার", href: "/ledger/transactions" },
      { name: "তহবিল বরাদ্দ খতিয়ান", href: "/ledger/allocations" },
      { name: "খতিয়ান রিপোর্ট", href: "/ledger/reports" },
    ]
  },
  { name: "সেটিংস", href: "/settings", icon: Settings },
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
