"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export type ComboboxMember = {
  id: string
  memberId?: string | null
  beneficiaryId?: string | null
  fullName: string | null
  group?: { name?: string; code?: string } | null
}

interface MemberComboboxProps {
  members: ComboboxMember[]
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  emptyText?: string
}

export function MemberCombobox({
  members,
  value,
  onChange,
  placeholder = "নির্বাচন করুন...",
  emptyText = "কাউকে পাওয়া যায়নি",
}: MemberComboboxProps) {
  const [open, setOpen] = React.useState(false)

  const selectedMember = members.find((member) => member.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedMember ? (
            <div className="flex flex-col items-start overflow-hidden text-left truncate">
              <span className="truncate w-full">{selectedMember.memberId || selectedMember.beneficiaryId} — {selectedMember.fullName || 'নাম পাওয়া যায়নি'}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command filter={(value, search) => {
           if (!search) return 1
           const searchLower = search.toLowerCase()
           const member = members.find(m => m.id === value)
           if (!member) return 0
           const searchableStr = `${member.memberId || member.beneficiaryId || ''} ${member.fullName || ''} ${member.group?.name || ''} ${member.group?.code || ''}`.toLowerCase()
           return searchableStr.includes(searchLower) ? 1 : 0
        }}>
          <CommandInput placeholder="খুঁজুন (আইডি, নাম, গ্রুপ)..." />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {members.map((member) => (
                <CommandItem
                  key={member.id}
                  value={member.id}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? "" : currentValue)
                    setOpen(false)
                  }}
                  className="flex flex-col items-start p-2 cursor-pointer"
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="font-medium">
                      {member.memberId || member.beneficiaryId} — {member.fullName || 'নাম পাওয়া যায়নি'}
                    </span>
                    <Check
                      className={cn(
                        "h-4 w-4 shrink-0 text-primary",
                        value === member.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">
                    {member.group ? `গ্রুপ: ${member.group.name} (${member.group.code})` : ''}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
