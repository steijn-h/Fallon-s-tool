"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

import { deleteTask, toggleTask } from "@/lib/actions/tasks";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { formatDate, relativeDays } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Database } from "@/lib/supabase/database.types";

type Task = Pick<
  Database["public"]["Tables"]["tasks"]["Row"],
  "id" | "title" | "description" | "due_date" | "priority" | "completed"
>;

export function ProspectTaskRow({ prospectId, task }: { prospectId: string; task: Task }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const days = relativeDays(task.due_date);
  const overdue = !task.completed && days !== null && days < 0;

  return (
    <div className="flex items-start justify-between gap-3 rounded-md border border-border bg-card p-3">
      <div className="flex items-start gap-3">
        <Checkbox
          checked={task.completed}
          disabled={pending}
          onCheckedChange={(checked) =>
            startTransition(async () => {
              await toggleTask(prospectId, task.id, checked === true);
              router.refresh();
            })
          }
          className="mt-0.5"
        />
        <div>
          <p className={cn("text-sm font-medium", task.completed && "text-muted-foreground line-through")}>
            {task.title}
          </p>
          {task.description ? <p className="text-sm text-muted-foreground">{task.description}</p> : null}
          <p className={cn("text-xs text-muted-foreground", overdue && "font-medium text-destructive")}>
            {task.priority} · Deadline: {formatDate(task.due_date)}
            {overdue ? " · Te laat" : ""}
          </p>
        </div>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await deleteTask(prospectId, task.id);
            router.refresh();
          })
        }
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}
