"use client"

import * as React from "react"
import { useTheme } from "next-themes"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="tooltip-container p-2 text-surface-500 hover:text-surface-700 hover:bg-surface-100 rounded-lg transition-all relative flex items-center justify-center">
          <span className="material-symbols-outlined rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0">light_mode</span>
          <span className="material-symbols-outlined absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100">dark_mode</span>
          <span className="sr-only">Toggle theme</span>
          <span className="tooltip-custom">Theme</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")} className="cursor-pointer">
          <span className="material-symbols-outlined sm mr-2">light_mode</span>
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")} className="cursor-pointer">
          <span className="material-symbols-outlined sm mr-2">dark_mode</span>
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")} className="cursor-pointer">
          <span className="material-symbols-outlined sm mr-2">desktop_windows</span>
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
