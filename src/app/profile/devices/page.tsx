import { getUserSessions } from "@/features/profile/actions"
import { DevicesTable } from "@/features/profile/components/devices-table"

export default async function DevicesPage() {
  const { sessions, currentJti } = await getUserSessions()
  
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">ডিভাইস ব্যবস্থাপনা (Device Management)</h1>
        <p className="text-muted-foreground">আপনার লগইন করা ডিভাইসের তালিকা</p>
      </div>
      <DevicesTable sessions={sessions} currentJti={currentJti} />
    </div>
  )
}
