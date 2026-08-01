import re

with open("src/features/member-requests/components/request-actions.tsx", "r") as f:
    content = f.read()

# Add Dropdown imports
dropdown_imports = """
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
"""
content = content.replace('import { Button } from "@/components/ui/button"', dropdown_imports + '\nimport { Button } from "@/components/ui/button"')

# Replace the flex button container with DropdownMenu
old_buttons = """    <div className="flex flex-wrap gap-2">
      <Button 
        onClick={() => setActionType("APPROVE")}
        className="bg-emerald-600 hover:bg-emerald-700 text-white"
      >
        <Check className="mr-2 h-4 w-4" />
        {t("common.approve")}
      </Button>
      <Button 
        onClick={() => setActionType("CHANGES")}
        variant="outline"
        className="text-amber-600 border-amber-200 hover:bg-amber-50"
      >
        <AlertCircle className="mr-2 h-4 w-4" />
        {t("member-requests.actions.request_changes")}
      </Button>
      <Button 
        onClick={() => setActionType("REJECT")}
        variant="destructive"
      >
        <X className="mr-2 h-4 w-4" />
        {t("common.reject")}
      </Button>"""

new_buttons = """    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 px-2 flex items-center gap-1 bg-background hover:bg-muted">
            <span className="hidden sm:inline-block text-xs">{t("common.actions")}</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
            {t("common.actions")}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            className="cursor-pointer text-emerald-600 focus:text-emerald-600"
            onClick={() => setActionType("APPROVE")}
          >
            <Check className="mr-2 h-4 w-4" />
            <span>{t("common.approve")}</span>
          </DropdownMenuItem>

          <DropdownMenuItem 
            className="cursor-pointer text-amber-600 focus:text-amber-600"
            onClick={() => setActionType("CHANGES")}
          >
            <AlertCircle className="mr-2 h-4 w-4" />
            <span>{t("member-requests.actions.request_changes")}</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem 
            className="cursor-pointer text-destructive focus:text-destructive"
            onClick={() => setActionType("REJECT")}
          >
            <X className="mr-2 h-4 w-4" />
            <span>{t("common.reject")}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>"""

content = content.replace(old_buttons, new_buttons)

# Fix the closing div
content = content.replace('      </Dialog>\n    </div>', '      </Dialog>\n    </>')

with open("src/features/member-requests/components/request-actions.tsx", "w") as f:
    f.write(content)

print("Updated RequestActions.tsx")
