"use client"

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
  FileText,
  Settings,
  FolderOpen,
} from "lucide-react"

const sidebarItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Members", href: "/members", icon: Users },
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

  return (
    <aside className="w-64 border-r bg-card flex flex-col h-full">
      <div className="h-14 border-b flex items-center px-6">
        <h2 className="font-semibold text-lg tracking-tight">Foundation ERP</h2>
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className="space-y-1 px-3">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href
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
