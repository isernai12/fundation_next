"use client"

import { Button } from "@/components/ui/button"
import { Printer, Edit, Trash, BookOpen } from "lucide-react"
import Link from "next/link"
import { deleteDonor } from "../actions"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function DonorProfileActions({ donorId }: { donorId: string }) {
  const router = useRouter()

  const handlePrint = () => {
    window.print()
  }

  const handleDelete = async () => {
    if (confirm("আপনি কি নিশ্চিত যে আপনি এই অনুদানদাতাকে মুছে ফেলতে চান?")) {
      const res = await deleteDonor(donorId)
      if (res.success) {
        toast.success("সফলভাবে মুছে ফেলা হয়েছে")
        router.push("/donors")
      } else {
        toast.error(res.error)
      }
    }
  }

  return (
    <div className="flex items-center gap-2 hide-print">
      <Button variant="outline" onClick={handlePrint} size="sm">
        <Printer className="mr-2 h-4 w-4" /> প্রিন্ট
      </Button>
      <Button variant="outline" asChild size="sm">
        <Link href={`/donors/ledger?donorId=${donorId}`}>
          <BookOpen className="mr-2 h-4 w-4" /> লেজার
        </Link>
      </Button>
      <Button variant="outline" asChild size="sm">
        <Link href={`/donors/${donorId}/edit`}>
          <Edit className="mr-2 h-4 w-4" /> সম্পাদনা
        </Link>
      </Button>
      <Button variant="destructive" onClick={handleDelete} size="sm">
        <Trash className="mr-2 h-4 w-4" /> মুছুন
      </Button>
    </div>
  )
}
