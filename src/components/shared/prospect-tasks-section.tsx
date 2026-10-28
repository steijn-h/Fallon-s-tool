import { AddTaskForm } from "@/components/shared/add-task-form";
import { ProspectTaskRow } from "@/components/shared/prospect-task-row";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import type { TaskParent } from "@/lib/actions/tasks";

export async function ProspectTasksSection({ prospectId }: { prospectId: string }) {
  const supabase = await createClient();
  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, title, description, due_date, priority, completed")
    .eq("prospect_id", prospectId)
    .order("completed", { ascending: true })
    .order("due_date", { ascending: true, nullsFirst: false });

  const parent: TaskParent = { prospectId };

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent>
          <AddTaskForm parent={parent} />
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2">
        {(tasks ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">Nog geen taken.</p>
        ) : (
          (tasks ?? []).map((task) => <ProspectTaskRow key={task.id} parent={parent} task={task} />)
        )}
      </div>
    </div>
  );
}
