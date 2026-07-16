"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getGroups } from "../actions"
import { Group } from "@prisma/client"

export function GroupSelector() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentGroupId = searchParams.get("groupId") || ""
  
  const [groups, setGroups] = useState<Group[]>([])
  
  useEffect(() => {
    getGroups().then(data => setGroups(data))
  }, [])

  const handleValueChange = (value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value && value !== "all") {
      params.set("groupId", value)
    } else {
      params.delete("groupId")
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm font-medium">Select Group:</span>
      <Select value={currentGroupId} onValueChange={handleValueChange}>
        <SelectTrigger className="w-[250px]">
          <SelectValue placeholder="Select a group..." />
        </SelectTrigger>
        <SelectContent>
          {groups.map((g) => (
            <SelectItem key={g.id} value={g.id}>
              {g.code} - {g.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
