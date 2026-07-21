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

export type ComboboxGroup = {
  id: string
  name: string
  code: string
}

interface GroupComboboxProps {
  groups: ComboboxGroup[]
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  emptyText?: string
}

export function GroupCombobox({
  groups,
  value,
  onChange,
  placeholder = "গ্রুপ নির্বাচন করুন...",
  emptyText = "কোন গ্রুপ পাওয়া যায়নি",
}: GroupComboboxProps) {
  const [open, setOpen] = React.useState(false)

  const selectedGroup = groups.find((group) => group.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedGroup ? (
            <div className="flex flex-col items-start overflow-hidden text-left truncate">
              <span className="truncate w-full">{selectedGroup.code} — {selectedGroup.name}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command filter={(value, search) => {
           if (!search) return 1
           const searchLower = search.toLowerCase()
           const group = groups.find(g => g.id === value)
           if (!group) return 0
           const searchableStr = `${group.code} ${group.name}`.toLowerCase()
           return searchableStr.includes(searchLower) ? 1 : 0
        }}>
          <CommandInput placeholder="খুঁজুন (নাম বা কোড)..." />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {groups.map((group) => (
                <CommandItem
                  key={group.id}
                  value={group.id}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? "" : currentValue)
                    setOpen(false)
                  }}
                  className="flex flex-col items-start p-2 cursor-pointer"
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="font-medium">
                      {group.code} — {group.name}
                    </span>
                    <Check
                      className={cn(
                        "h-4 w-4 shrink-0 text-primary",
                        value === group.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
