"use client"

import { Button } from "@/components/ui/button"
import { Printer, Edit } from "lucide-react"
import Link from "next/link"

export function BeneficiaryProfileActions({ id }: { id: string }) {
  return (
    <div className="flex items-center gap-2 print:hidden">
      <Button variant="outline" size="sm" asChild>
        <Link href={`/beneficiaries/${id}/edit`}>
          <Edit className="h-4 w-4 mr-2" />
          সম্পাদনা
        </Link>
      </Button>
      <Button variant="outline" size="sm" onClick={() => window.print()}>
        <Printer className="h-4 w-4 mr-2" />
        প্রিন্ট করুন
      </Button>
    </div>
  )
}
