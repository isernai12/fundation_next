"use client"

import { useState, useMemo } from "react"
import { updateRolePermissions } from "./actions"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { SectionHeader } from "@/components/ui/section-header"
import { Save, ShieldCheck } from "lucide-react"

export function RolesManager({
  roles,
  permissions,
  rolePermissions
}: {
  roles: any[]
  permissions: any[]
  rolePermissions: any[]
}) {
  const [selectedRoleId, setSelectedRoleId] = useState<string>(roles[0]?.id || "")
  const [saving, setSaving] = useState(false)
  
  // We'll store a Set of permission IDs for the currently selected role
  const initialRolePerms = useMemo(() => {
    return new Set(
      rolePermissions
        .filter(rp => rp.roleId === selectedRoleId)
        .map(rp => rp.permissionId)
    )
  }, [rolePermissions, selectedRoleId])
  
  const [selectedPerms, setSelectedPerms] = useState<Set<string>>(initialRolePerms)
  
  // Update local state when role changes
  useMemo(() => {
    setSelectedPerms(
      new Set(
        rolePermissions
          .filter(rp => rp.roleId === selectedRoleId)
          .map(rp => rp.permissionId)
      )
    )
  }, [rolePermissions, selectedRoleId])

  // Group permissions by module
  const modules = useMemo(() => {
    const mods = new Map<string, any[]>()
    permissions.forEach(p => {
      if (!mods.has(p.module)) {
        mods.set(p.module, [])
      }
      mods.get(p.module)!.push(p)
    })
    return mods
  }, [permissions])

  const allActions = useMemo(() => {
    const actions = new Set<string>()
    permissions.forEach(p => actions.add(p.action))
    // Standardize order
    const ordered = ["View", "Create", "Add", "Edit", "Update", "Delete", "Approve", "Manage"]
    return Array.from(actions).sort((a, b) => {
      const idxA = ordered.findIndex(o => a.includes(o))
      const idxB = ordered.findIndex(o => b.includes(o))
      if (idxA !== -1 && idxB !== -1) return idxA - idxB
      if (idxA !== -1) return -1
      if (idxB !== -1) return 1
      return a.localeCompare(b)
    })
  }, [permissions])

  const handleToggle = (permId: string) => {
    setSelectedPerms(prev => {
      const next = new Set(prev)
      if (next.has(permId)) next.delete(permId)
      else next.add(permId)
      return next
    })
  }

  const handleSelectAllModule = (moduleName: string, checked: boolean) => {
    const modPerms = modules.get(moduleName) || []
    setSelectedPerms(prev => {
      const next = new Set(prev)
      modPerms.forEach(p => {
        if (checked) next.add(p.id)
        else next.delete(p.id)
      })
      return next
    })
  }

  const handleSave = async () => {
    setSaving(true)
    const res = await updateRolePermissions(selectedRoleId, Array.from(selectedPerms))
    if (res.success) {
      toast.success("Role permissions updated successfully")
    } else {
      toast.error(res.error || "Failed to update permissions")
    }
    setSaving(false)
  }

  const selectedRole = roles.find(r => r.id === selectedRoleId)

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Roles & Permissions" 
        description="Manage access control and permissions for different roles in the system."
      />

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar for Roles */}
        <Card className="md:w-1/4 h-fit border-border/50 shadow-sm">
          <CardHeader className="bg-muted/10 pb-4 border-b">
            <CardTitle className="text-lg">Roles</CardTitle>
            <CardDescription>Select a role to modify</CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-2">
            <div className="md:hidden">
              <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(r => (
                    <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="hidden md:flex flex-col space-y-1">
              {roles.map(r => (
                <button
                  key={r.id}
                  onClick={() => setSelectedRoleId(r.id)}
                  className={`text-left px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium border ${
                    selectedRoleId === r.id 
                      ? "bg-primary text-primary-foreground border-primary shadow-sm" 
                      : "bg-background border-transparent hover:bg-muted hover:border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {r.name}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Area for Permissions */}
        <Card className="flex-1 shadow-sm border-border/50">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b bg-muted/10 pb-4">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                Permissions: <span className="text-primary">{selectedRole?.name}</span>
              </CardTitle>
              <CardDescription className="mt-1.5">
                Configure module-level access and operations for this role.
              </CardDescription>
            </div>
            <Button 
              onClick={handleSave} 
              disabled={saving || selectedRole?.name === 'SUPER_ADMIN'}
              className="w-full sm:w-auto shadow-sm"
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </CardHeader>
          <CardContent className="p-0 overflow-hidden">
            {selectedRole?.name === 'SUPER_ADMIN' && (
              <div className="px-6 py-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-b border-amber-500/20 text-sm font-medium flex items-center">
                <ShieldCheck className="h-4 w-4 mr-2" />
                The SUPER_ADMIN role has unrestricted access to all modules. Permissions cannot be modified.
              </div>
            )}
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[220px] font-semibold text-foreground px-6 py-4">Module</TableHead>
                    <TableHead className="w-[100px] text-center font-semibold text-foreground py-4">Select All</TableHead>
                    {allActions.map(action => (
                      <TableHead key={action} className="text-center font-medium py-4 whitespace-nowrap px-4">{action}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from(modules.entries()).map(([moduleName, modPerms]) => {
                    const allChecked = modPerms.length > 0 && modPerms.every(p => selectedPerms.has(p.id))
                    const someChecked = modPerms.some(p => selectedPerms.has(p.id))
                    
                    return (
                      <TableRow key={moduleName} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-medium px-6">{moduleName}</TableCell>
                        <TableCell className="text-center bg-muted/10 border-x">
                          <div className="flex justify-center">
                            <Checkbox 
                              checked={allChecked ? true : someChecked ? "indeterminate" : false}
                              onCheckedChange={(c) => handleSelectAllModule(moduleName, !!c)}
                              disabled={selectedRole?.name === 'SUPER_ADMIN'}
                              className="data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground"
                            />
                          </div>
                        </TableCell>
                        {allActions.map(action => {
                          const perm = modPerms.find(p => p.action === action)
                          return (
                            <TableCell key={action} className="text-center border-r last:border-r-0">
                              {perm ? (
                                <div className="flex justify-center">
                                  <Checkbox 
                                    checked={selectedPerms.has(perm.id)}
                                    onCheckedChange={() => handleToggle(perm.id)}
                                    disabled={selectedRole?.name === 'SUPER_ADMIN'}
                                  />
                                </div>
                              ) : (
                                <span className="text-muted-foreground/20 font-light">-</span>
                              )}
                            </TableCell>
                          )
                        })}
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
