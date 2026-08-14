"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Edit, Shield, Search, Plus, Trash, AlertTriangle, Key } from "lucide-react"
import { toast } from "sonner"
import { createUser, updateUser, deleteUser, getUserWithPermissions, updateUserPermissions } from "@/features/settings/users/actions"
import { useRbac } from "@/components/providers/rbac-provider"

export default function UsersClient({ initialUsers, roles, allPermissions }: any) {
  const { can } = useRbac()
  const canAdd = can("Users", "Add")
  const canEdit = can("Users", "Edit")
  const canDelete = can("Users", "Delete")

  const [users, setUsers] = useState(initialUsers)
  const [search, setSearch] = useState("")
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [isPermModalOpen, setIsPermModalOpen] = useState(false)
  
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "", username: "", password: "", email: "", mobile: "", roleId: "", status: "ACTIVE"
  })
  
  // Permissions State
  const [userRolePermissions, setUserRolePermissions] = useState<Set<string>>(new Set())
  const [customPermissions, setCustomPermissions] = useState<Set<string>>(new Set())

  const filteredUsers = useMemo(() => {
    if (!search) return users
    const lower = search.toLowerCase()
    return users.filter((u: any) => 
      u.name.toLowerCase().includes(lower) || 
      u.username.toLowerCase().includes(lower) ||
      u.role.name.toLowerCase().includes(lower)
    )
  }, [users, search])

  const groupedPermissions = useMemo(() => {
    const map = new Map<string, any[]>()
    for (const p of allPermissions) {
      if (!map.has(p.module)) map.set(p.module, [])
      map.get(p.module)?.push(p)
    }
    return Array.from(map.entries())
  }, [allPermissions])

  const handleOpenUserModal = (user: any = null) => {
    if (user) {
      setCurrentUser(user)
      setFormData({
        name: user.name,
        username: user.username,
        password: "", // Leave blank on edit
        email: user.email || "",
        mobile: user.mobile || "",
        roleId: user.roleId,
        status: user.status
      })
    } else {
      setCurrentUser(null)
      setFormData({
        name: "", username: "", password: "", email: "", mobile: "", roleId: roles[0]?.id || "", status: "ACTIVE"
      })
    }
    setIsUserModalOpen(true)
  }

  const handleSaveUser = async () => {
    try {
      if (currentUser) {
        await updateUser(currentUser.id, formData)
        toast.success("User updated successfully")
      } else {
        if (!formData.password) {
          toast.error("Password is required for new users")
          return
        }
        await createUser(formData)
        toast.success("User created successfully")
      }
      setIsUserModalOpen(false)
      window.location.reload()
    } catch (e: any) {
      toast.error(e.message || "Failed to save user")
    }
  }

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return
    try {
      await deleteUser(id)
      toast.success("User deleted successfully")
      window.location.reload()
    } catch (e: any) {
      toast.error(e.message || "Failed to delete user")
    }
  }

  const handleOpenPermissions = async (userId: string) => {
    try {
      const data = await getUserWithPermissions(userId)
      setCurrentUser(data)
      
      const rPerms = new Set<string>()
      data?.role.permissions.forEach((rp: any) => rPerms.add(rp.permission.id))
      setUserRolePermissions(rPerms)
      
      const cPerms = new Set<string>()
      data?.userPermissions.forEach((up: any) => cPerms.add(up.permission.id))
      setCustomPermissions(cPerms)
      
      setIsPermModalOpen(true)
    } catch (e: any) {
      toast.error("Failed to load permissions")
    }
  }

  const toggleCustomPermission = (permId: string) => {
    const next = new Set(customPermissions)
    if (next.has(permId)) next.delete(permId)
    else next.add(permId)
    setCustomPermissions(next)
  }

  const handleSavePermissions = async () => {
    try {
      await updateUserPermissions(currentUser.id, Array.from(customPermissions))
      toast.success("Permissions updated successfully")
      setIsPermModalOpen(false)
    } catch (e: any) {
      toast.error("Failed to update permissions")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search users..." 
            className="pl-9 bg-card border-border"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {canAdd && (
          <Button onClick={() => handleOpenUserModal()} className="gap-2">
            <Plus className="w-4 h-4" /> Add User
          </Button>
        )}
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              {(canEdit || canDelete) && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user: any) => (
              <TableRow key={user.id} className="hover:bg-muted/30">
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    {user.role.name}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{user.email}</div>
                    <div className="text-muted-foreground">{user.mobile}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={user.status === 'ACTIVE' ? 'default' : 'secondary'}>
                    {user.status}
                  </Badge>
                </TableCell>
                {(canEdit || canDelete) && (
                  <TableCell className="text-right space-x-2">
                    {canEdit && (
                      <>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenPermissions(user.id)} title="Customize Permissions">
                          <Shield className="w-4 h-4 text-emerald-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenUserModal(user)} title="Edit User">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    {canDelete && (
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(user.id)} title="Delete User">
                        <Trash className="w-4 h-4 text-destructive" />
                      </Button>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
            {filteredUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* User Form Dialog */}
      <Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{currentUser ? 'Edit User' : 'Create New User'}</DialogTitle>
            <DialogDescription>
              {currentUser ? 'Update user details and access.' : 'Fill in the details to create a new user.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Username</Label>
              <Input value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Mobile</Label>
              <Input value={formData.mobile} onChange={(e) => setFormData({...formData, mobile: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={formData.roleId} onValueChange={(val) => setFormData({...formData, roleId: val})}>
                <SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger>
                <SelectContent>
                  {roles.map((r: any) => (
                    <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(val) => setFormData({...formData, status: val})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Password {currentUser && <span className="text-muted-foreground font-normal">(Leave blank to keep unchanged)</span>}</Label>
              <div className="relative">
                <Key className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="password" placeholder="••••••••" className="pl-9" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
              </div>
            </div>
          </div>
          <DialogFooter>
            {currentUser && (
              <Button type="button" variant="outline" className="mr-auto border-emerald-500/50 text-emerald-600 hover:bg-emerald-50" onClick={() => { setIsUserModalOpen(false); handleOpenPermissions(currentUser.id); }}>
                <Shield className="w-4 h-4 mr-2" /> Customize Permissions
              </Button>
            )}
            <Button variant="outline" onClick={() => setIsUserModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveUser}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permissions Dialog */}
      <Dialog open={isPermModalOpen} onOpenChange={setIsPermModalOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-500" />
              Customize Permissions: {currentUser?.name}
            </DialogTitle>
            <DialogDescription>
              Checkboxes in <span className="text-primary font-semibold">blue</span> indicate custom permissions assigned specifically to this user. 
              Disabled checkboxes indicate permissions inherited from their role ({currentUser?.role?.name}).
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-2 py-4 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groupedPermissions.map(([module, perms]) => (
                <div key={module} className="bg-card border rounded-lg overflow-hidden flex flex-col">
                  <div className="bg-muted/50 px-4 py-2 border-b font-medium text-sm">
                    {module}
                  </div>
                  <div className="p-4 flex-1 space-y-3">
                    {perms.map((p) => {
                      const isRolePerm = userRolePermissions.has(p.id)
                      const isCustomPerm = customPermissions.has(p.id)
                      const isActive = isRolePerm || isCustomPerm

                      return (
                        <div key={p.id} className="flex flex-row items-start space-x-3">
                          <Checkbox 
                            id={p.id} 
                            checked={isActive}
                            disabled={isRolePerm}
                            onCheckedChange={() => toggleCustomPermission(p.id)}
                            className={isRolePerm ? 'opacity-50 cursor-not-allowed' : (isCustomPerm ? 'border-primary bg-primary text-primary-foreground' : '')}
                          />
                          <div className="grid gap-1.5 leading-none">
                            <Label 
                              htmlFor={p.id} 
                              className={`text-sm font-medium leading-none ${isRolePerm ? 'text-muted-foreground' : 'cursor-pointer'}`}
                            >
                              {p.action}
                            </Label>
                            {p.description && (
                              <p className="text-xs text-muted-foreground">
                                {p.description}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter className="pt-4 mt-auto">
            <Button variant="outline" onClick={() => setIsPermModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSavePermissions}>Save Custom Permissions</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
