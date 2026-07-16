"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getBeneficiaries } from "../actions"

type BeneficiaryOption = {
  id: string
  name: string
  beneficiaryId: string
}

export function BeneficiarySelector() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentBeneficiaryId = searchParams.get("beneficiaryId") || ""
  
  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryOption[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    getBeneficiaries().then(data => {
      setBeneficiaries(
        data.map(b => ({
          id: b.id,
          name: `${b.firstName} ${b.lastName}`,
          beneficiaryId: b.beneficiaryId
        }))
      )
      setLoading(false)
    }).catch(e => {
      console.error(e)
      setLoading(false)
    })
  }, [])

  const handleValueChange = (value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value && value !== "all") {
      params.set("beneficiaryId", value)
    } else {
      params.delete("beneficiaryId")
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm font-medium">Select Beneficiary:</span>
      <Select value={currentBeneficiaryId} onValueChange={handleValueChange} disabled={loading}>
        <SelectTrigger className="w-[250px]">
          <SelectValue placeholder={loading ? "Loading..." : "Select a beneficiary..."} />
        </SelectTrigger>
        <SelectContent>
          {beneficiaries.map((b) => (
            <SelectItem key={b.id} value={b.id}>
              {b.beneficiaryId} - {b.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
