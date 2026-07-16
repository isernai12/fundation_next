import { GroupForm } from "@/features/groups/components/group-form"

export default function AddGroupPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add Group</h1>
        <p className="text-muted-foreground">Create a new group in the foundation.</p>
      </div>
      <GroupForm />
    </div>
  )
}
