import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Settings2, ShieldCheck, Users, Database, HardDriveDownload, MonitorCheck, LayoutTemplate, Building } from "lucide-react"

const adminCategories = [
  {
    title: "Access Management",
    icon: ShieldCheck,
    links: [
      { name: "Users", href: "/settings/users" },
      { name: "Roles & Permissions", href: "/settings/roles" },
      { name: "Audit Logs", href: "/settings/audit-logs" },
    ]
  },
  {
    title: "System Configuration",
    icon: Settings2,
    links: [
      { name: "Foundation Profile", href: "/settings/profile" },
      { name: "General Settings", href: "/settings/general" },
      { name: "Financial Rules", href: "/settings/financial" },
    ]
  },
  {
    title: "Data Management",
    icon: Database,
    links: [
      { name: "Backup & Restore", href: "/settings/backup" },
      { name: "Import & Export", href: "/settings/import-export" },
      { name: "System Maintenance", href: "/settings/maintenance" },
    ]
  },
  {
    title: "Preferences",
    icon: LayoutTemplate,
    links: [
      { name: "Appearance", href: "/settings/appearance" },
      { name: "Notifications", href: "/settings/notifications" },
    ]
  }
]

export default function SettingsDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Administration</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage system configurations, access control, and platform maintenance.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {adminCategories.map((category) => (
          <Card key={category.title}>
            <CardHeader className="flex flex-row items-center space-x-2 pb-2 border-b">
              <category.icon className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base">{category.title}</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-2">
                {category.links.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-sm text-blue-600 hover:underline">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
