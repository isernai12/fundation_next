"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { 
  ChevronDown, 
  X, 
  LayoutDashboard, 
  Users, 
  UserRoundCheck, 
  HandCoins, 
  WalletCards, 
  PiggyBank, 
  Landmark, 
  Gift, 
  UsersRound, 
  PieChart, 
  Settings,
  Diamond
} from "lucide-react"

import { useSidebar } from "@/components/layout/sidebar-provider"
import { useRbac } from "@/components/providers/rbac-provider"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

type SubMenuItem = {
  name: string
  href: string
  permission?: string
}

type MenuItem = {
  name: string
  href: string
  icon: React.ElementType
  permission?: string
  submenu?: SubMenuItem[]
}

type Section = {
  title: string
  items: MenuItem[]
}

const sidebarSections: Section[] = [
  {
    title: "প্রধান মেনু",
    items: [
      { name: "ড্যাশবোর্ড", href: "/", icon: LayoutDashboard },
      { 
        name: "সদস্য", 
        href: "/members", 
        icon: Users,
        permission: "Members:View",
        submenu: [
          { name: "নতুন সদস্য", href: "/members/new", permission: "Members:Add" },
          { name: "সদস্য ব্যবস্থাপনা", href: "/members/manage", permission: "Members:View" },
          { name: "সদস্য লেজার", href: "/members/ledger", permission: "Members:View" },
          { name: "বকেয়া চাঁদা", href: "/members/dues", permission: "Members:View" },
        ]
      },
      { 
        name: "সুবিধাভোগী", 
        href: "/beneficiaries", 
        icon: UserRoundCheck,
        permission: "Beneficiaries:View",
        submenu: [
          { name: "নতুন সুবিধাভোগী", href: "/beneficiaries/new", permission: "Beneficiaries:Add" },
          { name: "সুবিধাভোগী ব্যবস্থাপনা", href: "/beneficiaries/manage", permission: "Beneficiaries:View" },
          { name: "সুবিধাভোগী লেজার", href: "/beneficiaries/ledger", permission: "Beneficiaries:View" },
          { name: "সহায়তার ইতিহাস", href: "/beneficiaries/assistance-history", permission: "Beneficiaries:View" },
          { name: "ঋণের ইতিহাস", href: "/beneficiaries/loan-history", permission: "Beneficiaries:View" },
        ]
      },
    ]
  },
  {
    title: "আর্থিক কার্যক্রম",
    items: [
      { 
        name: "অনুদানদাতা", 
        href: "/donors", 
        icon: HandCoins,
        permission: "Donors:View",
        submenu: [
          { name: "নতুন অনুদানদাতা", href: "/donors/new", permission: "Donors:Add" },
          { name: "অনুদানদাতা ব্যবস্থাপনা", href: "/donors/manage", permission: "Donors:View" },
          { name: "অনুদান গ্রহণ", href: "/donors/receive", permission: "Donors:Receive Installment" },
          { name: "অনুদান লেজার", href: "/donors/ledger", permission: "Donors:View" },
        ]
      },
      { 
        name: "আর্থিক কার্যক্রম", 
        href: "/campaigns", 
        icon: WalletCards,
        permission: "Fund Collection:View",
        submenu: [
          { name: "নতুন তহবিল", href: "/campaigns/new", permission: "Fund Collection:Add" },
          { name: "তহবিল ব্যবস্থাপনা", href: "/campaigns/manage", permission: "Fund Collection:View" },
          { name: "তহবিলে অর্থ গ্রহণ", href: "/campaigns/contribute", permission: "Fund Collection:Add" },
          { name: "তহবিল লেজার", href: "/campaigns/ledger", permission: "Fund Collection:View" },
        ]
      },
      { 
        name: "তহবিল / চাঁদা", 
        href: "/contributions", 
        icon: PiggyBank,
        permission: "Fund Collection:View",
        submenu: [
          { name: "তহবিল গ্রহণ", href: "/contributions/new", permission: "Fund Collection:Add" },
          { name: "মাসিক চাঁদা", href: "/contributions/monthly", permission: "Fund Collection:View" },
          { name: "চাঁদা ব্যবস্থাপনা", href: "/contributions", permission: "Fund Collection:View" },
          { name: "বকেয়া চাঁদা", href: "/contributions/due", permission: "Fund Collection:View" },
          { name: "চাঁদা লেজার", href: "/contributions/ledger", permission: "Fund Collection:View" },
        ]
      },
      { 
        name: "ঋণ", 
        href: "/loans", 
        icon: Landmark,
        permission: "Loans:View",
        submenu: [
          { name: "নতুন ঋণ", href: "/loans/new", permission: "Loans:Add" },
          { name: "ঋণ ব্যবস্থাপনা", href: "/loans", permission: "Loans:View" },
          { name: "ঋণ পরিশোধ", href: "/loans/repayments", permission: "Loans:Manage" },
          { name: "ঋণ লেজার", href: "/loans/ledger", permission: "Loans:View" },
        ]
      },
      { 
        name: "অনুদান", 
        href: "/grants", 
        icon: Gift,
        permission: "Grants:View",
        submenu: [
          { name: "নতুন অনুদান", href: "/grants/new", permission: "Grants:Add" },
          { name: "অনুদান ব্যবস্থাপনা", href: "/grants/manage", permission: "Grants:View" },
          { name: "অনুদান লেজার", href: "/grants/ledger", permission: "Grants:View" },
        ]
      },
    ]
  },
  {
    title: "সংগঠন",
    items: [
      { 
        name: "গ্রুপ", 
        href: "/groups", 
        icon: UsersRound,
        permission: "Groups:View",
        submenu: [
          { name: "নতুন গ্রুপ", href: "/groups/new", permission: "Groups:Add" },
          { name: "গ্রুপ ব্যবস্থাপনা", href: "/groups/manage", permission: "Groups:View" },
          { name: "গ্রুপের সদস্য", href: "/groups/members", permission: "Groups:View" },
          { name: "গ্রুপ ফান্ড", href: "/groups/fund", permission: "Groups:View" },
          { name: "গ্রুপ লেজার", href: "/groups/ledger", permission: "Groups:View" },
        ]
      },
      { name: "সেটিংস", href: "/settings", icon: Settings, permission: "Settings:View" },
    ]
  }
]

import { useBranding } from "@/components/providers/branding-provider"

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { isOpen, setIsOpen, isCollapsed } = useSidebar()
  const { permissions, can } = useRbac()
  const branding = useBranding()

  const filteredSections = React.useMemo(() => {
    if (permissions.includes("*")) return sidebarSections;
    
    return sidebarSections.map((section: any) => {
      const items = section.items
        .map((item: any) => {
          const submenu = item.submenu
            ? item.submenu.filter((sub: any) => !sub.permission || can(sub.permission.split(":")[0], sub.permission.split(":")[1]))
            : undefined;
          return { ...item, submenu };
        })
        .filter((item: any) => {
          const hasParentPerm = !item.permission || can(item.permission.split(":")[0], item.permission.split(":")[1]);
          if (!hasParentPerm) return false;
          
          if (item.submenu && item.submenu.length === 0) return false;
          
          return true;
        });

      return { ...section, items };
    }).filter((section: any) => section.items.length > 0);
  }, [permissions, can])

  const [openItems, setOpenItems] = React.useState<Record<string, boolean>>(() => {
    const initialState: Record<string, boolean> = {}
    filteredSections.flatMap((s: any) => s.items).forEach((item: any) => {
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
      filteredSections.flatMap((s: any) => s.items).forEach((item: any) => {
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
          "fixed md:static inset-y-0 left-0 z-50 flex flex-col h-full bg-surface-0 border-r border-surface-200 transition-all duration-300 ease-in-out w-[80%] max-w-[320px] md:translate-x-0 shrink-0",
          isOpen ? "translate-x-0 animate-slide-left" : "-translate-x-full",
          isCollapsed ? "md:w-[80px]" : "md:w-[260px]"
        )}
      >
        <div className="px-5 pt-5 pb-6 flex items-center justify-between border-b border-transparent">
          <div className={cn("flex items-center gap-3", isCollapsed ? "md:justify-center w-full" : "")}>
            {branding.sidebarLogo || branding.logo ? (
              <img src={branding.sidebarLogo || branding.logo!} alt="Logo" className="w-9 h-9 object-contain" />
            ) : (
              <div className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/20">
                <Diamond className="text-white w-5 h-5" />
              </div>
            )}
            <div className={cn(isCollapsed && "md:hidden")}>
              <h1 className="text-[15px] font-bold text-surface-950 tracking-tight leading-tight whitespace-nowrap">{branding.foundationName}</h1>
              <span className="text-[10px] font-semibold text-surface-400 uppercase tracking-[0.08em]">{branding.shortName}</span>
            </div>
          </div>
          <button 
            className="md:hidden flex items-center justify-center h-11 w-11 -mr-3 text-surface-500 hover:text-surface-900 rounded-md"
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

      <div className="flex-1 overflow-auto pb-4">
        <nav className="space-y-0.5 px-3">
          {filteredSections.map((section: any, sIdx: number) => (
            <React.Fragment key={sIdx}>
              <div className={cn("px-3 pt-4 pb-2", isCollapsed && "md:hidden")}>
                <span className="text-[10px] font-bold text-surface-400 uppercase tracking-[0.1em]">{section.title}</span>
              </div>
              {section.items.map((item: any) => {
                const isActive = pathname === item.href

                if (item.submenu) {
                  const isMenuOpen = openItems[item.name]
                  const isChildActive = item.submenu.some((sub: any) => pathname === sub.href)
                  const isSectionActive = isChildActive || isActive

                  return (
                    <Collapsible
                      key={item.name}
                      open={isMenuOpen}
                      onOpenChange={() => toggleItem(item.name)}
                    >
                      <CollapsibleTrigger
                        title={isCollapsed ? item.name : undefined}
                        className={cn(
                          "nav-item flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors",
                          isCollapsed ? "md:justify-center" : "",
                          isSectionActive
                            ? "active"
                            : "text-surface-600 hover:text-surface-900 hover:bg-surface-50"
                        )}
                      >
                        <div className={cn("flex items-center", isCollapsed ? "md:justify-center w-full" : "gap-3")}>
                          <item.icon className={cn("flex-shrink-0 w-5 h-5", isSectionActive ? "text-brand-500" : "text-surface-400")} />
                          <span className={cn(isCollapsed && "md:hidden")}>{item.name}</span>
                        </div>
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 ml-auto text-surface-400 transition-transform duration-200",
                            isMenuOpen ? "rotate-180" : "",
                            isCollapsed && "md:hidden"
                          )}
                        />
                      </CollapsibleTrigger>
                      <CollapsibleContent className={cn("space-y-0.5 overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down", isCollapsed && "md:hidden")}>
                        <div className="pt-1 pb-1">
                          {item.submenu.map((sub: any) => {
                            const isSubActive = pathname === sub.href
                            return (
                              <Link
                                key={sub.name}
                                href={sub.href}
                                onClick={() => setIsOpen(false)}
                                className={cn(
                                  "flex items-center pl-10 pr-3 py-2 text-[12px] font-medium rounded-lg transition-colors",
                                  isSubActive
                                    ? "bg-brand-50 text-brand-600"
                                    : "text-surface-600 hover:text-surface-900 hover:bg-surface-50"
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
                    title={isCollapsed ? item.name : undefined}
                    className={cn(
                      "nav-item flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors",
                      isCollapsed ? "md:justify-center" : "",
                      isActive
                        ? "active"
                        : "text-surface-600 hover:text-surface-900 hover:bg-surface-50"
                    )}
                  >
                    <item.icon className={cn("flex-shrink-0 w-5 h-5", isActive ? "text-brand-500" : "text-surface-400")} />
                    <span className={cn(isCollapsed && "md:hidden")}>{item.name}</span>
                  </Link>
                )
              })}
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="px-3 py-4 border-t border-surface-200">
        <div className={cn("flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-50 cursor-pointer transition-colors", isCollapsed ? "md:justify-center px-0" : "")}>
          <div className="w-8 h-8 shrink-0 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-[11px] font-bold shadow-sm overflow-hidden">
            {session?.user?.image ? (
              <img 
                src={session.user.image} 
                alt="User" 
                className="w-full h-full object-cover" 
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  if (e.currentTarget.parentElement) {
                    e.currentTarget.parentElement.innerHTML = session?.user?.name ? session.user.name.substring(0, 2).toUpperCase() : 'EX';
                  }
                }}
              />
            ) : (
              session?.user?.name ? session.user.name.substring(0, 2).toUpperCase() : 'EX'
            )}
          </div>
          <div className={cn("flex-1 min-w-0", isCollapsed && "md:hidden")}>
            <p className="text-[13px] font-semibold text-surface-900 truncate">{session?.user?.name || 'Executive'}</p>
            <p className="text-[11px] text-surface-400 truncate">{session?.user?.email || 'admin@foundation.org'}</p>
          </div>
          <Settings className={cn("text-surface-400 shrink-0 w-[18px] h-[18px]", isCollapsed && "md:hidden")} />
        </div>
      </div>

      </aside>
    </>
  )
}