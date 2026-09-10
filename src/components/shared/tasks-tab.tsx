import { CreateTaskForm } from "@/components/shared/create-task-form";
import { TaskRow } from "@/components/shared/task-row";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export async function TasksTab({ profileId }: { profileId: string }) {
  const supabase = await createClient();

  const [{ data: tasks }, { data: members }] = await Promise.all([
    supabase
      .from("tasks")
      .select("id, title, description, status, due_date, assigned_to")
      .eq("profile_id", profileId)
      .order("due_date", { ascending: true, nullsFirst: false }),
    supabase
      .from("organization_members")
      .select("user_id, email, full_name")
      .order("email"),
  ]);

  const memberLabelById = new Map(
    (members ?? []).map((m) => [m.user_id, m.full_name || m.email || m.user_id]),
  );

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent>
          <CreateTaskForm profileId={profileId} members={members ?? []} />
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2">
        {(tasks ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">Nog geen taken voor dit profiel.</p>
        ) : (
          (tasks ?? []).map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              profileId={profileId}
              assigneeLabel={task.assigned_to ? memberLabelById.get(task.assigned_to) ?? "-" : "-"}
            />
          ))
        )}
      </div>
    </div>
  );
}
